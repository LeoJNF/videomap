import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  serviceId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  service: Service;

  @CreateDateColumn()
  createdAt: Date;
}
