import { useState, useEffect } from "react";
import "./App.scss";
import server from "./server";
import Wallet from "./components/Wallet";
import Transfer from "./components/Transfer";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import LedgerPanel from "./components/LedgerPanel";
import BgOrbs from "./components/BgOrbs";

const shortAddress = (value) => {
  if (!value) return "—";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

const loadHistory = (address) => {
  if (!address) return [];
  try {
    const raw = localStorage.getItem(`txHistory:${address}`);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

const saveHistory = (address, entries) => {
  if (!address) return;
  try {
    localStorage.setItem(`txHistory:${address}`, JSON.stringify(entries));
  } catch (err) {
    // Ignore storage failures
  }
};

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [nonceMap, setNonceMap] = useState({}); // client-side nonce tracking
  const [txHistory, setTxHistory] = useState([]);

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

  useEffect(() => {
    setTxHistory(loadHistory(address));
  }, [address]);

  useEffect(() => {
    saveHistory(address, txHistory);
  }, [address, txHistory]);

  return (
    <div className="app-shell">
      <BgOrbs />
      <AppHeader nonce={address ? nonceMap[address] || 0 : "—"} />

      <main className="app-grid">
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
          onTransfer={(entry) =>
            setTxHistory((prev) => [entry, ...prev].slice(0, 8))
          }
        />
      </main>

      <LedgerPanel txHistory={txHistory} shortAddress={shortAddress} />
      <AppFooter />
    </div>
  );
}

export default App;
