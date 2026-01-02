import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
const BASESCAN_API = "https://api.basescan.org/api";

export async function POST(request: NextRequest) {
  const { wallet } = await request.json();

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    // Pobierz saldo ETH
    const balanceRes = await fetch(
      `${BASESCAN_API}?module=account&action=balance&address=${wallet}&tag=latest&apikey=${API_KEY}`
    );
    const balanceData = await balanceRes.json();

    // Tutaj możesz dodać dodatkowe endpointy np. ERC20 tokeny

    return NextResponse.json({
      success: true,
      wallet,
      ethBalance: Number(balanceData.result) / 1e18, // zamieniamy wei na ETH
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
