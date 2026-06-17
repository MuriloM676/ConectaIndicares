import { Module } from "@nestjs/common";
import { MunicipalityService } from "./municipality.service";
import { MunicipalityController } from "./municipality.controller";

@Module({
  providers: [MunicipalityService],
  controllers: [MunicipalityController],
  exports: [MunicipalityService],
})
export class MunicipalityModule {}
