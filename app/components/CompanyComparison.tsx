// components/CompanyComparison.tsx
import React from "react";
import { Company } from "../types";

interface CompanyComparisonProps {
  companies: Company[];
}

const CompanyComparison: React.FC<CompanyComparisonProps> = ({ companies }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md mt-8">
      <h2 className="text-xl font-bold mb-2">Company Comparison</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Company</th>
            <th className="border p-2">Revenue</th>
            <th className="border p-2">Cost</th>
            <th className="border p-2">Profit</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td className="border p-2">{company.name}</td>
              <td className="border p-2">${company.revenue}</td>
              <td className="border p-2">${company.cost}</td>
              <td className="border p-2">${company.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyComparison;
