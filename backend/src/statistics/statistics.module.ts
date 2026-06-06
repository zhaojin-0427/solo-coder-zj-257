import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { OrdersModule } from '../orders/orders.module';
import { MaterialsModule } from '../materials/materials.module';
import { TenonsModule } from '../tenons/tenons.module';

@Module({
  imports: [OrdersModule, MaterialsModule, TenonsModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
