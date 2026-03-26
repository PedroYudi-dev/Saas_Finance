import { Metadata } from "next";
import { getBills } from "@/actions/bills";
import { getCategories } from "@/actions/categories";
import { BillsClient } from "@/components/bills/bills-client";

export const metadata: Metadata = { title: "Contas a Pagar — Fintra" };

export default async function BillsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const [bills, categories] = await Promise.all([
    getBills(searchParams.status),
    getCategories(),
  ]);

  return (
    <BillsClient
      bills={bills}
      categories={categories}
      status={searchParams.status}
    />
  );
}
