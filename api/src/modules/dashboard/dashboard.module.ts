import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { SiconfiModule } from "../siconfi/siconfi.module";

@Module({
  imports: [SiconfiModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
