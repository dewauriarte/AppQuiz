import { PrismaClient, BoardEventType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Board Events - Sprint 11
 * Eventos para el modo tablero tipo Mario Party
 */

async function seedBoardEvents() {
  console.log('🎲 Seeding board events...');

  const events = [
    // BONUS EVENTS
    {
      event_type: BoardEventType.bonus_coins,
      name: 'Cofre del Tesoro',
      description: '¡Encontraste un cofre con monedas!',
      coin_effect: 50,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/treasure.png',
      color: '#FFD700',
      sound_effect: 'coin_collect',
      animation_type: 'sparkle',
      spawn_probability: 15.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.bonus_coins,
      name: 'Monedas Doradas',
      description: '¡Monedas brillantes!',
      coin_effect: 100,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/gold_coins.png',
      color: '#FFD700',
      sound_effect: 'coin_collect',
      animation_type: 'sparkle',
      spawn_probability: 8.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.bonus_xp,
      name: 'Libro de Sabiduría',
      description: '¡Aprendiste algo nuevo!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 100,
      move_effect: 0,
      icon_url: '/assets/events/book.png',
      color: '#4169E1',
      sound_effect: 'level_up',
      animation_type: 'glow',
      spawn_probability: 12.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.bonus_xp,
      name: 'Estrella de Conocimiento',
      description: '¡Ganaste mucha experiencia!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 200,
      move_effect: 0,
      icon_url: '/assets/events/star.png',
      color: '#4169E1',
      sound_effect: 'level_up',
      animation_type: 'glow',
      spawn_probability: 6.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.bonus_gems,
      name: 'Gema Brillante',
      description: '¡Encontraste una gema!',
      coin_effect: 0,
      gem_effect: 10,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/gem.png',
      color: '#FF1493',
      sound_effect: 'gem_collect',
      animation_type: 'shine',
      spawn_probability: 5.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.bonus_gems,
      name: 'Tesoro de Gemas',
      description: '¡Un tesoro de gemas preciosas!',
      coin_effect: 0,
      gem_effect: 25,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/gem_chest.png',
      color: '#FF1493',
      sound_effect: 'gem_collect',
      animation_type: 'shine',
      spawn_probability: 3.0,
      is_active: true,
    },

    // TRAP EVENTS
    {
      event_type: BoardEventType.trap_lose_coins,
      name: 'Trampa de Ladrones',
      description: '¡Te robaron monedas!',
      coin_effect: -50,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/thief.png',
      color: '#DC143C',
      sound_effect: 'trap',
      animation_type: 'shake',
      spawn_probability: 10.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.trap_go_back,
      name: 'Agujero en el Camino',
      description: '¡Caíste en un agujero!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: -3,
      icon_url: '/assets/events/hole.png',
      color: '#8B4513',
      sound_effect: 'fall',
      animation_type: 'shake',
      spawn_probability: 8.0,
      is_active: true,
    },

    // TELEPORT EVENTS
    {
      event_type: BoardEventType.teleport_forward,
      name: 'Portal Mágico',
      description: '¡El portal te llevó adelante!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 5,
      icon_url: '/assets/events/portal.png',
      color: '#9370DB',
      sound_effect: 'teleport',
      animation_type: 'portal',
      spawn_probability: 6.0,
      is_active: true,
    },
    {
      event_type: BoardEventType.teleport_forward,
      name: 'Túnel del Tiempo',
      description: '¡Viajaste al futuro!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 7,
      icon_url: '/assets/events/time_tunnel.png',
      color: '#9370DB',
      sound_effect: 'teleport',
      animation_type: 'portal',
      spawn_probability: 4.0,
      is_active: true,
    },

    // POWERUP EVENTS
    {
      event_type: BoardEventType.powerup,
      name: 'Powerup Aleatorio',
      description: '¡Conseguiste un powerup!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/powerup.png',
      color: '#00FF00',
      sound_effect: 'powerup',
      animation_type: 'pulse',
      spawn_probability: 7.0,
      is_active: true,
    },

    // MYSTERY BOX
    {
      event_type: BoardEventType.mystery_box,
      name: 'Caja Misteriosa',
      description: '¿Qué habrá dentro?',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/mystery.png',
      color: '#FFD700',
      sound_effect: 'mystery',
      animation_type: 'rotate',
      spawn_probability: 10.0,
      is_active: true,
    },

    // QUIZ CHALLENGE
    {
      event_type: BoardEventType.quiz_challenge,
      name: 'Desafío de Quiz',
      description: '¡Responde correctamente para doble recompensa!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 150,
      move_effect: 0,
      icon_url: '/assets/events/quiz.png',
      color: '#4169E1',
      sound_effect: 'quiz_start',
      animation_type: 'bounce',
      spawn_probability: 8.0,
      is_active: true,
    },

    // BOSS ENCOUNTER
    {
      event_type: BoardEventType.boss_encounter,
      name: 'Encuentro con Boss',
      description: '¡Prepárate para la batalla!',
      coin_effect: 0,
      gem_effect: 0,
      xp_effect: 0,
      move_effect: 0,
      icon_url: '/assets/events/boss.png',
      color: '#8B0000',
      sound_effect: 'boss_appear',
      animation_type: 'shake',
      spawn_probability: 2.0,
      is_active: true,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const event of events) {
    const existing = await prisma.board_events.findFirst({
      where: {
        name: event.name,
        event_type: event.event_type,
      },
    });

    if (existing) {
      console.log(`   ⏭️  Skipped: ${event.name} (already exists)`);
      skipped++;
    } else {
      await prisma.board_events.create({
        data: event,
      });
      console.log(`   ✅ Created: ${event.name} (${event.event_type})`);
      created++;
    }
  }

  console.log(`\n📊 Board Events Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total: ${events.length}`);
}

async function main() {
  try {
    await seedBoardEvents();
    console.log('\n✅ Board events seed completed!');
  } catch (error) {
    console.error('❌ Error seeding board events:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: Error) => {
  console.error(error);
  throw error;
});
