"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense, updateExpense, deleteExpense } from "@/actions/expenses";
import { formatCurrency, formatDate, PAYMENT_METHODS, getMonthOptions, getYearOptions } from "@/lib/utils";
import type { Expense, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Filter,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  expenses: Expense[];
  categories: Category[];
  month: number;
  year: number;
  selectedCategory?: string;
  search?: string;
}

const emptyForm = {
  description: "",
  value: "",
  categoryId: "",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "pix",
  notes: "",
};

export function ExpensesClient({ expenses, categories, month, year, selectedCategory, search }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchValue, setSearchValue] = useState(search ?? "");

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.value), 0);

  function openCreate() {
    setEditingExpense(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setForm({
      description: expense.description,
      value: expense.value,
      categoryId: expense.categoryId ?? "",
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes ?? "",
    });
    setOpen(true);
  }

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (key !== "month") params.set("month", String(month));
    if (key !== "year") params.set("year", String(year));
    if (key !== "category" && selectedCategory) params.set("category", selectedCategory);
    if (key !== "q" && searchValue) params.set("q", searchValue);
    if (value) params.set(key, value);
    router.push(`/expenses?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    handleFilter("q", searchValue);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));

    startTransition(async () => {
      const result = editingExpense
        ? await updateExpense(editingExpense.id, fd)
        : await createExpense(fd);

      if (result.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      } else {
        toast({ title: editingExpense ? "Gasto atualizado!" : "Gasto adicionado!", description: "Operação realizada com sucesso." });
        setOpen(false);
        router.refresh();
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteExpense(id);
      toast({ title: "Gasto excluído." });
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gastos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {expenses.length} registros · Total: {formatCurrency(totalExpenses)}
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Gasto
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-48">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar gastos..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">Buscar</Button>
            </form>

            <Select value={String(month)} onValueChange={(v) => handleFilter("month", v)}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(year)} onValueChange={(v) => handleFilter("year", v)}>
              <SelectTrigger className="h-9 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory ?? "all"} onValueChange={(v) => handleFilter("category", v === "all" ? "" : v)}>
              <SelectTrigger className="h-9 w-44">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="py-16 text-center">
              <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum gasto encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">Adicione seu primeiro gasto clicando no botão acima.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-4">Descrição</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-2">Pagamento</div>
                <div className="col-span-1 text-right">Valor</div>
                <div className="col-span-1" />
              </div>
              {expenses.map((expense) => (
                <div key={expense.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-accent/30 transition-colors group">
                  <div className="col-span-4 font-medium text-sm truncate">{expense.description}</div>
                  <div className="col-span-2">
                    {expense.category ? (
                      <Badge variant="outline" className="text-xs gap-1.5 font-normal">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: expense.category.color }} />
                        {expense.category.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">{formatDate(expense.date)}</div>
                  <div className="col-span-2 text-sm text-muted-foreground capitalize">
                    {PAYMENT_METHODS.find(p => p.value === expense.paymentMethod)?.label ?? expense.paymentMethod}
                  </div>
                  <div className="col-span-1 text-right font-semibold text-sm text-rose-600">
                    {formatCurrency(expense.value)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(expense)}>
                          <Pencil className="mr-2 w-3.5 h-3.5" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(expense.id)}
                        >
                          <Trash2 className="mr-2 w-3.5 h-3.5" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {/* Footer total */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-muted/30">
                <div className="col-span-10 text-xs font-medium text-muted-foreground">
                  Total ({expenses.length} itens)
                </div>
                <div className="col-span-1 text-right font-bold text-sm text-rose-600">
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="col-span-1" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Editar Gasto" : "Novo Gasto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Almoço, Uber, Conta de luz..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.categoryId || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                placeholder="Opcional..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingExpense ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
