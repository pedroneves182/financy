import { CircleUserRound, LayoutDashboard, ReceiptText, Tags } from "lucide-react";
import { Brand } from "./Brand";

export type PageKey = "dashboard" | "transactions" | "categories" | "profile";
const links: { key: PageKey; label: string; Icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "transactions", label: "Transações", Icon: ReceiptText },
  { key: "categories", label: "Categorias", Icon: Tags },
];

export function Topbar({ page, email, onNavigate }: { page: PageKey; email: string; onNavigate: (page: PageKey) => void }) {
  return <header className="topbar"><div className="topbar-inner">
    <button className="brand-button" onClick={() => onNavigate("dashboard")} aria-label="Ir para o dashboard"><Brand compact /></button>
    <nav className="main-nav" aria-label="Navegação principal">{links.map(({ key, label, Icon }) => <button key={key} className={`nav-link ${page === key ? "active" : ""}`} onClick={() => onNavigate(key)}><Icon size={17} /><span>{label}</span></button>)}</nav>
    <div className="user-menu"><button className={`avatar-button ${page === "profile" ? "selected" : ""}`} aria-label="Abrir perfil" title={email} onClick={() => onNavigate("profile")}><CircleUserRound size={19} /></button></div>
  </div></header>;
}
