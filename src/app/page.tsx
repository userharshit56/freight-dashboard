"use client";

import "@/app/globals.css";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Discrepancy {
  id: string;
  invoice_id: string;
  carrier_name: string;
  billed_amount: number;
  audited_amount: number;
  overcharge: number;
  status: string;
}

export default function ExecutiveDashboard() {
  const [invoices, setInvoices] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      if (!supabaseUrl || !supabaseAnonKey) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("audited_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setInvoices(data || []);
      }
      setLoading(false);
    }

    fetchInvoices();

    if (supabaseUrl && supabaseAnonKey) {
      const channel = supabase
        .channel("realtime-audits")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "audited_invoices" },
          (payload) => {
            setInvoices((prev) => [payload.new as Discrepancy, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Executive Audit Overview
      </h1>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Recovered</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">$12,450.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending Claims</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">8 Claims</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Monthly Audits</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">142 Invoices</p>
        </div>
      </div>

      {/* Recent Discrepancies Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Discrepancies
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Connecting to Supabase...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No audit discrepancies found in Supabase table.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Invoice ID</th>
                  <th className="px-6 py-3">Carrier</th>
                  <th className="px-6 py-3">Billed</th>
                  <th className="px-6 py-3">Audited</th>
                  <th className="px-6 py-3">Overcharge</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {inv.invoice_id}
                    </td>
                    <td className="px-6 py-4">{inv.carrier_name}</td>
                    <td className="px-6 py-4">${inv.billed_amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">${inv.audited_amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      ${inv.overcharge?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inv.status === "OVERCHARGE_FLAGGED"
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

