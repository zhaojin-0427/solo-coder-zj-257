import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CraftsService } from './crafts.service';

@Controller('crafts')
export class CraftsController {
  constructor(private readonly craftsService: CraftsService) {}

  @Get()
  findAll() {
    return this.craftsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.craftsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.craftsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.craftsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.craftsService.delete(id);
    return { message: '删除成功' };
  }
}
