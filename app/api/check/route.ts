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
    // błąd obsługiwany, ale "err" nie jest deklarowane
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
