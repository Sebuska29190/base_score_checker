import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
const BASESCAN_API = "https://api.etherscan.io/v2/api";

async function getBalance(address: string) {
  const res = await fetch(
    `${BASESCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`
  );
  const data = await res.json();
  return Number(data.result ?? 0) / 1e18;
}

async function getTxListLength(address: string) {
  const res = await fetch(
    `${BASESCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${API_KEY}`
  );
  const data = await res.json();
  return Array.isArray(data.result) ? data.result.length : 0;
}

function computeScore(balance: number, txCount: number) {
  let score = 0;
  if (balance > 0.1) score += 20;
  if (balance > 1) score += 30;
  if (txCount > 10) score += 20;
  if (txCount > 50) score += 30;
  return Math.min(score, 100);
}

function computeBadge(score: number) {
  if (score >= 80) return "Gold";
  if (score >= 50) return "Silver";
  if (score >= 20) return "Bronze";
  return "Newbie";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const wallet = typeof body.wallet === "string" ? body.wallet.trim() : "";

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Wallet address is required" },
        { status: 400 }
      );
    }

    const balance = await getBalance(wallet);
    const txCount = await getTxListLength(wallet);
    const score = computeScore(balance, txCount);
    const badge = computeBadge(score);

    return NextResponse.json({
      success: true,
      wallet,
      balance,
      txCount,
      score,
      badge,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
