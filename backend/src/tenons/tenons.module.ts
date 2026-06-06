import { Module } from '@nestjs/common';
import { TenonsController } from './tenons.controller';
import { TenonsService } from './tenons.service';

@Module({
  controllers: [TenonsController],
  providers: [TenonsService],
  exports: [TenonsService],
})
export class TenonsModule {}
