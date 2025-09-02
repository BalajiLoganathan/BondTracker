import React, { useState } from "react";

const BondForm = ({ onAddBond }) => {
  const [formData, setFormData] = useState({
    Bond: "",
    Expected_Interest_Month_Date: "1",
    Interest_Rate: "",
    Interest_Frequency: "Monthly",
    BondAmount: "",
    Invested_Amount: "",
    MaturityDate: "",
    Platform: "",
    Account: "",
    BankAccount: "",
    BondPurchaseType: "",
    Status: "",
    SettlementDate: "",
    ISIN: "",
    Closed: "No",
    Comments: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.Bond) return;
    onAddBond({ ...formData });
    setFormData({
      Bond: "",
      Expected_Interest_Month_Date: "1",
      Interest_Rate: "",
      Interest_Frequency: "Monthly",
      BondAmount: "",
      Invested_Amount: "",
      MaturityDate: "",
      Platform: "",
      Account: "",
      BankAccount: "",
      BondPurchaseType: "",
      Status: "",
      SettlementDate: "",
      ISIN: "",
      Closed: "No",
      Comments: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-100 rounded-xl shadow grid grid-cols-3 gap-3"
    >
      <input name="Bond" value={formData.Bond} onChange={handleChange} placeholder="Bond" className="p-2 border rounded" />

      <select name="Expected_Interest_Month_Date" value={formData.Expected_Interest_Month_Date} onChange={handleChange} className="p-2 border rounded">
        {Array.from({ length: 31 }, (_, i) => (
          <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
        ))}
      </select>

      <input name="Interest_Rate" value={formData.Interest_Rate} onChange={handleChange} placeholder="Interest Rate (%)" className="p-2 border rounded" />

      <select name="Interest_Frequency" value={formData.Interest_Frequency} onChange={handleChange} className="p-2 border rounded">
        <option>Monthly</option>
        <option>Quarterly</option>
        <option>Half-Yearly</option>
        <option>Yearly</option>
      </select>

      <input type="number" name="BondAmount" value={formData.BondAmount} onChange={handleChange} placeholder="Bond Amount" className="p-2 border rounded" />

      <input type="number" name="Invested_Amount" value={formData.Invested_Amount} onChange={handleChange} placeholder="Invested Amount" className="p-2 border rounded" />

      <input type="date" name="MaturityDate" value={formData.MaturityDate} onChange={handleChange} className="p-2 border rounded" />

      <input name="Platform" value={formData.Platform} onChange={handleChange} placeholder="Platform" className="p-2 border rounded" />

      <input name="Account" value={formData.Account} onChange={handleChange} placeholder="Account" className="p-2 border rounded" />

      <input name="BankAccount" value={formData.BankAccount} onChange={handleChange} placeholder="Bank Account" className="p-2 border rounded" />

      <input name="BondPurchaseType" value={formData.BondPurchaseType} onChange={handleChange} placeholder="Bond Purchase Type" className="p-2 border rounded" />

      <input name="Status" value={formData.Status} onChange={handleChange} placeholder="Status" className="p-2 border rounded" />

      <input type="date" name="SettlementDate" value={formData.SettlementDate} onChange={handleChange} className="p-2 border rounded" />

      <input name="ISIN" value={formData.ISIN} onChange={handleChange} placeholder="ISIN" className="p-2 border rounded" />

      <select name="Closed" value={formData.Closed} onChange={handleChange} className="p-2 border rounded">
        <option>No</option>
        <option>Yes</option>
      </select>

      <input name="Comments" value={formData.Comments} onChange={handleChange} placeholder="Comments" className="p-2 border rounded col-span-3" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-3 hover:bg-blue-700">
        Add Bond
      </button>
    </form>
  );
};

export default BondForm;
