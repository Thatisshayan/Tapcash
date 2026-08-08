export function getRouteFromUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const slug = decodeURIComponent(normalizedPath.replace(/^\/+/, ""));

  if (host === "activity" || normalizedPath === "/activity") {
    return "/(tabs)/activity";
  }

  if (host === "cashout" || normalizedPath === "/cashout") {
    return "/(tabs)/cashout";
  }

  if (host === "earn" || normalizedPath === "/earn") {
    return "/(tabs)/earn";
  }

  if (host === "offer" && slug) {
    return `/(tabs)/offer/${slug}`;
  }

  if (normalizedPath.startsWith("/offer/")) {
    return `/(tabs)/offer/${slug.replace(/^offer\//, "")}`;
  }

  return null;
}
