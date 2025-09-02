import React from "react";

export default function BondTable({
  bonds,
  months,
  onUpdateBond,
  onUpdateMonthly,
}) {
  const totalInvested = bonds.reduce(
    (sum, b) => sum + (parseFloat(b.Invested_Amount) || 0),
    0
  );

  const monthlyTotals = {};
  months.forEach((m) => {
    monthlyTotals[m] = bonds.reduce(
      (sum, b) => sum + (parseFloat(b.monthly?.[m]) || 0),
      0
    );
  });

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Bond</th>
            <th className="border px-2 py-1">ISIN</th>
            <th className="border px-2 py-1">Invested Amount</th>
            <th className="border px-2 py-1">Maturity Date</th>
            {months.map((m) => (
              <th key={m} className="border px-2 py-1">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bonds.map((bond, idx) => {
            const maturityMonth = new Date(bond.MaturityDate).toLocaleString(
              "default",
              { month: "short", year: "numeric" }
            );

            return (
              <tr
                key={bond.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border px-2 py-1">{bond.Bond}</td>
                <td className="border px-2 py-1">{bond.ISIN}</td>
                <td className="border px-2 py-1">{bond.Invested_Amount}</td>
                <td className="border px-2 py-1">{bond.MaturityDate}</td>
                {months.map((m) => (
                  <td
                    key={m}
                    className={`border px-2 py-1 ${
                      maturityMonth === m ? "bg-green-200" : ""
                    }`}
                  >
                    <input
                      type="number"
                      value={bond.monthly?.[m] || ""}
                      onChange={(e) =>
                        onUpdateMonthly(bond.id, m, e.target.value)
                      }
                      className="w-20 p-1 border rounded"
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-yellow-100 font-bold">
            <td className="border px-2 py-1">TOTAL</td>
            <td className="border px-2 py-1"></td>
            <td className="border px-2 py-1">{totalInvested}</td>
            <td className="border px-2 py-1"></td>
            {months.map((m) => (
              <td key={m} className="border px-2 py-1">
                {monthlyTotals[m]}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
