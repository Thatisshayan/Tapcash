import { applyBonus, getGiftCardBonus, GIFT_CARD_BONUSES } from "../giftCardBonus";

describe("Gift Card Bonus", () => {
  describe("getGiftCardBonus", () => {
    it("should return bonus for steam", () => {
      const bonus = getGiftCardBonus("steam");
      expect(bonus).toBeDefined();
      expect(bonus!.bonusPercent).toBe(1);
    });

    it("should return bonus for tim_hortons", () => {
      const bonus = getGiftCardBonus("tim_hortons");
      expect(bonus).toBeDefined();
      expect(bonus!.bonusPercent).toBe(3);
    });

    it("should return bonus for canadian_tire", () => {
      const bonus = getGiftCardBonus("canadian_tire");
      expect(bonus).toBeDefined();
      expect(bonus!.bonusPercent).toBe(3);
    });

    it("should return bonus for cineplex", () => {
      const bonus = getGiftCardBonus("cineplex");
      expect(bonus).toBeDefined();
      expect(bonus!.bonusPercent).toBe(2);
    });

    it("should return undefined for paypal", () => {
      expect(getGiftCardBonus("paypal")).toBeUndefined();
    });

    it("should return undefined for interac", () => {
      expect(getGiftCardBonus("interac")).toBeUndefined();
    });

    it("should return undefined for bitcoin", () => {
      expect(getGiftCardBonus("bitcoin")).toBeUndefined();
    });

    it("should have 7 bonus methods configured", () => {
      expect(GIFT_CARD_BONUSES).toHaveLength(7);
    });
  });

  describe("applyBonus", () => {
    it("should apply 1% bonus for steam", () => {
      const result = applyBonus(10000, "steam");
      expect(result.base).toBe(10000);
      expect(result.bonus).toBe(100);
      expect(result.total).toBe(10100);
    });

    it("should apply 3% bonus for tim_hortons", () => {
      const result = applyBonus(10000, "tim_hortons");
      expect(result.base).toBe(10000);
      expect(result.bonus).toBe(300);
      expect(result.total).toBe(10300);
    });

    it("should apply 2% bonus for cineplex", () => {
      const result = applyBonus(5000, "cineplex");
      expect(result.base).toBe(5000);
      expect(result.bonus).toBe(100);
      expect(result.total).toBe(5100);
    });

    it("should return no bonus for paypal", () => {
      const result = applyBonus(10000, "paypal");
      expect(result.base).toBe(10000);
      expect(result.bonus).toBe(0);
      expect(result.total).toBe(10000);
    });

    it("should return no bonus for interac", () => {
      const result = applyBonus(10000, "interac");
      expect(result.base).toBe(10000);
      expect(result.bonus).toBe(0);
      expect(result.total).toBe(10000);
    });

    it("should floor fractional bonus amounts", () => {
      const result = applyBonus(3333, "steam");
      expect(result.bonus).toBe(33);
    });

    it("should handle zero amount", () => {
      const result = applyBonus(0, "steam");
      expect(result.bonus).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
