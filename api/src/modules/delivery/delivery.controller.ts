import { Controller, Get, Param, Query } from "@nestjs/common";
import { DeliveryService } from "./delivery.service";

@Controller("municipalities")
export class DeliveryController {
  constructor(private service: DeliveryService) {}

  @Get(":ibgeCode/deliveries")
  getDeliveries(
    @Param("ibgeCode") ibgeCode: string,
    @Query("year") year?: number,
    @Query("reportType") reportType?: string,
  ) {
    return this.service.getDeliveries(ibgeCode, year, reportType);
  }
}
