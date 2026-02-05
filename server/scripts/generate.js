const fs = require("fs");
const path = require("path");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const dataDir = path.join(__dirname, "..", "data");
const keyFile = path.join(dataDir, "keys.json");

function loadOrCreateKeys() {
  try {
    if (fs.existsSync(keyFile)) {
      const raw = fs.readFileSync(keyFile, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.privateKeys) && parsed.privateKeys.length > 0) {
        return parsed.privateKeys;
      }
    }
  } catch (err) {
    // fall through to regenerate
  }

  const newKeys = [
    toHex(secp.utils.randomPrivateKey()),
    toHex(secp.utils.randomPrivateKey()),
    toHex(secp.utils.randomPrivateKey()),
  ];

  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(keyFile, JSON.stringify({ privateKeys: newKeys }, null, 2));
  } catch (err) {
    // If we can't write (read-only FS), keep in-memory keys
  }

  return newKeys;
}

const privateKeys = loadOrCreateKeys();
const publicKeys = privateKeys.map((k) => toHex(secp.getPublicKey(k)));

console.log("private keys: ", privateKeys);
console.log("public keys: ", publicKeys);

module.exports = { privateKeys, publicKeys };
