import { Controller, Get, Query } from "@nestjs/common";
import { ComparisonService } from "./comparison.service";

@Controller("comparison")
export class ComparisonController {
  constructor(private service: ComparisonService) {}

  @Get()
  compare(
    @Query("municipalityA") municipalityA: string,
    @Query("municipalityB") municipalityB: string,
    @Query("year") year: number,
  ) {
    return this.service.compare(municipalityA, municipalityB, year ?? new Date().getFullYear());
  }
}
