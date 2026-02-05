const express = require("express");
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { privateKeys, publicKeys } = require("./scripts/generate.js");
const {
  utf8ToBytes,
  toHex,
  hexToBytes,
} = require("ethereum-cryptography/utils");
const { getAddress, computeMerkleRoot } = require("./scripts/utils.js");
const app = express();
const port = process.env.PORT || 3042;

app.use(cors());
app.use(express.json());

// Balances keyed by standard address
const balances = {};
privateKeys.forEach((k, i) => {
  const address = getAddress(Buffer.from(publicKeys[i], "hex"));
  balances[address] = (i + 1) * 1000; // assign balances
});

// Utility: normalize addresses
function normalizeAddress(address) {
  if (!address) return "";
  return address.toLowerCase().replace(/^0x/, "");
}

// Nonce per address
const nonces = {};

// Transaction pool
const transactionPool = [];

app.get("/balance/:address", (req, res) => {
  const address = normalizeAddress(req.params.address);
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/nonce/:address", (req, res) => {
  const address = normalizeAddress(req.params.address);
  nonces[address] ||= 0; // initialize if missing
  res.send({ nonce: nonces[address] });
});

app.get("/keys", (req, res) => {
  res.send({ privateKeys });
});

// Send transaction endpoint
app.post("/send", (req, res) => {
  const { transaction, signature, recoveryBit } = req.body;

  const { recipient, amount, nonce } = transaction;
  const normalizedRecipient = normalizeAddress(recipient);

  // Recreate message hash from transaction object
  const messageHash = keccak256(utf8ToBytes(JSON.stringify(transaction)));

  // Recover public key
  const publicKey = secp.recoverPublicKey(
    messageHash,
    hexToBytes(signature),
    recoveryBit
  );

  // Derive sender address
  const sender = normalizeAddress(getAddress(publicKey));

  // Initialize balances & nonce
  balances[sender] ||= 0;
  balances[normalizedRecipient] ||= 0;
  nonces[sender] ||= 0;

  // Check signature
  const isValid = secp.verify(hexToBytes(signature), messageHash, publicKey);
  if (!isValid) return res.status(400).send({ message: "Invalid signature!" });

  // Check nonce
  if (nonce !== nonces[sender]) {
    return res
      .status(400)
      .send({ message: `Invalid nonce! Expected ${nonces[sender]}` });
  }

  // Check balance
  if (balances[sender] < amount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }

  // Apply transaction
  balances[sender] -= amount;
  balances[normalizedRecipient] += amount;
  nonces[sender] += 1;

  // Add to transaction pool
  transactionPool.push({ ...transaction, sender });

  // Compute Merkle root for the pool
  const txHashes = transactionPool.map((tx) =>
    toHex(keccak256(utf8ToBytes(JSON.stringify(tx))))
  );
  const merkleRoot = computeMerkleRoot(txHashes);

  res.send({ balance: balances[sender], merkleRoot });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
