import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto, UpdateOrderStatusDto, AcceptOrderDto, UpdateQuoteDto, ConfirmDepositDto } from './orders.dto';
import { OrderStatus, QuoteStatus } from '../shared/types';
import { MaterialsService, MaterialItem } from '../materials/materials.service';

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

export interface QuoteItem {
  id: string;
  name: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface DepositRecord {
  ratio: number;
  amount: number;
  confirmedAt: string;
  paid: boolean;
  paidAt?: string;
}

export interface Quote {
  quoteNo: string;
  items: QuoteItem[];
  materialCost: number;
  laborCost: number;
  wastageCost: number;
  transportInstallCost: number;
  totalAmount: number;
  quoteRemark?: string;
  createdAt: string;
  updatedAt: string;
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
  quoteStatus: QuoteStatus;
  quote?: Quote;
  deposit?: DepositRecord;
}

const WOOD_PRICE_PER_UNIT: Record<string, number> = {
  '黄花梨': 800,
  '紫檀': 1200,
  '酸枝': 400,
  '鸡翅木': 300,
  '楠木': 350,
  '榆木': 150,
  '榉木': 180,
  '松木': 80,
};

const COMPLEXITY_LABOR_MULTIPLIER: Record<string, number> = {
  'simple': 1.0,
  'medium': 1.5,
  'complex': 2.2,
  'master': 3.5,
};

const BASE_LABOR_COST = 3000;
const WASTAGE_RATE = 0.08;
const TRANSPORT_INSTALL_BASE = 500;

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor(private readonly materialsService: MaterialsService) {
    this.seedData();
  }

  static readonly SEED_ORDER_1_ID = 'order-001-seed';
  static readonly SEED_ORDER_2_ID = 'order-002-seed';
  static readonly SEED_ORDER_3_ID = 'order-003-seed';

  private computeVolume(dimensions: { length: number; width: number; height: number; unit: string }): number {
    let factor = 1;
    if (dimensions.unit === 'mm') factor = 0.1;
    return (dimensions.length * factor) * (dimensions.width * factor) * (dimensions.height * factor) / 1000000;
  }

  private generateQuoteItems(order: Order, materialList?: any): QuoteItem[] {
    const items: QuoteItem[] = [];

    if (materialList && materialList.items && materialList.items.length > 0) {
      materialList.items.forEach((m: MaterialItem) => {
        items.push({
          id: uuidv4(),
          name: m.name,
          specification: m.specification,
          quantity: m.quantity,
          unit: m.unit,
          unitPrice: m.unitPrice,
          totalPrice: m.totalPrice,
          notes: m.notes,
        });
      });
    } else {
      const volume = this.computeVolume(order.dimensions);
      const woodPricePerUnit = WOOD_PRICE_PER_UNIT[order.woodPreference] || 200;
      const materialTotal = Math.round(volume * woodPricePerUnit * 100);

      items.push({
        id: uuidv4(),
        name: `${order.woodPreference}主料`,
        specification: `${order.dimensions.length}×${order.dimensions.width}×${order.dimensions.height}${order.dimensions.unit}`,
        quantity: 1,
        unit: '套',
        unitPrice: materialTotal,
        totalPrice: materialTotal,
        notes: `按家具尺寸估算主料用量`,
      });

      if (order.requiredTenons && order.requiredTenons.length > 0) {
        items.push({
          id: uuidv4(),
          name: '榫卯配件',
          specification: order.requiredTenons.join('、'),
          quantity: order.requiredTenons.length,
          unit: '种',
          unitPrice: 200,
          totalPrice: order.requiredTenons.length * 200,
        });
      }

      items.push({
        id: uuidv4(),
        name: '辅料（胶、漆、五金）',
        specification: '标准配套',
        quantity: 1,
        unit: '套',
        unitPrice: 800,
        totalPrice: 800,
      });
    }

    return items;
  }

