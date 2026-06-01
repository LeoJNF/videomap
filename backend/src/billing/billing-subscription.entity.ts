import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('billing_subscriptions')
export class BillingSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  planCode: string;

  @Column({ type: 'varchar', length: 255 })
  mercadoPagoPlanId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  externalReference: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  mercadoPagoSubscriptionId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  providerId?: string | null;

  @Column({ type: 'varchar', length: 255 })
  providerName: string;

  @Column({ type: 'varchar', length: 255 })
  payerEmail: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  payerFullName?: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  payerPhone?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  documentType?: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  documentNumber?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  paymentMethodId?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  issuerId?: string | null;

  @Column({ type: 'varchar', length: 60, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  initPoint?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  nextPaymentDate?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  rawSnapshot?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
