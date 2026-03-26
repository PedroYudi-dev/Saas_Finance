export type Category = {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  createdAt: Date;
};

export type Income = {
  id: string;
  userId: string;
  monthlyIncome: string;
  month: number;
  year: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Expense = {
  id: string;
  userId: string;
  description: string;
  value: string;
  categoryId: string | null;
  date: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
};

export type Bill = {
  id: string;
  userId: string;
  name: string;
  value: string;
  dueDate: string;
  status: string;
  categoryId: string | null;
  notes: string | null;
  recurrent: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
};

export type DashboardStats = {
  monthlyIncome: number;
  totalExpenses: number;
  remaining: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
};

export type ExpensesByCategory = {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  total: number;
  count: number;
};

export type MonthlyTrend = {
  month: string;
  expenses: number;
  income: number;
};

export type BillStatus = "pending" | "paid" | "overdue" | "due_soon";
