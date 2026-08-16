import { signupSchema } from "../validation/signupSchema";

describe("Signup Schema Validation", () => {
  const validInput = {
    email: "test@gmail.com",
    password: "securepass123",
    displayName: "TestUser",
    dateOfBirth: "1995-06-15",
    tosAccepted: true as const,
    privacyAccepted: true as const,
    marketingAccepted: false,
  };

  it("should accept valid signup data", () => {
    const result = signupSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = signupSchema.safeParse({ ...validInput, password: "short" });
    expect(result.success).toBe(false);
  });

  it("should reject missing dateOfBirth", () => {
    const { dateOfBirth, ...noDob } = validInput;
    const result = signupSchema.safeParse(noDob);
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format", () => {
    const result = signupSchema.safeParse({ ...validInput, dateOfBirth: "15/06/1995" });
    expect(result.success).toBe(false);
  });

  it("should reject users under 13", () => {
    const today = new Date();
    const youngDob = `${today.getFullYear() - 12}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const result = signupSchema.safeParse({ ...validInput, dateOfBirth: youngDob });
    expect(result.success).toBe(false);
  });

  it("should accept users exactly 13", () => {
    const today = new Date();
    const thirteenDob = `${today.getFullYear() - 13}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const result = signupSchema.safeParse({ ...validInput, dateOfBirth: thirteenDob });
    expect(result.success).toBe(true);
  });

  it("should reject when tosAccepted is false", () => {
    const result = signupSchema.safeParse({ ...validInput, tosAccepted: false });
    expect(result.success).toBe(false);
  });

  it("should reject when privacyAccepted is false", () => {
    const result = signupSchema.safeParse({ ...validInput, privacyAccepted: false });
    expect(result.success).toBe(false);
  });

  it("should default marketingAccepted to false", () => {
    const { marketingAccepted, ...noMarketing } = validInput;
    const result = signupSchema.safeParse(noMarketing);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingAccepted).toBe(false);
    }
  });

  it("should accept optional displayName", () => {
    const { displayName, ...noName } = validInput;
    const result = signupSchema.safeParse(noName);
    expect(result.success).toBe(true);
  });
});
