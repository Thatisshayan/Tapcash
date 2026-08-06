export function setNodeEnv(value: string): void {
  // `enumerable: true` is required here: Node's process.env setter validates
  // that the descriptor is a fully configurable/writable/enumerable data
  // descriptor, and silently no-ops the write otherwise (no throw) in some
  // jest/node environments. Omitting it previously caused NODE_ENV mutations
  // in tests to be dropped without any error surfacing.
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}
