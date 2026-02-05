function AppFooter() {
  return (
    <section className="app-footer">
      <div>
        <p className="app-footer__title">Zero-trust demo</p>
        <p className="app-footer__sub">
          Local keys only. Transactions are signed client-side and verified on
          the server.
        </p>
      </div>
      <div className="app-footer__pill">Glass + Neon UI v2</div>
    </section>
  );
}

export default AppFooter;
