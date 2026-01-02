"use client";
import { useEffect } from "react";
import { useQuickAuth, useMiniKit } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

// Typ odpowiedzi API
interface WalletCheckResponse {
  success: boolean;
  user?: {
    fid: number;
    wallet?: string;
    score?: number;
    badges?: string[];
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  // Init MiniKit
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  // Wywołanie API wallet check
  const { data, isLoading, error } = useQuickAuth<WalletCheckResponse>(
    "/api/check",
    { method: "GET" }
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{minikitConfig.miniapp.name.toUpperCase()}</h1>
      <p className={styles.subtitle}>
        {isLoading && "Checking your wallet..."}
        {error && `Error: ${error.message}`}
        {data?.success && data.user
          ? `Wallet: ${data.user.wallet} | Score: ${data.user.score} | Badges: ${data.user.badges?.join(", ")}`
          : ""}
      </p>
    </div>
  );
}
