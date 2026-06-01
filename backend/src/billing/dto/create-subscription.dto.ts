import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMercadoPagoSubscriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  planCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  providerId?: string;

  @IsString()
  @MaxLength(255)
  providerName: string;

  @IsString()
  @MaxLength(255)
  payerFullName: string;

  @IsEmail()
  @MaxLength(255)
  payerEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  payerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  documentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  documentNumber?: string;

  @IsString()
  @MaxLength(255)
  cardTokenId: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  issuerId?: string;
}
