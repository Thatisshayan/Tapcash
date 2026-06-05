import { motion } from "framer-motion";
import { ShieldCheck, Gamepad2, Target, Wallet, ChevronRight } from "lucide-react";
import { theme } from "../theme";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="micro">
          <ShieldCheck size={18} /> Real offers. Tracked rewards. Clean cashout.
        </div>
        <h1>
          Play.
          <br />
          <span>Earn.</span>
          <br />
          Cash Out.
        </h1>
        <p>Complete verified offers. Track every step. Cash out when rewards clear.</p>
        <div className="cta-row">
          <button className="primary">
            Start My Safest Offer <ChevronRight size={20} />
          </button>
          <button className="secondary">See How It Works</button>
        </div>
        <div className="mini-points">
          <span>
            <Gamepad2 /> Play Games
          </span>
          <span>
            <Target /> Earn Rewards
          </span>
          <span>
            <Wallet /> Cash Out Fast
          </span>
        </div>
      </div>

      <motion.div
        className="hero-person"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="halo" />
        <div className="person-card">
          <div className="face">&#128578;</div>
          <div className="phone">TC</div>
        </div>
      </motion.div>

      <div className="hero-side">
        <div className="balance-card">
          <span>Your Balance</span>
          <strong>$12.50</strong>
          <em>+$4.20 today</em>
          <div className="bar">
            <i />
          </div>
          <small>Min. $20 to withdraw</small>
        </div>
        <div className="safe-card">
          <b>New to TapCash?</b>
          <h3>Start with our Safest Offer</h3>
          <p>No purchase &middot; high tracking &middot; fast payout</p>
          <div className="score-mini">
            TapScore <strong>94%</strong>
          </div>
          <button>Start Safely</button>
        </div>
      </div>
    </section>
  );
}
