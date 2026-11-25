import { Wallet } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-small" : ""}`}><span className="brand-mark"><Wallet size={compact ? 17 : 21} strokeWidth={2.3} /></span><span>financy</span></span>;
}
