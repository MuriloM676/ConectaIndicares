import { Controller, Post } from "@nestjs/common";
import { SiconfiService } from "./siconfi.service";

@Controller("sync")
export class SiconfiController {
  constructor(private service: SiconfiService) {}

  @Post()
  async sync() {
    this.service.syncAll();
    return { message: "Sincronização iniciada em segundo plano" };
  }
}
