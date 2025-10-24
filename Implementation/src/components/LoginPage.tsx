import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "../utils/api";
import { showToast } from "./Toast";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "../utils/theme";

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  joinDate: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  itemsShared: number;
  itemsClaimed: number;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupLocation, setSignupLocation] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast("Please enter email and password", "error");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting login for:", loginEmail);
      const result = await authAPI.signin({ 
        email: loginEmail.trim(), 
        password: loginPassword 
      });
      console.log("Login successful:", result);
      onLogin(result.user);
      showToast(`Welcome back, ${result.user.name}!`, "success");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to login";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupEmail.trim() || !signupLocation.trim() || !signupPassword.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting signup for:", signupEmail);
      const result = await authAPI.signup({ 
        email: signupEmail.trim(), 
        password: signupPassword, 
        name: signupName.trim(), 
        location: signupLocation.trim() 
      });
      console.log("Signup successful:", result);
      
      // After signup, sign in automatically
      const signInResult = await authAPI.signin({ 
        email: signupEmail.trim(), 
        password: signupPassword 
      });
      console.log("Auto-signin successful:", signInResult);
      onLogin(signInResult.user);
      showToast(`Welcome, ${signInResult.user.name}!`, "success");
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = error instanceof Error ? error.message : "Failed to create account";
      
      if (errorMessage.includes("already been registered")) {
        errorMessage = "This email is already registered. Please use the Login tab instead.";
      }
      
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView 
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            <View style={styles.formContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.emoji}>🍃</Text>
                <Text style={styles.title}>Fooditude</Text>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <Pressable
                  style={[styles.tab, activeTab === "login" && styles.tabActive]}
                  onPress={() => setActiveTab("login")}
                >
                  <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>
                    Login
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, activeTab === "signup" && styles.tabActive]}
                  onPress={() => setActiveTab("signup")}
                >
                  <Text style={[styles.tabText, activeTab === "signup" && styles.tabTextActive]}>
                    Sign Up
                  </Text>
                </Pressable>
              </View>

              {/* Login Form */}
              {activeTab === "login" && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Welcome Back</Text>
                    <Text style={styles.cardSubtitle}>
                      Login to continue sharing and reducing food waste
                    </Text>
                  </View>

                  <View style={styles.form}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        editable={!isLoading}
                      />
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        editable={!isLoading}
                      />
                    </View>

                    <Pressable
                      style={[styles.button, isLoading && styles.buttonDisabled]}
                      onPress={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={colors.primaryForeground} />
                      ) : (
                        <Text style={styles.buttonText}>
                          Login
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Signup Form */}
              {activeTab === "signup" && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Create Account</Text>
                    <Text style={styles.cardSubtitle}>
                      Join our community to start sharing food
                    </Text>
                  </View>

                  <View style={styles.form}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Full Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="words"
                        value={signupName}
                        onChangeText={setSignupName}
                        editable={!isLoading}
                      />
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={signupEmail}
                        onChangeText={setSignupEmail}
                        editable={!isLoading}
                      />
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Location</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Downtown, Main Street"
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="words"
                        value={signupLocation}
                        onChangeText={setSignupLocation}
                        editable={!isLoading}
                      />
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry
                        value={signupPassword}
                        onChangeText={setSignupPassword}
                        editable={!isLoading}
                      />
                    </View>

                    <Pressable
                      style={[styles.button, isLoading && styles.buttonDisabled]}
                      onPress={handleSignup}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={colors.primaryForeground} />
                      ) : (
                        <Text style={styles.buttonText}>
                          Create Account
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}

              <Text style={styles.footer}>
                Your data is securely stored
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  formContainer: {
    width: '100%',
    maxWidth: 480,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['3xl'],
  },
  emoji: {
    fontSize: fontSize['4xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.medium,
    color: colors.foreground,
  },
  tabContainer: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.background,
  },
  tabText: {
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    color: colors.mutedForeground,
    fontSize: fontSize.base,
  },
  tabTextActive: {
    color: colors.foreground,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: colors.cardForeground,
  },
  cardSubtitle: {
    color: colors.mutedForeground,
    marginTop: 4,
    fontSize: fontSize.base,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontWeight: fontWeight.medium,
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.foreground,
    fontSize: fontSize.base,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primaryForeground,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  footer: {
    textAlign: 'center',
    color: colors.mutedForeground,
    marginTop: spacing.lg,
    fontSize: fontSize.sm,
  },
});
