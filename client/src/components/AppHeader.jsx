function AppHeader({ nonce }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand__orb" aria-hidden="true" />
        <div className="brand__copy">
          <p className="brand__eyebrow">ECDSA NEON LEDGER</p>
          <h1>Quantum Wallet</h1>
          <p className="brand__sub">
            Sign, verify, and move value through a glassmorphic ledger.
          </p>
        </div>
      </div>
      <div className="status-card">
        <div>
          <p className="status-card__label">Network</p>
          <p className="status-card__value">Testnet: ECDSA Local</p>
        </div>
        <div>
          <p className="status-card__label">Nonce</p>
          <p className="status-card__value">{nonce ?? "—"}</p>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
