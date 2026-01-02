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
  } catch {
    setError("Server error"); // brak "err"
  } finally {
    setLoading(false);
  }
};
