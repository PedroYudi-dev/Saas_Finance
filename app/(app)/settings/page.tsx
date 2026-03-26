import { Metadata } from "next";
import { requireAuth } from "@/lib/auth/server";
import { getIncome } from "@/actions/income";
import { getAllIncome } from "@/actions/income";
import { getCurrentMonthYear } from "@/lib/utils";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Configurações — Fintra" };

export default async function SettingsPage() {
  const session = await requireAuth();
  const { month, year } = getCurrentMonthYear();
  const [currentIncome, allIncome] = await Promise.all([
    getIncome(month, year),
    getAllIncome(),
  ]);

  return (
    <SettingsClient
      user={session.user}
      currentIncome={currentIncome}
      allIncome={allIncome}
      month={month}
      year={year}
    />
  );
}
