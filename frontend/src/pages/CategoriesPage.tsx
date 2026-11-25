import { useState } from "react";
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Tag, Trash2, Utensils } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import { CATEGORIES_QUERY, DELETE_CATEGORY, TRANSACTIONS_QUERY } from "../graphql";
import type { Category, Transaction } from "../types";
import { CategoryDialog } from "../components/CategoryDialog";
import { getCategoryPresentation } from "../utils/category-presentation";

export function CategoriesPage() {
  const { data, loading, error } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY);
  const { data: transactionData } = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY);
  const [dialog, setDialog] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [remove] = useMutation(DELETE_CATEGORY, { refetchQueries: [{ query: CATEGORIES_QUERY }, { query: TRANSACTIONS_QUERY }], awaitRefetchQueries: true });
  const categories = data?.categories ?? [];
  function countFor(id: string) { return transactionData?.transactions.filter(t => t.category?.id === id).length ?? 0; }
  const mostUsed = categories.reduce<Category | null>((best, category) => !best || countFor(category.id) > countFor(best.id) ? category : best, null);
  async function deleteCategory(category: Category) { if (window.confirm(`Excluir a categoria “${category.name}”? As transações serão mantidas sem categoria.`)) { try { await remove({ variables: { id: category.id } }); } catch { window.alert("Não foi possível excluir a categoria."); } } }
  return <section className="page-section"><div className="page-title-row"><div><h1>Categorias</h1><p>Organize suas receitas e despesas por categoria.</p></div><button className="button primary" onClick={() => setDialog({ open: true })}><Plus size={17} /> Nova categoria</button></div>
    {error && <p className="notice error" role="alert">Não foi possível carregar as categorias.</p>}
    {loading ? <div className="panel empty-state">Carregando categorias…</div> : categories.length === 0 ? <div className="panel empty-state category-empty"><span className="empty-icon"><Tag size={22} /></span><strong>Você ainda não tem categorias</strong><p>Crie categorias para organizar suas receitas e despesas.</p><button className="button primary" onClick={() => setDialog({ open: true })}><Plus size={17} /> Criar categoria</button></div> : <><div className="category-stats"><article className="summary-card category-stat"><Tag size={20} /><strong>{categories.length}<small>Total de categorias</small></strong></article><article className="summary-card category-stat"><ArrowUpDown size={20} /><strong>{transactionData?.transactions.length ?? 0}<small>Total de transações</small></strong></article><article className="summary-card category-stat"><Utensils size={20} /><strong>{mostUsed?.name ?? "—"}<small>Categoria mais utilizada</small></strong></article></div><div className="category-grid">{categories.map(category => { const { Icon, tone } = getCategoryPresentation(category.name, category.color, category.icon); return <article key={category.id} className="category-card"><header className="category-card-top"><span className={`category-symbol ${tone}`}><Icon size={19} /></span><span className="category-actions"><button className="icon-button" aria-label={`Editar ${category.name}`} onClick={() => setDialog({ open: true, category })}><Pencil size={15} /></button><button className="icon-button danger-hover" aria-label={`Excluir ${category.name}`} onClick={() => void deleteCategory(category)}><Trash2 size={15} /></button></span></header><div className="category-card-copy"><h2>{category.name}</h2><p>{category.description || "Movimentações nesta categoria"}</p></div><footer><span className={`category-pill ${tone}`}>{countFor(category.id)} {countFor(category.id) === 1 ? "item" : "itens"}</span><span className="muted-count">{countFor(category.id)} transações</span></footer></article>; })}<button className="category-add-card" onClick={() => setDialog({ open: true })}><span className="add-card-icon"><MoreHorizontal size={20} /></span><span>Adicionar categoria</span></button></div></>}
    {dialog.open && <CategoryDialog category={dialog.category} onClose={() => setDialog({ open: false })} />}
  </section>;
}
