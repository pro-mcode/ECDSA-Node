import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey, nonce, incrementNonce }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    // Basic validations
    if (!privateKey) return alert("Private key is missing!");
    if (!recipient) return alert("Recipient address is missing!");
    // if (!/^[0-9a-f]{40}$/.test(recipient.toLowerCase()))
    //   return alert("Invalid recipient address!");
    const amount = parseInt(sendAmount);
    if (!amount || amount <= 0) return alert("Invalid amount!");

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

      // Clear input
      setSendAmount("");
      setRecipient("");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>Send Amount</label>
      <input
        placeholder="10, 20, 30..."
        value={sendAmount}
        onChange={setValue(setSendAmount)}
      />

      <label>Recipient</label>
      <input
        placeholder="Enter recipient address"
        value={recipient}
        onChange={setValue(setRecipient)}
      />

      <button className="button" type="submit">
        Transfer
      </button>
      {/* <input type="submit" value="Transfer" /> */}
    </form>
  );
}

export default Transfer;
