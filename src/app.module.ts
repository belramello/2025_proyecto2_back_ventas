import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { ProductosModule } from './modules/productos/productos.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { MarcasModule } from './modules/marcas/marcas.module';
import { MulterModule } from '@nestjs/platform-express';
import { HistorialActividadesModule } from './modules/historial-actividades/historial-actividades.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { LineasModule } from './modules/lineas/lineas.module';
import { MailModule } from './modules/mails/mail.module';
import { MetabaseModule } from './metabase/metabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
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
    MulterModule.register({
      dest: './uploads/logos',
    }),
    ServeStaticModule.forRoot({
      // Define la carpeta física raíz donde están tus archivos estáticos
      // process.cwd() apunta a la raíz del proyecto (donde está package.json)
      rootPath: join(process.cwd(), 'uploads'),

      // Define el prefijo URL bajo el cual se servirán estos archivos
      // Si pides /uploads/logos/img.png, buscará en rootPath/logos/img.png
      serveRoot: '/uploads',

      // Opciones adicionales importantes:
      serveStaticOptions: {
        // Asegura que las cabeceras CORS correctas se envíen para los archivos estáticos
        // (¡Muy importante si frontend y backend están en puertos diferentes!)
        setHeaders: (res, path, stat) => {
          res.set('Access-Control-Allow-Origin', '*'); // O sé más específico con tu URL de frontend
        },
        // Evita que siga buscando rutas si no encuentra el archivo estático
        fallthrough: false,
      },
      // Excluye la ruta base de la API para evitar conflictos (si tuvieras un prefijo global)
      // exclude: ['/api/(.*)'], // Descomentar si usas un prefijo global como '/api'
    }),
    ProductosModule,
    VentasModule,
    UsuarioModule,
    AuthModule,
    JwtModule,
    RolesModule,
    PermisosModule,
    MarcasModule,
    ProveedoresModule,
    LineasModule,
    MailModule,
    MetabaseModule,
    HistorialActividadesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
