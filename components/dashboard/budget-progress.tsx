import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function BudgetProgress({ stats }: { stats: DashboardStats }) {
  const pct = Math.min(stats.budgetPercentage, 100);
  const color =
    pct < 75 ? "bg-emerald-500" : pct < 90 ? "bg-amber-500" : "bg-rose-500";

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Progresso do Orçamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Gasto</span>
          <span className="font-semibold">{formatCurrency(stats.totalExpenses)}</span>
        </div>

        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", color)}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stats.isOverBudget ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-sm text-rose-600 font-medium">
                  Orçamento ultrapassado em {formatCurrency(stats.overBudgetAmount)}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">
                  Restam {formatCurrency(stats.remaining)}
                </span>
              </>
            )}
          </div>
          <span className="text-sm font-bold">{pct.toFixed(1)}%</span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Renda</p>
            <p className="text-sm font-semibold">{formatCurrency(stats.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gasto</p>
            <p className="text-sm font-semibold">{formatCurrency(stats.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Restante</p>
            <p className={cn("text-sm font-semibold", stats.remaining < 0 ? "text-rose-600" : "text-emerald-600")}>
              {formatCurrency(stats.remaining)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
