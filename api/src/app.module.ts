import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./common/prisma/prisma.module";
import { MunicipalityModule } from "./modules/municipality/municipality.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ComparisonModule } from "./modules/comparison/comparison.module";
import { RankingModule } from "./modules/ranking/ranking.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { SiconfiModule } from "./modules/siconfi/siconfi.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MunicipalityModule,
    DashboardModule,
    ComparisonModule,
    RankingModule,
    DeliveryModule,
    SiconfiModule,
  ],
})
export class AppModule {}
