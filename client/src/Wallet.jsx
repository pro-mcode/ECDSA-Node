import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { useEffect, useState } from "react";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  const [sampleKeys, setSampleKeys] = useState([]);
  const [showKeys, setShowKeys] = useState(false);
  const copyToClipboard = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      // Ignore if clipboard unavailable
    }
  };

  function getAddress(publicKey) {
    const slicedKey = publicKey.slice(1); // remove format byte
    const hash = keccak256(slicedKey);
    return toHex(hash.slice(-20)); // last 20 bytes
  }

  async function syncWallet(nextPrivateKey) {
    if (!nextPrivateKey) {
      setAddress("");
      setBalance(0);
      return;
    }

    const publicKey = secp.getPublicKey(nextPrivateKey);
    let nextAddress = getAddress(publicKey);

    // Normalize to lowercase to match server
    nextAddress = nextAddress.toLowerCase();
    setAddress(nextAddress);

    if (nextAddress) {
      const {
        data: { balance },
      } = await server.get(`balance/${nextAddress}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onChange(evt) {
    const nextPrivateKey = evt.target.value;
    setPrivateKey(nextPrivateKey);
    await syncWallet(nextPrivateKey);
  }

  useEffect(() => {
    syncWallet(privateKey);
  }, [privateKey]);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const { data } = await server.get("/keys");
        if (Array.isArray(data.privateKeys)) {
          setSampleKeys(data.privateKeys);
          if (!privateKey && data.privateKeys.length > 0) {
            setPrivateKey(data.privateKeys[0]);
          }
        }
      } catch (err) {
        // If the endpoint isn't available, keep existing defaults
      }
    }

    fetchKeys();
  }, []);

  return (
    <section className="panel wallet-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Wallet Access</p>
          <h2>Your Vault</h2>
        </div>
        <div className="panel__badge panel__badge--warning">
          Demo keys (server-generated)
        </div>
      </div>

      <label className="field">
        <span>Private Key</span>
        <div className="field__row">
          <input
            placeholder="Enter your private key"
            value={privateKey}
            onChange={onChange}
          ></input>
          <button
            className="ghost-button"
            type="button"
            onClick={() => copyToClipboard(privateKey)}
          >
            Copy
          </button>
        </div>
      </label>

      <div className="metric-grid">
        <div className="metric">
          <p className="metric__label">Balance</p>
          <p className="metric__value">{balance}</p>
        </div>
        <div className="metric">
          <p className="metric__label">Address</p>
          <div className="metric__row">
            <p className="metric__value metric__value--mono">
              {address || "—"}
            </p>
            <button
              className="ghost-button ghost-button--tiny"
              type="button"
              onClick={() => copyToClipboard(address)}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="panel__section">
        <div className="panel__section-row">
          <p className="panel__section-title">Sample Private Keys</p>
          <button
            className="ghost-button ghost-button--tiny"
            type="button"
            onClick={() => setShowKeys((prev) => !prev)}
          >
            {showKeys ? "Hide keys" : "Reveal keys"}
          </button>
        </div>
        {showKeys ? (
          <div className="key-list">
            {sampleKeys.length === 0 ? (
              <div className="key-item">Server keys unavailable.</div>
            ) : (
              sampleKeys.map((key) => (
                <div key={key} className="key-item">
                  {key}
                  <button
                    className="ghost-button ghost-button--icon"
                    type="button"
                    aria-label="Copy sample key"
                    onClick={() => copyToClipboard(key)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      role="img"
                      aria-hidden="true"
                      className="icon"
                    >
                      <path
                        d="M9 9h10v10H9zM6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1h-2V5H5v8h1v2z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="key-list key-list--hidden">
            <div className="key-item">Keys hidden.</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Wallet;
