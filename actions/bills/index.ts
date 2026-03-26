"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { bills } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server";
import { eq, and, desc, asc } from "drizzle-orm";

const billSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  value: z.coerce.number().positive("Valor deve ser positivo").max(9999999.99),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  status: z.enum(["pending", "paid", "overdue"]),
  categoryId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  recurrent: z.coerce.boolean().optional(),
});

export async function createBill(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    name: formData.get("name"),
    value: formData.get("value"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") || "pending",
    categoryId: formData.get("categoryId") || null,
    notes: formData.get("notes") || undefined,
    recurrent: formData.get("recurrent") === "true",
  };

  const parsed = billSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db.insert(bills).values({
    userId,
    name: parsed.data.name,
    value: String(parsed.data.value),
    dueDate: parsed.data.dueDate,
    status: parsed.data.status,
    categoryId: parsed.data.categoryId || null,
    notes: parsed.data.notes || null,
    recurrent: parsed.data.recurrent ?? false,
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBill(id: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    name: formData.get("name"),
    value: formData.get("value"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") || "pending",
    categoryId: formData.get("categoryId") || null,
    notes: formData.get("notes") || undefined,
    recurrent: formData.get("recurrent") === "true",
  };

  const parsed = billSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db
    .update(bills)
    .set({
      name: parsed.data.name,
      value: String(parsed.data.value),
      dueDate: parsed.data.dueDate,
      status: parsed.data.status,
      categoryId: parsed.data.categoryId || null,
      notes: parsed.data.notes || null,
      recurrent: parsed.data.recurrent ?? false,
      updatedAt: new Date(),
    })
    .where(and(eq(bills.id, id), eq(bills.userId, userId)));

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markBillAsPaid(id: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  await db
    .update(bills)
    .set({ status: "paid", updatedAt: new Date() })
    .where(and(eq(bills.id, id), eq(bills.userId, userId)));

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBill(id: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  await db
    .delete(bills)
    .where(and(eq(bills.id, id), eq(bills.userId, userId)));

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getBills(status?: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  return db.query.bills.findMany({
    where: and(
      eq(bills.userId, userId),
      status && status !== "all" ? eq(bills.status, status) : undefined
    ),
    with: { category: true },
    orderBy: [asc(bills.dueDate)],
  });
}

export async function getUpcomingBills() {
  const session = await requireAuth();
  const userId = session.user.id;

  const allBills = await db.query.bills.findMany({
    where: and(eq(bills.userId, userId), eq(bills.status, "pending")),
    with: { category: true },
    orderBy: [asc(bills.dueDate)],
  });

  return allBills.slice(0, 5);
}
