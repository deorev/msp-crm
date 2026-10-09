import { describe, expect, it } from "vitest";
import { userLabel } from "../src/user-label.js";

describe("userLabel", () => {
  it("shows the signed-in user's name and role", () => {
    expect(userLabel("Morgan Lee", "Admin")).toBe("Morgan Lee · Admin");
  });
});
