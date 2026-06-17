"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";
import {
  getDashboard,
  getMunicipalities,
  DashboardData,
} from "@/lib/api";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMunicipalities().then(setMunicipalities);
  }, []);

  useEffect(() => {
    if (!selected) {
      setData(null);
      return;
    }
    setLoading(true);
    getDashboard(selected, year).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [selected, year]);

  const chartData = data
    ? [
        { name: "Receita", value: data.revenue ?? 0 },
        { name: "Despesa", value: data.expense ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Fiscal</h2>
        <div className="flex gap-4 items-center">
          {loading && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} />
              Sincronizando dados...
            </span>
          )}
          <div className="w-80">
            <Combobox
              value={selected}
              onChange={setSelected}
              options={municipalities.map((m) => ({
                value: m.ibgeCode,
                label: `${m.name} - ${m.uf}`,
              }))}
              placeholder="Selecione um município"
            />
          </div>
          <div className="w-24">
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2025, 2024, 2023, 2022, 2021].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {!selected ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecione um município para visualizar os indicadores
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Carregando...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(data.revenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Despesa Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.expense)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resultado Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    (data.result ?? 0) >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(data.result)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  População
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.population)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saúde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(data.healthPercent)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Educação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(data.educationPercent)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pessoal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(data.personnelPercent)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receita x Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="value" fill="hsl(221.2, 83.2%, 53.3%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
