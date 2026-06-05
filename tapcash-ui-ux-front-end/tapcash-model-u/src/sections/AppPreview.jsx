export default function AppPreview() {
  return (
    <section className="preview">
      <div>
        <h2>See It In Action</h2>
        <p>Offer details, TapScore, and cashout in one clean app flow.</p>
      </div>
      <div className="phones">
        <div className="phone-screen">
          <b>$12.50</b>
          <span>CashPath</span>
          <div className="mini-line" />
        </div>
        <div className="phone-screen">
          <b>TapScore 94%</b>
          <span>Monopoly Go!</span>
          <button>Start Offer</button>
        </div>
        <div className="phone-screen">
          <b>Cash Out</b>
          <span>PayPal &middot; Bitcoin &middot; Gift Cards</span>
          <button>Withdraw</button>
        </div>
      </div>
    </section>
  );
}
