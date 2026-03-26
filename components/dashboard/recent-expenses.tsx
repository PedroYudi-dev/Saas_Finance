import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Últimos Gastos</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs h-7">
          <Link href="/expenses">
            Ver todos <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum gasto registrado</p>
            <Button variant="outline" size="sm" asChild className="mt-3">
              <Link href="/expenses">Adicionar gasto</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: expense.category?.color ?? "#6b7280" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.category?.name ?? "Sem categoria"} · {formatDate(expense.date)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-rose-600 shrink-0">
                  -{formatCurrency(expense.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
