import { Alert } from 'react-native';

/**
 * Simple toast notification system for React Native
 * Uses native Alert for simplicity (can be replaced with a library like react-native-toast-message)
 */

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' = 'success'
) => {
  const title = type === 'success' ? '✅ Success' : type === 'error' ? '❌ Error' : 'ℹ️ Info';
  
  Alert.alert(title, message, [{ text: 'OK', style: type === 'error' ? 'destructive' : 'default' }]);
};


export default showToast;
