// components/FinancialDashboard.tsx
import React from "react";
import { Company } from "../types";

interface FinancialDashboardProps {
  company: Company;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ company }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">
        {company.name} Financial Health
      </h2>
      <div className="flex justify-around">
        <div>
          <p className="font-semibold">Revenue</p>
          <p>${company.revenue}</p>
        </div>
        <div>
          <p className="font-semibold">Cost</p>
          <p>${company.cost}</p>
        </div>
        <div>
          <p className="font-semibold">Profit</p>
          <p>${company.profit}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
