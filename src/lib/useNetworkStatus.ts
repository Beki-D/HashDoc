// src/lib/useNetworkStatus.ts
import { useState, useEffect } from "react";

// Exportable checkInternetConnection function
export const checkInternetConnection = async (
  endpoint: string = "https://8.8.8.8"
) => {
  try {
    await fetch(endpoint, { mode: "no-cors", cache: "no-store" });
    return true;
  } catch (error) {
    return false;
  }
};

export const useNetworkStatus = ({
  checkInterval = 5000, // Check for internet every 5 seconds
  endpoint = "https://8.8.8.8", // Google Public DNS server
  notificationDuration = 3000,
} = {}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const updateStatus = async () => {
      const hasPhysicalConnection = navigator.onLine;
      const hasInternet = await checkInternetConnection(endpoint);

      if (!mounted) return;

      if (hasPhysicalConnection && hasInternet) {
        setIsOnline(true);
        if (!isOnline) {
          setShowOnlineNotification(true);
          setStatusMessage("Online with internet access.");
          setTimeout(
            () => setShowOnlineNotification(false),
            notificationDuration
          );
        }
      } else if (hasPhysicalConnection && !hasInternet) {
        setIsOnline(false);
        setStatusMessage(
          "Connected without internet. Check your router or ISP."
        );
      } else {
        setIsOnline(false);
        setStatusMessage("Disconnected network. Check your WiFi or Ethernet.");
      }
    };

    const handleOnline = () => {
      updateStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusMessage("Disconnected network. Check your WiFi or Ethernet.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    updateStatus();
    intervalId = setInterval(updateStatus, checkInterval);

    return () => {
      mounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, checkInterval, endpoint, notificationDuration]);

  return { isOnline, showOnlineNotification, statusMessage };
};
