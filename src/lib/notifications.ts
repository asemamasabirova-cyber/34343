export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | null {
  if (!notificationsSupported()) return null;
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showNotification(title: string, body?: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {
    // Some browsers throw if the page is not focused; ignore silently
  }
}
