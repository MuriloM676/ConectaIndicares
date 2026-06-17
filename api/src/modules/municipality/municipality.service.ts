import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class MunicipalityService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.municipality.findMany({ orderBy: { name: "asc" } });
  }

  async findByIbge(code: string) {
    return this.prisma.municipality.findUnique({ where: { ibgeCode: code } });
  }

  async findByUf(uf: string) {
    return this.prisma.municipality.findMany({
      where: { uf },
      orderBy: { name: "asc" },
    });
  }
}
