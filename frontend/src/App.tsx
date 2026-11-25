import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Topbar, type PageKey } from "./components/Topbar";
import { ME_QUERY } from "./graphql";
import type { AuthPayload, User } from "./types";

const paths: Record<PageKey, string> = {
  dashboard: "/",
  transactions: "/transacoes",
  categories: "/categorias",
  profile: "/perfil",
};

function pageForPath(path: string): PageKey | null {
  const match = (Object.entries(paths) as [PageKey, string][]).find(([, route]) => route === path);
  return match?.[0] ?? null;
}

export default function App() {
  const client = useApolloClient();
  const [token, setToken] = useState(() => localStorage.getItem("financy-token"));
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function navigate(to: string) {
    if (window.location.pathname !== to) window.history.pushState({}, "", to);
    setPath(to);
  }

  const { data, loading, error } = useQuery<{ me: User }>(ME_QUERY, { skip: !token, fetchPolicy: "network-only" });

  useEffect(() => {
    if (error && token) {
      localStorage.removeItem("financy-token");
      setToken(null);
    }
  }, [error, token]);

  useEffect(() => {
    if (token && (path === "/cadastro" || !pageForPath(path))) navigate("/");
  }, [path, token]);

  async function authenticated(payload: AuthPayload) {
    localStorage.setItem("financy-token", payload.token);
    setToken(payload.token);
    navigate("/");
    await client.clearStore();
  }

  async function logout() {
    localStorage.removeItem("financy-token");
    setToken(null);
    navigate("/");
    await client.clearStore();
  }

  if (!token) {
    if (path !== "/" && path !== "/cadastro") navigate("/");
    return path === "/cadastro"
      ? <RegisterPage onAuthenticated={authenticated} onLogin={() => navigate("/")} />
      : <LoginPage onAuthenticated={authenticated} onRegister={() => navigate("/cadastro")} />;
  }

  const page = pageForPath(path);
  if (!page) return <main className="loading-screen"><span className="spinner" /><p>Carregando suas finanças…</p></main>;
  if (loading || !data?.me) return <main className="loading-screen"><span className="spinner" /><p>Carregando suas finanças…</p></main>;

  return <div className="app-shell"><Topbar page={page} email={data.me.email} onNavigate={key => navigate(paths[key])} /><main className="page-content">
    {page === "dashboard" && <DashboardPage onNavigate={key => navigate(paths[key])} />}
    {page === "transactions" && <TransactionsPage />}
    {page === "categories" && <CategoriesPage />}
    {page === "profile" && <ProfilePage user={data.me} onLogout={logout} />}
  </main></div>;
}
