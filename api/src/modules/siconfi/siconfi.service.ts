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

  private extractValue(items: any[], codConta: string, coluna: string): number {
    for (const i of items) {
      if (i.cod_conta === codConta && i.coluna === coluna) {
        return Number(i.valor) || 0;
      }
    }
    return 0;
  }

  private sumValues(items: any[], codConta: string, coluna: string, filter?: string): number {
    let total = 0;
    for (const i of items) {
      if (i.cod_conta === codConta && i.coluna === coluna) {
        if (!filter || (i.conta && i.conta.includes(filter))) {
          total += Number(i.valor) || 0;
        }
      }
    }
    return total;
  }

  async syncAll(): Promise<{ municipalities: number; indicators: number }> {
    let municipalities = 0;
    let indicators = 0;

    try {
      const entes = await this.syncMunicipalities();
      municipalities = entes;

      const year = new Date().getFullYear();
      const municipalitiesList = await this.prisma.municipality.findMany();

      for (const m of municipalitiesList) {
        try {
          await this.syncRREO(m.ibgeCode, year - 1, m.name);
          await this.syncRGF(m.ibgeCode, year - 1, m.name);
          indicators += 1;
        } catch (err) {
          this.logger.warn(`Falha ao sincronizar ${m.ibgeCode} - ${m.name}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`Erro na sincronização: ${err.message}`);
    }

    return { municipalities, indicators };
  }

  private async syncMunicipalities(): Promise<number> {
    try {
      const data: any = await this.get("/entes");
      const items = Array.isArray(data) ? data : data?.items ?? [];

      let count = 0;
      for (const item of items) {
        const ibgeCode = String(item.cod_ibge ?? "").padStart(7, "0");
        if (!ibgeCode || ibgeCode.length < 7) continue;

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

  private async syncRREO(ibgeCode: string, year: number, name: string): Promise<void> {
    try {
      const data: any = await this.get("/rreo", {
        an_exercicio: year,
        nr_periodo: 6,
        co_tipo_demonstrativo: "RREO",
        id_ente: ibgeCode,
      });

      const items: any[] = Array.isArray(data) ? data : data?.items ?? [];
      if (!items.length) {
        this.logger.warn(`RREO sem dados para ${name} (${ibgeCode})/${year}`);
        return;
      }

      const revenue = this.extractValue(items, "ReceitasExcetoIntraOrcamentarias", "Até o Bimestre (c)");
      const expense = this.extractValue(items, "DespesasExcetoIntraOrcamentarias", "DESPESAS EMPENHADAS ATÉ O BIMESTRE (f)")
        || this.extractValue(items, "DespesasExcetoIntraOrcamentarias", "DESPESAS LIQUIDADAS ATÉ O BIMESTRE (h)");

      if (revenue === 0 && expense === 0) {
        this.logger.warn(`RREO sem valores para ${name} (${ibgeCode})/${year}`);
        return;
      }

      const educationDespesa = this.extractValue(items, "MinimoAnualDasReceitasDeImpostosNaManutencaoEDesenvolvimentoDoEnsinoDemonstrativoSimplificado", "Valor Apurado Até o Bimestre");
      const healthDespesa = this.extractValue(items, "AplicacaoTotalDasDespesasComAcoesEServicosPublicosDeSaude", "Valor Apurado Até o Bimestre");

      const educationPercent = expense > 0 ? +((educationDespesa / expense) * 100).toFixed(2) : 0;
      const healthPercent = expense > 0 ? +((healthDespesa / expense) * 100).toFixed(2) : 0;

      await this.prisma.fiscalIndicator.upsert({
        where: { municipalityId_year: { municipalityId: ibgeCode, year } },
        update: { revenue, expense, result: revenue - expense, educationPercent, healthPercent },
        create: { municipalityId: ibgeCode, year, revenue, expense, result: revenue - expense, educationPercent, healthPercent },
      });

      this.logger.log(`RREO OK ${name}/${year}: R$ ${(revenue/1e9).toFixed(2)}B`);
    } catch (err) {
      this.logger.warn(`Falha RREO ${name}/${year}: ${err.message}`);
    }
  }

  private async syncRGF(ibgeCode: string, year: number, name: string): Promise<void> {
    try {
      const data: any = await this.get("/rgf", {
        an_exercicio: year,
        in_periodicidade: "Q",
        nr_periodo: 3,
        co_tipo_demonstrativo: "RGF",
        co_poder: "E",
        id_ente: ibgeCode,
      });

      const items: any[] = Array.isArray(data) ? data : data?.items ?? [];
      if (!items.length) {
        this.logger.warn(`RGF sem dados para ${name} (${ibgeCode})/${year}`);
        return;
      }

      let personnelPercent = 0;
      for (const i of items) {
        if (i.cod_conta === "RGF" && i.coluna === "%" && i.conta && i.conta.includes("Pessoal")) {
          personnelPercent = Number(i.valor) || 0;
          break;
        }
      }

      const existing = await this.prisma.fiscalIndicator.findUnique({
        where: { municipalityId_year: { municipalityId: ibgeCode, year } },
      });

      if (existing) {
        await this.prisma.fiscalIndicator.update({
          where: { municipalityId_year: { municipalityId: ibgeCode, year } },
          data: { personnelPercent },
        });
      }

      this.logger.log(`RGF OK ${name}/${year}: ${personnelPercent}%`);
    } catch (err) {
      this.logger.warn(`Falha RGF ${name}/${year}: ${err.message}`);
    }
  }
}
