import { NextRequest, NextResponse } from "next/server";

// Etherscan API V2 dla Base
const ETHERSCAN_API = "https://api.etherscan.io/v2/api";
const CHAIN_ID = 8453; // Base Mainnet

async function safeEtherscanFetch(url: string) {
  const res = await fetch(url);
  const text = await res.text(); // zawsze odczytujemy surowy tekst
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("Etherscan non-JSON response:", text);
    throw new Error("Non JSON response from Etherscan");
  }
  return json;
}

async function getBalance(address: string) {
  const url = `${ETHERSCAN_API}?chainid=${CHAIN_ID}&module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`;

  const data: any = await safeEtherscanFetch(url);

  // jeśli Etherscan zgłasza błąd statusem
  if (data.status !== "1") {
    console.error("Etherscan balance error", { url, data });
    throw new Error(data.message || "Etherscan balance error");
  }

  const balance = Number(data.result ?? 0) / 1e18;
  return balance;
}

async function getTxListLength(address: string) {
  const url = `${ETHERSCAN_API}?chainid=${CHAIN_ID}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;

  const data: any = await safeEtherscanFetch(url);

  if (data.status !== "1") {
    console.error("Etherscan txlist error", { url, data });
    throw new Error(data.message || "Etherscan txlist error");
  }

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

    if (!process.env.ETHERSCAN_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Missing ETHERSCAN_API_KEY" },
        { status: 500 }
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
  } catch (error) {
    console.error("API /api/check error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
