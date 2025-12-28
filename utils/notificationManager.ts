
export const checkNotificationSupport = (): boolean => {
  return "Notification" in window;
};

// Ensure SW is present (fallback if html script hasn't run yet)
export const ensureServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return null;

  try {
    // Check for existing registration first
    let registration = await navigator.serviceWorker.getRegistration();
    if (registration) return registration;

    // Attempt registration
    registration = await navigator.serviceWorker.register("sw.js");
    return registration;
  } catch (error) {
    // Cleanly handle SecurityError or Origin mismatch in sandboxed previews
    console.warn("Service Worker unavailable (using fallback):", error);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Try to register, but don't block if it fails
      await ensureServiceWorker();
      return true;
    }
  } catch (e) {
    console.error("Permission request failed:", e);
  }

  return false;
};

export const sendLocalNotification = async (title: string, body: string) => {
  if (Notification.permission !== "granted") {
    return;
  }

  const options: any = {
    body: body,
    icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
    vibrate: [200, 100, 200],
    tag: 'liquid-todo-app',
    renotify: true
  };

  try {
    // 1. Try Service Worker (Preferred for Mobile)
    if ("serviceWorker" in navigator) {
      // We do not use .ready here because it hangs if SW fails to register in sandboxes
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.active) {
        registration.showNotification(title, options);
        return;
      }
    }
  } catch (error) {
    console.warn("SW Notification failed, falling back to standard API", error);
  }

  // 2. Fallback to Standard API (Desktop / Sandbox)
  try {
    new Notification(title, options);
  } catch (e) {
    console.error("Standard notification failed:", e);
  }
};
