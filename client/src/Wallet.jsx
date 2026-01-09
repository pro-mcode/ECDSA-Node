import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);

    function getAddress(publicKey) {
      const slicedKey = publicKey.slice(1); // remove format byte
      const hash = keccak256(slicedKey);
      return toHex(hash.slice(-20)); // last 20 bytes
    }

    const publicKey = secp.getPublicKey(privateKey);
    let address = getAddress(publicKey);

    // Normalize to lowercase to match server
    address = address.toLowerCase();
    setAddress(address);

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>Private Key</label>
      <input
        placeholder="Enter your private key"
        value={privateKey}
        onChange={onChange}
      ></input>

      <div className="balance">Balance: {balance}</div>

      <div className="address">Address: {address}</div>

      <div className="available-privatekey">
        Private Keys:
        <div>
          125b88e4ad3db01bd00c8bd5d8002ee2f7ab11f0fadd5aef9fd38841d86abdde
        </div>
        <div>
          25163ad1efa2f4319197e447ed35f73379b870a667e7a408d16fe07fc0d41f08
        </div>
        <div>
          1916707701a7ed3f9c7e8d9e069e3ebfed57a71f89c4f64517e9c236cc7717c0
        </div>
      </div>
    </div>
  );
}

export default Wallet;
