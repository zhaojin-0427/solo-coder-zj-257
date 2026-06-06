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
          { id: 'c1', stepName: '选料开料', completed: true, completedAt: new Date(now.getTime() - 18 * 24 * 3600 * 1000).toISOString(), notes: '精选海南黄花梨老料' },
          { id: 'c2', stepName: '干燥处理', completed: true, completedAt: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(), difficulty: '自然阴干需严格控制温湿度', notes: '阴干15天' },
          { id: 'c3', stepName: '开榫凿眼', completed: true, completedAt: new Date(now.getTime() - 6 * 24 * 3600 * 1000).toISOString(), difficulty: '楔钉榫对接精度要求高' },
          { id: 'c4', stepName: '试装拼合', completed: false, notes: '需确保各部件严丝合缝' },
          { id: 'c5', stepName: '打磨上漆', completed: false },
          { id: 'c6', stepName: '整体修整', completed: false },
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
          { id: 'd1', stepName: '选料开料', completed: true, completedAt: new Date(now.getTime() - 58 * 24 * 3600 * 1000).toISOString() },
          { id: 'd2', stepName: '干燥处理', completed: true, completedAt: new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString() },
          { id: 'd3', stepName: '开榫凿眼', completed: true, completedAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), difficulty: '霸王枨安装需经验丰富' },
          { id: 'd4', stepName: '试装拼合', completed: true, completedAt: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString() },
          { id: 'd5', stepName: '打磨上漆', completed: true, completedAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString() },
          { id: 'd6', stepName: '整体修整', completed: true, completedAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString() },
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
        tenonDiagramIds: [],
        craftRecords: [],
      },
    ];
    this.orders = sampleOrders;
  }

  findAll(): Order[] {
    return this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findOne(id: string): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`订单 ${id} 不存在`);
    }
    return order;
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

  updateStatus(id: string, dto: UpdateOrderStatusDto): Order {
    const order = this.findOne(id);
    order.status = dto.status;
    order.updatedAt = new Date().toISOString();
    if (dto.status === 'completed' && !order.actualDelivery) {
      order.actualDelivery = new Date().toISOString();
    }
    return order;
  }

  acceptOrder(id: string, dto: AcceptOrderDto): Order {
    const order = this.findOne(id);
    order.status = 'accepted';
    order.craftsmanshipRating = dto.craftsmanshipRating;
    order.customerComment = dto.comment;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  updateCraftRecord(orderId: string, craftId: string, data: Partial<CraftRecord>): Order {
    const order = this.findOne(orderId);
    const record = order.craftRecords.find((r) => r.id === craftId);
    if (!record) {
      throw new NotFoundException(`工序记录 ${craftId} 不存在`);
    }
    Object.assign(record, data);
    if (data.completed && !record.completedAt) {
      record.completedAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();
    return order;
  }

  delete(id: string): void {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new NotFoundException(`订单 ${id} 不存在`);
    }
    this.orders.splice(index, 1);
  }
}
