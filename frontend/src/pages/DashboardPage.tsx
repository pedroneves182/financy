import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowRight, ArrowUpCircle, CirclePlus, Tag, Wallet } from "lucide-react";
import { useQuery } from "@apollo/client";
import { CATEGORIES_QUERY, TRANSACTIONS_QUERY } from "../graphql";
import type { Category, Transaction } from "../types";
import { formatCurrency, formatDate } from "../types";
import type { PageKey } from "../components/Topbar";
import { TransactionDialog } from "../components/TransactionDialog";
import { getCategoryPresentation } from "../utils/category-presentation";

export function DashboardPage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const [transactionDialog, setTransactionDialog] = useState(false);
  const { data, loading, error } = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY);
  const { data: categoryData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY);
  const transactions = data?.transactions ?? [];
  const month = new Date();
  const thisMonth = useMemo(() => transactions.filter(t => { const date = new Date(t.occurredAt); return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear(); }), [transactions, month.getMonth(), month.getFullYear()]);
  const income = thisMonth.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amountCents, 0);
  const expenses = thisMonth.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amountCents, 0);
  const balance = transactions.reduce((sum, t) => sum + (t.type === "INCOME" ? t.amountCents : -t.amountCents), 0);
  const summary = [
    { label: "Saldo total", value: balance, Icon: Wallet, tone: "neutral" },
    { label: "Receitas do mês", value: income, Icon: ArrowUpCircle, tone: "positive" },
    { label: "Despesas do mês", value: expenses, Icon: ArrowDownCircle, tone: "negative" },
  ];
  return <section className="page-section">
    <div className="page-title-row"><div><h1>Dashboard</h1><p>Acompanhe sua vida financeira em um só lugar.</p></div><button className="button primary" onClick={() => setTransactionDialog(true)}><CirclePlus size={17} /> Nova transação</button></div>
    {error && <p className="notice error" role="alert">Não foi possível carregar as transações. Tente novamente.</p>}
    <div className="summary-grid">{summary.map(({ label, value, Icon, tone }) => <article className="summary-card" key={label}><div className="summary-label"><Icon size={19} className={`summary-icon ${tone}`} /><span>{label}</span></div><strong>{loading ? "—" : formatCurrency(value)}</strong></article>)}</div>
    <div className="dashboard-grid">
      <section className="panel transactions-panel"><header className="panel-heading"><h2>Transações recentes</h2><button className="text-link" onClick={() => onNavigate("transactions")}>Ver todas <ArrowRight size={16} /></button></header>
        {loading ? <div className="empty-state">Carregando…</div> : transactions.length === 0 ? <div className="empty-state"><span className="empty-icon"><Wallet size={22} /></span><strong>Suas transações aparecerão aqui</strong><p>Registre sua primeira receita ou despesa para acompanhar seu saldo.</p><button className="button outline" onClick={() => setTransactionDialog(true)}>Criar transação</button></div> : <div className="recent-list">{transactions.slice(0, 5).map(t => { const { Icon, tone } = getCategoryPresentation(t.category?.name, t.category?.color, t.category?.icon); return <div className="recent-row" key={t.id}><span className={`transaction-icon ${tone}`}><Icon size={17} /></span><span className="recent-name"><strong>{t.description}</strong><small>{formatDate(t.occurredAt)}</small></span><span className={`category-pill ${tone}`}>{t.category?.name ?? "Sem categoria"}</span><strong className={`amount ${t.type.toLowerCase()}`}>{t.type === "INCOME" ? "+" : "−"} {formatCurrency(t.amountCents)}</strong></div>; })}<button className="dashboard-add-link" onClick={() => setTransactionDialog(true)}><CirclePlus size={17} /> Nova transação</button></div>}
      </section>
      <aside className="panel aside-panel"><header className="panel-heading"><h2>Categorias</h2><button className="text-link" onClick={() => onNavigate("categories")}>Gerenciar <ArrowRight size={16} /></button></header>{(categoryData?.categories ?? []).length === 0 ? <div className="category-overview-empty"><Tag size={20} /><span>Suas categorias aparecerão aqui.</span><button className="text-link" onClick={() => onNavigate("categories")}>Criar categoria <ArrowRight size={15} /></button></div> : <div className="category-overview-list">{(categoryData?.categories ?? []).slice(0, 6).map(category => { const entries = transactions.filter(t => t.category?.id === category.id); const spent = entries.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amountCents, 0); const { Icon, tone } = getCategoryPresentation(category.name, category.color, category.icon); return <div className="category-overview-row" key={category.id}><span className={`category-symbol ${tone}`}><Icon size={17} /></span><span className="category-overview-name">{category.name}</span><small>{entries.length} {entries.length === 1 ? "item" : "itens"}</small><strong>{formatCurrency(spent)}</strong></div>; })}</div>}<button className="category-overview-add" onClick={() => onNavigate("categories")}><CirclePlus size={17} /> Nova categoria</button></aside>
    </div>{transactionDialog && <TransactionDialog onClose={() => setTransactionDialog(false)} />}
  </section>;
}
