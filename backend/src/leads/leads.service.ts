import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { Service } from '../services/service.entity';
import { ExpoPushService } from '../notifications/expo-push.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    private readonly expoPushService: ExpoPushService,
  ) {}

  async createLead(
    serviceId: string,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    message: string,
    budget?: number,
    clientId?: string,
  ): Promise<Lead> {
    const service = await this.servicesRepository.findOne({ 
      where: { id: serviceId },
      relations: ['provider'] 
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (clientId && clientId === service.providerId) {
      throw new ForbiddenException('Você não pode solicitar orçamento do próprio serviço');
    }

    const lead = this.leadsRepository.create({
      clientName,
      clientEmail,
      clientPhone,
      message,
      budget,
      serviceId,
      providerId: service.providerId,
      clientId,
      status: 'pending',
    });

    const saved = await this.leadsRepository.save(lead);

    // Notifica o provider sobre novo orçamento
    await this.expoPushService.sendToUser(service.providerId, {
      title: 'Novo orçamento recebido',
      body: `${clientName} enviou um pedido em "${service.title}"`,
      data: { type: 'lead:new', leadId: saved.id, serviceId: service.id },
    });

    return saved;
  }

  async getProviderLeads(providerId: string, status?: string): Promise<Lead[]> {
    const where: any = { providerId };
    if (status) {
      where.status = status;
    }
    return this.leadsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['service', 'provider'],
    });
  }

  async getLeadById(leadId: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id: leadId },
      relations: ['service', 'provider'],
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }

  async getLeadByIdForProvider(leadId: string, providerId: string): Promise<Lead> {
    const lead = await this.getLeadById(leadId);
    if (lead.providerId !== providerId) {
      throw new ForbiddenException('Você não tem permissão para ver este lead');
    }
    return lead;
  }

  async updateLeadStatus(
    leadId: string,
    providerId: string,
    status: string,
    providerNotes?: string,
  ): Promise<Lead> {
    const lead = await this.getLeadById(leadId);

    if (lead.providerId !== providerId) {
      throw new ForbiddenException('Você não tem permissão para atualizar este lead');
    }

    lead.status = status;
    if (providerNotes !== undefined) {
      lead.providerNotes = providerNotes;
    }

    const saved = await this.leadsRepository.save(lead);

    // Notifica o cliente (se autenticado) que o status mudou
    if (saved.clientId) {
      await this.expoPushService.sendToUser(saved.clientId, {
        title: 'Seu orçamento foi atualizado',
        body: `Status: ${saved.status}`,
        data: { type: 'lead:status', leadId: saved.id, status: saved.status },
      });
    }

    return saved;
  }

  async getLeadsStats(providerId: string): Promise<any> {
    const leads = await this.getProviderLeads(providerId);
    
    const stats = {
      total: leads.length,
      pending: leads.filter(l => l.status === 'pending').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      accepted: leads.filter(l => l.status === 'accepted').length,
      rejected: leads.filter(l => l.status === 'rejected').length,
      completed: leads.filter(l => l.status === 'completed').length,
      totalBudget: leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0),
      averageBudget: leads.length > 0 
        ? leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0) / leads.length 
        : 0,
    };

    return stats;
  }

  async deleteLead(leadId: string, providerId: string): Promise<void> {
    const lead = await this.getLeadById(leadId);

    if (lead.providerId !== providerId) {
      throw new ForbiddenException('Você não tem permissão para deletar este lead');
    }

    await this.leadsRepository.delete(leadId);
  }
}
