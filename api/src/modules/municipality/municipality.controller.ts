import { Controller, Get, Param } from "@nestjs/common";
import { MunicipalityService } from "./municipality.service";

@Controller("municipalities")
export class MunicipalityController {
  constructor(private service: MunicipalityService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":ibgeCode")
  findByIbge(@Param("ibgeCode") ibgeCode: string) {
    return this.service.findByIbge(ibgeCode);
  }
}
