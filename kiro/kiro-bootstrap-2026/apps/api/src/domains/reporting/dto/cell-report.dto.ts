import { IsString, IsInt, Min, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCellReportDto {
  @IsString()
  groupId: string;

  @IsString()
  cellCode: string;

  @IsDateString()
  meetingDate: string;

  @IsString()
  coverageName: string;

  @IsString()
  leaderName: string;

  @IsOptional()
  @IsString()
  coLeaderName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  menCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  womenCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  youthMaleCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  youthFemaleCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  childrenCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  visitorsCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  convertsCount: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  reconciledCount: number;

  @IsOptional()
  @IsString()
  messageTopic?: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offeringAmount?: number;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  wasSupervised?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class CellReportQueryDto {
  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  networkId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;
}
