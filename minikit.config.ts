const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjI4MTUwMiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDZmOEZFRkUwZDZhNDU1MDJDNEI2MjFiOEI5RkMzOUQ5QTk4RjZDNkIifQ",
    payload: "eyJkb21haW4iOiJiYXNlc2NvcmVjaGVja2VyLnZlcmNlbC5hcHAifQ",
    signature: "6zdfEN572VGVXLx0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIp7InR5cGUiOiJ3ZWJhdXRobi5nZXQiLCJjaGFsbGVuZ2UiOiItZUZJeDZVbGdfaXJMXzFuQnEwYXlyZTlhU0k5WHNZQi0zN0VKSEdJOVFJIiwib3JpZ2luIjoiaHR0cHM6Ly9rZXlzLmNvaW5iYXNlLmNvbSIsImNyb3NzT3JpZ2luIjpmYWxzZX0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAZJJkkmSSZJJkkmSSZJJkkmSSZJJkkmSSZJJkkmSSZJI"
  },  // <-- tutaj był brakujący przecinek
  miniapp: {
    version: "1",
    name: "Base Score Checker",
    subtitle: "Check your wallet score instantly",
    description: "Automatically detects your Base wallet and calculates your wallet score or badge eligibility",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "tools",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`
  }
} as const;
