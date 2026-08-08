import fs from "fs";
import path from "path";
import { getRouteFromUrl } from "../../mobile/src/lib/deepLinks";

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Track 3 mobile regressions", () => {
  it("keeps SplashScreen imported where AuthContext hides it", () => {
    const source = read("mobile/src/auth/AuthContext.tsx");
    expect(source).toContain('import * as SplashScreen from "expo-splash-screen";');
    expect(source).toContain("SplashScreen.hideAsync()");
  });

  it("wires real Expo assets in both app config surfaces", () => {
    const appJson = read("mobile/app.json");
    const appConfig = read("mobile/app.config.js");

    for (const source of [appJson, appConfig]) {
      expect(source).toContain("./assets/icon.png");
      expect(source).toContain("./assets/splash.png");
      expect(source).toContain("./assets/adaptive-icon.png");
      expect(source).toContain("tapcash");
    }
  });

  it("removes Interac from the mobile cashout flow", () => {
    const source = read("mobile/app/(tabs)/cashout.tsx");
    expect(source).not.toMatch(/interac/i);
  });

  it("replaces placeholder mobile assets with real image files", () => {
    const assetPaths = [
      "mobile/assets/icon.png",
      "mobile/assets/adaptive-icon.png",
      "mobile/assets/splash.png",
      ...Array.from({ length: 10 }, (_, index) => `mobile/assets/offers/offer-${index + 1}.png`),
    ];

    for (const assetPath of assetPaths) {
      const { size } = fs.statSync(path.join(repoRoot, assetPath));
      expect(size).toBeGreaterThan(69);
    }
  });

  it("maps supported tapcash deep links to app routes", () => {
    expect(getRouteFromUrl("tapcash://activity")).toBe("/(tabs)/activity");
    expect(getRouteFromUrl("tapcash://cashout")).toBe("/(tabs)/cashout");
    expect(getRouteFromUrl("tapcash://offer/offer-42")).toBe("/(tabs)/offer/offer-42");
    expect(getRouteFromUrl("tapcash://unknown")).toBeNull();
  });
});
