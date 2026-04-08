import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  clientName: string;

  @Column({ type: 'varchar', length: 255 })
  clientEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  clientPhone: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string; // pending, contacted, accepted, rejected, completed

  @ManyToOne(() => Service, { eager: true })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'providerId' })
  provider: User;

  @Column()
  providerId: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'text', nullable: true })
  providerNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
