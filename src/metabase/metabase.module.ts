import { Module } from '@nestjs/common';
import { MetabaseService } from './metabase.service';
import { MetabaseController } from './metabase.controller';
import { UsuarioModule } from 'src/modules/usuario/usuario.module';
import { JwtModule } from 'src/modules/jwt/jwt.module';

@Module({
  imports: [UsuarioModule, JwtModule],
  controllers: [MetabaseController],
  providers: [MetabaseService],
})
export class MetabaseModule {}
