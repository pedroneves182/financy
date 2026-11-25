export type User = { id: string; name: string; email: string; createdAt: string };
export type Category = { id: string; name: string; description: string; icon: string; color: string; createdAt: string; updatedAt: string };
export type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amountCents: number;
  occurredAt: string;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};
export type AuthPayload = { token: string; user: User };

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
