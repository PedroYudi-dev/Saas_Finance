"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { expenses } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server";
import { eq, and, desc, like, gte, lte, sql } from "drizzle-orm";
import { getCurrentMonthYear } from "@/lib/utils";

const expenseSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(255),
  value: z.coerce.number().positive("Valor deve ser positivo").max(9999999.99),
  categoryId: z.string().uuid().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  notes: z.string().optional(),
});

export async function createExpense(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    description: formData.get("description"),
    value: formData.get("value"),
    categoryId: formData.get("categoryId") || null,
    date: formData.get("date"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db.insert(expenses).values({
    userId,
    description: parsed.data.description,
    value: String(parsed.data.value),
    categoryId: parsed.data.categoryId || null,
    date: parsed.data.date,
    paymentMethod: parsed.data.paymentMethod,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    description: formData.get("description"),
    value: formData.get("value"),
    categoryId: formData.get("categoryId") || null,
    date: formData.get("date"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db
    .update(expenses)
    .set({
      description: parsed.data.description,
      value: String(parsed.data.value),
      categoryId: parsed.data.categoryId || null,
      date: parsed.data.date,
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getExpenses(opts?: {
  month?: number;
  year?: number;
  categoryId?: string;
  search?: string;
}) {
  const session = await requireAuth();
  const userId = session.user.id;

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const month = opts?.month ?? currentMonth;
  const year = opts?.year ?? currentYear;

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  const result = await db.query.expenses.findMany({
    where: and(
      eq(expenses.userId, userId),
      gte(expenses.date, startDate),
      lte(expenses.date, endDateStr),
      opts?.categoryId ? eq(expenses.categoryId, opts.categoryId) : undefined
    ),
    with: {
      category: true,
    },
    orderBy: [desc(expenses.date), desc(expenses.createdAt)],
  });

  if (opts?.search) {
    const search = opts.search.toLowerCase();
    return result.filter((e) =>
      e.description.toLowerCase().includes(search)
    );
  }

  return result;
}

export async function getExpensesByCategory(month?: number, year?: number) {
  const session = await requireAuth();
  const userId = session.user.id;

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const targetMonth = month ?? currentMonth;
  const targetYear = year ?? currentYear;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const endDate = new Date(targetYear, targetMonth, 0);
  const endDateStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  const result = await db.query.expenses.findMany({
    where: and(
      eq(expenses.userId, userId),
      gte(expenses.date, startDate),
      lte(expenses.date, endDateStr)
    ),
    with: { category: true },
  });

  const grouped = result.reduce(
    (acc, expense) => {
      const key = expense.categoryId ?? "uncategorized";
      if (!acc[key]) {
        acc[key] = {
          categoryId: expense.categoryId,
          categoryName: expense.category?.name ?? "Sem categoria",
          categoryColor: expense.category?.color ?? "#6b7280",
          total: 0,
          count: 0,
        };
      }
      acc[key].total += parseFloat(expense.value);
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, {
      categoryId: string | null;
      categoryName: string;
      categoryColor: string;
      total: number;
      count: number;
    }>
  );

  return Object.values(grouped).sort((a, b) => b.total - a.total);
}

export async function getMonthlyTrend(months = 6) {
  const session = await requireAuth();
  const userId = session.user.id;

  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const monthExpenses = await db.query.expenses.findMany({
      where: and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ),
    });

    const total = monthExpenses.reduce(
      (sum, e) => sum + parseFloat(e.value),
      0
    );

    result.push({
      month: `${String(month).padStart(2, "0")}/${year}`,
      expenses: total,
      income: 0,
    });
  }

  return result;
}
