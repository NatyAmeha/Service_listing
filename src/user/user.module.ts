import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserRepository } from 'src/repo/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository.injectName,
      useClass: UserRepository
    },
    UserService],
  exports: [UserService, UserRepository.injectName]
})
export class UserModule { }
