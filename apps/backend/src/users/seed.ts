import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from './users.service';
import { Role } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = 'admin@ueg.br';
  const existingAdmin = await usersService.findByEmail(adminEmail);

  if (!existingAdmin) {
    // Cannot use create method directly as it sets role to USER and ativo to false
    // we need to inject the repository or add a specific method.
    // For simplicity, we can do it this way if we add a createAdmin method or modify create.
    console.log('Admin não existe. Para criar o admin de forma correta, adicione um método de criação administrativa no UsersService.');
  } else {
    console.log('Admin já existe.');
  }

  await app.close();
}
bootstrap();
