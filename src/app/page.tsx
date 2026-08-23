import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExecutiveDashboard() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Executive Audit Overview</h1>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">$12,450.00</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">8 Claims</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Monthly Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">142 Invoices</div>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Log Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Discrepancies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-md text-slate-400 bg-white">
            Audit Discrepancy Table (Connecting to Supabase...)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
