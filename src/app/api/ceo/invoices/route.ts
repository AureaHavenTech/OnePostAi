import { NextRequest, NextResponse } from "next/server";

function dbQuery(sql: string): any[] {
  try {
    const { execSync } = require("child_process");
    const out = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function dbExec(sql: string): boolean {
  try {
    const { execSync } = require("child_process");
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    return true;
  } catch (e) {
    return false;
  }
}

function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}

const DEMO_INVOICES = [
  { id: "inv_demo_001", customer: "Demo User", email: "user@example.com", plan: "Pro", amount: 49, currency: "USD", status: "paid", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "inv_demo_002", customer: "Agency Client", email: "agency@example.com", plan: "Agency", amount: 99, currency: "USD", status: "paid", date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "inv_demo_003", customer: "Basic User", email: "basic@example.com", plan: "Basic", amount: 19, currency: "USD", status: "pending", date: new Date().toISOString() },
];

export async function GET() {
  try {
    let invoices: any[] = dbQuery("SELECT * FROM invoices ORDER BY created_at DESC LIMIT 50");
    if (!invoices || invoices.length === 0) {
      invoices = DEMO_INVOICES;
    }
    const totalRevenue = invoices.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
    const paid = invoices.filter((i: any) => i.status === "paid");
    const pending = invoices.filter((i: any) => i.status === "pending");
    return NextResponse.json({
      success: true,
      invoices,
      summary: {
        total: invoices.length,
        totalRevenue,
        paid: paid.length,
        pending: pending.length,
        paidRevenue: paid.reduce((s: number, i: any) => s + Number(i.amount || 0), 0),
        pendingRevenue: pending.reduce((s: number, i: any) => s + Number(i.amount || 0), 0),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, email, plan, amount, currency, status } = body;
    if (!customer || !amount) {
      return NextResponse.json({ error: "customer and amount are required" }, { status: 400 });
    }
    const id = `inv_${Date.now()}`;
    const persisted = dbExec(
      `INSERT INTO invoices (id, customer, email, plan, amount, currency, status, date) VALUES ('${esc(id)}', '${esc(customer)}', '${esc(email || "")}', '${esc(plan || "")}', ${Number(amount) || 0}, '${esc(currency || "USD")}', '${esc(status || "pending")}', datetime('now'))`
    );
    const invoice = { id, customer, email, plan, amount, currency: currency || "USD", status: status || "pending", date: new Date().toISOString() };
    return NextResponse.json({ success: true, invoice, persisted }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
  }
}
