"use client";

import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <section className="workspace-error" role="alert">
    <span className="challenge-emblem"><WifiOff size={28} /></span>
    <h2>We couldn&apos;t open this page</h2>
    <p>Check your connection and try again.</p>
    <p lang="bn">পাতাটি খোলা যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।</p>
    <div className="challenge-result-actions">
      <button className="button button-primary" type="button" onClick={reset}><RefreshCw size={16} />Try again / আবার চেষ্টা</button>
      <Link className="button button-secondary" href="/dashboard">Overview / সারসংক্ষেপ</Link>
    </div>
  </section>;
}
