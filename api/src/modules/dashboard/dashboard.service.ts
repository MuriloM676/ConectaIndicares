import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { SiconfiService } from "../siconfi/siconfi.service";

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private siconfi: SiconfiService,
  ) {}

  async getDashboard(ibgeCode: string, year: number) {
    const municipality = await this.prisma.municipality.findUnique({
      where: { ibgeCode },
    });

    if (!municipality) {
      throw new NotFoundException("Município não encontrado");
    }

    let indicator = await this.prisma.fiscalIndicator.findUnique({
      where: { municipalityId_year: { municipalityId: ibgeCode, year } },
    });

    if (!indicator) {
      this.siconfi.syncSingle(ibgeCode);
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
