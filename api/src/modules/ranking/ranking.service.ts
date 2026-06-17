import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  async getRanking(uf?: string, year?: number, page = 1, limit = 100) {
    const y = year ?? new Date().getFullYear();

    const whereMunicipality = uf ? { uf } : {};
    const municipalities = await this.prisma.municipality.findMany({
      where: whereMunicipality,
    });

    const ibgeCodes = municipalities.map((m) => m.ibgeCode);

    const indicators = await this.prisma.fiscalIndicator.findMany({
      where: { municipalityId: { in: ibgeCodes }, year: y },
    });

    const indicatorMap = new Map(indicators.map((i) => [i.municipalityId, i]));

    const ranked = municipalities
      .map((m) => {
        const ind = indicatorMap.get(m.ibgeCode);
        if (!ind) return null;

        const revenuePerCapita = m.population > 0 ? ind.revenue / m.population : 0;
        const investmentPerCapita = 0;

        const score =
          ind.result * 0.4 + revenuePerCapita * 0.3 + investmentPerCapita * 0.3;

        return {
          ibgeCode: m.ibgeCode,
          name: m.name,
          uf: m.uf,
          population: m.population,
          score: +score.toFixed(2),
          revenue: ind.revenue,
          expense: ind.expense,
          result: ind.result,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => b.score - a.score);

    const total = ranked.length;
    const offset = (page - 1) * limit;
    const items = ranked.slice(offset, offset + limit);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
}
