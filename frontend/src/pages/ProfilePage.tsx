import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client";
import { LogOut, Mail, UserRound } from "lucide-react";
import { UPDATE_PROFILE_MUTATION } from "../graphql";
import type { User } from "../types";

export function ProfilePage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [name, setName] = useState(user.name);
  const [updateProfile, { loading, error }] = useMutation(UPDATE_PROFILE_MUTATION);

  useEffect(() => setName(user.name), [user.name]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile({ variables: { name } });
    } catch { /* errors are shown below */ }
  }

  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

  return <section className="page-section"><div className="page-title-row"><div><h1>Meu perfil</h1><p>Gerencie os dados da sua conta.</p></div></div>
    <article className="panel profile-card figma-profile-card">
      <header className="profile-heading"><div className="profile-avatar figma-profile-avatar">{initials || "?"}</div><h2>{name || user.email.split("@")[0]}</h2><p>{user.email}</p></header>
      <div className="profile-divider" />
      <form className="profile-edit-form figma-profile-form" onSubmit={saveProfile}>
        <label className="field"><span>Nome completo</span><span className="input-wrap"><UserRound size={16} /><input autoComplete="name" maxLength={60} value={name} onChange={event => setName(event.target.value)} required /></span></label>
        <label className="field"><span>E-mail</span><span className="input-wrap is-readonly"><Mail size={16} /><input type="email" value={user.email} readOnly /></span></label>
        <p className="profile-email-hint">O e-mail não pode ser alterado</p>
        {error && <p className="form-error" role="alert">Não foi possível salvar as alterações. Tente novamente.</p>}
        <button className="button primary full profile-save-button" type="submit" disabled={loading || !name.trim()}>{loading ? "Salvando…" : "Salvar alterações"}</button>
      </form>
      <button className="button outline full profile-logout-button" onClick={onLogout}><LogOut size={16} /> Sair da conta</button>
    </article>
  </section>;
}
