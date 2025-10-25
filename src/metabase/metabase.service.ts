import { Injectable } from '@nestjs/common';

@Injectable()
export class MetabaseService {
  private readonly metabaseSecretKey = process.env.METABASE_SECRET_KEY;
  private readonly metabaseUrl =
    process.env.METABASE_URL || 'http://localhost:4000';

  generateSignedUrl(userId: number): { signedUrl: string } {
    if (!this.metabaseSecretKey) {
      throw new Error('Metabase secret key not configured');
    }

    const jwt = require('jsonwebtoken');
    const payload = {
      resource: { dashboard: 10 },
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
    };
    //genera un token con JWT cuyo payload contenga el id del usuario.
    const token = jwt.sign(payload, this.metabaseSecretKey);
    const signedUrl = `${this.metabaseUrl}/embed/dashboard/${token}#background=false&bordered=false&titled=false`;
    return { signedUrl };
  }
}
