import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
}
