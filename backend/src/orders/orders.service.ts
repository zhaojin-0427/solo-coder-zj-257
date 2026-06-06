import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto, UpdateOrderStatusDto, AcceptOrderDto } from './orders.dto';
import { OrderStatus } from '../shared/types';

export interface CraftRecord {
  id: string;
  stepName: string;
  completed: boolean;
  completedAt?: string;
  difficulty?: string;
  notes?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  assignee?: string;
  blockingReason?: string;
}

export type ScheduleStatus = 'overdue' | 'near' | 'normal';

export interface OrderWithSchedule extends Order {
  scheduleStatus: ScheduleStatus;
  overdueCraftCount: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  furnitureName: string;
  woodPreference: string;
  dimensions: { length: number; width: number; height: number; unit: string };
  complexity: string;
  requiredTenons: string[];
  specialRequirements?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  materialListId?: string;
  tenonDiagramIds: string[];
  craftRecords: CraftRecord[];
  craftsmanshipRating?: number;
  customerComment?: string;
}

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor() {
    this.seedData();
  }

  static readonly SEED_ORDER_1_ID = 'order-001-seed';
  static readonly SEED_ORDER_2_ID = 'order-002-seed';
  static readonly SEED_ORDER_3_ID = 'order-003-seed';

  private seedData() {
    const now = new Date();
    const sampleOrders: Order[] = [
      {
        id: OrdersService.SEED_ORDER_1_ID,
        orderNo: 'WO-2026-001',
        customerName: '李明远',
        customerPhone: '13800138001',
        furnitureName: '明式圈椅',
        woodPreference: '黄花梨',
        dimensions: { length: 60, width: 48, height: 96, unit: 'cm' },
        complexity: 'complex',
        requiredTenons: ['楔钉榫', '格肩榫', '夹头榫'],
        specialRequirements: '需做旧处理，保留木纹天然质感',
        status: 'producing',
        createdAt: new Date(now.getTime() - 20 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
        estimatedDelivery: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(),
        tenonDiagramIds: [],
        craftRecords: [
          { id: 'c1', stepName: '选料开料', completed: true, completedAt: new Date(now.getTime() - 18 * 24 * 3600 * 1000).toISOString(), notes: '精选海南黄花梨老料', plannedStartDate: new Date(now.getTime() - 19 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 17 * 24 * 3600 * 1000).toISOString(), assignee: '张木匠' },
          { id: 'c2', stepName: '干燥处理', completed: true, completedAt: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(), difficulty: '自然阴干需严格控制温湿度', notes: '阴干15天', plannedStartDate: new Date(now.getTime() - 17 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 13 * 24 * 3600 * 1000).toISOString(), assignee: '李木匠' },
          { id: 'c3', stepName: '开榫凿眼', completed: true, completedAt: new Date(now.getTime() - 6 * 24 * 3600 * 1000).toISOString(), difficulty: '楔钉榫对接精度要求高', plannedStartDate: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString(), assignee: '王木匠' },
          { id: 'c4', stepName: '试装拼合', completed: false, notes: '需确保各部件严丝合缝', plannedStartDate: new Date(now.getTime() - 6 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(), assignee: '张木匠', blockingReason: '等待楔钉榫配件到货' },
          { id: 'c5', stepName: '打磨上漆', completed: false, plannedStartDate: new Date(now.getTime() + 1 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() + 4 * 24 * 3600 * 1000).toISOString(), assignee: '赵木匠' },
          { id: 'c6', stepName: '整体修整', completed: false, plannedStartDate: new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() + 9 * 24 * 3600 * 1000).toISOString(), assignee: '王木匠' },
        ],
      },
      {
        id: OrdersService.SEED_ORDER_2_ID,
        orderNo: 'WO-2026-002',
        customerName: '王若兰',
        customerPhone: '13900139002',
        furnitureName: '紫檀画案',
        woodPreference: '紫檀',
        dimensions: { length: 180, width: 80, height: 82, unit: 'cm' },
        complexity: 'master',
        requiredTenons: ['霸王枨', '夹头榫', '抱肩榫', '粽角榫'],
        status: 'accepted',
        createdAt: new Date(now.getTime() - 60 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
        estimatedDelivery: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
        actualDelivery: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
        tenonDiagramIds: [],
        craftRecords: [
          { id: 'd1', stepName: '选料开料', completed: true, completedAt: new Date(now.getTime() - 58 * 24 * 3600 * 1000).toISOString(), plannedStartDate: new Date(now.getTime() - 59 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 57 * 24 * 3600 * 1000).toISOString(), assignee: '张木匠' },
          { id: 'd2', stepName: '干燥处理', completed: true, completedAt: new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString(), plannedStartDate: new Date(now.getTime() - 56 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 46 * 24 * 3600 * 1000).toISOString(), assignee: '李木匠' },
          { id: 'd3', stepName: '开榫凿眼', completed: true, completedAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), difficulty: '霸王枨安装需经验丰富', plannedStartDate: new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 31 * 24 * 3600 * 1000).toISOString(), assignee: '王木匠' },
          { id: 'd4', stepName: '试装拼合', completed: true, completedAt: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(), plannedStartDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 16 * 24 * 3600 * 1000).toISOString(), assignee: '张木匠' },
          { id: 'd5', stepName: '打磨上漆', completed: true, completedAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString(), plannedStartDate: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 8 * 24 * 3600 * 1000).toISOString(), assignee: '赵木匠' },
          { id: 'd6', stepName: '整体修整', completed: true, completedAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(), plannedStartDate: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString(), plannedEndDate: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(), assignee: '王木匠' },
        ],
        craftsmanshipRating: 5,
        customerComment: '工艺精湛，紫檀画案做工一丝不苟，霸王枨结构稳固美观，非常满意！',
      },
      {
        id: OrdersService.SEED_ORDER_3_ID,
        orderNo: 'WO-2026-003',
        customerName: '张文博',
        customerPhone: '13700137003',
        furnitureName: '榆木书架',
        woodPreference: '榆木',
        dimensions: { length: 120, width: 35, height: 200, unit: 'cm' },
        complexity: 'medium',
        requiredTenons: ['直榫', '燕尾榫'],
        status: 'designing',
        createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
        estimatedDelivery: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(),
        tenonDiagramIds: [],
        craftRecords: [],
      },
    ];
    this.orders = sampleOrders;
  }

  static readonly NEAR_DELIVERY_DAYS = 7;
  static readonly NEAR_DELIVERY_THRESHOLD_DAYS = 7;

  computeOverdueCraftCount(order: Order): number {
    const now = new Date();
    return order.craftRecords.filter((c) => {
      if (c.completed || !c.plannedEndDate) return false;
      return new Date(c.plannedEndDate).getTime() < now.getTime();
    }).length;
  }

  computeScheduleStatus(order: Order): ScheduleStatus {
    if (order.status === 'completed' || order.status === 'accepted') return 'normal';
    if (this.computeOverdueCraftCount(order) > 0) return 'overdue';
    if (order.estimatedDelivery) {
      const daysLeft = Math.ceil(
        (new Date(order.estimatedDelivery).getTime() - new Date().getTime()) /
          (24 * 3600 * 1000),
      );
      if (daysLeft >= 0 && daysLeft <= OrdersService.NEAR_DELIVERY_THRESHOLD_DAYS) return 'near';
    }
    return 'normal';
  }

  computeCraftDurationDays(craft: CraftRecord): number | null {
    if (!craft.completed && craft.plannedStartDate && craft.plannedEndDate) {
      return Math.ceil(
        (new Date(craft.plannedEndDate).getTime() -
          new Date(craft.plannedStartDate).getTime()) /
          (24 * 3600 * 1000),
      );
    }
    if (craft.completed && craft.completedAt && craft.plannedStartDate) {
      return Math.ceil(
        (new Date(craft.completedAt).getTime() -
          new Date(craft.plannedStartDate).getTime()) /
          (24 * 3600 * 1000),
      );
    }
    return null;
  }

  enrichWithSchedule(order: Order): OrderWithSchedule {
    return {
      ...order,
      scheduleStatus: this.computeScheduleStatus(order),
      overdueCraftCount: this.computeOverdueCraftCount(order),
    };
  }

  private findRawOrder(id: string): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`订单 ${id} 不存在`);
    }
    return order;
  }

  findAll(scheduleStatus?: ScheduleStatus): OrderWithSchedule[] {
    const sorted = this.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const enriched = sorted.map((o) => this.enrichWithSchedule(o));
    if (scheduleStatus) {
      return enriched.filter((o) => o.scheduleStatus === scheduleStatus);
    }
    return enriched;
  }

  findOne(id: string): OrderWithSchedule {
    return this.enrichWithSchedule(this.findRawOrder(id));
  }

  create(dto: CreateOrderDto): Order {
    const orderNo = `WO-${new Date().getFullYear()}-${String(this.orders.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const defaultSteps = [
      '选料开料',
      '干燥处理',
      '开榫凿眼',
      '试装拼合',
      '打磨上漆',
      '整体修整',
    ];

    const craftRecords: CraftRecord[] = defaultSteps.map((name, idx) => ({
      id: uuidv4(),
      stepName: name,
      completed: false,
    }));

    const order: Order = {
      id: uuidv4(),
      orderNo,
      ...dto,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      tenonDiagramIds: [],
      craftRecords,
    };

    this.orders.push(order);
    return order;
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto): OrderWithSchedule {
    const order = this.findRawOrder(id);
    order.status = dto.status;
    order.updatedAt = new Date().toISOString();
    if (dto.status === 'completed' && !order.actualDelivery) {
      order.actualDelivery = new Date().toISOString();
    }
    return this.enrichWithSchedule(order);
  }

  acceptOrder(id: string, dto: AcceptOrderDto): OrderWithSchedule {
    const order = this.findRawOrder(id);
    order.status = 'accepted';
    order.craftsmanshipRating = dto.craftsmanshipRating;
    order.customerComment = dto.comment;
    order.updatedAt = new Date().toISOString();
    return this.enrichWithSchedule(order);
  }

  updateCraftRecord(orderId: string, craftId: string, data: Partial<CraftRecord>): OrderWithSchedule {
    const order = this.findRawOrder(orderId);
    const record = order.craftRecords.find((r) => r.id === craftId);
    if (!record) {
      throw new NotFoundException(`工序记录 ${craftId} 不存在`);
    }
    const clearableFields: (keyof CraftRecord)[] = [
      'difficulty',
      'notes',
      'plannedStartDate',
      'plannedEndDate',
      'assignee',
      'blockingReason',
    ];
    clearableFields.forEach((key) => {
      if (key in data) {
        const v = data[key];
        (record as any)[key] = v === '' || v === null ? undefined : v;
      }
    });
    if ('completed' in data) {
      record.completed = data.completed as boolean;
      if (data.completed && !record.completedAt) {
        record.completedAt = new Date().toISOString();
      }
      if (!data.completed) {
        record.completedAt = undefined;
      }
    }
    order.updatedAt = new Date().toISOString();
    return this.enrichWithSchedule(order);
  }

  delete(id: string): void {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new NotFoundException(`订单 ${id} 不存在`);
    }
    this.orders.splice(index, 1);
  }
}
