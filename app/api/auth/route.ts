import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

// Typ odpowiedzi po weryfikacji JWT
interface WalletCheckPayload {
  sub: number;         // FID użytkownika
  iat: number;         // issued at
  exp: number;         // expires at
  wallet: string;      // adres portfela
  score: number;       // score portfela
  badges: string[];    // zdobyte odznaki
}

// Helper do pobrania hosta
function getUrlHost(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host;
    } catch {}
  }
  const host = request.headers.get("host");
  if (host) return host;

  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }
  return new URL(urlValue).host;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    // Weryfikacja JWT
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1],
      domain: getUrlHost(request),
    }) as WalletCheckPayload;

    // TODO: tutaj możesz dodać wywołanie BaseScan API, żeby policzyć score portfela
    // przykładowo: const walletScore = await fetchBaseScore(payload.wallet);

    return NextResponse.json({
      success: true,
      user: {
        fid: payload.sub,
        wallet: payload.wallet,
        score: payload.score,
        badges: payload.badges,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      },
    });

  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 500 });
    }
    throw e;
  }
}
