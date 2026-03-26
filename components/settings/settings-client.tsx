"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setIncome } from "@/actions/income";
import { signOut } from "@/lib/auth/client";
import { formatCurrency, formatMonth, getMonthOptions, getYearOptions } from "@/lib/utils";
import type { Income } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, TrendingUp, User, DollarSign } from "lucide-react";
import type { User as UserType } from "@/lib/auth";

interface Props {
  user: UserType;
  currentIncome: Income | undefined;
  allIncome: Income[];
  month: number;
  year: number;
}

export function SettingsClient({ user, currentIncome, allIncome, month, year }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [incomeValue, setIncomeValue] = useState(currentIncome?.monthlyIncome ?? "");
  const [selectedMonth, setSelectedMonth] = useState(String(month));
  const [selectedYear, setSelectedYear] = useState(String(year));

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  async function handleIncomeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("monthlyIncome", String(incomeValue));
    fd.set("month", selectedMonth);
    fd.set("year", selectedYear);

    startTransition(async () => {
      const result = await setIncome(fd);
      if (result.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Renda atualizada!" });
        router.refresh();
      }
    });
  }

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Perfil</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-semibold text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Config */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Renda Mensal</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Configure sua renda para calcular o orçamento mensal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-value">Renda (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  id="income-value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={incomeValue}
                  onChange={(e) => setIncomeValue(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Renda"}
            </Button>
          </form>

          {allIncome.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Histórico de Renda</p>
                <div className="space-y-2">
                  {allIncome.slice(0, 6).map((inc) => (
                    <div key={inc.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm text-muted-foreground capitalize">
                          {formatMonth(inc.month, inc.year)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(inc.monthlyIncome)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sair da conta</p>
              <p className="text-xs text-muted-foreground">Encerrar sua sessão atual</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-1.5" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
