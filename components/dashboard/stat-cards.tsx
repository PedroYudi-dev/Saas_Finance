import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export function StatCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Renda Mensal",
      value: formatCurrency(stats.monthlyIncome),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      sub: stats.monthlyIncome === 0 ? "Não definida" : "Definida para o mês",
    },
    {
      label: "Total Gasto",
      value: formatCurrency(stats.totalExpenses),
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      sub: `${stats.isOverBudget ? "⚠ Acima do orçamento" : "Dentro do orçamento"}`,
    },
    {
      label: "Disponível",
      value: formatCurrency(Math.abs(stats.remaining)),
      icon: Wallet,
      color: stats.remaining >= 0 ? "text-blue-600" : "text-rose-600",
      bg: stats.remaining >= 0
        ? "bg-blue-50 dark:bg-blue-950/30"
        : "bg-rose-50 dark:bg-rose-950/30",
      sub: stats.remaining < 0
        ? `Déficit de ${formatCurrency(Math.abs(stats.remaining))}`
        : "Restante no mês",
    },
    {
      label: "Uso do Orçamento",
      value: `${Math.min(stats.budgetPercentage, 999).toFixed(1)}%`,
      icon: PieChart,
      color:
        stats.budgetPercentage < 75
          ? "text-violet-600"
          : stats.budgetPercentage < 100
          ? "text-amber-600"
          : "text-rose-600",
      bg:
        stats.budgetPercentage < 75
          ? "bg-violet-50 dark:bg-violet-950/30"
          : stats.budgetPercentage < 100
          ? "bg-amber-50 dark:bg-amber-950/30"
          : "bg-rose-50 dark:bg-rose-950/30",
      sub: stats.monthlyIncome === 0 ? "Sem renda definida" : "Do orçamento utilizado",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, sub }) => (
        <Card key={label} className="card-hover border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
