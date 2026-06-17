import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SiconfiService } from "./siconfi.service";
import { SiconfiController } from "./siconfi.controller";
import { SiconfiSyncJob } from "../../jobs/siconfi-sync.job";

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.SICONFI_BASE_URL || "https://apidatalake.tesouro.gov.br/ords/siconfi/tt",
      timeout: 30000,
    }),
  ],
  controllers: [SiconfiController],
  providers: [SiconfiService, SiconfiSyncJob],
  exports: [SiconfiService],
})
export class SiconfiModule {}
