import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Tag,
  Ticket,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type CategoryTone = "blue" | "rose" | "mint" | "amber" | "red" | "violet" | "yellow" | "neutral";

export const CATEGORY_ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "briefcase-business", label: "Trabalho", Icon: BriefcaseBusiness },
  { value: "car-front", label: "Transporte", Icon: CarFront },
  { value: "heart-pulse", label: "Saúde", Icon: HeartPulse },
  { value: "piggy-bank", label: "Investimento", Icon: PiggyBank },
  { value: "shopping-cart", label: "Compras", Icon: ShoppingCart },
  { value: "ticket", label: "Entretenimento", Icon: Ticket },
  { value: "tool-case", label: "Serviços", Icon: Wrench },
  { value: "utensils", label: "Alimentação", Icon: Utensils },
  { value: "paw-print", label: "Pets", Icon: PawPrint },
  { value: "house", label: "Moradia", Icon: House },
  { value: "gift", label: "Presentes", Icon: Gift },
  { value: "dumbbell", label: "Esportes", Icon: Dumbbell },
  { value: "book-open", label: "Educação", Icon: BookOpen },
  { value: "baggage-claim", label: "Viagem", Icon: BaggageClaim },
  { value: "mailbox", label: "Correspondência", Icon: Mailbox },
  { value: "receipt-text", label: "Contas", Icon: ReceiptText },
];

export const CATEGORY_COLOR_OPTIONS: { value: string; label: string; tone: CategoryTone; hex: string }[] = [
  { value: "blue", label: "Azul", tone: "blue", hex: "#2563eb" },
  { value: "pink", label: "Rosa", tone: "rose", hex: "#db2777" },
  { value: "green", label: "Verde", tone: "mint", hex: "#16a34a" },
  { value: "orange", label: "Laranja", tone: "amber", hex: "#ea580c" },
  { value: "purple", label: "Roxo", tone: "violet", hex: "#9333ea" },
  { value: "yellow", label: "Amarelo", tone: "yellow", hex: "#ca8a04" },
  { value: "red", label: "Vermelho", tone: "red", hex: "#dc2626" },
];

const colorTones: Record<string, CategoryTone> = {
  blue: "blue",
  pink: "rose",
  green: "mint",
  orange: "amber",
  purple: "violet",
  yellow: "yellow",
  red: "red",
};
const categoryIcons = Object.fromEntries(CATEGORY_ICON_OPTIONS.map(option => [option.value, option.Icon])) as Record<string, LucideIcon>;

export function getCategoryPresentation(name?: string | null, color?: string | null, icon?: string | null): { tone: CategoryTone; Icon: LucideIcon } {
  if (!name && !color && !icon) return { tone: "neutral", Icon: Tag };
  const tone = colorTones[color ?? ""] ?? "blue";
  const Icon = categoryIcons[icon ?? ""] ?? BriefcaseBusiness;
  return { tone, Icon };
}
