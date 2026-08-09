import { Controller } from '@nestjs/common';
import { StudyGroupsService } from './study-groups.service';
@Controller('api/study-groups')
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}
}
