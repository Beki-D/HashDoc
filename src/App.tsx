import { HashDoc } from "@/components/HashDoc";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";

function App() {
  return (
    <div className="relative min-h-screen min-w-screen">
      <HashDoc />
      <NetworkStatusIndicator />
    </div>
  );
}

export default App;
