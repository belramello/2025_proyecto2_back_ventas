import { JwtPayload } from 'jsonwebtoken';

export interface Payload extends JwtPayload {
  sub: string; // Identificador del usuario
  email: string; // Email del usuario
  exp: number; // Fecha de expiración del token
}
