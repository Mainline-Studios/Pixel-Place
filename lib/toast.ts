import { showToast, ToastType } from '@/components/Toast';

// Replace alert() with non-blocking toast notifications
export function toastAlert(message: string, type: ToastType = 'info') {
  showToast(message, type);
}

// For confirm dialogs, we'll keep using the browser confirm but could replace later
export function toastConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}

// Convenience functions
export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
  warning: (message: string) => showToast(message, 'warning'),
};
