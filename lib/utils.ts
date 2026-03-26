import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, "MMMM yyyy", { locale: ptBR });
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getBillStatus(dueDate: string, status: string) {
  if (status === "paid") return "paid";
  const due = new Date(dueDate);
  const today = new Date();
  const threeDaysLater = addDays(today, 3);

  if (isBefore(due, today)) return "overdue";
  if (isBefore(due, threeDaysLater)) return "due_soon";
  return "pending";
}

export const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "bank_transfer", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export const BILL_STATUSES = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "overdue", label: "Vencido" },
];

export const DEFAULT_CATEGORIES = [
  { name: "Alimentação", color: "#f97316", icon: "utensils" },
  { name: "Transporte", color: "#3b82f6", icon: "car" },
  { name: "Moradia", color: "#8b5cf6", icon: "home" },
  { name: "Saúde", color: "#ef4444", icon: "heart" },
  { name: "Lazer", color: "#10b981", icon: "gamepad-2" },
  { name: "Educação", color: "#f59e0b", icon: "book-open" },
  { name: "Roupas", color: "#ec4899", icon: "shirt" },
  { name: "Outros", color: "#6b7280", icon: "more-horizontal" },
];

export function getMonthOptions() {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i, 1), "MMMM", { locale: ptBR }),
  }));
}

export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: String(currentYear - 2 + i),
  }));
}
