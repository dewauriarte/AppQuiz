import prisma from '../config/database.js';

async function findUser() {
  const username = 'luis.rodriguez';
  
  const user = await prisma.users.findUnique({
    where: { username },
    select: { user_id: true, username: true, display_name: true, role: true }
  });
  
  console.log('\n🔍 Usuario encontrado:', user);
  
  if (user) {
    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: user.user_id },
      select: { 
        level: true, 
        total_xp: true,
        total_games_played: true,
        total_games_won: true
      }
    });
    
    const currency = await prisma.user_currencies.findUnique({
      where: { user_id: user.user_id },
      select: { coins: true, gems: true }
    });
    
    console.log('📊 Perfil:', profile);
    console.log('💰 Monedas:', currency);
    
    // Últimos juegos
    const gameResults = await prisma.game_results.findMany({
      where: { user_id: user.user_id },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    console.log(`\n🎮 Juegos recientes (${gameResults.length} encontrados):`);
    gameResults.forEach((gr, i) => {
      console.log(`  ${i + 1}. Game ${gr.game_id} - Rank ${gr.final_rank} - XP: ${gr.xp_earned}, Coins: ${gr.coins_earned}, Gems: ${gr.gems_earned}`);
    });
  }
}

findUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

