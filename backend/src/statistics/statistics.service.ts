import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { MaterialsService } from '../materials/materials.service';
import { TenonsService } from '../tenons/tenons.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly materialsService: MaterialsService,
    private readonly tenonsService: TenonsService,
  ) {}

  getDashboard() {
    const orders = this.ordersService.findAll();
    const materials = this.materialsService.findAll();
    const tenons = this.tenonsService.findAll();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const producingOrders = orders.filter(
      (o) => o.status === 'producing' || o.status === 'designing',
    ).length;
    const completedOrders = orders.filter(
      (o) => o.status === 'completed' || o.status === 'accepted',
    ).length;

    const totalRevenue = materials.reduce((sum, m) => sum + m.totalCost, 0);

    const woodConsumption: Record<string, number> = {};
    materials.forEach((m) => {
      m.items.forEach((item) => {
        const key = item.woodType;
        if (!woodConsumption[key]) woodConsumption[key] = 0;
        woodConsumption[key] += item.totalPrice;
      });
    });

    const woodTrend = Object.entries(woodConsumption).map(([name, value]) => ({
      name,
      value,
    }));

    const tenonFrequency = tenons
      .map((t) => ({ name: t.type, value: t.usageCount }))
      .sort((a, b) => b.value - a.value);

    const deliveryCycles = orders
      .filter((o) => o.actualDelivery && o.createdAt)
      .map((o) => {
        const days = Math.ceil(
          (new Date(o.actualDelivery!).getTime() - new Date(o.createdAt).getTime()) /
            (24 * 3600 * 1000),
        );
        return { orderNo: o.orderNo, furnitureName: o.furnitureName, days };
      });

    const avgDeliveryCycle =
      deliveryCycles.length > 0
        ? Math.round(
            deliveryCycles.reduce((sum, d) => sum + d.days, 0) / deliveryCycles.length,
          )
        : 0;

    const satisfactionRatings = orders
      .filter((o) => o.craftsmanshipRating && (o.status === 'accepted' || o.status === 'completed'))
      .map((o) => ({
        orderNo: o.orderNo,
        furnitureName: o.furnitureName,
        rating: o.craftsmanshipRating,
        comment: o.customerComment,
      }));

    const avgSatisfaction =
      satisfactionRatings.length > 0
        ? (
            satisfactionRatings.reduce((sum, r) => sum + r.rating, 0) /
            satisfactionRatings.length
          ).toFixed(1)
        : '0.0';

    const satisfactionDistribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: satisfactionRatings.filter((r) => r.rating === star).length,
    }));

    return {
      overview: {
        totalOrders,
        pendingOrders,
        producingOrders,
        completedOrders,
        totalRevenue,
        avgDeliveryCycle,
        avgSatisfaction,
      },
      woodConsumptionTrend: woodTrend,
      tenonFrequency,
      deliveryCycles,
      satisfaction: {
        avg: avgSatisfaction,
        ratings: satisfactionRatings,
        distribution: satisfactionDistribution,
      },
    };
  }
}
