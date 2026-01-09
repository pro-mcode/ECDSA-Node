const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

function getAddress(publicKey) {
  const slicedKey = publicKey.slice(1); // remove format byte
  const hash = keccak256(slicedKey);
  return toHex(hash.slice(-20)); // last 20 bytes = standard address
}

// Compute Merkle Root from an array of transaction hashes
function computeMerkleRoot(txHashes) {
  if (txHashes.length === 0) return null;
  let layer = txHashes.slice();

  while (layer.length > 1) {
    const nextLayer = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 === layer.length) {
        // If odd number, duplicate last hash
        nextLayer.push(keccak256(Buffer.from(layer[i], "hex")));
      } else {
        const combined = Buffer.concat([
          Buffer.from(layer[i], "hex"),
          Buffer.from(layer[i + 1], "hex"),
        ]);
        nextLayer.push(keccak256(combined));
      }
    }
    layer = nextLayer.map((b) => toHex(b));
  }

  return layer[0];
}

module.exports = { getAddress, computeMerkleRoot };
