import server from "../server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { useEffect, useState } from "react";
import CopyButton from "./CopyButton";
import { toChecksumAddress } from "../utils/address";

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
  const [showToast, setShowToast] = useState(false);

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

    // Normalize to checksum format
    nextAddress = toChecksumAddress(nextAddress);
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

  useEffect(() => {
    if (!showKeys) return;
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 1600);
    return () => clearTimeout(timer);
  }, [showKeys]);

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
          <CopyButton value={privateKey} size="full" />
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
            <CopyButton value={address} size="tiny" />
          </div>
        </div>
      </div>

      <div className="panel__section">
        <div className="panel__section-row">
          <p className="panel__section-title">Sample Private Keys</p>
          {/* <span className="key-status">
            {sampleKeys.length > 0 ? "Keys loaded" : "Loading keys"}
          </span> */}
          <button
            className="ghost-button ghost-button--tiny"
            type="button"
            onClick={() => setShowKeys((prev) => !prev)}
          >
            {showKeys ? "Hide keys" : "Reveal keys"}
          </button>
        </div>
        {/* {showToast ? <div className="toast">Keys revealed</div> : null} */}
        {showKeys ? (
          <div className="key-list">
            {sampleKeys.length === 0 ? (
              <div className="key-item">Server keys unavailable.</div>
            ) : (
              sampleKeys.map((key) => (
                <div key={key} className="key-item">
                  {key}
                  <CopyButton value={key} variant="icon" />
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
