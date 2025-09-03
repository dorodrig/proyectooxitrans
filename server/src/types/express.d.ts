import { Usuario } from './index';

declare namespace Express {
  interface Request {
    user?: Usuario;
  }
}
