import { Controller, Get, Post, Put, Delete, Param, Body, Patch, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, AcceptOrderDto } from './orders.dto';
import { ScheduleStatus } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('scheduleStatus') scheduleStatus?: ScheduleStatus) {
    return this.ordersService.findAll(scheduleStatus);
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
