import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { MaterialsService } from '../materials/materials.service';
import { TenonsService } from '../tenons/tenons.service';
import { OrderWithSchedule, CraftRecord } from '../orders/orders.service';

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

    const overdueCraftCount = orders.reduce(
      (sum, o) => sum + this.ordersService.computeOverdueCraftCount(o),
      0,
    );

    const craftDurations: number[] = [];
    orders.forEach((o) => {
      o.craftRecords.forEach((c) => {
        const d = this.ordersService.computeCraftDurationDays(c);
        if (d !== null && d >= 0) craftDurations.push(d);
      });
    });
    const avgCraftDuration =
      craftDurations.length > 0
        ? Math.round(craftDurations.reduce((s, d) => s + d, 0) / craftDurations.length)
        : 0;

    const nearDeliveryOrders: Array<{
      id: string;
      orderNo: string;
      furnitureName: string;
      customerName: string;
      estimatedDelivery?: string;
      daysLeft: number;
      overdueCraftCount: number;
    }> = orders
      .filter((o) => o.scheduleStatus === 'near')
      .map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        furnitureName: o.furnitureName,
        customerName: o.customerName,
        estimatedDelivery: o.estimatedDelivery,
        daysLeft: o.estimatedDelivery
          ? Math.ceil(
              (new Date(o.estimatedDelivery).getTime() - new Date().getTime()) /
                (24 * 3600 * 1000),
            )
          : 0,
        overdueCraftCount: o.overdueCraftCount,
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
        overdueCraftCount,
        avgCraftDuration,
      },
      woodConsumptionTrend: woodTrend,
      tenonFrequency,
      deliveryCycles,
      satisfaction: {
        avg: avgSatisfaction,
        ratings: satisfactionRatings,
        distribution: satisfactionDistribution,
      },
      nearDeliveryOrders,
    };
  }
}
