import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MaterialItem {
  id: string;
  name: string;
  woodType: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface MaterialList {
  id: string;
  orderId: string;
  orderNo: string;
  items: MaterialItem[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'confirmed' | 'purchased';
}

@Injectable()
export class MaterialsService {
  private materialLists: MaterialList[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    this.materialLists = [
      {
        id: uuidv4(),
        orderId: 'seed-order-1',
        orderNo: 'WO-2026-001',
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 19 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 18 * 24 * 3600 * 1000).toISOString(),
        totalCost: 28600,
        items: [
          {
            id: uuidv4(),
            name: '黄花梨面板料',
            woodType: '黄花梨',
            specification: '120×30×5cm',
            quantity: 2,
            unit: '块',
            unitPrice: 8000,
            totalPrice: 16000,
            notes: '精选海南黄花梨老料，纹理清晰',
          },
          {
            id: uuidv4(),
            name: '黄花梨腿料',
            woodType: '黄花梨',
            specification: '96×6×6cm',
            quantity: 4,
            unit: '根',
            unitPrice: 2500,
            totalPrice: 10000,
            notes: '无结疤直料',
          },
          {
            id: uuidv4(),
            name: '黄花梨枨子料',
            woodType: '黄花梨',
            specification: '50×4×4cm',
            quantity: 4,
            unit: '根',
            unitPrice: 650,
            totalPrice: 2600,
          },
        ],
      },
      {
        id: uuidv4(),
        orderId: 'seed-order-2',
        orderNo: 'WO-2026-002',
        status: 'purchased',
        createdAt: new Date(now.getTime() - 58 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 55 * 24 * 3600 * 1000).toISOString(),
        totalCost: 128000,
        items: [
          {
            id: uuidv4(),
            name: '紫檀面板大料',
            woodType: '紫檀',
            specification: '200×90×8cm',
            quantity: 1,
            unit: '块',
            unitPrice: 85000,
            totalPrice: 85000,
            notes: '印度小叶紫檀，满金星',
          },
          {
            id: uuidv4(),
            name: '紫檀腿料',
            woodType: '紫檀',
            specification: '85×10×10cm',
            quantity: 4,
            unit: '根',
            unitPrice: 9000,
            totalPrice: 36000,
            notes: '一木同出',
          },
          {
            id: uuidv4(),
            name: '紫檀牙板料',
            woodType: '紫檀',
            specification: '180×12×3cm',
            quantity: 2,
            unit: '块',
            unitPrice: 3500,
            totalPrice: 7000,
          },
        ],
      },
    ];
  }

  findAll(): MaterialList[] {
    return this.materialLists.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findOne(id: string): MaterialList {
    const list = this.materialLists.find((m) => m.id === id);
    if (!list) {
      throw new NotFoundException(`用料清单 ${id} 不存在`);
    }
    return list;
  }

  findByOrderId(orderId: string): MaterialList | undefined {
    return this.materialLists.find((m) => m.orderId === orderId);
  }

  create(orderId: string, orderNo: string, items: Omit<MaterialItem, 'id'>[]): MaterialList {
    const now = new Date().toISOString();
    const materialItems: MaterialItem[] = items.map((item) => ({
      ...item,
      id: uuidv4(),
    }));
    const totalCost = materialItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const list: MaterialList = {
      id: uuidv4(),
      orderId,
      orderNo,
      items: materialItems,
      totalCost,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
    };

    this.materialLists.push(list);
    return list;
  }

  update(id: string, data: Partial<MaterialList>): MaterialList {
    const list = this.findOne(id);
    Object.assign(list, data);
    if (data.items) {
      list.totalCost = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    list.updatedAt = new Date().toISOString();
    return list;
  }

  delete(id: string): void {
    const index = this.materialLists.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`用料清单 ${id} 不存在`);
    }
    this.materialLists.splice(index, 1);
  }
}
