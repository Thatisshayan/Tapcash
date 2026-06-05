import { ShieldCheck, BadgeCheck, Zap, Star } from "lucide-react";

export default function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: "Verified Offers", text: "Checked before listing" },
    { icon: BadgeCheck, title: "Clear Requirements", text: "Know exactly what to do" },
    { icon: Zap, title: "Fast Cashout", text: "PayPal, crypto, and cards" },
    { icon: Star, title: "4.8/5 Excellent", text: "Use real review count when verified" },
  ];

  return (
    <section className="trust">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title}>
          <Icon />
          <b>{title}</b>
          <span>{text}</span>
        </div>
      ))}
    </section>
  );
}
