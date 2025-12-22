
export const checkNotificationSupport = (): boolean => {
  return "Notification" in window && "serviceWorker" in navigator;
};

export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log("Service Worker Registered");
      return registration;
    } catch (error) {
      console.error("Service Worker Registration Failed", error);
    }
  }
  return null;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return false;
  }

  let permission = Notification.permission;

  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    await registerServiceWorker();
    return true;
  }

  return false;
};

export const sendLocalNotification = async (title: string, body: string) => {
  if (Notification.permission !== "granted") {
    return;
  }

  try {
    // 1. Try Service Worker Method (Most Reliable for Mobile/Android)
    if ("serviceWorker" in navigator) {
      // Ensure we have a registration
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
         registration = await registerServiceWorker();
      }

      if (registration) {
         // Wait for it to be active
         await navigator.serviceWorker.ready;
         
         registration.showNotification(title, {
            body: body,
            icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
            vibrate: [200, 100, 200],
            tag: 'liquid-todo-alert',
            renotify: true,
            badge: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
            requireInteraction: true
         } as any);
         return;
      }
    }

    // 2. Fallback to Standard Notification API (Desktop)
    new Notification(title, {
       body: body,
       icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
       tag: 'liquid-todo-alert',
       renotify: true
    } as any);

  } catch (e) {
    console.error("Notification failed:", e);
    // Ultimate fallback
    try {
        new Notification(title, { body: body });
    } catch (err) {
        console.error("Even fallback failed", err);
    }
  }
};
