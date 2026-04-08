import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Service } from '../services/service.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string;

  @Column({ type: 'varchar', default: 'CLIENT' })
  role: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string;

  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ nullable: true })
  premiumSince: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  expoPushToken: string;

  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
