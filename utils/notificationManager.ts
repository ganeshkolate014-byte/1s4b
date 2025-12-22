
export const checkNotificationSupport = (): boolean => {
  return "Notification" in window;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    console.warn("Notifications not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendLocalNotification = (title: string, body: string) => {
  if (!checkNotificationSupport()) return;

  const trigger = () => {
    try {
      // Using 'any' cast for options to support mobile properties without TS errors
      const options: any = {
        body: body,
        icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix", // App Icon
        badge: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix", // Android small icon
        tag: 'liquid-todo-notification', // Overwrites previous notifications from this app
        renotify: true, // Plays sound/vibrate again even if tag matches
        silent: false,
        requireInteraction: true // Keeps it visible on desktop
      };

      // Service Worker Fallback (for Android mostly)
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
          // Check if showNotification exists on registration
          if ('showNotification' in registration) {
             registration.showNotification(title, options);
          } else {
             new Notification(title, options);
          }
        }).catch(() => {
           new Notification(title, options);
        });
      } else {
        // Standard Desktop/iOS Web App
        new Notification(title, options);
      }
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  };

  if (Notification.permission === "granted") {
    trigger();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        trigger();
      }
    });
  }
};
