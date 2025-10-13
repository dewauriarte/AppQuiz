import prisma from '../config/database.js';

async function checkUserData() {
  const userId = 5; // Luis Rodriguez
  
  console.log('\n🔍 Verificando datos del usuario Luis Rodriguez (ID: 5)...\n');
  
  // 1. Usuario
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { user_id: true, username: true, display_name: true }
  });
  console.log('👤 Usuario:', user);
  
  // 2. Perfil
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId }
  });
  console.log('\n📊 Perfil:');
  console.log('  - Level:', profile?.level);
  console.log('  - Total XP:', profile?.total_xp.toString());
  console.log('  - Current XP:', profile?.current_xp);
  console.log('  - XP to next level:', profile?.xp_to_next_level);
  console.log('  - Total games played:', profile?.total_games_played);
  console.log('  - Total games won:', profile?.total_games_won);
  console.log('  - Total questions answered:', profile?.total_questions_answered);
  console.log('  - Total correct answers:', profile?.total_correct_answers);
  console.log('  - Average accuracy:', profile?.average_accuracy?.toString() || '0');
  
  // 3. Currencies
  const currency = await prisma.user_currencies.findUnique({
    where: { user_id: userId }
  });
  console.log('\n💰 Monedas:');
  console.log('  - Coins:', currency?.coins);
  console.log('  - Gems:', currency?.gems);
  console.log('  - Total coins earned:', currency?.total_coins_earned);
  console.log('  - Total gems earned:', currency?.total_gems_earned);
  
  // 4. Últimos game_results
  const gameResults = await prisma.game_results.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 3,
    select: {
      game_id: true,
      final_score: true,
      final_rank: true,
      xp_earned: true,
      coins_earned: true,
      gems_earned: true,
      created_at: true
    }
  });
  console.log('\n🎮 Últimos 3 game_results:');
  gameResults.forEach((gr, i) => {
    console.log(`  ${i + 1}. Game ${gr.game_id} - Rank ${gr.final_rank} - ${gr.xp_earned} XP, ${gr.coins_earned} coins, ${gr.gems_earned} gems (${gr.created_at})`);
  });
  
  // 5. Transacciones recientes
  const transactions = await prisma.currency_transactions.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log('\n💸 Últimas 5 transacciones:');
  transactions.forEach((tx, i) => {
    console.log(`  ${i + 1}. ${tx.currency_type} +${tx.amount} - Source: ${tx.source} (${tx.created_at})`);
  });
  
  console.log('\n✅ Verificación completa\n');
}

checkUserData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

