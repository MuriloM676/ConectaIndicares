import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ComparisonService {
  constructor(private prisma: PrismaService) {}

  async compare(municipalityA: string, municipalityB: string, year: number) {
    const [mA, mB] = await Promise.all([
      this.prisma.municipality.findUnique({ where: { ibgeCode: municipalityA } }),
      this.prisma.municipality.findUnique({ where: { ibgeCode: municipalityB } }),
    ]);

    if (!mA) throw new NotFoundException(`Município ${municipalityA} não encontrado`);
    if (!mB) throw new NotFoundException(`Município ${municipalityB} não encontrado`);

    const [iA, iB] = await Promise.all([
      this.prisma.fiscalIndicator.findUnique({
        where: { municipalityId_year: { municipalityId: municipalityA, year } },
      }),
      this.prisma.fiscalIndicator.findUnique({
        where: { municipalityId_year: { municipalityId: municipalityB, year } },
      }),
    ]);

    const format = (i: typeof iA, pop: number) => ({
      name: i ? undefined : "Dados não disponíveis",
      revenue: i?.revenue ?? null,
      expense: i?.expense ?? null,
      result: i?.result ?? null,
      population: pop,
      revenuePerCapita: i && pop ? +(i.revenue / pop).toFixed(2) : null,
      expensePerCapita: i && pop ? +(i.expense / pop).toFixed(2) : null,
      educationPercent: i?.educationPercent ?? null,
      healthPercent: i?.healthPercent ?? null,
      personnelPercent: i?.personnelPercent ?? null,
    });

    return {
      municipalityA: { ...format(iA, mA.population), name: mA.name },
      municipalityB: { ...format(iB, mB.population), name: mB.name },
    };
  }
}
