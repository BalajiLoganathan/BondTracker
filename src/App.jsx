import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import BondForm from "./components/BondForm";

const App = () => {
  const [bonds, setBonds] = useState(() => {
    const saved = localStorage.getItem("bonds");
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState({ Bond: "", Platform: "", ISIN: "" });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("bonds", JSON.stringify(bonds));
  }, [bonds]);

  const addBond = (bond) => setBonds([...bonds, bond]);

  const updateBond = (index, field, value) => {
    const updated = [...bonds];
    updated[index][field] = value;
    setBonds(updated);
  };

  const filteredBonds = bonds.filter(
    (b) =>
      b.Bond.toLowerCase().includes(filter.Bond.toLowerCase()) &&
      b.Platform.toLowerCase().includes(filter.Platform.toLowerCase()) &&
      b.ISIN.toLowerCase().includes(filter.ISIN.toLowerCase())
  );

  const sortedBonds = [...filteredBonds].sort(
    (a, b) => new Date(a.MaturityDate) - new Date(b.MaturityDate)
  );

  const totalInvested = bonds.reduce(
    (sum, b) => sum + (parseFloat(b.Invested_Amount) || 0),
    0
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(bonds);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bonds");

    // Add total row
    XLSX.utils.sheet_add_aoa(ws, [["Total", "", "", "", "", totalInvested]], {
      origin: -1,
    });

    XLSX.writeFile(wb, "bonds.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const imported = XLSX.utils.sheet_to_json(sheet);
      setBonds(imported);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bond Tracker</h1>

      {/* Form */}
      <BondForm onAddBond={addBond} />

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input placeholder="Filter by Bond" className="p-2 border rounded"
          value={filter.Bond} onChange={(e) => setFilter({ ...filter, Bond: e.target.value })} />
        <input placeholder="Filter by Platform" className="p-2 border rounded"
          value={filter.Platform} onChange={(e) => setFilter({ ...filter, Platform: e.target.value })} />
        <input placeholder="Filter by ISIN" className="p-2 border rounded"
          value={filter.ISIN} onChange={(e) => setFilter({ ...filter, ISIN: e.target.value })} />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-4">
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export to Excel</button>
        <input type="file" accept=".xlsx, .xls" onChange={importFromExcel} className="border p-2 rounded" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              {[
                "Bond","Expected_Interest_Month_Date","Interest_Rate","Interest_Frequency",
                "BondAmount","Invested_Amount","MaturityDate","Platform","Account","BankAccount",
                "BondPurchaseType","Status","SettlementDate","ISIN","Closed","Comments",
              ].map((col) => (
                <th key={col} className="border border-gray-300 px-2 py-1">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedBonds.map((bond, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {Object.keys(bond).map((field) => (
                  <td key={field} className="border border-gray-300 px-2 py-1">
                    <input
                      value={bond[field]}
                      onChange={(e) => updateBond(i, field, e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-200">
              <td colSpan={5} className="text-right px-2">Total:</td>
              <td className="border border-gray-300 px-2">{totalInvested}</td>
              <td colSpan={10}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default App;
