import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { EmailModule } from './infrastructure/email/email.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/users/users.module';
import { AuditModule } from './domains/audit/audit.module';
import { GroupsModule } from './domains/groups/groups.module';
import { DiscipleshipModule } from './domains/discipleship/discipleship.module';
import { MembershipsModule } from './domains/memberships/memberships.module';
import { ReportingModule } from './domains/reporting/reporting.module';
import { NetworksModule } from './domains/networks/networks.module';
import { PermissionsModule } from './domains/permissions/permissions.module';
import { SearchModule } from './infrastructure/search/search.module';
import { AnalyticsModule } from './domains/analytics/analytics.module';
import { AdminModule } from './domains/admin/admin.module';
import { InvitationsModule } from './domains/invitations/invitations.module';
import { SermonsModule } from './domains/sermons/sermons.module';
import { NotificationsModule } from './domains/notifications/notifications.module';
import { LoggerModule } from './common/logger/logger.module';
import { DomainEventsModule } from './common/events/events.module';
import { HierarchyVisibilityModule } from './common/services/hierarchy-visibility.module';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    // Config — load .env globally with Zod validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate,
    }),

    // Rate limiting — global: 1000 req/min, auth: 10 req/min
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 1000,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Event bus (sync — for local event handlers)
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
    }),

    // Infrastructure
    DatabaseModule,
    CacheModule,
    QueueModule,
    EmailModule,

    // Structured logging
    LoggerModule,

    // Domain events (async — BullMQ)
    DomainEventsModule,

    // Hierarchy-based visibility
    HierarchyVisibilityModule,

    // Health checks
    HealthModule,

    // Domains
    AuthModule,
    AuditModule,
    UsersModule,
    GroupsModule,
    DiscipleshipModule,
    MembershipsModule,
    ReportingModule,
    NetworksModule,
    PermissionsModule,
    SearchModule,
    AnalyticsModule,
    AdminModule,
    InvitationsModule,
    SermonsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SecurityHeadersMiddleware, TraceIdMiddleware)
      .forRoutes('*');
  }
}
