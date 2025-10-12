import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'env' }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts, .js}'],
      synchronize: true,
      ssl: {
        ca: process.env.CA_CERT
          ? Buffer.from(process.env.CA_CERT, 'utf-8')
          : fs.readFileSync(
              path.resolve(
                __dirname,
                '..',
                '..',
                '2025_proyecto2_back_ventas',
                'src',
                'config',
                'ca.pem',
              ),
            ),
        rejectUnauthorized: true,
      },
    }),
    UsuarioModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
