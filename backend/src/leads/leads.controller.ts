import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('service/:serviceId')
  @UseGuards(JwtAuthGuard)
  async createLead(
    @Param('serviceId') serviceId: string,
    @Body() body: {
      clientName: string;
      clientEmail: string;
      clientPhone?: string;
      message: string;
      budget?: number;
    },
    @Request() req,
  ) {
    const lead = await this.leadsService.createLead(
      serviceId,
      body.clientName,
      body.clientEmail,
      body.clientPhone,
      body.message,
      body.budget,
      req.user.id,
    );
    return { message: 'Orçamento enviado com sucesso', lead };
  }

  @Get('provider')
  @UseGuards(JwtAuthGuard)
  async getProviderLeads(
    @Request() req,
    @Query('status') status?: string,
  ) {
    return this.leadsService.getProviderLeads(req.user.id, status);
  }

  @Get('provider/stats')
  @UseGuards(JwtAuthGuard)
  async getLeadsStats(@Request() req) {
    return this.leadsService.getLeadsStats(req.user.id);
  }

  @Get(':leadId')
  @UseGuards(JwtAuthGuard)
  async getLeadById(@Request() req, @Param('leadId') leadId: string) {
    return this.leadsService.getLeadByIdForProvider(leadId, req.user.id);
  }

  @Put(':leadId/status')
  @UseGuards(JwtAuthGuard)
  async updateLeadStatus(
    @Request() req,
    @Param('leadId') leadId: string,
    @Body() body: { status: string; providerNotes?: string },
  ) {
    const lead = await this.leadsService.updateLeadStatus(
      leadId,
      req.user.id,
      body.status,
      body.providerNotes,
    );
    return { message: 'Lead atualizado com sucesso', lead };
  }

  @Delete(':leadId')
  @UseGuards(JwtAuthGuard)
  async deleteLead(@Request() req, @Param('leadId') leadId: string) {
    await this.leadsService.deleteLead(leadId, req.user.id);
    return { message: 'Lead removido com sucesso' };
  }
}
