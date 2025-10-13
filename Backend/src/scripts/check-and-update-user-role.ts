/**
 * Script para verificar y actualizar el rol de un usuario
 * Uso: npx ts-node src/scripts/check-and-update-user-role.ts <user_id> [new_role]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndUpdateUserRole() {
  const args = process.argv.slice(2);
  const userId = parseInt(args[0]);
  const newRole = args[1]; // 'admin', 'teacher', 'student'

  if (!userId) {
    console.log('❌ Uso: npx ts-node src/scripts/check-and-update-user-role.ts <user_id> [new_role]');
    console.log('   Ejemplo: npx ts-node src/scripts/check-and-update-user-role.ts 13 admin');
    process.exit(1);
  }

  try {
    // Verificar usuario actual
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.log(`❌ Usuario con ID ${userId} no encontrado`);
      process.exit(1);
    }

    console.log('\n📊 Usuario encontrado:');
    console.log('━'.repeat(50));
    console.log(`ID:       ${user.user_id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email:    ${user.email || 'N/A'}`);
    console.log(`Rol:      ${user.role}`);
    console.log('━'.repeat(50));

    // Actualizar rol si se proporciona
    if (newRole) {
      if (!['admin', 'teacher', 'student'].includes(newRole)) {
        console.log(`❌ Rol inválido: ${newRole}`);
        console.log('   Roles permitidos: admin, teacher, student');
        process.exit(1);
      }

      const updated = await prisma.users.update({
        where: { user_id: userId },
        data: { role: newRole as any },
      });

      console.log(`\n✅ Rol actualizado de "${user.role}" a "${updated.role}"`);
    } else {
      console.log('\n💡 Para cambiar el rol, ejecuta:');
      console.log(`   npx ts-node src/scripts/check-and-update-user-role.ts ${userId} admin`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndUpdateUserRole();

