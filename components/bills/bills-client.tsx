"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBill, updateBill, deleteBill, markBillAsPaid } from "@/actions/bills";
import { formatCurrency, formatDate, getBillStatus, BILL_STATUSES } from "@/lib/utils";
import type { Bill, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, MoreHorizontal, Pencil, Trash2, Loader2, CheckCircle2, FileText, AlertCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

const statusConfig = {
  overdue: { label: "Vencida", class: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400" },
  due_soon: { label: "Vence em breve", class: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400" },
  pending: { label: "Pendente", class: "bg-secondary text-muted-foreground" },
  paid: { label: "Pago", class: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400" },
};

const filterTabs = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "paid", label: "Pagas" },
  { value: "overdue", label: "Vencidas" },
];

const emptyForm = {
  name: "",
  value: "",
  dueDate: new Date().toISOString().split("T")[0],
  status: "pending",
  categoryId: "",
  notes: "",
  recurrent: "false",
};

interface Props {
  bills: Bill[];
  categories: Category[];
  status?: string;
}

export function BillsClient({ bills, categories, status }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [form, setForm] = useState(emptyForm);

  const totalPending = bills
    .filter((b) => b.status !== "paid")
    .reduce((s, b) => s + parseFloat(b.value), 0);
  const totalPaid = bills
    .filter((b) => b.status === "paid")
    .reduce((s, b) => s + parseFloat(b.value), 0);

  function openCreate() {
    setEditingBill(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(bill: Bill) {
    setEditingBill(bill);
    setForm({
      name: bill.name,
      value: bill.value,
      dueDate: bill.dueDate,
      status: bill.status,
      categoryId: bill.categoryId ?? "",
      notes: bill.notes ?? "",
      recurrent: bill.recurrent ? "true" : "false",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));

    startTransition(async () => {
      const result = editingBill
        ? await updateBill(editingBill.id, fd)
        : await createBill(fd);
      if (result.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      } else {
        toast({ title: editingBill ? "Conta atualizada!" : "Conta adicionada!" });
        setOpen(false);
        router.refresh();
      }
    });
  }

  async function handleMarkPaid(id: string) {
    startTransition(async () => {
      await markBillAsPaid(id);
      toast({ title: "Conta marcada como paga!" });
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteBill(id);
      toast({ title: "Conta excluída." });
      setDeleteId(null);
      router.refresh();
    });
  }

  function getDaysInfo(dueDate: string, billStatus: string) {
    if (billStatus === "paid") return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return `${Math.abs(days)}d em atraso`;
    if (days === 0) return "Vence hoje";
    return `${days}d restantes`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas a Pagar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pendente: {formatCurrency(totalPending)} · Pago: {formatCurrency(totalPaid)}
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Conta
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(tab.value === "all" ? "/bills" : `/bills?status=${tab.value}`)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              (status ?? "all") === tab.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bills List */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {bills.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhuma conta encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-4">Nome</div>
                <div className="col-span-2">Vencimento</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Prazo</div>
                <div className="col-span-1 text-right">Valor</div>
                <div className="col-span-1" />
              </div>
              {bills.map((bill) => {
                const computed = getBillStatus(bill.dueDate, bill.status);
                const config = statusConfig[computed as keyof typeof statusConfig] ?? statusConfig.pending;
                const daysInfo = getDaysInfo(bill.dueDate, bill.status);
                return (
                  <div key={bill.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-accent/30 transition-colors group">
                    <div className="col-span-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          computed === "overdue" ? "bg-rose-100 dark:bg-rose-950/30" :
                          computed === "due_soon" ? "bg-amber-100 dark:bg-amber-950/30" :
                          computed === "paid" ? "bg-emerald-100 dark:bg-emerald-950/30" : "bg-secondary"
                        )}>
                          {computed === "overdue" ? <AlertCircle className="w-4 h-4 text-rose-600" /> :
                           computed === "paid" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                           <Clock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{bill.name}</p>
                          {bill.category && (
                            <p className="text-xs text-muted-foreground">{bill.category.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{formatDate(bill.dueDate)}</div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={cn("text-xs", config.class)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      {daysInfo && (
                        <span className={cn("text-xs font-medium",
                          computed === "overdue" ? "text-rose-600" :
                          computed === "due_soon" ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {daysInfo}
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-right font-semibold text-sm">{formatCurrency(bill.value)}</div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {bill.status !== "paid" && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(bill.id)}>
                              <CheckCircle2 className="mr-2 w-3.5 h-3.5 text-emerald-600" /> Marcar como pago
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEdit(bill)}>
                            <Pencil className="mr-2 w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(bill.id)}>
                            <Trash2 className="mr-2 w-3.5 h-3.5" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBill ? "Editar Conta" : "Nova Conta a Pagar"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" placeholder="Ex: Aluguel, Internet, Energia..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bill-value">Valor (R$) *</Label>
                <Input id="bill-value" type="number" step="0.01" min="0.01" placeholder="0,00" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento *</Label>
                <Input id="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BILL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-notes">Observações</Label>
              <Input id="bill-notes" placeholder="Opcional..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingBill ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Deseja excluir esta conta? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={isPending} onClick={() => deleteId && handleDelete(deleteId)}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
