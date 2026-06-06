import { Controller, Get, Post, Put, Delete, Param, Body, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, AcceptOrderDto } from './orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Post(':id/accept')
  acceptOrder(@Param('id') id: string, @Body() dto: AcceptOrderDto) {
    return this.ordersService.acceptOrder(id, dto);
  }

  @Patch(':id/craft/:craftId')
  updateCraftRecord(
    @Param('id') orderId: string,
    @Param('craftId') craftId: string,
    @Body() data: any,
  ) {
    return this.ordersService.updateCraftRecord(orderId, craftId, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.ordersService.delete(id);
    return { message: '删除成功' };
  }
}
