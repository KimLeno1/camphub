import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/communities/:communityId/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getResources(@Param('communityId') communityId: string) {
    return this.resourcesService.getResourcesForCommunity(communityId);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async uploadResource(
    @CurrentUser() user: any,
    @Param('communityId') communityId: string,
    @Body() body: { title: string; fileUrl: string; fileSizeBytes: number; mimeType: string }
  ) {
    return this.resourcesService.uploadResource(
      user.uid, 
      communityId, 
      body.title, 
      body.fileUrl, 
      body.fileSizeBytes, 
      body.mimeType
    );
  }
}

@Controller('api/resources')
export class SingleResourceController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getResourceById(@Param('id') id: string) {
    return this.resourcesService.getResourceById(id);
  }
}
