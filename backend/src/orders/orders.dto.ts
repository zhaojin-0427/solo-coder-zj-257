import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, WoodType, Complexity, TenonType } from '../shared/types';

class DimensionDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  unit: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  furnitureName: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['黄花梨', '紫檀', '酸枝', '鸡翅木', '楠木', '榆木', '榉木', '松木'])
  woodPreference: WoodType;

  @ValidateNested()
  @Type(() => DimensionDto)
  dimensions: DimensionDto;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['simple', 'medium', 'complex', 'master'])
  complexity: Complexity;

  @IsArray()
  @IsOptional()
  requiredTenons: TenonType[];

  @IsString()
  @IsOptional()
  specialRequirements: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['pending', 'designing', 'producing', 'completed', 'accepted'])
  status: OrderStatus;
}

export class AcceptOrderDto {
  @IsNumber()
  craftsmanshipRating: number;

  @IsString()
  @IsOptional()
  comment: string;
}
