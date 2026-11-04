import { buildSignupPayload, signupErrorMessage } from "../validation/buildSignupPayload";
import { signupSchema } from "../validation/signupSchema";

const valid = {
  name: "  Jane Doe ",
  email: " jane@example.com ",
  password: "correct-horse-battery",
  dateOfBirth: "1995-04-12",
  agreedToPolicies: true,
};

describe("buildSignupPayload matches the /api/auth/signup schema", () => {
  it("produces a body that passes signupSchema", () => {
    const result = signupSchema.safeParse(buildSignupPayload(valid, "fp-123"));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Jane Doe");
      expect(result.data.email).toBe("jane@example.com");
      expect(result.data.tosAccepted).toBe(true);
      expect(result.data.privacyAccepted).toBe(true);
    }
  });

  it("omits an empty display name instead of sending a too-short one", () => {
    const body = buildSignupPayload({ ...valid, name: "   " });
    expect(body.displayName).toBeUndefined();
    expect(signupSchema.safeParse(body).success).toBe(true);
  });

  it("is rejected when policies are not agreed", () => {
    expect(signupSchema.safeParse(buildSignupPayload({ ...valid, agreedToPolicies: false })).success).toBe(false);
  });

  it("is rejected without a date of birth or when under the minimum age", () => {
    expect(signupSchema.safeParse(buildSignupPayload({ ...valid, dateOfBirth: "" })).success).toBe(false);
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 10);
    const dob = tooYoung.toISOString().slice(0, 10);
    expect(signupSchema.safeParse(buildSignupPayload({ ...valid, dateOfBirth: dob })).success).toBe(false);
  });
});

describe("signupErrorMessage", () => {
  it("prefers field details over the generic error", () => {
    expect(
      signupErrorMessage({ error: "Validation failed", details: ["dateOfBirth: You must be at least 13 years old to register"] }, "x")
    ).toBe("You must be at least 13 years old to register");
  });

  it("falls back to error, then the fallback", () => {
    expect(signupErrorMessage({ error: "Registration rejected." }, "x")).toBe("Registration rejected.");
    expect(signupErrorMessage(null, "fallback")).toBe("fallback");
  });
});
