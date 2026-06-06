import { Controller, Get, Post, Put, Delete, Param, Body, Patch, Query } from '@nestjs/common';
import { OrdersService, ScheduleStatus } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, AcceptOrderDto, UpdateQuoteDto, ConfirmDepositDto } from './orders.dto';
import { QuoteStatus } from '../shared/types';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('scheduleStatus') scheduleStatus?: ScheduleStatus,
    @Query('quoteStatus') quoteStatus?: QuoteStatus,
  ) {
    return this.ordersService.findAll(scheduleStatus, quoteStatus);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Post(':id/quote')
  createQuote(@Param('id') id: string) {
    return this.ordersService.createQuote(id);
  }

  @Put(':id/quote')
  updateQuote(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.ordersService.updateQuote(id, dto);
  }

  @Post(':id/deposit')
  confirmDeposit(@Param('id') id: string, @Body() dto: ConfirmDepositDto) {
    return this.ordersService.confirmDeposit(id, dto);
  }

  @Post(':id/settle')
  settleQuote(@Param('id') id: string) {
    return this.ordersService.settleQuote(id);
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
