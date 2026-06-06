import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { MaterialsModule } from './materials/materials.module';
import { TenonsModule } from './tenons/tenons.module';
import { CraftsModule } from './crafts/crafts.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    OrdersModule,
    MaterialsModule,
    TenonsModule,
    CraftsModule,
    StatisticsModule,
  ],
})
export class AppModule {}
