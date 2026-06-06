import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MaterialsService, MaterialItem } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.materialsService.findByOrderId(orderId);
  }

  @Post()
  create(@Body() body: { orderId: string; orderNo: string; items: Omit<MaterialItem, 'id'>[] }) {
    return this.materialsService.create(body.orderId, body.orderNo, body.items);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.materialsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.materialsService.delete(id);
    return { message: '删除成功' };
  }
}
