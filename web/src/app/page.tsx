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
  Cell,
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

  const REVENUE_COLOR = "hsl(152, 61%, 38%)";
  const EXPENSE_COLOR = "hsl(0, 65%, 50%)";

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
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Receita x Despesa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Valores totais do exercício de {year}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tick={{
                      fontSize: 13,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    dy={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `R$ ${(v / 1_000_000).toFixed(1)} mi`
                        : v >= 1_000
                          ? `R$ ${(v / 1_000).toFixed(0)} mil`
                          : `R$ ${v}`
                    }
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.08)",
                      padding: "12px 14px",
                      fontSize: "13px",
                    }}
                    labelStyle={{
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Valor",
                    ]}
                    cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={80}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === "Receita"
                            ? REVENUE_COLOR
                            : EXPENSE_COLOR
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
