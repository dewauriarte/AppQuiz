import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create admin user
  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@appquiz.com',
      password_hash: hashedPassword,
      role: 'admin',
      display_name: 'Administrator',
      email_verified: true,
    },
  });

  // Create admin profile
  await prisma.user_profiles.upsert({
    where: { user_id: admin.user_id },
    update: {},
    create: {
      user_id: admin.user_id,
      level: 99,
      total_xp: 999999,
    },
  });

  // Create admin currencies
  await prisma.user_currencies.upsert({
    where: { user_id: admin.user_id },
    update: {},
    create: {
      user_id: admin.user_id,
      coins: 10000,
      gems: 1000,
    },
  });

  console.log('✅ Admin created:', admin.username);

  // Create 2 teachers
  for (let i = 1; i <= 2; i++) {
    const teacher = await prisma.users.upsert({
      where: { username: `teacher${i}` },
      update: {},
      create: {
        username: `teacher${i}`,
        email: `teacher${i}@appquiz.com`,
        password_hash: hashedPassword,
        role: 'teacher',
        display_name: `Teacher ${i}`,
        email_verified: true,
      },
    });

    await prisma.user_profiles.upsert({
      where: { user_id: teacher.user_id },
      update: {},
      create: {
        user_id: teacher.user_id,
      },
    });

    await prisma.user_currencies.upsert({
      where: { user_id: teacher.user_id },
      update: {},
      create: {
        user_id: teacher.user_id,
      },
    });

    console.log(`✅ Teacher created: ${teacher.username}`);
  }

  // Create 5 students
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.users.upsert({
      where: { username: `student${i}` },
      update: {},
      create: {
        username: `student${i}`,
        email: `student${i}@appquiz.com`,
        password_hash: hashedPassword,
        role: 'student',
        display_name: `Student ${i}`,
        email_verified: true,
      },
    });

    await prisma.user_profiles.upsert({
      where: { user_id: student.user_id },
      update: {},
      create: {
        user_id: student.user_id,
        level: i,
        total_xp: i * 100,
      },
    });

    await prisma.user_currencies.upsert({
      where: { user_id: student.user_id },
      update: {},
      create: {
        user_id: student.user_id,
        coins: 100 * i,
        gems: 10 * i,
      },
    });

    console.log(`✅ Student created: ${student.username}`);
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: username=admin, password=password123');
  console.log('Teacher: username=teacher1, password=password123');
  console.log('Student: username=student1, password=password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

