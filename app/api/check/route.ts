/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API = "https://api.etherscan.io/v2/api";
const CHAIN_ID = 8453;

async function safeEtherscanFetch(url: string) {
  const res = await fetch(url);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("Non‑JSON Etherscan response", text);
    throw new Error("NonJSON Etherscan response");
  }
  return json;
}

async function getBalance(address: string) {
  const url = `${ETHERSCAN_API}?chainid=${CHAIN_ID}&module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const data: any = await safeEtherscanFetch(url);

  if (data.status !== "1") {
    console.error("Etherscan balance error", data);
    throw new Error(data.message || "Balance error");
  }

  return Number(data.result ?? 0) / 1e18;
}

async function getTxListLength(address: string) {
  const url = `${ETHERSCAN_API}?chainid=${CHAIN_ID}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const data: any = await safeEtherscanFetch(url);

  if (data.status !== "1") {
    console.error("Etherscan txlist error", data);
    throw new Error(data.message || "Txlist error");
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
      return NextResponse.json({ success: false, message: "Wallet required" }, { status: 400 });
    }

    if (!process.env.ETHERSCAN_API_KEY) {
      return NextResponse.json({ success: false, message: "Missing API key" }, { status: 500 });
    }

    const balance = await getBalance(wallet);
    const txCount = await getTxListLength(wallet);
    const score = computeScore(balance, txCount);
    const badge = computeBadge(score);

    return NextResponse.json({ success: true, wallet, balance, txCount, score, badge });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
