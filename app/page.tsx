"use client";
import { useState } from "react";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<{ ethBalance: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/check-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unknown error");
      } else {
        setResult({ ethBalance: data.ethBalance });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Base Score Checker</h1>
      <input
        type="text"
        placeholder="Enter Base wallet address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        style={{ width: 400, padding: 10 }}
      />
      <button onClick={handleCheck} style={{ marginLeft: 10, padding: "10px 20px" }}>
        {loading ? "Checking..." : "Check Wallet"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <p>Wallet: {wallet}</p>
          <p>ETH Balance: {result.ethBalance} ETH</p>
        </div>
      )}
    </div>
  );
}
