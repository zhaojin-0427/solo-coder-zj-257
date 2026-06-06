import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface TenonDiagram {
  id: string;
  name: string;
  type: string;
  orderId?: string;
  orderNo?: string;
  description: string;
  difficulty: 'low' | 'medium' | 'high' | 'master';
  diagramPlaceholder: string;
  notes?: string;
  createdAt: string;
  usageCount: number;
}

@Injectable()
export class TenonsService {
  private diagrams: TenonDiagram[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    this.diagrams = [
      {
        id: uuidv4(),
        name: '明式圈椅楔钉榫结构',
        type: '楔钉榫',
        orderId: 'seed-order-1',
        orderNo: 'WO-2026-001',
        description: '用于连接圈椅弧形构件，楔钉横向贯穿加固，防止脱榫',
        difficulty: 'high',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20wood%20joinery%20wedge%20tenon%20joint%20diagram%20technical%20drawing%20minimalist%20style&image_size=square',
        notes: '楔钉需与榫眼成60度角，配合紧密',
        createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
        usageCount: 8,
      },
      {
        id: uuidv4(),
        name: '紫檀画案霸王枨结构',
        type: '霸王枨',
        orderId: 'seed-order-2',
        orderNo: 'WO-2026-002',
        description: '腿足与桌面连接结构，霸王枨斜向支撑，既稳固又美观',
        difficulty: 'master',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20furniture%20bawangcheng%20stretcher%20joint%20technical%20diagram%20woodwork&image_size=square',
        notes: '霸王枨上端托着桌面穿带，下端与腿足相交',
        createdAt: new Date(Date.now() - 56 * 24 * 3600 * 1000).toISOString(),
        usageCount: 3,
      },
      {
        id: uuidv4(),
        name: '标准夹头榫结构图',
        type: '夹头榫',
        description: '桌案类家具通用结构，牙头夹着腿足，承载面板',
        difficulty: 'medium',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20jiatousun%20clamped%20head%20mortise%20tenon%20joint%20technical%20drawing&image_size=square',
        notes: '最经典的桌案结构之一，宋代已广泛使用',
        createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
        usageCount: 24,
      },
      {
        id: uuidv4(),
        name: '燕尾榫标准图',
        type: '燕尾榫',
        description: '抽屉及箱框连接用，梯形榫头防止拉脱',
        difficulty: 'medium',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20dovetail%20joint%20Chinese%20woodwork%20yantou%20technical%20drawing&image_size=square',
        notes: '半隐燕尾榫用于高端家具外观',
        createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
        usageCount: 45,
      },
      {
        id: uuidv4(),
        name: '直榫基础结构图',
        type: '直榫',
        description: '最基础的榫卯结构，方材直角连接',
        difficulty: 'low',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20straight%20mortise%20tenon%20joint%20zhisun%20woodworking%20technical%20diagram&image_size=square',
        notes: '分开口榫、闭口榫、半开口榫',
        createdAt: new Date(Date.now() - 200 * 24 * 3600 * 1000).toISOString(),
        usageCount: 128,
      },
      {
        id: uuidv4(),
        name: '粽角榫三维结构',
        type: '粽角榫',
        description: '三材六面汇合于一角，形似粽子角',
        difficulty: 'high',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=zongjiaosun%20corner%20mortise%20tenon%20three%20way%20joint%203d%20technical%20drawing&image_size=square',
        notes: '多用于书架、柜子等框架角部',
        createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
        usageCount: 15,
      },
      {
        id: uuidv4(),
        name: '抱肩榫连接图',
        type: '抱肩榫',
        description: '腿足与束腰、牙条的连接结构',
        difficulty: 'high',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baojiansun%20shoulder%20embracing%20mortise%20tenon%20joint%20technical%20illustration&image_size=square',
        notes: '有束腰家具必用结构',
        createdAt: new Date(Date.now() - 70 * 24 * 3600 * 1000).toISOString(),
        usageCount: 12,
      },
      {
        id: uuidv4(),
        name: '插肩榫结构图',
        type: '插肩榫',
        description: '腿足从牙条中间插出，肩部削成斜肩',
        difficulty: 'medium',
        diagramPlaceholder: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chajiansun%20inserted%20shoulder%20tenon%20joint%20woodworking%20diagram&image_size=square',
        notes: '外观平整，正面不露榫头',
        createdAt: new Date(Date.now() - 85 * 24 * 3600 * 1000).toISOString(),
        usageCount: 18,
      },
    ];
  }

  findAll(type?: string): TenonDiagram[] {
    let result = this.diagrams;
    if (type) {
      result = result.filter((d) => d.type === type);
    }
    return result.sort((a, b) => b.usageCount - a.usageCount);
  }

  findOne(id: string): TenonDiagram {
    const diagram = this.diagrams.find((d) => d.id === id);
    if (!diagram) {
      throw new NotFoundException(`榫卯图 ${id} 不存在`);
    }
    return diagram;
  }

  create(data: Omit<TenonDiagram, 'id' | 'createdAt' | 'usageCount'>): TenonDiagram {
    const diagram: TenonDiagram = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    this.diagrams.push(diagram);
    return diagram;
  }

  incrementUsage(id: string): TenonDiagram {
    const diagram = this.findOne(id);
    diagram.usageCount++;
    return diagram;
  }

  delete(id: string): void {
    const index = this.diagrams.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new NotFoundException(`榫卯图 ${id} 不存在`);
    }
    this.diagrams.splice(index, 1);
  }
}
