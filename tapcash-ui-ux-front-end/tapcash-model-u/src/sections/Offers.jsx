import { Flame, ChevronRight } from "lucide-react";
import { Zap } from "lucide-react";
import { offers, theme } from "../theme";

function Badge({ children }) {
  return (
    <span className="badge">
      <Zap size={13} />
      {children}
    </span>
  );
}

export default function Offers() {
  return (
    <section className="offers" id="offers">
      <div className="section-head">
        <h2>
          <Flame /> Top Offers
        </h2>
        <a href="#all">
          View all <ChevronRight size={18} />
        </a>
      </div>
      <div className="offer-grid">
        {offers.map((o, i) => (
          <article className="offer" key={o.id}>
            {o.hot && <mark>HOT</mark>}
            <div className="offer-art">{o.image}</div>
            <h3>{o.title}</h3>
            <div className="tags">
              {o.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <p>{o.platform}</p>
            <strong>{o.payout}</strong>
            <button>Start Offer</button>
          </article>
        ))}
      </div>
    </section>
  );
}
