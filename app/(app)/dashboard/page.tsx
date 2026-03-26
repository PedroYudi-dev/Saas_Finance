import { Metadata } from "next";
import { getIncome } from "@/actions/income";
import { getExpenses, getExpensesByCategory, getMonthlyTrend } from "@/actions/expenses";
import { getUpcomingBills } from "@/actions/bills";
import { getCurrentMonthYear, formatCurrency, formatMonth } from "@/lib/utils";
import { StatCards } from "@/components/dashboard/stat-cards";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { ExpensesByCategoryChart } from "@/components/charts/expenses-by-category";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend";
import { UpcomingBillsList } from "@/components/dashboard/upcoming-bills";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { IncomeSetupBanner } from "@/components/dashboard/income-setup-banner";

export const metadata: Metadata = { title: "Dashboard — Fintra" };

export default async function DashboardPage() {
  const { month, year } = getCurrentMonthYear();
  const [incomeData, expensesData, expensesByCategory, trend, upcomingBills] =
    await Promise.all([
      getIncome(month, year),
      getExpenses({ month, year }),
      getExpensesByCategory(month, year),
      getMonthlyTrend(6),
      getUpcomingBills(),
    ]);

  const monthlyIncome = incomeData ? parseFloat(incomeData.monthlyIncome) : 0;
  const totalExpenses = expensesData.reduce(
    (sum, e) => sum + parseFloat(e.value),
    0
  );
  const remaining = monthlyIncome - totalExpenses;
  const budgetPct = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;
  const isOverBudget = totalExpenses > monthlyIncome && monthlyIncome > 0;

  const stats = {
    monthlyIncome,
    totalExpenses,
    remaining,
    budgetPercentage: budgetPct,
    isOverBudget,
    overBudgetAmount: isOverBudget ? totalExpenses - monthlyIncome : 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatMonth(month, year)} · Visão geral das suas finanças
        </p>
      </div>

      {!incomeData && <IncomeSetupBanner month={month} year={year} />}

      <StatCards stats={stats} />

      {monthlyIncome > 0 && (
        <BudgetProgress stats={stats} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensesByCategoryChart data={expensesByCategory} />
        <MonthlyTrendChart data={trend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses expenses={expensesData.slice(0, 5)} />
        <UpcomingBillsList bills={upcomingBills} />
      </div>
    </div>
  );
}
