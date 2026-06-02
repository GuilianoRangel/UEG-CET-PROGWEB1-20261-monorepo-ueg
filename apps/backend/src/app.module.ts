import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { MailerModule } from './mailer/mailer.module';
import { Match } from './matches/entities/match.entity';
import { PredictionOption } from './matches/entities/prediction-option.entity';
import { UserGuess } from './guesses/entities/user-guess.entity';
import { MatchesModule } from './matches/matches.module';
import { GuessesModule } from './guesses/guesses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_NAME || 'database.sqlite',
      entities: [User, Match, PredictionOption, UserGuess],
      synchronize: true, // Use with caution in prod
    }),
    UsersModule,
    AuthModule,
    MailerModule,
    MatchesModule,
    GuessesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
