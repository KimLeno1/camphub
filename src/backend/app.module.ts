import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CommunitiesModule } from './communities/communities.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { GovernanceModule } from './governance/governance.module';
import { ResourcesModule } from './resources/resources.module';
import { EventsModule } from './events/events.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { StudyGroupsModule } from './study-groups/study-groups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GatewaysModule } from './gateways/gateways.module';
import { AiModule } from './ai/ai.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    GatewaysModule,
    UsersModule, 
    ProfilesModule, 
    CommunitiesModule, 
    ChannelsModule, 
    MessagesModule,
    GovernanceModule,
    ResourcesModule,
    EventsModule,
    MarketplaceModule,
    StudyGroupsModule,
    NotificationsModule,
    SearchModule,
    AnalyticsModule,
    AiModule,
    SecurityModule
  ],
})
export class AppModule {}
