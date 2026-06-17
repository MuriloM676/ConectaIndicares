import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async getDeliveries(ibgeCode: string, year?: number, reportType?: string) {
    const municipality = await this.prisma.municipality.findUnique({
      where: { ibgeCode },
    });

    if (!municipality) {
      throw new NotFoundException("Município não encontrado");
    }

    const where: any = { municipalityId: ibgeCode };
    if (year) where.year = year;
    if (reportType) where.reportType = reportType;

    const deliveries = await this.prisma.deliveryStatus.findMany({
      where,
      orderBy: { deliveredAt: "desc" },
    });

    return deliveries;
  }
}
