/**
 * Script para crear user_profiles y user_currencies faltantes
 */
import prisma from '../config/database.js';

async function fixMissingProfiles() {
  console.log('🔧 Iniciando fix de perfiles faltantes...\n');

  try {
    // 1. Obtener todos los usuarios
    const allUsers = await prisma.users.findMany({
      select: { user_id: true, username: true }
    });

    console.log(`📊 Total de usuarios encontrados: ${allUsers.length}\n`);

    let profilesCreated = 0;
    let currenciesCreated = 0;

    for (const user of allUsers) {
      // Verificar si tiene perfil
      const profile = await prisma.user_profiles.findUnique({
        where: { user_id: user.user_id }
      });

      if (!profile) {
        console.log(`➕ Creando perfil para usuario: ${user.username} (ID: ${user.user_id})`);
        await prisma.user_profiles.create({
          data: {
            user_id: user.user_id,
          }
        });
        profilesCreated++;
      }

      // Verificar si tiene currencies
      const currency = await prisma.user_currencies.findUnique({
        where: { user_id: user.user_id }
      });

      if (!currency) {
        console.log(`💰 Creando currencies para usuario: ${user.username} (ID: ${user.user_id})`);
        await prisma.user_currencies.create({
          data: {
            user_id: user.user_id,
          }
        });
        currenciesCreated++;
      }
    }

    console.log('\n✅ Fix completado:');
    console.log(`   - Perfiles creados: ${profilesCreated}`);
    console.log(`   - Currencies creados: ${currenciesCreated}`);

  } catch (error) {
    console.error('❌ Error al ejecutar fix:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fixMissingProfiles()
  .then(() => {
    console.log('\n✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });

