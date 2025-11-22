import { MetabaseStrategy } from './metabase-strategy';

export class DueñoStrategy implements MetabaseStrategy {
  generatePayloard(userId: number) {
    const payload = {
      resource: { dashboard: 10 },
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
    };
    return payload;
  }
}
