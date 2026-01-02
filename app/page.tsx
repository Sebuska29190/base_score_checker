"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface CheckResult {
  wallet: string;
  balance: number;
  txCount: number;
  score: number;
  badge: string;
}

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!wallet) {
      setError("Enter a valid Base wallet address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Check failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Base Wallet Score Checker</h1>

      <form onSubmit={handleCheck} className={styles.form}>
        <input
          type="text"
          placeholder="Enter Base wallet address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Checking..." : "Check Wallet"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.resultBox}>
          <p><strong>Wallet:</strong> {result.wallet}</p>
          <p><strong>Balance:</strong> {result.balance.toFixed(4)} Base</p>
          <p><strong>Transactions:</strong> {result.txCount}</p>
          <p><strong>Score:</strong> {result.score}</p>
          <p><strong>Badge:</strong> {result.badge}</p>
        </div>
      )}
    </div>
  );
}
