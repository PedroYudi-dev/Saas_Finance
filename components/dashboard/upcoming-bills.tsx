import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getBillStatus } from "@/lib/utils";
import type { Bill } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  overdue: { label: "Vencida", class: "bg-rose-100 text-rose-700 border-rose-200" },
  due_soon: { label: "Vence em breve", class: "bg-amber-100 text-amber-700 border-amber-200" },
  pending: { label: "Pendente", class: "bg-secondary text-muted-foreground" },
  paid: { label: "Pago", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export function UpcomingBillsList({ bills }: { bills: Bill[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs h-7">
          <Link href="/bills">
            Ver todas <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma conta pendente</p>
            <Button variant="outline" size="sm" asChild className="mt-3">
              <Link href="/bills">Adicionar conta</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const computed = getBillStatus(bill.dueDate, bill.status);
              const config = statusConfig[computed as keyof typeof statusConfig] ?? statusConfig.pending;
              return (
                <div key={bill.id} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    computed === "overdue" ? "bg-rose-100" : computed === "due_soon" ? "bg-amber-100" : "bg-secondary"
                  )}>
                    {computed === "overdue" ? (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">Vence {formatDate(bill.dueDate)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold shrink-0">{formatCurrency(bill.value)}</span>
                    <Badge variant="outline" className={cn("text-xs h-5", config.class)}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
