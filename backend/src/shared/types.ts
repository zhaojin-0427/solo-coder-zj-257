export type OrderStatus = 'pending' | 'designing' | 'producing' | 'completed' | 'accepted';
export type WoodType = '黄花梨' | '紫檀' | '酸枝' | '鸡翅木' | '楠木' | '榆木' | '榉木' | '松木';
export type Complexity = 'simple' | 'medium' | 'complex' | 'master';
export type TenonType =
  | '直榫'
  | '燕尾榫'
  | '格肩榫'
  | '夹头榫'
  | '插肩榫'
  | '粽角榫'
  | '霸王枨'
  | '抱肩榫'
  | '楔钉榫'
  | '长短榫';

export interface Dimension {
  length: number;
  width: number;
  height: number;
  unit: string;
}
