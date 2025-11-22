import { Injectable } from '@nestjs/common';
import { RolesEnum } from '../modules/roles/enums/roles-enum';
import { AdministradorStrategy } from './strategies/administrador-strategy';
import { MetabaseStrategy } from './strategies/metabase-strategy';
import { DueñoStrategy } from './strategies/dueño-strategy';
import { VendedorStrategy } from './strategies/vendedor-strategy';

@Injectable()
export class MetabaseService {
  private readonly metabaseSecretKey = process.env.METABASE_SECRET_KEY;
  private readonly metabaseUrl =
    process.env.METABASE_URL || 'http://localhost:4000';

  generateSignedUrl(userId: number, rolId: number): { signedUrl: string } {
    if (!this.metabaseSecretKey) {
      throw new Error('Metabase secret key not configured');
    }

    const jwt = require('jsonwebtoken');
    //de acuerdo al rol del usuario, se asigna una strategy y se genera el payload.
    const strategy: MetabaseStrategy = this.getStrategy(rolId);
    const payload = strategy.generatePayloard(userId);
    const token = jwt.sign(payload, this.metabaseSecretKey);
    const signedUrl = `${this.metabaseUrl}/embed/dashboard/${token}#background=false&bordered=false&titled=false`;
    return { signedUrl };
  }

  private getStrategy = (rol: number): MetabaseStrategy => {
    switch (rol) {
      case RolesEnum.ADMINISTRADOR:
        return new AdministradorStrategy();
      case RolesEnum.VENDEDOR:
        return new VendedorStrategy();
      case RolesEnum.DUEÑO:
        return new DueñoStrategy();
      default:
        throw new Error('No se encontró un rol válido');
    }
  };
}
