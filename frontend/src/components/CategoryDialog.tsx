import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "@apollo/client";
import { CATEGORIES_QUERY, CREATE_CATEGORY, UPDATE_CATEGORY } from "../graphql";
import type { Category } from "../types";
import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from "../utils/category-presentation";

export function CategoryDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "briefcase-business");
  const [color, setColor] = useState(category?.color ?? "blue");
  const [message, setMessage] = useState("");
  const options = { refetchQueries: [{ query: CATEGORIES_QUERY }], awaitRefetchQueries: true };
  const [create, createState] = useMutation(CREATE_CATEGORY, options);
  const [update, updateState] = useMutation(UPDATE_CATEGORY, options);
  const loading = createState.loading || updateState.loading;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const values = { name: name.trim(), description: description.trim(), icon, color };
    try {
      if (category) await update({ variables: { id: category.id, ...values } });
      else await create({ variables: values });
      onClose();
    } catch {
      setMessage("Não foi possível salvar. Talvez já exista uma categoria com esse nome.");
    }
  }

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="dialog category-dialog" role="dialog" aria-modal="true" aria-labelledby="category-title">
      <header className="dialog-header"><div><h2 id="category-title">{category ? "Editar categoria" : "Nova categoria"}</h2><p>Organize suas transações com categorias</p></div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={19} /></button></header>
      <form className="dialog-form" onSubmit={submit}>
        <label className="field"><span>Nome</span><input className="text-input" placeholder="Ex.: Alimentação" value={name} onChange={event => setName(event.target.value)} maxLength={60} autoFocus required /></label>
        <label className="field"><span>Descrição</span><textarea className="text-input category-description-input" placeholder="Ex.: Restaurantes, delivery e refeições" value={description} onChange={event => setDescription(event.target.value)} maxLength={200} /></label>
        <fieldset className="category-picker"><legend>Ícone</legend><div className="category-icon-options">{CATEGORY_ICON_OPTIONS.map(({ value, label, Icon }) => <button key={value} type="button" className={`category-icon-choice ${icon === value ? "selected" : ""}`} aria-label={label} aria-pressed={icon === value} title={label} onClick={() => setIcon(value)}><Icon size={20} /></button>)}</div></fieldset>
        <fieldset className="category-picker"><legend>Cor</legend><div className="category-color-options">{CATEGORY_COLOR_OPTIONS.map(option => <button key={option.value} type="button" className={`category-color-choice ${color === option.value ? "selected" : ""}`} aria-label={option.label} aria-pressed={color === option.value} title={option.label} onClick={() => setColor(option.value)}><span style={{ backgroundColor: option.hex }} /></button>)}</div></fieldset>
        {message && <p className="form-error" role="alert">{message}</p>}
        <footer className="dialog-actions"><button className="button primary" type="submit" disabled={loading}>{loading ? "Salvando…" : category ? "Salvar alterações" : "Criar categoria"}</button></footer>
      </form>
    </section>
  </div>;
}
