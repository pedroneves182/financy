import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import App from "./App";
import "./styles.css";

const httpLink = new HttpLink({ uri: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/graphql" });
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("financy-token");
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});
const client = new ApolloClient({ link: from([authLink, httpLink]), cache: new InMemoryCache() });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}><App /></ApolloProvider>
  </React.StrictMode>,
);
