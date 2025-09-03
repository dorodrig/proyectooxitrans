import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/UsuarioModel';

const router = Router();

// Endpoint para debuggear el JWT
router.get('/jwt', (req: Request, res: Response): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.decode(token) as { userId: string; documento: string; rol: string } | null;
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string; documento: string; rol: string };
    
    res.json({
      success: true,
      token: token,
      decoded: decoded,
      verified: verified,
      decodedUserId: decoded?.userId,
      decodedUserIdType: typeof decoded?.userId,
      verifiedUserId: verified?.userId,
      verifiedUserIdType: typeof verified?.userId
    });
  } catch (error) {
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint para debuggear la autenticación completa
router.get('/auth', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.json({ error: 'No token provided' });
      return;
    }

    console.log('[debug/auth] Token recibido:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string; documento: string; rol: string };
    console.log('[debug/auth] Token decodificado:', decoded);
    console.log('[debug/auth] userId:', decoded.userId, 'tipo:', typeof decoded.userId);
    
    const user = await UsuarioModel.findById(decoded.userId);
    console.log('[debug/auth] Usuario encontrado:', user);
    
    res.json({
      success: true,
      decoded: decoded,
      user: user,
      userFound: !!user
    });
  } catch (error) {
    console.log('[debug/auth] Error:', error);
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
