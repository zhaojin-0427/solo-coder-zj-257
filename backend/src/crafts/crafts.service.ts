import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface CraftArchive {
  id: string;
  orderId?: string;
  orderNo?: string;
  furnitureName: string;
  title: string;
  content: string;
  woodType: string;
  tenonTypes: string[];
  difficulty: 'low' | 'medium' | 'high' | 'master';
  keyTechniques: string[];
  lessonsLearned?: string;
  createdAt: string;
  author: string;
  tags: string[];
}

@Injectable()
export class CraftsService {
  private archives: CraftArchive[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    this.archives = [
      {
        id: uuidv4(),
        orderId: 'seed-order-2',
        orderNo: 'WO-2026-002',
        furnitureName: '紫檀画案',
        title: '紫檀大画案霸王枨制作工艺全记录',
        content: `本紫檀画案长180cm、宽80cm、高82cm，通体采用印度小叶紫檀老料制作。\n\n一、选料阶段：精选满金星紫檀大料，面板采用一木对开双拼，木纹对称美观。腿足选用同一根木料开料，确保色泽纹理统一。\n\n二、开榫阶段：霸王枨是本件的核心工艺。霸王枨上端托着桌面的穿带，用销钉固定，下端与腿足中部相交，巧妙地将桌面承重传递至腿足。\n\n三、安装难点：霸王枨与腿足的连接需做到"无缝"，严丝合缝，手感顺滑。\n\n四、打磨上漆：采用传统生漆工艺，反复髹涂十五道，每次髹涂后精细打磨，最终呈现温润如玉的琥珀质感。`,
        woodType: '紫檀',
        tenonTypes: ['霸王枨', '夹头榫', '抱肩榫', '粽角榫'],
        difficulty: 'master',
        keyTechniques: ['一木同出', '一木对开', '生漆髹涂十五道', '霸王枨精准安装'],
        lessonsLearned: '紫檀材质坚硬，开榫时需慢工细作，注意木材顺纹方向，防止崩茬。',
        createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
        author: '李大师',
        tags: ['紫檀', '画案', '霸王枨', '生漆工艺'],
      },
      {
        id: uuidv4(),
        orderId: 'order-001-seed',
        orderNo: 'WO-2026-001',
        furnitureName: '明式圈椅',
        title: '明式黄花梨圈椅楔钉榫制作要点',
        content: `明式圈椅的精髓在于圈背的楔钉榫结构。\n\n一、楔钉榫是连接弧形材料的经典榫卯。两片榫头拍合后，中间露出一个梯形的榫眼，再楔入梯形楔钉。\n\n二、本案例中楔钉榫用于连接圈椅靠背的三段弧形材料。\n\n三、关键要点：楔钉角度需精确控制在58-62度之间，楔钉材质与主材一致，敲击力度均匀。\n\n四、干燥处理：海南黄花梨需阴干处理至少三个月，确保含水率稳定在12%以下。`,
        woodType: '黄花梨',
        tenonTypes: ['楔钉榫', '格肩榫', '夹头榫'],
        difficulty: 'high',
        keyTechniques: ['楔钉榫角度控制', '阴干处理', '攒边打槽'],
        createdAt: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(),
        author: '李大师',
        tags: ['黄花梨', '圈椅', '楔钉榫', '明式家具'],
      },
      {
        id: uuidv4(),
        furnitureName: '传统工艺笔记',
        title: '古典家具干燥处理工艺详解',
        content: `木材干燥是家具制作的第一道关键工序，直接决定家具成品的稳定性和寿命。\n\n一、自然阴干法：将开好的料放置于通风避光处，让水分自然缓慢蒸发。根据木材厚度不同，阴干时间从3个月到2年不等。\n\n二、窑干法：现代化干燥窑控制温度湿度，效率较高。但名贵硬木建议优先采用自然阴干配合低温烘干。\n\n三、注意事项：1) 材堆之间需留通风间隙；2) 避免阳光直射造成开裂；3) 定期检查含水率。\n\n四、目标含水率：北方地区控制在8-10%，南方地区控制在12-15%。`,
        woodType: '通用',
        tenonTypes: [],
        difficulty: 'medium',
        keyTechniques: ['自然阴干', '窑干', '含水率控制', '防开裂处理'],
        lessonsLearned: '紫檀、黄花梨等名贵硬木切忌快速干燥，极易造成不可逆的开裂。',
        createdAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
        author: '王师傅',
        tags: ['干燥工艺', '木材处理', '基础工艺'],
      },
    ];
  }

  findAll(): CraftArchive[] {
    return this.archives.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findOne(id: string): CraftArchive {
    const archive = this.archives.find((a) => a.id === id);
    if (!archive) {
      throw new NotFoundException(`工艺档案 ${id} 不存在`);
    }
    return archive;
  }

  create(data: Omit<CraftArchive, 'id' | 'createdAt'>): CraftArchive {
    const archive: CraftArchive = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.archives.push(archive);
    return archive;
  }

  update(id: string, data: Partial<CraftArchive>): CraftArchive {
    const archive = this.findOne(id);
    Object.assign(archive, data);
    return archive;
  }

  delete(id: string): void {
    const index = this.archives.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new NotFoundException(`工艺档案 ${id} 不存在`);
    }
    this.archives.splice(index, 1);
  }
}
