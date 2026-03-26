"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server";
import { eq, and } from "drizzle-orm";
import { DEFAULT_CATEGORIES } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .default("#6366f1"),
  icon: z.string().optional(),
});

export async function createCategory(formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    name: formData.get("name"),
    color: formData.get("color") || "#6366f1",
    icon: formData.get("icon") || "tag",
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db.insert(categories).values({
    userId,
    name: parsed.data.name,
    color: parsed.data.color,
    icon: parsed.data.icon || "tag",
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await requireAuth();
  const userId = session.user.id;

  const raw = {
    name: formData.get("name"),
    color: formData.get("color") || "#6366f1",
    icon: formData.get("icon") || "tag",
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await db
    .update(categories)
    .set({
      name: parsed.data.name,
      color: parsed.data.color,
      icon: parsed.data.icon || "tag",
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));

  revalidatePath("/categories");
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));

  revalidatePath("/categories");
  revalidatePath("/expenses");
  return { success: true };
}

export async function getCategories() {
  const session = await requireAuth();
  const userId = session.user.id;

  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

export async function seedDefaultCategories() {
  const session = await requireAuth();
  const userId = session.user.id;

  const existing = await db.query.categories.findMany({
    where: eq(categories.userId, userId),
  });

  if (existing.length === 0) {
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((cat) => ({
        userId,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      }))
    );
    revalidatePath("/categories");
  }
}
