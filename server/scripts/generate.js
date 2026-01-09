const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKeys = [
  toHex(secp.utils.randomPrivateKey()),
  toHex(secp.utils.randomPrivateKey()),
  toHex(secp.utils.randomPrivateKey()),
];

const publicKeys = privateKeys.map((k) => toHex(secp.getPublicKey(k)));

console.log("private keys: ", privateKeys);
console.log("public keys: ", publicKeys);

module.exports = { privateKeys, publicKeys };
