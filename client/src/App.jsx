import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState, useEffect } from "react";
import server from "./server";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [nonceMap, setNonceMap] = useState({}); // client-side nonce tracking

  // Update nonce from server whenever address changes
  useEffect(() => {
    if (!address) return;

    async function fetchNonce() {
      try {
        const res = await server.get(`/nonce/${address}`);
        setNonceMap((prev) => ({ ...prev, [address]: res.data.nonce }));
      } catch (err) {
        // If endpoint not implemented, start at 0
        setNonceMap((prev) => ({ ...prev, [address]: 0 }));
      }
    }

    fetchNonce();
  }, [address]);

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        setAddress={setAddress}
      />
      <Transfer
        setBalance={setBalance}
        address={address}
        privateKey={privateKey}
        nonce={nonceMap[address] || 0}
        incrementNonce={() =>
          setNonceMap((prev) => ({
            ...prev,
            [address]: (prev[address] || 0) + 1,
          }))
        }
      />
    </div>
  );
}

export default App;
