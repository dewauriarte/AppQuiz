import prisma from '@/config/database';

/**
 * Genera un código de juego único de 6 caracteres
 * Formato: A-Z, 0-9
 * Verifica que no exista en la base de datos
 */
export async function generateGameCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 6;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < codeLength; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Verificar que no exista
    const existingGame = await prisma.games.findUnique({
      where: { game_code: code },
    });

    if (!existingGame) {
      return code;
    }

    attempts++;
  }

  // Si después de 10 intentos no se genera un código único, usar timestamp
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
  return timestamp.padStart(6, '0');
}

