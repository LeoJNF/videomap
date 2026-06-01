import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('billing_plans')
export class BillingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  mercadoPagoPlanId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 8, default: 'BRL' })
  currencyId: string;

  @Column({ type: 'int', default: 1 })
  frequency: number;

  @Column({ type: 'varchar', length: 20, default: 'months' })
  frequencyType: string;

  @Column({ type: 'int', nullable: true })
  repetitions?: number | null;

  @Column({ type: 'int', default: 30 })
  freeTrialFrequency: number;

  @Column({ type: 'varchar', length: 20, default: 'days' })
  freeTrialFrequencyType: string;

  @Column({ type: 'varchar', length: 500 })
  backUrl: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'simple-json', nullable: true })
  rawSnapshot?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
