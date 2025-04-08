import { useState, useEffect } from "react";
import FileUpload from "@/components/FileUploader";
// import AssetViewer from "./components/AssetViewer";
// import pdfFile from "./assets/sample.pdf";
// import imageFile from "./assets/pp.jpg";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineNotification(true);
      setTimeout(() => setShowOnlineNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return (
    <div className="relative min-h-screen min-w-screen">
      {/* <div className="space-y-8 p-4">
        <h2 className="text-xl font-semibold">PDF Viewer</h2>
        <AssetViewer src={pdfFile} />

        <h2 className="text-xl font-semibold">Image Viewer</h2>
        <AssetViewer src={imageFile} />
      </div> */}
      <FileUpload />

      {/* Network status indicator */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {!isOnline && (
          <div className="bg-red-500/50 text-white text-xs p-1 text-center">
            You are offline. Please check your internet connection.
          </div>
        )}
        {isOnline && showOnlineNotification && (
          <div className="bg-green-500/50 text-white text-xs p-1 text-center">
            You are back online.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
