import { Controller, Get, Query } from "@nestjs/common";
import { RankingService } from "./ranking.service";

@Controller("ranking")
export class RankingController {
  constructor(private service: RankingService) {}

  @Get()
  getRanking(
    @Query("uf") uf?: string,
    @Query("year") year?: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.service.getRanking(uf, year, page, limit);
  }
}
