import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import * as Express from 'express';

@Controller('api/security')
@UseGuards(FirebaseAuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('logs')
  getLogs() {
    return this.securityService.getAuditLogs();
  }

  @Get('monitoring')
  getMonitoring() {
    return this.securityService.getMonitoringMetrics();
  }

  @Get('blocked-ips')
  getBlockedIps() {
    return this.securityService.getBlockedIPs();
  }

  @Post('unblock-ip')
  unblockIp(@Body() body: { ip: string }) {
    return this.securityService.unblockIP(body.ip);
  }

  @Post('scan-file')
  async scanFile(
    @Body() body: { title: string; mimeType: string; fileSizeBytes: number },
    @Req() req: Express.Request
  ) {
    const ip = req.ip || '127.0.0.1';
    return this.securityService.scanUploadedFile(body.title, body.mimeType, body.fileSizeBytes, ip);
  }

  @Post('backup')
  createBackup(@Body() body: { type: 'full' | 'incremental' }) {
    return this.securityService.createBackup(body.type || 'incremental');
  }

  @Get('backups')
  getBackups() {
    return this.securityService.getBackups();
  }

  @Delete('backup/:id')
  deleteBackup(@Param('id') id: string) {
    return this.securityService.deleteBackup(id);
  }

  @Post('encrypt')
  encrypt(@Body() body: { text: string }) {
    return this.securityService.encryptData(body.text);
  }

  @Post('decrypt')
  decrypt(@Body() body: { ciphertext: string; iv: string; tag: string }) {
    return this.securityService.decryptData(body.ciphertext, body.iv, body.tag);
  }

  @Post('sanitize')
  sanitize(@Body() body: { text: string }, @Req() req: Express.Request) {
    const ip = req.ip || '127.0.0.1';
    const sanitized = this.securityService.sanitizeAndValidateInput(body.text, ip);
    return { original: body.text, sanitized };
  }
}
