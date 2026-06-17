"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getDeliveries, getMunicipalities, DeliveryItem } from "@/lib/api";

export default function DeliveriesPage() {
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [year, setYear] = useState<number | undefined>();
  const [reportType, setReportType] = useState("");
  const [data, setData] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    getMunicipalities().then(setMunicipalities);
  }, []);

  useEffect(() => {
    if (!selected) return;
    getDeliveries(selected, year, reportType || undefined).then(setData);
  }, [selected, year, reportType]);

  const statusVariant = (status: string) => {
    if (status === "HO") return "success" as const;
    if (status === "RE") return "warning" as const;
    return "default" as const;
  };

  const statusLabel = (status: string) => {
    if (status === "HO") return "Homologado";
    if (status === "RE") return "Retificado";
    return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Entregas SICONFI
        </h2>
        <div className="flex gap-4">
          <Combobox
            value={selected}
            onChange={setSelected}
            options={municipalities.map((m) => ({
              value: m.ibgeCode,
              label: `${m.name} - ${m.uf}`,
            }))}
            placeholder="Selecione um município"
          />
          <Select
            value={year ?? ""}
            onChange={(e) =>
              setYear(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Todos anos</option>
            {[2025, 2024, 2023, 2022, 2021].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Todos relatórios</option>
            <option value="RREO">RREO</option>
            <option value="RGF">RGF</option>
            <option value="DCA">DCA</option>
          </Select>
        </div>
      </div>

      {!selected ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecione um município para visualizar as entregas
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Entregas
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {data.length} registro(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Exercício</th>
                  <th className="text-left py-2 font-medium">Relatório</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Data</th>
                  <th className="text-left py-2 font-medium">Periodicidade</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3">{item.year}</td>
                      <td className="py-3 font-medium">{item.reportType}</td>
                      <td className="py-3">
                        <Badge variant={statusVariant(item.status)}>
                          {statusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {item.deliveredAt
                          ? new Date(item.deliveredAt).toLocaleDateString(
                              "pt-BR",
                            )
                          : "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {item.periodicity ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
