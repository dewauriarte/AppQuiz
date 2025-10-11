## **🔷 SPRINT 6: Resultados \+ XP \+ Coins Básico (Semanas 11-12)**

### **🎯 Objetivos del Sprint**

* Sistema de XP y niveles funcional
* Sistema de coins básico
* Pantallas de resultados pulidas
* Stats de jugador

### **📦 Backend Tasks**

#### **Rewards System**

\[ \] Método `grantRewards(userId, rewards)`  
interface Rewards {  xp: number;  coins: number;  gems?: number;  items?: Array\<{itemId: number, quantity: number}\>;}

*
    * Actualizar user\_profiles (total\_xp, current\_xp)
    * Check level up
    * Actualizar user\_currencies (coins, gems)
    * Guardar transacciones
    * Return new levels/unlocks

\[ \] Level Up Logic  
function calculateLevel(totalXP: number): number {  // Formula: XP\_to\_level \= 100 \* level^1.5  // Level 1: 100 XP  // Level 2: 283 XP  // Level 3: 520 XP  // etc.}function checkLevelUp(user): LevelUpResult | null {  const currentLevel \= user.level;  const newLevel \= calculateLevel(user.total\_xp);    if (newLevel \> currentLevel) {    // Level up\!    return {      oldLevel: currentLevel,      newLevel: newLevel,      rewards: calculateLevelRewards(newLevel)    };  }  return null;}

*
* \[ \] Level up rewards
    * Cada nivel: 100 coins \* level
    * Cada 5 niveles: 50 gems
    * Cada 10 niveles: item random

#### **Stats Tracking**

* \[ \] Actualizar user\_profiles después de juego
    * total\_quizzes\_completed++
    * total\_questions\_answered \+= questions
    * total\_correct\_answers \+= correct
    * average\_accuracy \= recalcular
    * Si ganó: total\_games\_won++
    * total\_games\_played++
* \[ \] Método `getUserStats(userId)`
    * Obtener profile completo
    * Calcular stats adicionales
    * Histórico de juegos
    * Progresión de nivel

#### **Endpoints**

* \[ \] `GET /api/users/:id/stats` \- Stats completos
* \[ \] `GET /api/users/:id/recent-games` \- Últimos 10 juegos
* \[ \] `GET /api/users/:id/progress` \- Gráficos de progreso
* \[ \] `GET /api/leaderboards/global` \- Top 100 global
* \[ \] `GET /api/leaderboards/friends` \- Leaderboard amigos

#### **Testing Backend**

* \[ \] Tests de grant rewards
* \[ \] Tests de level up calculation
* \[ \] Tests de stats tracking
* \[ \] Tests de leaderboards
* \[ \] Tests de edge cases (overflow, negative)

### **🎨 Frontend Tasks**

#### **Post-Game Screens**

* \[ \] Victory Animation
    * Si top 3: Animación especial
    * Confetti
    * Trophy/medals
    * Celebración con pet (si tiene)
* \[ \] Results Card
    * Final rank con podium visual
    * Score total con efecto contador
    * Estadísticas clave:
        * Accuracy %
        * Questions correct/total
        * Average time
        * Highest combo
    * Breakdown de puntos:
        * Base points
        * Speed bonus
        * Combo bonus
* \[ \] Rewards Screen
    * XP ganada con barra de progreso
    * Level up animation si aplica
        * "LEVEL UP\!" badge
        * Old level → New level
        * Rewards por level up
    * Coins ganadas con animación
    * Items desbloqueados (si hay)
    * Achievements desbloqueados (si hay)
    * Botón "Continue to Dashboard"

#### **Profile Screen**

* \[ \] Header

    * Avatar (customizable después)
    * Username
    * Nivel con barra de progreso a siguiente
    * XP: current/needed
* \[ \] Stats Grid

    * Total quizzes completed
    * Total questions answered
    * Accuracy %
    * Games won
    * Current streak
    * Total coins
    * Total gems
* \[ \] Recent Games Section

    * Últimos 10 juegos
    * Score, rank, fecha
    * Ver detalles
* \[ \] Achievements Preview

    * 3-5 últimos logros
    * Link a "Ver todos"

#### **Leaderboards**

* \[ \] Global Leaderboard Page
    * Top 100 con paginación
    * Filtros: Daily, Weekly, Monthly, All-Time
    * Card por usuario:
        * Rank \#
        * Avatar
        * Username
        * Level
        * Total XP
    * Current user destacado si está en top 100
* \[ \] Mini Leaderboards
    * Widget para dashboard
    * Top 5 solamente
    * Auto-refresh

#### **Components Reutilizables**

* \[ \] StatCard component
* \[ \] ProgressBar component (XP, level)
* \[ \] RewardCard component
* \[ \] LeaderboardRow component
* \[ \] AnimatedNumber component (contador)

#### **Store Updates**

\[ \] User Store  
interface UserStore {  profile: UserProfile | null;  stats: UserStats | null;  recentGames: Game\[\];  updateProfile: (updates) \=\> void;  addXP: (xp: number) \=\> void;  addCoins: (coins: number) \=\> void;}

*

#### **Testing Frontend**

* \[ \] Tests de post-game screens
* \[ \] Tests de profile display
* \[ \] Tests de leaderboards
* \[ \] Tests de level up animation
* \[ \] Visual regression tests

### **✅ Criterios de Aceptación**

* \[ \] Al terminar juego, se muestran resultados correctos
* \[ \] XP se otorga según performance (ranking, accuracy)
* \[ \] Coins se otorgan según performance
* \[ \] Si sube de nivel, animación "LEVEL UP\!" se muestra
* \[ \] Barra de progreso XP se actualiza correctamente
* \[ \] Stats de usuario se actualizan en BD
* \[ \] Profile muestra stats precisos
* \[ \] Leaderboards funcionan y ordenan correctamente
* \[ \] UI de resultados es celebratoria y motivante
* \[ \] Todas las animaciones son smooth (60fps)

### **📈 Métricas de Éxito**

* 100% de recompensas otorgadas correctamente
* 0 bugs de cálculo de XP/nivel
* Profile carga en \<1 segundo
* Leaderboard carga en \<2 segundos
* Users reportan "satisfacción" con resultados

---