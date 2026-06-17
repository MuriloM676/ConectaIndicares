import { Controller, Get, Param, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("municipalities")
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get(":ibgeCode/dashboard")
  getDashboard(
    @Param("ibgeCode") ibgeCode: string,
    @Query("year") year: number,
  ) {
    return this.service.getDashboard(ibgeCode, year ?? new Date().getFullYear());
  }
}
