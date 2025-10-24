import { projectId, publicAnonKey } from "./supabase/info";
import { storage } from "./storage";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-089874b4`;

// Store auth token (mobile-compatible with AsyncStorage)
let authToken: string | null = null;

export const setAuthToken = async (token: string | null) => {
  authToken = token;
  if (token) {
    await storage.setItem("auth_token", token);
  } else {
    await storage.removeItem("auth_token");
  }
};

export const getAuthToken = async () => {
  if (!authToken) {
    authToken = await storage.getItem("auth_token");
  }
  return authToken;
};

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || publicAnonKey}`,
      ...options.headers,
    };

    const url = `${API_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Request Error for ${endpoint}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed");
  }
};

// Auth API
export const authAPI = {
  signup: async (data: { email: string; password: string; name: string; location: string }) => {
    return makeRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signin: async (data: { email: string; password: string }) => {
    const result = await makeRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (result.access_token) {
      await setAuthToken(result.access_token);
    }
    return result;
  },

  signout: async () => {
    const result = await makeRequest("/auth/signout", {
      method: "POST",
    });
    await setAuthToken(null);
    return result;
  },

  getSession: async () => {
    return makeRequest("/auth/session");
  },
};

// Items API
export const itemsAPI = {
  getAll: async () => {
    return makeRequest("/items");
  },

  create: async (item: any) => {
    return makeRequest("/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  update: async (id: string, updates: any) => {
    return makeRequest(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return makeRequest(`/items/${id}`, {
      method: "DELETE",
    });
  },
};

// Profile API
export const profileAPI = {
  get: async (userId: string) => {
    return makeRequest(`/profile/${userId}`);
  },

  update: async (updates: any) => {
    return makeRequest("/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

// Reviews API
export const reviewsAPI = {
  getByUser: async (userId: string) => {
    return makeRequest(`/reviews/${userId}`);
  },

  create: async (review: any) => {
    return makeRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(review),
    });
  },
};

// Messages API
export const messagesAPI = {
  getByItem: async (itemId: string) => {
    return makeRequest(`/messages/${itemId}`);
  },

  send: async (message: any) => {
    return makeRequest("/messages", {
      method: "POST",
      body: JSON.stringify(message),
    });
  },
};

// Image Upload API for React Native
export const uploadImageMobile = async (uri: string, fileName: string): Promise<string> => {
  try {
    const token = await getAuthToken();
    
    // Create FormData for mobile
    const formData: any = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: 'image/jpeg',
    });

    const response = await fetch(`${API_URL}/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};
