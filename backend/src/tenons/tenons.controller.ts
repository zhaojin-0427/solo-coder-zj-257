import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { TenonsService } from './tenons.service';

@Controller('tenons')
export class TenonsController {
  constructor(private readonly tenonsService: TenonsService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.tenonsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenonsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.tenonsService.create(body);
  }

  @Post(':id/use')
  incrementUsage(@Param('id') id: string) {
    return this.tenonsService.incrementUsage(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.tenonsService.delete(id);
    return { message: '删除成功' };
  }
}