  private autoGenerateQuote(order: Order): Quote {
    const materialList = order.materialListId
      ? this.materialsService.findOne(order.materialListId)
      : this.materialsService.findByOrderId(order.id);

    const items = this.generateQuoteItems(order, materialList);

    const materialCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const laborMultiplier = COMPLEXITY_LABOR_MULTIPLIER[order.complexity] || 1.0;
    const laborCost = Math.round(BASE_LABOR_COST * laborMultiplier);
    const wastageCost = Math.round(materialCost * WASTAGE_RATE);
    const volume = this.computeVolume(order.dimensions);
    const transportInstallCost = Math.round(TRANSPORT_INSTALL_BASE + volume * 50);
    const totalAmount = materialCost + laborCost + wastageCost + transportInstallCost;

    const now = new Date().toISOString();
    return {
      quoteNo: `Q-${order.orderNo}`,
      items,
      materialCost,
      laborCost,
      wastageCost,
      transportInstallCost,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    };
  }

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
        quoteStatus: 'deposit_paid',
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
        quoteStatus: 'settled',
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
        quoteStatus: 'unquoted',
      },
    ];

    sampleOrders.forEach((order) => {
      if (order.quoteStatus !== 'unquoted') {
        order.quote = this.autoGenerateQuote(order);
        if (order.quoteStatus === 'deposit_paid' || order.quoteStatus === 'settled') {
          const depositRatio = order.quoteStatus === 'settled' ? 100 : 30;
          order.deposit = {
            ratio: depositRatio,
            amount: Math.round(order.quote.totalAmount * depositRatio / 100),
            confirmedAt: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(),
            paid: true,
            paidAt: new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString(),
          };
        }
      }
    });

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

  private recalcQuoteTotal(quote: Quote): void {
    const materialCost = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    quote.materialCost = materialCost;
    quote.totalAmount = materialCost + quote.laborCost + quote.wastageCost + quote.transportInstallCost;
    quote.updatedAt = new Date().toISOString();
  }

  findAll(scheduleStatus?: ScheduleStatus, quoteStatus?: QuoteStatus): OrderWithSchedule[] {
    let sorted = [...this.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (quoteStatus) {
      sorted = sorted.filter((o) => o.quoteStatus === quoteStatus);
    }
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
      quoteStatus: 'unquoted',
    };

    this.orders.push(order);
    return order;
  }

  createQuote(orderId: string): OrderWithSchedule {
    const order = this.findRawOrder(orderId);
    if (order.quote && order.quoteStatus !== 'unquoted') {
      throw new BadRequestException('该订单已存在报价');
    }
    order.quote = this.autoGenerateQuote(order);
    order.quoteStatus = 'pending_confirm';
    order.updatedAt = new Date().toISOString();
    return this.enrichWithSchedule(order);
  }

  updateQuote(orderId: string, dto: UpdateQuoteDto): OrderWithSchedule {
    const order = this.findRawOrder(orderId);
    if (!order.quote) {
      throw new NotFoundException('该订单尚未创建报价');
    }
    if (order.quoteStatus === 'deposit_paid' || order.quoteStatus === 'settled') {
      throw new BadRequestException('订金已确认，无法修改报价');
    }

    if (dto.laborCost !== undefined) order.quote.laborCost = dto.laborCost;
    if (dto.wastageCost !== undefined) order.quote.wastageCost = dto.wastageCost;
    if (dto.transportInstallCost !== undefined) order.quote.transportInstallCost = dto.transportInstallCost;
    if (dto.quoteRemark !== undefined) order.quote.quoteRemark = dto.quoteRemark;

    if (dto.items && dto.items.length > 0) {
      order.quote.items = dto.items.map((item) => ({
        ...item,
        id: (item as any).id || uuidv4(),
      }));
    }

    this.recalcQuoteTotal(order.quote);
    order.updatedAt = new Date().toISOString();
    order.quoteStatus = 'pending_confirm';
    return this.enrichWithSchedule(order);
  }

  confirmDeposit(orderId: string, dto: ConfirmDepositDto): OrderWithSchedule {
    const order = this.findRawOrder(orderId);
    if (!order.quote) {
      throw new NotFoundException('该订单尚未创建报价');
    }
    if (order.quoteStatus !== 'pending_confirm') {
      throw new BadRequestException('当前报价状态不允许确认订金');
    }
    if (dto.depositRatio <= 0 || dto.depositRatio > 100) {
      throw new BadRequestException('订金比例需在0-100之间');
    }
    const expectedAmount = Math.round(order.quote.totalAmount * dto.depositRatio / 100);
    if (Math.abs(dto.depositAmount - expectedAmount) > 1) {
      throw new BadRequestException(`订金金额与比例不匹配，应为${expectedAmount}`);
    }

    const now = new Date().toISOString();
    order.deposit = {
      ratio: dto.depositRatio,
      amount: dto.depositAmount,
      confirmedAt: now,
      paid: true,
      paidAt: now,
    };

    if (dto.depositRatio >= 100) {
      order.quoteStatus = 'settled';
    } else {
      order.quoteStatus = 'deposit_paid';
    }
    order.updatedAt = now;
    return this.enrichWithSchedule(order);
  }

  settleQuote(orderId: string): OrderWithSchedule {
    const order = this.findRawOrder(orderId);
    if (!order.quote || !order.deposit) {
      throw new NotFoundException('该订单尚未完成报价和订金确认');
    }
    if (order.quoteStatus !== 'deposit_paid') {
      throw new BadRequestException('当前状态不允许结清尾款');
    }
    const now = new Date().toISOString();
    order.deposit.ratio = 100;
    order.deposit.amount = order.quote.totalAmount;
    order.deposit.confirmedAt = now;
    order.deposit.paid = true;
    order.deposit.paidAt = now;
    order.quoteStatus = 'settled';
    order.updatedAt = now;
    return this.enrichWithSchedule(order);
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
