## ECDSA Wallet & Transaction Ledger

### Table of Contents

- Project Overview
- Features
- Architecture
- Installation
- Usage
- Endpoints
- Technical Details
- Security Considerations
- Future Enhancements

### Project Overview

This project is an educational, full‑stack demo of an ECDSA‑based wallet and transaction ledger. The React client derives public keys and Ethereum‑style addresses from private keys, displays balances, and signs transactions. The Node/Express server verifies signatures and nonces to prevent replay attacks, updates balances, and maintains an in‑memory transaction pool with a Merkle root for integrity. It’s intentionally centralized to focus on cryptography and transaction validation concepts rather than distributed consensus. It demonstrates the principles of:

- Generating private/public key pairs using secp256k1
- Deriving Ethereum-style addresses from public keys
- Signing transactions with ECDSA and verifying them server-side
- Tracking balances, nonces, and a transaction pool
- Computing a Merkle root for transaction integrity
- This project is intended for educational purposes to illustrate blockchain concepts and secure transaction signing.

This project is an example of using a client and server to facilitate transfers between different addresses. Since there is just a single server on the back-end handling transfers, this is clearly very centralized. We won't worry about distributed consensus for this project.

### Features

- Generate a wallet from a private key
- Derive compressed public key and standard address
- Display balance for a given address
- Send signed transactions to a server
- Prevent replay attacks using nonces
- Maintain a transaction pool
- Compute Merkle root of transactions
- Validate recipient addresses

### Architecture

#### Client (React)

- Wallet.jsx – Input private key, view address and balance
- Transfer.jsx – Send signed transactions
- Uses ethereum-cryptography library for:
- ECDSA key operations (secp256k1)
- Keccak256 hashing
- Tracks nonce client-side and updates after each transaction

#### Server (Node.js / Express)

- Tracks balances, nonces, and a transaction pool
- Endpoints:
  - /balance/:address – Fetch balance
  - /nonce/:address – Fetch current nonce
  - /send – Receive signed transactions, verify signature, update balances
- Verifies ECDSA signatures and transaction nonces
- Computes Merkle root for transaction integrity

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ecdsa-node-main
```

2. Install dependencies:

```bash
npm install
cd client
npm install
```

### Usage

#### Start the server

```bash
npm run server
```

#### Start the client

```bash
cd client
npm start
```

- Open <http://localhost:3000> in your browser
- Enter a private key in the wallet to see your address and balance
- Use the Transfer form to send funds to a recipient address

### Endpoints

| Endpoint            | Method | Description                                           |
| ------------------- | ------ | ----------------------------------------------------- |
| `/balance/:address` | GET    | Returns the current balance for the address           |
| `/nonce/:address`   | GET    | Returns the current nonce for the address             |
| `/send`             | POST   | Receives a signed transaction and applies it if valid |

Transaction Object (POST /send)

```json
{
  "transaction": {
    "recipient": "52f481a385680b621b8c58bc846f1f6e1fb36099",
    "amount": 100,
    "nonce": 0
  },
  "signature": "<signature-hex>",
  "recoveryBit": 0
}
```

### Technical Details

#### Key & Address Generation

- Private keys: 32-byte random numbers
- Public keys: Generated via secp256k1
- Standard addresses: Last 20 bytes of Keccak256 hash of the uncompressed public key (without format byte)

#### Signing & Verification

- Transactions are hashed with Keccak256 before signing
- Signed using secp.sign() with recovery bit
- Server recovers public key and derives sender address to validate funds

#### Nonces (Replay Protection)

- Each address has a nonce to prevent replay attacks
- Nonce increments after each valid transaction
- Server rejects transactions if nonce mismatch occurs

#### Transaction Pool & Merkle Root

- All transactions are stored in a transaction pool
- Each transaction is hashed using Keccak256
- Merkle root computed for integrity verification

### Security Considerations

- Never enter real private keys — only use test/demo keys
- Addresses and transactions are stored in memory, not persisted
- Signature verification ensures authenticity and integrity
- Nonce tracking prevents replay attacks

### Future Enhancements

- Persist balances and transactions in a database
- Add genesis block and blockchain simulation
- Implement block validation and tamper detection
- Support multi-sig wallets
- Enhance client UI with real-time transaction updates
