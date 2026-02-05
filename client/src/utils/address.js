import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

export const toChecksumAddress = (address) => {
  if (!address) return "";
  const stripped = address.toLowerCase().replace(/^0x/, "");
  const hash = toHex(keccak256(utf8ToBytes(stripped)));
  let checksum = "";

  for (let i = 0; i < stripped.length; i += 1) {
    const char = stripped[i];
    const hashNibble = parseInt(hash[i], 16);
    checksum += hashNibble >= 8 ? char.toUpperCase() : char;
  }

  return `0x${checksum}`;
};
