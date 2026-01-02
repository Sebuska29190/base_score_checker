/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";

// Ustaw swój Infura Base Mainnet RPC URL
const RPC_URL =
  process.env.INFURA_BASE_RPC_URL || "https://base-mainnet.infura.io/v3/<YOUR_INFURA_PROJECT_ID>";

// helper: wykonanie JSON‑RPC do Infura
async function rpcCall(method: string, params: any[]) {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method,
    params,
  };

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message || "RPC error");
  }

  return json.result;
}

async function getBalance(address: string) {
  // eth_getBalance zwraca hex z saldem w wei
  const balanceHex = await rpcCall("eth_getBalance", [address, "latest"]);
  return parseInt(balanceHex as string, 16) / 1e18;
}

async function getTxCount(address: string) {
  // eth_getTransactionCount zwraca liczbe wyslanych tx (nonce)
  const txHex = await rpcCall("eth_getTransactionCount", [address, "latest"]);
  return parseInt(txHex as string, 16);
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
        { success: false, message: "Wallet address required" },
        { status: 400 }
      );
    }

    const balance = await getBalance(wallet);
    const txCount = await getTxCount(wallet);
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
  } catch (err) {
    console.error("RPC error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
