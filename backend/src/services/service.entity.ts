import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  coverUrl: string;

  @Column({ type: 'text' })
  videoUrl: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  whatsappClicks: number;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @ManyToOne(() => User, (user) => user.services, { eager: true })
  @JoinColumn({ name: 'providerId' })
  provider: User;

  @Column()
  providerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}