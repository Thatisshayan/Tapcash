export function setNodeEnv(value: string): void {
  // Plain assignment, not Object.defineProperty. process.env is backed by a
  // native binding whose defineProperty trap silently no-ops writes (no
  // throw, no error) even when the existing descriptor is a perfectly
  // ordinary writable/enumerable/configurable data property -- verified
  // directly: `Object.defineProperty(process.env, "NODE_ENV", {value: "x",
  // configurable: true, writable: true, enumerable: true})` left NODE_ENV
  // unchanged, while `process.env.NODE_ENV = "x"` took effect immediately.
  // The previous defineProperty-based implementation caused every test that
  // called setNodeEnv("production") to silently keep running under
  // NODE_ENV=test, masking production-only branches (e.g.
  // src/lib/__tests__/origin.test.ts "should reject missing origin in
  // production mode").
  process.env.NODE_ENV = value;
}
