"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setIncome } from "@/actions/income";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function IncomeSetupBanner({ month, year }: { month: number; year: number }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("monthlyIncome", value);
    fd.set("month", String(month));
    fd.set("year", String(year));
    const result = await setIncome(fd);
    setLoading(false);
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Renda definida!", description: "Seu orçamento foi configurado." });
      router.refresh();
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Defina sua renda mensal</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Para calcular seu orçamento, informe sua renda deste mês.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
