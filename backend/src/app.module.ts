import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [UsersModule, PrismaModule, DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
