"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { income } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server";
import { eq, and } from "drizzle-orm";
import { getCurrentMonthYear } from "@/lib/utils";

const incomeSchema = z.object({
  monthlyIncome: z.coerce
    .number()
    .positive("Renda deve ser um valor positivo")
    .max(9999999.99),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  description: z.string().optional(),
});

export async function setIncome(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    monthlyIncome: formData.get("monthlyIncome"),
    month: formData.get("month"),
    year: formData.get("year"),
    description: formData.get("description"),
  };

  const parsed = incomeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { monthlyIncome, month, year, description } = parsed.data;

  const existing = await db.query.income.findFirst({
    where: and(
      eq(income.userId, userId),
      eq(income.month, month),
      eq(income.year, year)
    ),
  });

  if (existing) {
    await db
      .update(income)
      .set({
        monthlyIncome: String(monthlyIncome),
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(income.id, existing.id));
  } else {
    await db.insert(income).values({
      userId,
      monthlyIncome: String(monthlyIncome),
      month,
      year,
      description: description || null,
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getIncome(month?: number, year?: number) {
  const session = await requireAuth();
  const userId = session.user.id;

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const targetMonth = month ?? currentMonth;
  const targetYear = year ?? currentYear;

  const result = await db.query.income.findFirst({
    where: and(
      eq(income.userId, userId),
      eq(income.month, targetMonth),
      eq(income.year, targetYear)
    ),
  });

  return result;
}

export async function getAllIncome() {
  const session = await requireAuth();
  const userId = session.user.id;

  return db.query.income.findMany({
    where: eq(income.userId, userId),
    orderBy: (income, { desc }) => [desc(income.year), desc(income.month)],
  });
}
