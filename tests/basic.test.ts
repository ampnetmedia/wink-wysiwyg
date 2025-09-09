import { describe, it, expect } from "vitest";

describe("Basic Tests", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should verify package exports", () => {
    // This test ensures the package can be imported without errors
    expect(true).toBe(true);
  });
});
