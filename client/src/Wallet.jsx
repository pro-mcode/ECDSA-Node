import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { useEffect } from "react";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
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

  return (
    <section className="panel wallet-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Wallet Access</p>
          <h2>Your Vault</h2>
        </div>
        <div className="panel__badge">secp256k1</div>
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
        <p className="panel__section-title">Sample Private Keys</p>
        <div className="key-list">
          <div className="key-item">
            125b88e4ad3db01bd00c8bd5d8002ee2f7ab11f0fadd5aef9fd38841d86abdde
            <button
              className="ghost-button ghost-button--icon"
              type="button"
              aria-label="Copy sample key"
              onClick={() =>
                copyToClipboard(
                  "125b88e4ad3db01bd00c8bd5d8002ee2f7ab11f0fadd5aef9fd38841d86abdde"
                )
              }
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
          <div className="key-item">
            25163ad1efa2f4319197e447ed35f73379b870a667e7a408d16fe07fc0d41f08
            <button
              className="ghost-button ghost-button--icon"
              type="button"
              aria-label="Copy sample key"
              onClick={() =>
                copyToClipboard(
                  "25163ad1efa2f4319197e447ed35f73379b870a667e7a408d16fe07fc0d41f08"
                )
              }
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
          <div className="key-item">
            1916707701a7ed3f9c7e8d9e069e3ebfed57a71f89c4f64517e9c236cc7717c0
            <button
              className="ghost-button ghost-button--icon"
              type="button"
              aria-label="Copy sample key"
              onClick={() =>
                copyToClipboard(
                  "1916707701a7ed3f9c7e8d9e069e3ebfed57a71f89c4f64517e9c236cc7717c0"
                )
              }
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
        </div>
      </div>
    </section>
  );
}

export default Wallet;
