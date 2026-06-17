"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";
import { getComparison, getMunicipalities } from "@/lib/api";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";

export default function ComparisonPage() {
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [mA, setMA] = useState("");
  const [mB, setMB] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getMunicipalities().then(setMunicipalities);
  }, []);

  useEffect(() => {
    if (!mA || !mB) return;
    getComparison(mA, mB, year).then(setData);
  }, [mA, mB, year]);

  const rows = [
    { label: "População", key: "population", fmt: formatNumber },
    { label: "Receita Total", key: "revenue", fmt: formatCurrency },
    { label: "Despesa Total", key: "expense", fmt: formatCurrency },
    { label: "Resultado Fiscal", key: "result", fmt: formatCurrency },
    { label: "Receita Per Capita", key: "revenuePerCapita", fmt: formatCurrency },
    { label: "Despesa Per Capita", key: "expensePerCapita", fmt: formatCurrency },
    { label: "Saúde", key: "healthPercent", fmt: formatPercent },
    { label: "Educação", key: "educationPercent", fmt: formatPercent },
    { label: "Pessoal", key: "personnelPercent", fmt: formatPercent },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Comparativo Municipal
        </h2>
        <div className="flex gap-4">
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2025, 2024, 2023, 2022, 2021].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Combobox
          value={mA}
          onChange={setMA}
          options={municipalities.map((m) => ({
            value: m.ibgeCode,
            label: `${m.name} - ${m.uf}`,
          }))}
          placeholder="Município A"
        />
        <Combobox
          value={mB}
          onChange={setMB}
          options={municipalities.map((m) => ({
            value: m.ibgeCode,
            label: `${m.name} - ${m.uf}`,
          }))}
          placeholder="Município B"
        />
      </div>

      {!mA || !mB ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecione dois municípios para comparar
          </CardContent>
        </Card>
      ) : data ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {data.municipalityA.name} vs {data.municipalityB.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Indicador</th>
                  <th className="text-right py-2 font-medium">{data.municipalityA.name}</th>
                  <th className="text-right py-2 font-medium">{data.municipalityB.name}</th>
                  <th className="text-right py-2 font-medium">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const vA = data.municipalityA[row.key];
                  const vB = data.municipalityB[row.key];
                  const diff =
                    vA !== null && vB !== null && vB !== 0
                      ? (((vA - vB) / vB) * 100).toFixed(1)
                      : null;
                  return (
                    <tr key={row.key} className="border-b last:border-0">
                      <td className="py-3 text-muted-foreground">{row.label}</td>
                      <td className="py-3 text-right font-medium">
                        {row.fmt(vA)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {row.fmt(vB)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {diff !== null ? (
                          <span
                            className={
                              Number(diff) >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {Number(diff) >= 0 ? "+" : ""}
                            {diff}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
