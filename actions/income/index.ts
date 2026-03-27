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
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  description: z.string().optional(),
});

function normalizeMoneyInput(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(",") && trimmed.includes(".")) {
    return trimmed.replace(/\./g, "").replace(",", ".");
  }
  if (trimmed.includes(",")) {
    return trimmed.replace(",", ".");
  }
  return trimmed;
}

export async function setIncome(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const rawMonth = formData.get("month");
  const rawYear = formData.get("year");
  const rawDescription = formData.get("description");
  const raw = {
    monthlyIncome: normalizeMoneyInput(formData.get("monthlyIncome")),
    month: rawMonth === null ? undefined : rawMonth,
    year: rawYear === null ? undefined : rawYear,
    description: typeof rawDescription === "string" ? rawDescription : undefined,
  };

  const parsed = incomeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const { monthlyIncome, month = currentMonth, year = currentYear, description } = parsed.data;

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
