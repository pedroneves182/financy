import { useState, type FormEvent } from "react";
import { Mail, UserRound } from "lucide-react";
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "../graphql";
import type { AuthPayload } from "../types";
import { Brand } from "../components/Brand";

export function RegisterPage({ onAuthenticated, onLogin }: { onAuthenticated: (payload: AuthPayload) => void; onLogin: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, { loading, error }] = useMutation<{ register: AuthPayload }>(REGISTER_MUTATION);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await register({ variables: { name, email, password } });
      if (result.data?.register) onAuthenticated(result.data.register);
    } catch { /* errors are shown below */ }
  }

  return <main className="auth-page"><Brand /><section className="auth-card">
    <header className="auth-heading"><h1>Criar conta</h1><p>Comece a controlar suas finanças ainda hoje</p></header>
    <form className="auth-form" onSubmit={submit}>
      <label className="field"><span>Nome completo</span><span className="input-wrap"><UserRound size={18} /><input autoComplete="name" type="text" placeholder="Seu nome completo" value={name} onChange={event => setName(event.target.value)} maxLength={60} required /></span></label>
      <label className="field"><span>E-mail</span><span className="input-wrap"><Mail size={18} /><input autoComplete="email" type="email" placeholder="seu@email.com" value={email} onChange={event => setEmail(event.target.value)} required /></span></label>
      <label className="field"><span>Senha</span><input className="text-input" autoComplete="new-password" type="password" placeholder="Mínimo de 8 caracteres" value={password} onChange={event => setPassword(event.target.value)} minLength={8} required /></label>
      {error && <p className="form-error" role="alert">{error.message.toLocaleLowerCase("pt-BR").includes("account with this email") ? "Já existe uma conta com este e-mail." : "Não foi possível criar sua conta. Confira os dados e tente novamente."}</p>}
      <button className="button primary full" type="submit" disabled={loading}>{loading ? "Aguarde…" : "Cadastrar"}</button>
    </form>
    <div className="auth-divider"><span>ou</span></div>
    <div className="auth-switch"><p>Já tem uma conta?</p><button className="button outline full" onClick={onLogin}>Fazer login</button></div>
  </section></main>;
}
