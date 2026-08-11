import { Module } from '@nestjs/common';
import { ResourcesController, SingleResourceController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
  controllers: [ResourcesController, SingleResourceController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
