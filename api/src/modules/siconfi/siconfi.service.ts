import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { PrismaService } from "../../common/prisma/prisma.service";
import { lastValueFrom } from "rxjs";

@Injectable()
export class SiconfiService {
  private readonly logger = new Logger(SiconfiService.name);
  private lastRequest = 0;

  constructor(
    private http: HttpService,
    private prisma: PrismaService,
  ) {}

  private async rateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < 1000) {
      await new Promise((r) => setTimeout(r, 1000 - elapsed));
    }
    this.lastRequest = Date.now();
  }

  private async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    await this.rateLimit();
    const { data } = await lastValueFrom(
      this.http.get<T>(path, { params }),
    );
    return data;
  }

  async syncAll(): Promise<{ municipalities: number; indicators: number; deliveries: number }> {
    let municipalities = 0;
    let indicators = 0;
    let deliveries = 0;

    try {
      const entes = await this.syncMunicipalities();
      municipalities = entes;

      const year = new Date().getFullYear();
      const municipalitiesList = await this.prisma.municipality.findMany();

      for (const m of municipalitiesList) {
        try {
          const rreo = await this.syncRREO(m.ibgeCode, year);
          if (rreo) indicators += rreo;

          const rgf = await this.syncRGF(m.ibgeCode, year);
          if (rgf) indicators += rgf;

          const entregas = await this.syncDeliveries(m.ibgeCode, year);
          deliveries += entregas;
        } catch (err) {
          this.logger.warn(`Falha ao sincronizar ${m.ibgeCode} - ${m.name}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`Erro na sincronização: ${err.message}`);
    }

    return { municipalities, indicators, deliveries };
  }

  private async syncMunicipalities(): Promise<number> {
    try {
      const data: any = await this.get("/entes");
      const items = Array.isArray(data) ? data : data?.items ?? [];

      let count = 0;
      for (const item of items) {
        const ibgeCode = String(item.cod_ibge ?? "");
        if (!ibgeCode) continue;

        await this.prisma.municipality.upsert({
          where: { ibgeCode },
          update: {
            name: item.ente ?? "",
            uf: item.uf ?? "",
            population: Number(item.populacao) || 0,
            cnpj: String(item.co_cnpj ?? ""),
          },
          create: {
            ibgeCode,
            name: item.ente ?? "",
            uf: item.uf ?? "",
            population: Number(item.populacao) || 0,
            cnpj: String(item.co_cnpj ?? ""),
          },
        });
        count++;
      }

      this.logger.log(`${count} municípios sincronizados`);
      return count;
    } catch (err) {
      this.logger.error(`Falha ao sincronizar municípios: ${err.message}`);
      return 0;
    }
  }

  private async syncRREO(ibgeCode: string, year: number): Promise<number> {
    try {
      const data: any = await this.get("/rreo", {
        an_exercicio: year,
        nr_periodo: 6,
        co_tipo_demonstrativo: "RREO",
        id_ente: ibgeCode,
      });

      const items = Array.isArray(data) ? data : data?.items ?? [];
      if (!items.length) return 0;

      const latest = items[items.length - 1];
      const revenue = Number(latest.receita_total) || 0;
      const expense = Number(latest.despesa_total) || 0;
      const education = Number(latest.percentual_educacao) || 0;
      const health = Number(latest.percentual_saude) || 0;

      await this.prisma.fiscalIndicator.upsert({
        where: { municipalityId_year: { municipalityId: ibgeCode, year } },
        update: {
          revenue,
          expense,
          result: revenue - expense,
          educationPercent: education,
          healthPercent: health,
        },
        create: {
          municipalityId: ibgeCode,
          year,
          revenue,
          expense,
          result: revenue - expense,
          educationPercent: education,
          healthPercent: health,
        },
      });

      return 1;
    } catch (err) {
      this.logger.warn(`Falha RREO ${ibgeCode}/${year}: ${err.message}`);
      return 0;
    }
  }

  private async syncRGF(ibgeCode: string, year: number): Promise<number> {
    try {
      const data: any = await this.get("/rgf", {
        an_exercicio: year,
        in_periodicidade: "Q",
        nr_periodo: 3,
        co_tipo_demonstrativo: "RGF",
        co_poder: "E",
        id_ente: ibgeCode,
      });

      const items = Array.isArray(data) ? data : data?.items ?? [];
      if (!items.length) return 0;

      const latest = items[items.length - 1];
      const personnelPercent = Number(latest.percentual_pessoal) || 0;

      const existing = await this.prisma.fiscalIndicator.findUnique({
        where: { municipalityId_year: { municipalityId: ibgeCode, year } },
      });

      if (existing) {
        await this.prisma.fiscalIndicator.update({
          where: { municipalityId_year: { municipalityId: ibgeCode, year } },
          data: { personnelPercent },
        });
      } else {
        await this.prisma.fiscalIndicator.create({
          data: {
            municipalityId: ibgeCode,
            year,
            revenue: 0,
            expense: 0,
            result: 0,
            personnelPercent,
          },
        });
      }

      return 1;
    } catch (err) {
      this.logger.warn(`Falha RGF ${ibgeCode}/${year}: ${err.message}`);
      return 0;
    }
  }

  private async syncDeliveries(ibgeCode: string, year: number): Promise<number> {
    try {
      const data: any = await this.get("/extrato_entregas", {
        id_ente: ibgeCode,
        an_referencia: year,
      });

      const items = Array.isArray(data) ? data : data?.items ?? [];
      let count = 0;

      for (const item of items) {
        await this.prisma.deliveryStatus.create({
          data: {
            municipalityId: ibgeCode,
            reportType: item.entregavel ?? "",
            status: item.status_relatorio ?? "",
            deliveredAt: item.data_status ? new Date(item.data_status) : null,
            year,
            periodicity: item.periodicidade ?? null,
          },
        });
        count++;
      }

      this.logger.log(`${count} entregas para ${ibgeCode}`);
      return count;
    } catch (err) {
      this.logger.warn(`Falha entregas ${ibgeCode}/${year}: ${err.message}`);
      return 0;
    }
  }
}
