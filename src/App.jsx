import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import BondForm from "./components/BondForm";

// Month columns: Jan 2022 → Dec 2030
const monthLabels = (() => {
  const out = [];
  const start = new Date(2022, 0, 1);
  const end = new Date(2030, 11, 1);
  const cur = new Date(start);
  while (cur <= end) {
    out.push(cur.toLocaleString("default", { month: "short", year: "numeric" }));
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
})();

const masterFields = [
  "Bond",
  "Expected_Interest_Month_Date",
  "Interest_Rate",
  "Interest_Frequency",
  "BondAmount",
  "Invested_Amount",
  "MaturityDate",
  "Platform",
  "Account",
  "BankAccount",
  "BondPurchaseType",
  "Status",
  "SettlementDate",
  "ISIN",
  "Closed",
  "Comments",
];

const emptyMonthly = () =>
  monthLabels.reduce((acc, m) => ((acc[m] = 0), acc), {});

export default function App() {
  const [bonds, setBonds] = useState(() => {
    const saved = localStorage.getItem("bonds");
    return saved ? JSON.parse(saved) : [];
  });

  const [filters, setFilters] = useState({ Bond: "", Platform: "", ISIN: "" });

  // Persist
  useEffect(() => {
    localStorage.setItem("bonds", JSON.stringify(bonds));
  }, [bonds]);

  // Add bond from form
  const handleAddBond = (bond) => {
    const normalized = {
      id: Date.now(),
      ...bond,
      BondAmount: parseFloat(bond.BondAmount || 0),
      Invested_Amount: parseFloat(bond.Invested_Amount || 0),
      months: emptyMonthly(),
    };
    setBonds((prev) =>
      [...prev, normalized].sort(
        (a, b) => new Date(a.MaturityDate || "2100-01-01") - new Date(b.MaturityDate || "2100-01-01")
      )
    );
  };

  // Inline edit master fields
  const updateBondField = (idx, field, value) => {
    setBonds((prev) => {
      const next = [...prev];
      if (field === "BondAmount" || field === "Invested_Amount") {
        next[idx][field] = parseFloat(value || 0);
      } else {
        next[idx][field] = value;
      }
      return next;
    });
  };

  // Inline edit monthly amount
  const updateBondMonth = (idx, label, value) => {
    setBonds((prev) => {
      const next = [...prev];
      const v = parseFloat(value || 0);
      if (!next[idx].months) next[idx].months = emptyMonthly();
      next[idx].months[label] = v;
      return next;
    });
  };

  // Filters
  const filtered = useMemo(() => {
    const b = (s) => (s || "").toString().toLowerCase();
    const fb = b(filters.Bond);
    const fp = b(filters.Platform);
    const fi = b(filters.ISIN);
    return bonds.filter(
      (row) =>
        b(row.Bond).includes(fb) &&
        b(row.Platform).includes(fp) &&
        b(row.ISIN).includes(fi)
    );
  }, [bonds, filters]);

  // Default sort by MaturityDate
  const rows = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(a.MaturityDate || "2100-01-01") -
          new Date(b.MaturityDate || "2100-01-01")
      ),
    [filtered]
  );

  // Accumulated per bond
  const accumulatedFor = (bond) =>
    monthLabels.reduce((sum, m) => sum + (bond.months?.[m] || 0), 0);

  // Totals
  const totals = useMemo(() => {
    const totalInvested = bonds.reduce(
      (s, r) => s + (parseFloat(r.Invested_Amount) || 0),
      0
    );
    const monthlyTotals = monthLabels.map((m) =>
      bonds.reduce((s, r) => s + (r.months?.[m] || 0), 0)
    );
    const totalAccum = bonds.reduce((s, r) => s + accumulatedFor(r), 0);
    return { totalInvested, monthlyTotals, totalAccum };
  }, [bonds]);

  // Export to Excel (master + months + single Accumulated_Amount + totals row)
  const exportExcel = () => {
    const data = rows.map((r) => {
      const row = {};
      masterFields.forEach((f) => (row[f] = r[f] ?? ""));
      monthLabels.forEach((m) => (row[m] = r.months?.[m] ?? 0));
      row["Accumulated_Amount"] = accumulatedFor(r);
      return row;
    });

    // Totals row
    const totalsRow = {};
    masterFields.forEach((f) => (totalsRow[f] = f === "Bond" ? "TOTAL" : ""));
    monthLabels.forEach(
      (m, i) => (totalsRow[m] = totals.monthlyTotals[i])
    );
    totalsRow["Invested_Amount"] = totals.totalInvested;
    totalsRow["Accumulated_Amount"] = totals.totalAccum;

    const ws = XLSX.utils.json_to_sheet([...data, totalsRow], {
      header: [...masterFields, ...monthLabels, "Accumulated_Amount"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BondTracker");
    XLSX.writeFile(wb, "BondTracker.xlsx");
  };

  // Import from Excel
  const importExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);

      const imported = [];
      for (const row of json) {
        // Skip TOTAL line if present
        if ((row.Bond || "").toString().trim().toUpperCase() === "TOTAL") continue;

        const bond = { id: Date.now() + Math.random(), months: emptyMonthly() };
        masterFields.forEach((f) => (bond[f] = row[f] ?? ""));
        bond.BondAmount = parseFloat(bond.BondAmount || 0);
        bond.Invested_Amount = parseFloat(bond.Invested_Amount || 0);
        monthLabels.forEach((m) => {
          bond.months[m] = parseFloat(row[m] || 0);
        });
        imported.push(bond);
      }
      setBonds(imported);
      e.target.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const clearAll = () => {
    if (window.confirm("Clear all bonds?")) {
      setBonds([]);
      localStorage.removeItem("bonds");
    }
  };

  // Helpers
  const maturityLabel = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toLocaleString("default", { month: "short", year: "numeric" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📊 Bond Tracker</h1>

      {/* --- Toolbar Row --- */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={exportExcel} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow">
          ⬇️ Export Excel
        </button>
        <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow cursor-pointer">
          ⬆️ Import Excel
          <input type="file" accept=".xlsx,.xls" onChange={importExcel} className="hidden" />
        </label>
        <button onClick={clearAll} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow">
          🗑️ Clear All
        </button>
      </div>

      {/* --- Filters Row --- */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Filter: Bond"
          value={filters.Bond}
          onChange={(e) => setFilters((p) => ({ ...p, Bond: e.target.value }))}
          className="p-2 border rounded w-64"
        />
        <input
          placeholder="Filter: Platform"
          value={filters.Platform}
          onChange={(e) => setFilters((p) => ({ ...p, Platform: e.target.value }))}
          className="p-2 border rounded w-64"
        />
        <input
          placeholder="Filter: ISIN"
          value={filters.ISIN}
          onChange={(e) => setFilters((p) => ({ ...p, ISIN: e.target.value }))}
          className="p-2 border rounded w-64"
        />
      </div>

      {/* --- Add Form (with pickers/dropdowns) --- */}
      <BondForm onAddBond={handleAddBond} />

      {/* --- Table --- */}
      <div className="overflow-x-auto mt-6 bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-200 z-10">
            <tr>
              {masterFields.map((h) => (
                <th key={h} className="border px-2 py-2 text-left">{h}</th>
              ))}
              {monthLabels.map((m) => (
                <th key={m} className="border px-2 py-2 text-left">{m}</th>
              ))}
              <th className="border px-2 py-2 bg-yellow-200 font-bold">Accumulated_Amount</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((bond, i) => {
              const accum = accumulatedFor(bond);
              const maturity = maturityLabel(bond.MaturityDate);

              return (
                <tr key={bond.id || i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                  {masterFields.map((f) => (
                    <td key={f} className="border px-2 py-1">
                      <input
                        className="w-full bg-transparent outline-none"
                        value={bond[f] ?? ""}
                        onChange={(e) => updateBondField(i, f, e.target.value)}
                      />
                    </td>
                  ))}

                  {monthLabels.map((m) => (
                    <td key={m} className={`border px-2 py-1 ${maturity && m === maturity ? "bg-green-100" : ""}`}>
                      <input
                        type="number"
                        className="w-full bg-transparent outline-none"
                        value={bond.months?.[m] ?? 0}
                        onChange={(e) => updateBondMonth(i, m, e.target.value)}
                      />
                    </td>
                  ))}

                  <td className="border px-2 py-1 font-bold text-blue-700 bg-blue-50 text-right">
                    {accum.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* --- Summary Footer --- */}
          <tfoot>
            <tr className="bg-gray-300 font-bold">
              {/* Label cells to line up with master fields */}
              <td className="border px-2 py-2">TOTAL</td>
              {/* Fill remaining master fields except Invested_Amount */}
              {masterFields.slice(1, masterFields.indexOf("Invested_Amount")).map((_, i) => (
                <td key={`fpad1-${i}`} className="border px-2 py-2"></td>
              ))}
              {/* Invested_Amount total */}
              <td className="border px-2 py-2">{totals.totalInvested.toFixed(2)}</td>
              {/* Remaining master fields after Invested_Amount */}
              {masterFields
                .slice(masterFields.indexOf("Invested_Amount") + 1)
                .map((_, i) => (
                  <td key={`fpad2-${i}`} className="border px-2 py-2"></td>
                ))}

              {/* Monthly totals */}
              {totals.monthlyTotals.map((v, i) => (
                <td key={`mt-${i}`} className="border px-2 py-2">{v.toFixed(2)}</td>
              ))}

              {/* Accumulated total */}
              <td className="border px-2 py-2">{totals.totalAccum.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
