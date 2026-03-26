import { Metadata } from "next";
import { getExpenses } from "@/actions/expenses";
import { getCategories } from "@/actions/categories";
import { getCurrentMonthYear } from "@/lib/utils";
import { ExpensesClient } from "@/components/expenses/expenses-client";

export const metadata: Metadata = { title: "Gastos — Fintra" };

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string; category?: string; q?: string };
}) {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const month = searchParams.month ? parseInt(searchParams.month) : currentMonth;
  const year = searchParams.year ? parseInt(searchParams.year) : currentYear;

  const [expenses, categories] = await Promise.all([
    getExpenses({ month, year, categoryId: searchParams.category, search: searchParams.q }),
    getCategories(),
  ]);

  return (
    <ExpensesClient
      expenses={expenses}
      categories={categories}
      month={month}
      year={year}
      selectedCategory={searchParams.category}
      search={searchParams.q}
    />
  );
}
