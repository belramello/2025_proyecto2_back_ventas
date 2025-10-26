import { MetabaseStrategy } from './metabase-strategy';

export class AdministradorStrategy implements MetabaseStrategy {
  generatePayloard(userId: number) {
    const payload = {
      resource: { dashboard: 11 },
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
    };
    return payload;
  }
}
