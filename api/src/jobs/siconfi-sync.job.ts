import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SiconfiService } from "../modules/siconfi/siconfi.service";

@Injectable()
export class SiconfiSyncJob {
  private readonly logger = new Logger(SiconfiSyncJob.name);

  constructor(private siconfi: SiconfiService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleSync() {
    this.logger.log("Iniciando sincronização SICONFI...");

    const start = Date.now();
    const result = await this.siconfi.syncAll();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    this.logger.log(
      `Sincronização concluída em ${elapsed}s. ` +
      `Municípios: ${result.municipalities}, ` +
      `Indicadores: ${result.indicators}`,
    );
  }
}
