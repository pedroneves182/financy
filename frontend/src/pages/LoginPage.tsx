import { useState, type FormEvent } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql";
import type { AuthPayload } from "../types";
import { Brand } from "../components/Brand";

export function LoginPage({ onAuthenticated, onRegister }: { onAuthenticated: (payload: AuthPayload) => void; onRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await login({ variables: { email, password } });
      if (result.data?.login) onAuthenticated(result.data.login);
    } catch { /* errors are shown below */ }
  }

  return <main className="auth-page"><Brand /><section className="auth-card">
    <header className="auth-heading"><h1>Fazer login</h1><p>Entre na sua conta para continuar</p></header>
    <form className="auth-form" onSubmit={submit}>
      <label className="field"><span>E-mail</span><span className="input-wrap"><Mail size={18} /><input autoComplete="email" type="email" placeholder="seu@email.com" value={email} onChange={event => setEmail(event.target.value)} required /></span></label>
      <label className="field"><span>Senha</span><span className="input-wrap"><LockKeyhole size={18} /><input autoComplete="current-password" type="password" placeholder="Sua senha" value={password} onChange={event => setPassword(event.target.value)} required /></span></label>
      {error && <p className="form-error" role="alert">E-mail ou senha inválidos. Tente novamente.</p>}
      <button className="button primary full" type="submit" disabled={loading}>{loading ? "Aguarde…" : "Fazer login"}</button>
    </form>
    <div className="auth-divider"><span>ou</span></div>
    <div className="auth-switch"><p>Ainda não tem uma conta?</p><button className="button outline full" onClick={onRegister}>Criar conta</button></div>
  </section></main>;
}
