import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState, useEffect } from "react";
import server from "./server";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState(
    "125b88e4ad3db01bd00c8bd5d8002ee2f7ab11f0fadd5aef9fd38841d86abdde"
  );
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

  return (
    <div className="app-shell">
      <div className="bg-orbs" aria-hidden="true">
        <span className="bg-orb bg-orb--one" />
        <span className="bg-orb bg-orb--two" />
        <span className="bg-orb bg-orb--three" />
      </div>
      <header className="app-header">
        <div className="brand">
          <div className="brand__orb" aria-hidden="true" />
          <div className="brand__copy">
            <p className="brand__eyebrow">ECDSA NEON LEDGER</p>
            <h1>Quantum Wallet</h1>
            <p className="brand__sub">
              Sign, verify, and move value through a glassmorphic ledger.
            </p>
          </div>
        </div>
        <div className="status-card">
          <div>
            <p className="status-card__label">Network</p>
            <p className="status-card__value">Testnet: ECDSA Local</p>
          </div>
          <div>
            <p className="status-card__label">Nonce</p>
            <p className="status-card__value">
              {address ? nonceMap[address] || 0 : "—"}
            </p>
          </div>
        </div>
      </header>

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

      <section className="panel ledger-panel">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">Activity</p>
            <h2>Transaction Stream</h2>
          </div>
          <div className="panel__badge">Live</div>
        </div>
        <div className="ledger">
          {txHistory.length === 0 ? (
            <p className="ledger__empty">
              No transactions yet. Send a transfer to light up the stream.
            </p>
          ) : (
            txHistory.map((tx) => (
              <div key={tx.id} className="ledger__row">
                <div>
                  <p className="ledger__label">Recipient</p>
                  <p className="ledger__value ledger__value--mono">
                    {tx.recipient}
                  </p>
                </div>
                <div>
                  <p className="ledger__label">Amount</p>
                  <p className="ledger__value">{tx.amount}</p>
                </div>
                <div>
                  <p className="ledger__label">Nonce</p>
                  <p className="ledger__value">{tx.nonce}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="app-footer">
        <div>
          <p className="app-footer__title">Zero-trust demo</p>
          <p className="app-footer__sub">
            Local keys only. Transactions are signed client-side and verified on
            the server.
          </p>
        </div>
        <div className="app-footer__pill">Glass + Neon UI v2</div>
      </section>
    </div>
  );
}

export default App;
