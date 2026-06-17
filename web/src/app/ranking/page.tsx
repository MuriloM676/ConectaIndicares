"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getRanking, RankingItem } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Trophy, Medal } from "lucide-react";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function RankingPage() {
  const [uf, setUf] = useState("");
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    items: RankingItem[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);

  useEffect(() => {
    getRanking(uf || undefined, year, page, 100).then(setData);
  }, [uf, year, page]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy size={20} className="text-amber-500" />;
    if (index === 1) return <Medal size={20} className="text-gray-400" />;
    if (index === 2) return <Medal size={20} className="text-amber-700" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Ranking Municipal
        </h2>
        <div className="flex gap-4">
          <Select value={uf} onChange={(e) => { setUf(e.target.value); setPage(1); }}>
            <option value="">Todas UFs</option>
            {UFS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </Select>
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2025, 2024, 2023, 2022, 2021].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Score Fiscal
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {data?.total ?? 0} municípios
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-10 py-2"></th>
                <th className="text-left py-2 font-medium">Município</th>
                <th className="text-right py-2 font-medium">UF</th>
                <th className="text-right py-2 font-medium">Score</th>
                <th className="text-right py-2 font-medium">Receita</th>
                <th className="text-right py-2 font-medium">Despesa</th>
                <th className="text-right py-2 font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item, idx) => (
                <tr key={item.ibgeCode} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 flex items-center">
                    {getRankIcon(idx) ?? (
                      <span className="text-sm text-muted-foreground w-5 text-center">
                        {idx + 1 + (page - 1) * 100}
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-right">{item.uf}</td>
                  <td className="py-3 text-right font-bold">{item.score.toFixed(2)}</td>
                  <td className="py-3 text-right">{formatCurrency(item.revenue)}</td>
                  <td className="py-3 text-right">{formatCurrency(item.expense)}</td>
                  <td className="py-3 text-right">{formatCurrency(item.result)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                Página {data?.page} de {data?.totalPages}
              </span>
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                disabled={(data?.page ?? 0) >= (data?.totalPages ?? 0)}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
