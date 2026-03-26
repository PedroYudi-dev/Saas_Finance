import { Metadata } from "next";
import { getCategories } from "@/actions/categories";
import { CategoriesClient } from "@/components/categories/categories-client";

export const metadata: Metadata = { title: "Categorias — Fintra" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={categories} />;
}
