import { HashDoc } from "@/components/HashDoc";
import { useNetworkStatus } from "@/lib/useNetworkStatus";

function App() {
  const { isOnline, showOnlineNotification, statusMessage } =
    useNetworkStatus();

  return (
    <div className="relative min-h-screen min-w-screen">
      <HashDoc />

      {/* Network status indicator */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {!isOnline && statusMessage && (
          <div className="bg-red-500/50 text-white text-xs p-1 text-center">
            {statusMessage}
          </div>
        )}
        {isOnline && showOnlineNotification && statusMessage && (
          <div className="bg-green-500/50 text-white text-xs p-1 text-center">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
