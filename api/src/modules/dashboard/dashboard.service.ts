import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(ibgeCode: string, year: number) {
    const [municipality, indicator] = await Promise.all([
      this.prisma.municipality.findUnique({ where: { ibgeCode } }),
      this.prisma.fiscalIndicator.findUnique({
        where: { municipalityId_year: { municipalityId: ibgeCode, year } },
      }),
    ]);

    if (!municipality) {
      throw new NotFoundException("Município não encontrado");
    }

    if (!indicator) {
      return {
        revenue: null,
        expense: null,
        result: null,
        population: municipality.population,
        educationPercent: null,
        healthPercent: null,
        personnelPercent: null,
      };
    }

    return {
      revenue: indicator.revenue,
      expense: indicator.expense,
      result: indicator.result,
      population: municipality.population,
      educationPercent: indicator.educationPercent,
      healthPercent: indicator.healthPercent,
      personnelPercent: indicator.personnelPercent,
    };
  }
}
