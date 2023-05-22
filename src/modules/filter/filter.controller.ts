import { Controller, Get, UseGuards } from '@nestjs/common';
import { FilterService } from './filter.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';

@Controller('filter')
export class FilterController {
  constructor(private filterService: FilterService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllFilters() {
    return this.filterService.findAll();
  }
}
