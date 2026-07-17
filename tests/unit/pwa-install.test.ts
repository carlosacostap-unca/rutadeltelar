import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAppleMobileDevice, isInstallDismissed, isStandaloneDisplayMode, PWA_INSTALL_DISMISSAL_MS } from "../../app/lib/pwa-install.ts";

describe("PWA install helpers", () => {
  it("detects Apple mobile devices", () => { assert.equal(isAppleMobileDevice("iPhone"), true); assert.equal(isAppleMobileDevice("Macintosh", 5), true); assert.equal(isAppleMobileDevice("Android"), false); });
  it("detects standalone mode", () => { assert.equal(isStandaloneDisplayMode(true, false), true); assert.equal(isStandaloneDisplayMode(false, true), true); assert.equal(isStandaloneDisplayMode(false, false), false); });
  it("expires dismissals after thirty days", () => { const now = 3_000_000_000; assert.equal(isInstallDismissed(String(now - PWA_INSTALL_DISMISSAL_MS + 1), now), true); assert.equal(isInstallDismissed(String(now - PWA_INSTALL_DISMISSAL_MS), now), false); });
});
