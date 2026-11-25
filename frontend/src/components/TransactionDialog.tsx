import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import { CATEGORIES_QUERY, CREATE_TRANSACTION, TRANSACTIONS_QUERY, UPDATE_TRANSACTION } from "../graphql";
import type { Category, Transaction } from "../types";

function localDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}
export function TransactionDialog({ transaction, onClose }: { transaction?: Transaction; onClose: () => void }) {
  const editing = Boolean(transaction);
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(transaction ? (transaction.amountCents / 100).toFixed(2).replace(".", ",") : "");
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(transaction?.category?.id ?? "");
  const [occurredAt, setOccurredAt] = useState(localDate(transaction?.occurredAt));
  const [message, setMessage] = useState("");
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY);
  const options = { refetchQueries: [{ query: TRANSACTIONS_QUERY }], awaitRefetchQueries: true };
  const [create, createState] = useMutation(CREATE_TRANSACTION, options);
  const [update, updateState] = useMutation(UPDATE_TRANSACTION, options);
  const loading = createState.loading || updateState.loading;
  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage("");
    const normalizedAmount = amount.includes(",") ? amount.replace(/\./g, "").replace(",", ".") : amount;
    const cents = Math.round(Number(normalizedAmount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) { setMessage("Informe um valor maior que zero."); return; }
    if (!categoryId) { setMessage("Selecione uma categoria."); return; }
    const input = { type, description: description.trim(), amountCents: cents, occurredAt: new Date(`${occurredAt}T12:00:00`).toISOString(), categoryId };
    try { if (transaction) await update({ variables: { id: transaction.id, input } }); else await create({ variables: { input } }); onClose(); }
    catch { setMessage("Não foi possível salvar. Confira os dados e tente novamente."); }
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="transaction-title"><header className="dialog-header"><div><h2 id="transaction-title">{editing ? "Editar transação" : "Nova transação"}</h2><p>Registre os detalhes da sua movimentação.</p></div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={19} /></button></header>
    <form className="dialog-form" onSubmit={submit}><fieldset className="type-switch"><legend>Tipo de transação</legend><button type="button" className={type === "EXPENSE" ? "selected expense-choice" : ""} onClick={() => setType("EXPENSE")}>Despesa</button><button type="button" className={type === "INCOME" ? "selected income-choice" : ""} onClick={() => setType("INCOME")}>Receita</button></fieldset>
      <label className="field"><span>Descrição</span><input className="text-input" placeholder="Ex.: Conta de luz" value={description} onChange={e => setDescription(e.target.value)} maxLength={200} required /></label>
      <div className="form-row"><label className="field"><span>Valor (R$)</span><input className="text-input" inputMode="decimal" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} required /></label><label className="field"><span>Data</span><input className="text-input" type="date" value={occurredAt} onChange={e => setOccurredAt(e.target.value)} required /></label></div>
      <label className="field"><span>Categoria</span><select className="text-input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required><option value="">Selecione uma categoria</option>{categoriesData?.categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      {(!categoriesData?.categories.length) && <p className="helper-text">Crie uma categoria antes de registrar uma transação.</p>}{message && <p className="form-error" role="alert">{message}</p>}
      <footer className="dialog-actions"><button type="button" className="button outline" onClick={onClose}>Cancelar</button><button type="submit" className="button primary" disabled={loading || !categoriesData?.categories.length}>{loading ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar transação"}</button></footer>
    </form></section></div>;
}
