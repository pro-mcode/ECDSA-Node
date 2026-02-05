function LedgerPanel({ txHistory, shortAddress, onClearHistory }) {
  return (
    <section className="panel ledger-panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Activity</p>
          <h2>Transaction Stream</h2>
        </div>
        <div className="ledger__actions">
          {/* <button
            className="ghost-button ghost-button--tiny"
            type="button"
            onClick={onClearHistory}
          >
            Clear history
          </button> */}
          <div className="panel__badge">Live</div>
        </div>
      </div>
      <div className="ledger">
        {txHistory.length === 0 ? (
          <p className="ledger__empty">
            No transactions yet. Send a transfer to light up the stream.
          </p>
        ) : (
          txHistory.map((tx) => (
            <div key={tx.id} className="ledger__row">
              <div>
                <p className="ledger__label">Recipient</p>
                <p className="ledger__value ledger__value--mono">
                  {tx.recipient}
                </p>
              </div>
              <div>
                <p className="ledger__label">Sender</p>
                <p className="ledger__value ledger__value--mono">
                  {shortAddress(tx.sender)}
                </p>
              </div>
              <div>
                <p className="ledger__label">Amount</p>
                <p className="ledger__value">{tx.amount}</p>
              </div>
              <div>
                <p className="ledger__label">Nonce</p>
                <p className="ledger__value">{tx.nonce}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default LedgerPanel;
