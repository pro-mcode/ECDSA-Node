import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils";

function Transfer({
  address,
  setBalance,
  privateKey,
  nonce,
  incrementNonce,
  onTransfer,
}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    setError("");

    // Basic validations
    if (!privateKey) return setError("Private key is missing.");
    if (!recipient) return setError("Recipient address is missing.");
    const amount = parseInt(sendAmount);
    if (!amount || amount <= 0) return setError("Enter a valid amount.");

    // Build transaction object
    const transaction = { recipient, amount, nonce };

    // Hash transaction
    const messageHash = keccak256(utf8ToBytes(JSON.stringify(transaction)));

    try {
      // Sign transaction
      const [signature, recoveryBit] = await secp.sign(
        messageHash,
        hexToBytes(privateKey),
        { recovered: true }
      );

      // Send to server
      const { data } = await server.post("/send", {
        transaction,
        signature: toHex(signature),
        recoveryBit,
      });

      setBalance(data.balance);

      // Increment local nonce after success
      incrementNonce();

      onTransfer?.({
        id: `${Date.now()}-${recipient}`,
        recipient,
        amount,
        nonce,
        sender: address,
      });

      // Clear input
      setSendAmount("");
      setRecipient("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <section className="panel transfer-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Transaction</p>
          <h2>Send Value</h2>
        </div>
        <div className="panel__badge">ECDSA</div>
      </div>

      <div className="transfer__meta">
        <div>
          <p className="transfer__label">From</p>
          <p className="transfer__value transfer__value--mono">
            {address || "—"}
          </p>
        </div>
        <div>
          <p className="transfer__label">Nonce</p>
          <p className="transfer__value">{address ? nonce : "—"}</p>
        </div>
      </div>

      <form className="transfer__form" onSubmit={transfer}>
        <label className="field">
          <span>Send Amount</span>
          <input
            placeholder="10, 20, 30..."
            value={sendAmount}
            onChange={setValue(setSendAmount)}
          />
        </label>

        <label className="field">
          <span>Recipient</span>
          <input
            placeholder="Enter recipient address"
            value={recipient}
            onChange={setValue(setRecipient)}
          />
        </label>

        {error ? <div className="form-error">{error}</div> : null}

        <button className="button" type="submit">
          Transfer
        </button>
      </form>
    </section>
  );
}

export default Transfer;
