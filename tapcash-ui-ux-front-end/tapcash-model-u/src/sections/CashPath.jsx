import { Gamepad2, Target, Clock3, CheckCircle2, Wallet } from "lucide-react";
import { cashPath } from "../theme";

const iconMap = {
  gamepad: Gamepad2,
  target: Target,
  clock: Clock3,
  check: CheckCircle2,
  wallet: Wallet,
};

export default function CashPath() {
  return (
    <section className="cashpath" id="cashpath">
      <h2>
        CashPath&trade; Live <i />
      </h2>
      <div className="path-row">
        {cashPath.map(({ step, title, text, icon }, i) => {
          const Icon = iconMap[icon] || Gamepad2;
          return (
            <div className="path-step" key={step}>
              <div className="icon">
                <Icon size={30} />
              </div>
              <b>{title}</b>
              <span>{text}</span>
              {i < cashPath.length - 1 && <div className="line" />}
            </div>
          );
        })}
      </div>
      <p>Track every step. See your reward hit your account.</p>
    </section>
  );
}
