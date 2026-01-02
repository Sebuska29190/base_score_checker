import { NextRequest, NextResponse } from "next/server";

// Etherscan API V2 dla Base Mainnet (chainid = 8453)
const ETHERSCAN_API = "https://api.etherscan.io/v2/api";
const CHAIN_ID = 8453; // Base Mainnet

// Pobiera native balance (saldo) z Etherscan
async function getBalance(address: string) {
  const url = `${ETHERSCAN_API}?chainid=${CHAIN_ID}&module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error("Etherscan balance error:", res.status, text);
    throw new Error("Balance fetch failed");
  }

  const data = await res.json();
  // Etherscan API V2 zwraca "result" jako string z liczba w wei
  const balanceWei = data.result ?? "0";
  const balance = Number(balanceWei) / 1e18;
  return balance;
}

// Pobiera listę transakcji i liczy ich ilość
async function getTxListLength(address: string) {
  const url = `${ETHERSCAN_API}?chainid=${CHAIN_ID}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    console.error("Etherscan txlist error:", res.status, text);
    throw new Error("Tx list fetch failed");
  }

  const data = await res.json();
  const result = Array.isArray(data.result) ? data.result : [];
  return result.length;
}

// Prosty scoring na podstawie salda i liczby transakcji
function computeScore(balance: number, txCount: number) {
  let score = 0;
  if (balance > 0.1) score += 20;
  if (balance > 1) score += 30;
  if (txCount > 10) score += 20;
  if (txCount > 50) score += 30;
  return Math.min(score, 100);
}

// Nadawanie odznaki wg score
function computeBadge(score: number) {
  if (score >= 80) return "Gold";
  if (score >= 50) return "Silver";
  if (score >= 20) return "Bronze";
  return "Newbie";
}

// Główny handler dla POST /api/check
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

    // Pobranie salda i liczby transakcji
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
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
