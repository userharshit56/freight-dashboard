"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

export default function Page() {
  const [invoices, setInvoices] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      const { data, error } = await supabase
        .from("audited_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching data:", error);
      else setInvoices(data || []);
      setLoading(false);
    }

    fetchInvoices();

    // Enable Supabase Realtime Subscription
    const channel = supabase
      .channel("realtime-audits")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audited_invoices" }, (payload) => {
        setInvoices((prev) => [payload.new as Discrepancy, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Executive Audit Overview</h1>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Recovered</p>
          <p className="text-3xl font-bold text-green-600">₹10,500.00</p>
        </div>
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Pending Claims</p>
          <p className="text-3xl font-bold text-amber-600">2 Claims</p>
        </div>
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Monthly Audits</p>
          <p className="text-3xl font-bold text-gray-900">5 Invoices</p>
        </div>
      </div>

      {/* Dynamic Supabase Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading live audit records...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3">Billed</th>
                <th className="px-6 py-3">Audited</th>
                <th className="px-6 py-3">Overcharge</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{inv.invoice_id}</td>
                  <td className="px-6 py-4">{inv.carrier_name}</td>
                  <td className="px-6 py-4">₹{inv.billed_amount.toLocaleString()}</td>
                  <td className="px-6 py-4">₹{inv.audited_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-red-600">₹{inv.overcharge.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      inv.status === "OVERCHARGE_FLAGGED" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
