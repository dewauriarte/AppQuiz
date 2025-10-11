CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- ENUMERACIONES (ENUMS)
-- =====================================================================

CREATE TYPE "UserRole" AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE "GameStatus" AS ENUM ('lobby', 'starting', 'active', 'paused', 'finished', 'cancelled');
CREATE TYPE "GameMode" AS ENUM ('classic', 'board', 'survival', 'team', 'boss_battle', 'speed_run');
CREATE TYPE "CurrencyType" AS ENUM ('coins', 'gems', 'event_tokens');
CREATE TYPE "ItemType" AS ENUM ('skin', 'pet', 'accessory', 'emote', 'boost', 'powerup', 'badge', 'title');
CREATE TYPE "ItemRarity" AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');
CREATE TYPE "QuestionType" AS ENUM ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering');
CREATE TYPE "DifficultyLevel" AS ENUM ('very_easy', 'easy', 'medium', 'hard', 'very_hard', 'expert');
CREATE TYPE "AchievementCategory" AS ENUM ('quiz', 'social', 'progression', 'collection', 'mastery', 'special', 'seasonal');
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted', 'blocked', 'rejected');
CREATE TYPE "NotificationType" AS ENUM (
'friend_request',
'friend_accepted',
'achievement_unlocked',
'level_up',
'streak_milestone',
'reward_received',
'event_start',
'system_message'
);
CREATE TYPE "TransactionSource" AS ENUM (
'quiz_complete',
'quiz_win',
'achievement',
'streak_milestone',
'level_up',
'shop_purchase',
'gift_received',
'event_reward',
'boss_victory',
'refund',
'admin_grant',
'referral_bonus'
);
CREATE TYPE "BoardEventType" AS ENUM (
'bonus_coins',
'bonus_xp',
'bonus_gems',
'trap_lose_coins',
'trap_go_back',
'teleport_forward',
'quiz_challenge',
'powerup',
'mystery_box',
'boss_encounter'
);

-- =====================================================================
-- TABLA: USERS (USUARIOS)
-- =====================================================================
CREATE TABLE "users" (
     "user_id" SERIAL PRIMARY KEY,
     "username" VARCHAR(50) UNIQUE NOT NULL,
     "email" VARCHAR(255) UNIQUE,
     "password_hash" VARCHAR(255) NOT NULL,
     "role" "UserRole" DEFAULT 'student' NOT NULL,

-- Información básica
     "display_name" VARCHAR(100),
     "birthdate" DATE,
     "is_minor" BOOLEAN DEFAULT false,

-- Configuración
     "timezone" VARCHAR(50) DEFAULT 'UTC',
     "language" VARCHAR(10) DEFAULT 'es',
     "email_verified" BOOLEAN DEFAULT false,

-- Estado de cuenta
     "is_active" BOOLEAN DEFAULT true,
     "is_banned" BOOLEAN DEFAULT false,
     "ban_reason" TEXT,
     "banned_until" TIMESTAMP,

-- Seguridad
     "last_login" TIMESTAMP,
     "last_ip" INET,
     "failed_login_attempts" INTEGER DEFAULT 0,
     "locked_until" TIMESTAMP,

-- Timestamps
     "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_users_username" ON "users"("username");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_is_active" ON "users"("is_active") WHERE "is_active" = true;

COMMENT ON TABLE "users" IS 'Usuarios: profesores, estudiantes y admins';

-- =====================================================================
-- TABLA: USER_SESSIONS (SESIONES Y TOKENS)
-- =====================================================================
CREATE TABLE "user_sessions" (
    "session_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" INTEGER NOT NULL,
    "refresh_token" VARCHAR(255) UNIQUE NOT NULL,
    "access_token_hash" VARCHAR(255),
    
-- Información de sesión
    "ip_address" INET,
    "user_agent" TEXT,
    "device_type" VARCHAR(50),
    "device_name" VARCHAR(100),
    
-- Estado
    "is_active" BOOLEAN DEFAULT true,
    "last_activity" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
-- Expiración
    "expires_at" TIMESTAMP NOT NULL,
    "refresh_expires_at" TIMESTAMP NOT NULL,
    
-- Timestamps
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revoked_at" TIMESTAMP,
    "revoked_reason" VARCHAR(100),
    
    CONSTRAINT "fk_session_user"
        FOREIGN KEY ("user_id")
            REFERENCES "users"("user_id")
            ON DELETE CASCADE
);

CREATE INDEX "idx_sessions_user_active" ON "user_sessions"("user_id", "is_active") 
WHERE "is_active" = true;
CREATE INDEX "idx_sessions_refresh_token" ON "user_sessions"("refresh_token") 
WHERE "is_active" = true;
CREATE INDEX "idx_sessions_expires" ON "user_sessions"("expires_at") 
WHERE "is_active" = true;

COMMENT ON TABLE "user_sessions" IS 'Gestión de sesiones y tokens JWT';

-- =====================================================================
-- TABLA: USER_PROFILES (PERFILES Y GAMIFICACIÓN)
-- =====================================================================
CREATE TABLE "user_profiles" (
             "user_id" INTEGER PRIMARY KEY,

-- Avatar y personalización
             "avatar_url" VARCHAR(255) DEFAULT '/avatars/default.png',
             "avatar_frame_url" VARCHAR(255),
             "profile_background_url" VARCHAR(255),
             "title" VARCHAR(100),
             "bio" TEXT,

-- Sistema de niveles
             "level" INTEGER DEFAULT 1 NOT NULL,
             "total_xp" BIGINT DEFAULT 0 NOT NULL,
             "current_xp" INTEGER DEFAULT 0 NOT NULL,
             "xp_to_next_level" INTEGER DEFAULT 100 NOT NULL,

-- Sistema de rachas
             "current_streak" INTEGER DEFAULT 0 NOT NULL,
             "longest_streak" INTEGER DEFAULT 0 NOT NULL,
             "last_activity_date" DATE,
             "streak_freeze_count" INTEGER DEFAULT 0 NOT NULL,
             "weekend_amulet_active" BOOLEAN DEFAULT false,
             "weekend_amulet_expires" DATE,

-- Estadísticas generales
             "total_quizzes_completed" INTEGER DEFAULT 0 NOT NULL,
             "total_questions_answered" INTEGER DEFAULT 0 NOT NULL,
             "total_correct_answers" INTEGER DEFAULT 0 NOT NULL,
             "total_games_won" INTEGER DEFAULT 0 NOT NULL,
             "total_games_played" INTEGER DEFAULT 0 NOT NULL,
             "average_accuracy" DECIMAL(5,2) DEFAULT 0.00,
             "average_response_time_ms" INTEGER DEFAULT 0,

-- Estadísticas sociales
             "total_friends" INTEGER DEFAULT 0 NOT NULL,

-- Configuración
             "profile_privacy" VARCHAR(20) DEFAULT 'public',
             "show_stats" BOOLEAN DEFAULT true,
             "show_achievements" BOOLEAN DEFAULT true,
             "show_streak" BOOLEAN DEFAULT true,

-- Soft delete
             "deleted_at" TIMESTAMP,

-- Timestamps
             "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
             "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

             CONSTRAINT "fk_user_profile_user"
                 FOREIGN KEY ("user_id")
                     REFERENCES "users"("user_id")
                     ON DELETE CASCADE,

             CONSTRAINT "check_positive_stats"
                 CHECK (
                     "level" >= 1 AND
                     "total_xp" >= 0 AND
                     "current_streak" >= 0 AND
                     "total_quizzes_completed" >= 0
                     )
);

CREATE INDEX "idx_user_profiles_level" ON "user_profiles"("level" DESC);
CREATE INDEX "idx_user_profiles_total_xp" ON "user_profiles"("total_xp" DESC);
CREATE INDEX "idx_user_profiles_streak" ON "user_profiles"("current_streak" DESC);

COMMENT ON TABLE "user_profiles" IS 'Perfiles con estadísticas y gamificación';

-- =====================================================================
-- TABLA: USER_CURRENCIES (ECONOMÍA VIRTUAL)
-- =====================================================================
CREATE TABLE "user_currencies" (
               "user_id" INTEGER PRIMARY KEY,

-- Monedas actuales
               "coins" INTEGER DEFAULT 0 NOT NULL,
               "gems" INTEGER DEFAULT 0 NOT NULL,
               "event_tokens" INTEGER DEFAULT 0 NOT NULL,

-- Límites
               "coins_cap" INTEGER DEFAULT 50000 NOT NULL,
               "gems_cap" INTEGER DEFAULT 10000 NOT NULL,

-- Estadísticas lifetime
               "total_coins_earned" BIGINT DEFAULT 0 NOT NULL,
               "total_gems_earned" BIGINT DEFAULT 0 NOT NULL,
               "total_coins_spent" BIGINT DEFAULT 0 NOT NULL,
               "total_gems_spent" BIGINT DEFAULT 0 NOT NULL,

-- Límites diarios
               "coins_earned_today" INTEGER DEFAULT 0 NOT NULL,
               "daily_coins_limit" INTEGER DEFAULT 5000 NOT NULL,
               "last_daily_reset" DATE DEFAULT CURRENT_DATE,

               "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

               CONSTRAINT "fk_currency_user"
                   FOREIGN KEY ("user_id")
                       REFERENCES "users"("user_id")
                       ON DELETE CASCADE,

               CONSTRAINT "check_positive_currencies"
                   CHECK (
                       "coins" >= 0 AND
                       "gems" >= 0 AND
                       "event_tokens" >= 0
                       ),

               CONSTRAINT "check_currency_caps"
                   CHECK (
                       "coins" <= "coins_cap" AND
                       "gems" <= "gems_cap"
                       )
);

CREATE INDEX "idx_user_currencies_coins" ON "user_currencies"("coins" DESC);
CREATE INDEX "idx_user_currencies_gems" ON "user_currencies"("gems" DESC);

COMMENT ON TABLE "user_currencies" IS 'Sistema de economía: coins (soft) + gems (hard)';

-- =====================================================================
-- TABLA: CURRENCY_TRANSACTIONS (HISTORIAL)
-- =====================================================================
CREATE TABLE "currency_transactions" (
                     "transaction_id" BIGSERIAL PRIMARY KEY,
                     "user_id" INTEGER NOT NULL,
                     "currency_type" "CurrencyType" NOT NULL,
                     "amount" INTEGER NOT NULL,
                     "balance_after" INTEGER NOT NULL,
                     "source" "TransactionSource" NOT NULL,
                     "reference_id" INTEGER,
                     "description" TEXT,
                     "metadata" JSONB,
                     "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

                     CONSTRAINT "fk_transaction_user"
                         FOREIGN KEY ("user_id")
                             REFERENCES "users"("user_id")
                             ON DELETE CASCADE
);

CREATE INDEX "idx_transactions_user_date" ON "currency_transactions"("user_id", "created_at" DESC);
CREATE INDEX "idx_transactions_source" ON "currency_transactions"("source");
CREATE INDEX "idx_transactions_currency" ON "currency_transactions"("currency_type");

COMMENT ON TABLE "currency_transactions" IS 'Historial de transacciones para auditoría';

-- =====================================================================
-- TABLA: SHOP_ITEMS (TIENDA)
-- =====================================================================
CREATE TABLE "shop_items" (
          "item_id" SERIAL PRIMARY KEY,
          "name" VARCHAR(100) NOT NULL,
          "description" TEXT,
          "item_type" "ItemType" NOT NULL,
          "rarity" "ItemRarity" NOT NULL,

-- Assets
          "image_url" VARCHAR(255) NOT NULL,
          "icon_url" VARCHAR(255),
          "preview_url" VARCHAR(255),

-- Pricing
          "price_coins" INTEGER DEFAULT 0,
          "price_gems" INTEGER DEFAULT 0,
          "is_premium" BOOLEAN DEFAULT false,

-- Disponibilidad
          "is_available" BOOLEAN DEFAULT true,
          "is_limited_edition" BOOLEAN DEFAULT false,
          "available_from" TIMESTAMP,
          "available_until" TIMESTAMP,
          "stock_limit" INTEGER,
          "current_stock" INTEGER,
          "times_purchased" INTEGER DEFAULT 0,

-- Requisitos
          "required_level" INTEGER DEFAULT 1,
          "required_achievement_id" INTEGER,

-- Metadata
          "metadata" JSONB,
          "category" VARCHAR(50),
          "tags" TEXT[],
          "season" VARCHAR(50),

-- Soft delete
          "deleted_at" TIMESTAMP,

          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

          CONSTRAINT "check_item_price"
              CHECK ("price_coins" > 0 OR "price_gems" > 0),

          CONSTRAINT "check_stock"
              CHECK ("stock_limit" IS NULL OR "current_stock" <= "stock_limit")
);

CREATE INDEX "idx_shop_items_type" ON "shop_items"("item_type");
CREATE INDEX "idx_shop_items_rarity" ON "shop_items"("rarity");
CREATE INDEX "idx_shop_items_available" ON "shop_items"("is_available") WHERE "is_available" = true;
CREATE INDEX "idx_shop_items_category" ON "shop_items"("category");

COMMENT ON TABLE "shop_items" IS 'Catálogo de items: skins, pets, accesorios, boosts';

-- =====================================================================
-- TABLA: USER_INVENTORY (INVENTARIO)
-- =====================================================================
CREATE TABLE "user_inventory" (
              "inventory_id" BIGSERIAL PRIMARY KEY,
              "user_id" INTEGER NOT NULL,
              "item_id" INTEGER NOT NULL,
              "quantity" INTEGER DEFAULT 1 NOT NULL,
              "is_equipped" BOOLEAN DEFAULT false,
              "is_favorite" BOOLEAN DEFAULT false,
              "acquired_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
              "acquired_source" VARCHAR(100),
              "metadata" JSONB,

              CONSTRAINT "fk_inventory_user"
                  FOREIGN KEY ("user_id")
                      REFERENCES "users"("user_id")
                      ON DELETE CASCADE,

              CONSTRAINT "fk_inventory_item"
                  FOREIGN KEY ("item_id")
                      REFERENCES "shop_items"("item_id")
                      ON DELETE CASCADE,

              CONSTRAINT "unique_user_item"
                  UNIQUE ("user_id", "item_id"),

              CONSTRAINT "check_positive_quantity"
                  CHECK ("quantity" > 0)
);

CREATE INDEX "idx_inventory_user" ON "user_inventory"("user_id");
CREATE INDEX "idx_inventory_equipped" ON "user_inventory"("user_id", "is_equipped")
WHERE "is_equipped" = true;

COMMENT ON TABLE "user_inventory" IS 'Inventario personal de items';

-- =====================================================================
-- TABLA: PURCHASE_HISTORY (HISTORIAL DE COMPRAS)
-- =====================================================================
CREATE TABLE "purchase_history" (
                "purchase_id" BIGSERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL,
                "item_id" INTEGER NOT NULL,
                "quantity" INTEGER DEFAULT 1 NOT NULL,
                "price_paid_coins" INTEGER DEFAULT 0,
                "price_paid_gems" INTEGER DEFAULT 0,
                "transaction_id" BIGINT,
                "purchased_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

                CONSTRAINT "fk_purchase_user"
                    FOREIGN KEY ("user_id")
                        REFERENCES "users"("user_id")
                        ON DELETE CASCADE,

                CONSTRAINT "fk_purchase_item"
                    FOREIGN KEY ("item_id")
                        REFERENCES "shop_items"("item_id")
                        ON DELETE CASCADE
);

CREATE INDEX "idx_purchases_user" ON "purchase_history"("user_id", "purchased_at" DESC);
CREATE INDEX "idx_purchases_item" ON "purchase_history"("item_id");

COMMENT ON TABLE "purchase_history" IS 'Historial de compras';

-- =====================================================================
-- TABLA: PETS (CATÁLOGO DE MASCOTAS)
-- =====================================================================
CREATE TABLE "pets" (
    "pet_id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50),
    "rarity" "ItemRarity" NOT NULL,

-- Assets por etapa
    "stage1_sprite_url" VARCHAR(255) NOT NULL,
    "stage2_sprite_url" VARCHAR(255),
    "stage3_sprite_url" VARCHAR(255),

-- Evolución
    "evolution_stages" INTEGER DEFAULT 3 NOT NULL,
    "xp_to_stage2" INTEGER DEFAULT 1000,
    "xp_to_stage3" INTEGER DEFAULT 5000,

-- Habilidades
    "abilities" JSONB NOT NULL,

-- Metadata
    "is_seasonal" BOOLEAN DEFAULT false,
    "season" VARCHAR(50),
    "unlock_requirements" JSONB,

    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_pets_category" ON "pets"("category");
CREATE INDEX "idx_pets_rarity" ON "pets"("rarity");

COMMENT ON TABLE "pets" IS 'Catálogo de mascotas con evolución';

-- =====================================================================
-- TABLA: USER_PETS (MASCOTAS DE USUARIOS)
-- =====================================================================
CREATE TABLE "user_pets" (
         "user_pet_id" BIGSERIAL PRIMARY KEY,
         "user_id" INTEGER NOT NULL,
         "pet_id" INTEGER NOT NULL,

-- Personalización
         "nickname" VARCHAR(50),

-- Progresión
         "current_level" INTEGER DEFAULT 1 NOT NULL,
         "current_xp" INTEGER DEFAULT 0 NOT NULL,
         "evolution_stage" INTEGER DEFAULT 1 NOT NULL,

-- Estado
         "happiness" INTEGER DEFAULT 100 NOT NULL,
         "is_active" BOOLEAN DEFAULT false,

-- Estadísticas
         "times_fed" INTEGER DEFAULT 0,
         "games_played_with" INTEGER DEFAULT 0,
         "xp_earned_with" BIGINT DEFAULT 0,
         "last_interaction" TIMESTAMP,

         "acquired_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

         CONSTRAINT "fk_user_pet_user"
             FOREIGN KEY ("user_id")
                 REFERENCES "users"("user_id")
                 ON DELETE CASCADE,

         CONSTRAINT "fk_user_pet_pet"
             FOREIGN KEY ("pet_id")
                 REFERENCES "pets"("pet_id")
                 ON DELETE CASCADE,

         CONSTRAINT "check_evolution_stage"
             CHECK ("evolution_stage" >= 1 AND "evolution_stage" <= 3),

         CONSTRAINT "check_happiness"
             CHECK ("happiness" >= 0 AND "happiness" <= 100),

         CONSTRAINT "unique_user_pet"
             UNIQUE ("user_id", "pet_id")
);

CREATE INDEX "idx_user_pets_user" ON "user_pets"("user_id");
CREATE INDEX "idx_user_pets_active" ON "user_pets"("user_id", "is_active")
WHERE "is_active" = true;

COMMENT ON TABLE "user_pets" IS 'Mascotas personales con progresión';

-- =====================================================================
-- TABLA: ACHIEVEMENTS (LOGROS)
-- =====================================================================
CREATE TABLE "achievements" (
            "achievement_id" SERIAL PRIMARY KEY,
            "name" VARCHAR(100) NOT NULL,
            "description" TEXT NOT NULL,
            "category" "AchievementCategory" NOT NULL,
            "rarity" "ItemRarity" NOT NULL,

-- Assets
            "icon_url" VARCHAR(255) NOT NULL,
            "icon_locked_url" VARCHAR(255),
            "badge_url" VARCHAR(255),

-- Sistema de puntos
            "points" INTEGER DEFAULT 10 NOT NULL,

-- Requisitos
            "requirement_type" VARCHAR(50) NOT NULL,
            "requirement_value" INTEGER NOT NULL,

-- Recompensas
            "reward_coins" INTEGER DEFAULT 0,
            "reward_gems" INTEGER DEFAULT 0,
            "reward_xp" INTEGER DEFAULT 0,
            "reward_title" VARCHAR(100),
            "reward_item_id" INTEGER,

-- Configuración
            "is_secret" BOOLEAN DEFAULT false,
            "is_repeatable" BOOLEAN DEFAULT false,
            "display_order" INTEGER DEFAULT 0,

            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_achievements_category" ON "achievements"("category");
CREATE INDEX "idx_achievements_rarity" ON "achievements"("rarity");
CREATE INDEX "idx_achievements_order" ON "achievements"("display_order");

COMMENT ON TABLE "achievements" IS 'Sistema de logros desbloqueables';

-- =====================================================================
-- TABLA: USER_ACHIEVEMENTS (PROGRESO DE LOGROS)
-- =====================================================================
CREATE TABLE "user_achievements" (
                 "user_achievement_id" BIGSERIAL PRIMARY KEY,
                 "user_id" INTEGER NOT NULL,
                 "achievement_id" INTEGER NOT NULL,
                 "progress" INTEGER DEFAULT 0 NOT NULL,
                 "is_unlocked" BOOLEAN DEFAULT false,
                 "unlocked_at" TIMESTAMP,
                 "is_showcased" BOOLEAN DEFAULT false,
                 "times_completed" INTEGER DEFAULT 0,

                 CONSTRAINT "fk_user_achievement_user"
                     FOREIGN KEY ("user_id")
                         REFERENCES "users"("user_id")
                         ON DELETE CASCADE,

                 CONSTRAINT "fk_user_achievement_achievement"
                     FOREIGN KEY ("achievement_id")
                         REFERENCES "achievements"("achievement_id")
                         ON DELETE CASCADE,

                 CONSTRAINT "unique_user_achievement"
                     UNIQUE ("user_id", "achievement_id")
);

CREATE INDEX "idx_user_achievements_user" ON "user_achievements"("user_id");
CREATE INDEX "idx_user_achievements_unlocked" ON "user_achievements"("user_id", "is_unlocked");
CREATE INDEX "idx_user_achievements_showcased" ON "user_achievements"("is_showcased")
WHERE "is_showcased" = true;

COMMENT ON TABLE "user_achievements" IS 'Progreso individual de logros';

-- =====================================================================
-- TABLA: QUESTION_SETS (CONJUNTOS DE PREGUNTAS)
-- =====================================================================
CREATE TABLE "question_sets" (
             "set_id" SERIAL PRIMARY KEY,
             "teacher_id" INTEGER NOT NULL,
             "title" VARCHAR(255) NOT NULL,
             "description" TEXT,
             "subject" VARCHAR(100),
             "grade_level" VARCHAR(50),
             "difficulty" "DifficultyLevel" DEFAULT 'medium',

-- Generación con IA
             "ai_generated" BOOLEAN DEFAULT false,
             "source_document_name" VARCHAR(255),
             "source_content_hash" VARCHAR(64),
             "ai_model_used" VARCHAR(50),
             "generation_prompt" TEXT,

-- Configuración
             "language_code" VARCHAR(10) DEFAULT 'es',
             "is_public" BOOLEAN DEFAULT false,
             "is_approved" BOOLEAN DEFAULT true,
             "is_featured" BOOLEAN DEFAULT false,

-- Estadísticas
             "total_questions" INTEGER DEFAULT 0,
             "times_played" INTEGER DEFAULT 0,
             "average_score" DECIMAL(5,2) DEFAULT 0.00,
             "average_completion_time" INTEGER DEFAULT 0,

-- Tags
             "tags" TEXT[],
             "category" VARCHAR(50),

-- Soft delete
             "deleted_at" TIMESTAMP,

             "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
             "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

             CONSTRAINT "fk_question_sets_teacher"
                 FOREIGN KEY ("teacher_id")
                     REFERENCES "users"("user_id")
                     ON DELETE CASCADE
);

CREATE INDEX "idx_question_sets_teacher" ON "question_sets"("teacher_id");
CREATE INDEX "idx_question_sets_subject" ON "question_sets"("subject");
CREATE INDEX "idx_question_sets_difficulty" ON "question_sets"("difficulty");
CREATE INDEX "idx_question_sets_public" ON "question_sets"("is_public")
WHERE "is_public" = true;

COMMENT ON TABLE "question_sets" IS 'Conjuntos de preguntas con generación IA';

-- =====================================================================
-- TABLA: TOPICS (TEMAS)
-- =====================================================================
CREATE TABLE "topics" (
      "topic_id" SERIAL PRIMARY KEY,
      "set_id" INTEGER NOT NULL,
      "topic_name" VARCHAR(100) NOT NULL,
      "description" TEXT,
      "order_index" INTEGER DEFAULT 0,

      CONSTRAINT "fk_topics_set"
          FOREIGN KEY ("set_id")
              REFERENCES "question_sets"("set_id")
              ON DELETE CASCADE,

      CONSTRAINT "unique_set_topic"
          UNIQUE ("set_id", "topic_name")
);

CREATE INDEX "idx_topics_set" ON "topics"("set_id", "order_index");

COMMENT ON TABLE "topics" IS 'Temas para organizar preguntas';

-- =====================================================================
-- TABLA: QUESTIONS (PREGUNTAS)
-- =====================================================================
CREATE TABLE "questions" (
         "question_id" SERIAL PRIMARY KEY,
         "set_id" INTEGER NOT NULL,
         "topic_id" INTEGER,
         "question_type" "QuestionType" DEFAULT 'multiple_choice' NOT NULL,
         "question_text" TEXT NOT NULL,

-- Configuración
         "difficulty" INTEGER DEFAULT 5 NOT NULL,
         "time_limit" INTEGER DEFAULT 30 NOT NULL,
         "points" INTEGER DEFAULT 100 NOT NULL,

-- Media
         "media_url" VARCHAR(255),
         "media_type" VARCHAR(20),

-- Explicación educativa
         "explanation" TEXT,
         "explanation_media_url" VARCHAR(255),

-- Adaptive learning
         "difficulty_rating" DECIMAL(3,2),
         "discrimination_index" DECIMAL(3,2),
         "times_answered" INTEGER DEFAULT 0,
         "times_correct" INTEGER DEFAULT 0,
         "average_time_taken" INTEGER DEFAULT 0,

-- Metadata
         "tags" TEXT[],
         "bloom_taxonomy_level" VARCHAR(50),
         "order_index" INTEGER DEFAULT 0,

         "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
         "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

         CONSTRAINT "fk_questions_set"
             FOREIGN KEY ("set_id")
                 REFERENCES "question_sets"("set_id")
                 ON DELETE CASCADE,

         CONSTRAINT "fk_questions_topic"
             FOREIGN KEY ("topic_id")
                 REFERENCES "topics"("topic_id")
                 ON DELETE SET NULL,

         CONSTRAINT "check_difficulty_range"
             CHECK ("difficulty" >= 1 AND "difficulty" <= 10),

         CONSTRAINT "check_time_limit"
             CHECK ("time_limit" > 0 AND "time_limit" <= 300)
);

CREATE INDEX "idx_questions_set" ON "questions"("set_id", "order_index");
CREATE INDEX "idx_questions_topic" ON "questions"("topic_id");
CREATE INDEX "idx_questions_type" ON "questions"("question_type");
CREATE INDEX "idx_questions_difficulty" ON "questions"("difficulty");

COMMENT ON TABLE "questions" IS 'Preguntas con metadata para adaptive learning';

-- =====================================================================
-- TABLA: QUESTION_OPTIONS (OPCIONES)
-- =====================================================================
CREATE TABLE "question_options" (
                "option_id" SERIAL PRIMARY KEY,
                "question_id" INTEGER NOT NULL,
                "option_text" VARCHAR(500) NOT NULL,
                "is_correct" BOOLEAN DEFAULT false NOT NULL,
                "position" INTEGER NOT NULL,
                "media_url" VARCHAR(255),
                "explanation" TEXT,

-- Estadísticas
                "times_selected" INTEGER DEFAULT 0,
                "selection_rate" DECIMAL(5,2) DEFAULT 0.00,

                CONSTRAINT "fk_options_question"
                    FOREIGN KEY ("question_id")
                        REFERENCES "questions"("question_id")
                        ON DELETE CASCADE
);

CREATE INDEX "idx_question_options_question" ON "question_options"("question_id", "position");

COMMENT ON TABLE "question_options" IS 'Opciones de respuesta';

-- =====================================================================
-- TABLA: GAMES (PARTIDAS)
-- =====================================================================
CREATE TABLE "games" (
     "game_id" SERIAL PRIMARY KEY,
     "teacher_id" INTEGER NOT NULL,
     "set_id" INTEGER NOT NULL,
     "game_code" VARCHAR(10) UNIQUE NOT NULL,
     "game_mode" "GameMode" DEFAULT 'classic' NOT NULL,
     "status" "GameStatus" DEFAULT 'lobby' NOT NULL,

-- Configuración
     "max_players" INTEGER DEFAULT 100 NOT NULL,
     "max_turns" INTEGER DEFAULT 20,
     "current_turn" INTEGER DEFAULT 0,
     "current_question_index" INTEGER DEFAULT 0,

-- Config avanzada
     "config" JSONB,

-- Timestamps
     "started_at" TIMESTAMP,
     "ended_at" TIMESTAMP,
     "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

-- Estadísticas
     "total_players_joined" INTEGER DEFAULT 0,
     "total_questions_answered" INTEGER DEFAULT 0,
     "average_score" DECIMAL(7,2) DEFAULT 0.00,

     CONSTRAINT "fk_games_teacher"
         FOREIGN KEY ("teacher_id")
             REFERENCES "users"("user_id")
             ON DELETE CASCADE,

     CONSTRAINT "fk_games_set"
         FOREIGN KEY ("set_id")
             REFERENCES "question_sets"("set_id")
             ON DELETE RESTRICT,

     CONSTRAINT "check_max_players"
         CHECK ("max_players" > 0 AND "max_players" <= 1000)
);

CREATE INDEX "idx_games_teacher" ON "games"("teacher_id");
CREATE INDEX "idx_games_code" ON "games"("game_code");
CREATE INDEX "idx_games_status" ON "games"("status");
CREATE INDEX "idx_games_created" ON "games"("created_at" DESC);

COMMENT ON TABLE "games" IS 'Partidas en tiempo real';

-- =====================================================================
-- TABLA: GAME_PLAYERS (JUGADORES)
-- =====================================================================
CREATE TABLE "game_players" (
            "player_id" SERIAL PRIMARY KEY,
            "game_id" INTEGER NOT NULL,
            "user_id" INTEGER,
            "nickname" VARCHAR(50) NOT NULL,

-- Progreso
            "score" INTEGER DEFAULT 0 NOT NULL,
            "correct_answers" INTEGER DEFAULT 0 NOT NULL,
            "wrong_answers" INTEGER DEFAULT 0 NOT NULL,
            "combo_streak" INTEGER DEFAULT 0 NOT NULL,
            "highest_combo" INTEGER DEFAULT 0 NOT NULL,

-- Modo tablero
            "board_position" INTEGER DEFAULT 0,
            "coins_collected" INTEGER DEFAULT 0,
            "powerups_used" INTEGER DEFAULT 0,

-- Ranking
            "final_rank" INTEGER,

-- Estadísticas
            "total_time_played_ms" INTEGER DEFAULT 0,
            "average_response_time_ms" INTEGER DEFAULT 0,

-- Estado
            "is_ready" BOOLEAN DEFAULT false,
            "is_connected" BOOLEAN DEFAULT true,
            "is_eliminated" BOOLEAN DEFAULT false,

            "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "left_at" TIMESTAMP,

            CONSTRAINT "fk_game_players_game"
                FOREIGN KEY ("game_id")
                    REFERENCES "games"("game_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_game_players_user"
                FOREIGN KEY ("user_id")
                    REFERENCES "users"("user_id")
                    ON DELETE SET NULL,

            CONSTRAINT "unique_game_nickname"
                UNIQUE ("game_id", "nickname")
);

CREATE INDEX "idx_game_players_game" ON "game_players"("game_id");
CREATE INDEX "idx_game_players_user" ON "game_players"("user_id");
CREATE INDEX "idx_game_players_score" ON "game_players"("game_id", "score" DESC);

COMMENT ON TABLE "game_players" IS 'Jugadores con estadísticas en tiempo real';

-- =====================================================================
-- TABLA: GAME_ANSWERS (RESPUESTAS - PARTICIONADA)
-- =====================================================================
CREATE TABLE "game_answers" (
            "answer_id" BIGSERIAL,
            "game_id" INTEGER NOT NULL,
            "player_id" INTEGER NOT NULL,
            "question_id" INTEGER NOT NULL,
            "option_id" INTEGER NOT NULL,
            "time_taken_ms" INTEGER NOT NULL,
            "was_correct" BOOLEAN NOT NULL,
            "points_earned" INTEGER NOT NULL,
            "combo_multiplier" DECIMAL(3,2) DEFAULT 1.00,
            "powerup_used" VARCHAR(50),
            "answered_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

            CONSTRAINT "fk_game_answers_game"
                FOREIGN KEY ("game_id")
                    REFERENCES "games"("game_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_game_answers_player"
                FOREIGN KEY ("player_id")
                    REFERENCES "game_players"("player_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_game_answers_question"
                FOREIGN KEY ("question_id")
                    REFERENCES "questions"("question_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_game_answers_option"
                FOREIGN KEY ("option_id")
                    REFERENCES "question_options"("option_id")
                    ON DELETE CASCADE,

            PRIMARY KEY ("answer_id", "answered_at")
) PARTITION BY RANGE ("answered_at");

-- Crear particiones mensuales (ejemplo para 2025)
CREATE TABLE "game_answers_2025_01" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE "game_answers_2025_02" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE "game_answers_2025_03" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE "game_answers_2025_04" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE "game_answers_2025_05" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE "game_answers_2025_06" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE "game_answers_2025_07" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE "game_answers_2025_08" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE "game_answers_2025_09" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE "game_answers_2025_10" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE "game_answers_2025_11" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE "game_answers_2025_12" PARTITION OF "game_answers"
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE "game_answers_default" PARTITION OF "game_answers" DEFAULT;

CREATE INDEX "idx_game_answers_game" ON "game_answers"("game_id", "answered_at" DESC);
CREATE INDEX "idx_game_answers_player" ON "game_answers"("player_id", "answered_at" DESC);
CREATE INDEX "idx_game_answers_question" ON "game_answers"("question_id");
CREATE INDEX "idx_game_answers_correct" ON "game_answers"("was_correct", "answered_at" DESC);

COMMENT ON TABLE "game_answers" IS 'Respuestas detalladas para analytics (particionada por mes)';

-- =====================================================================
-- TABLA: GAME_RESULTS (RESULTADOS FINALES)
-- =====================================================================
CREATE TABLE "game_results" (
            "result_id" SERIAL PRIMARY KEY,
            "game_id" INTEGER NOT NULL,
            "player_id" INTEGER NOT NULL,
            "user_id" INTEGER,

-- Estadísticas finales
            "final_score" INTEGER DEFAULT 0 NOT NULL,
            "final_rank" INTEGER NOT NULL,
            "total_questions" INTEGER NOT NULL,
            "correct_answers" INTEGER NOT NULL,
            "wrong_answers" INTEGER NOT NULL,
            "accuracy_percentage" DECIMAL(5,2) NOT NULL,
            "average_response_time_ms" INTEGER NOT NULL,
            "highest_combo" INTEGER DEFAULT 0,

-- Recompensas
            "xp_earned" INTEGER DEFAULT 0,
            "coins_earned" INTEGER DEFAULT 0,
            "gems_earned" INTEGER DEFAULT 0,
            "items_earned" JSONB,

-- Metadata
            "game_duration_seconds" INTEGER,
            "podium_finish" BOOLEAN DEFAULT false,
            "perfect_score" BOOLEAN DEFAULT false,

            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

            CONSTRAINT "fk_game_results_game"
                FOREIGN KEY ("game_id")
                    REFERENCES "games"("game_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_game_results_player"
                FOREIGN KEY ("player_id")
                    REFERENCES "game_players"("player_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_game_results_user"
                FOREIGN KEY ("user_id")
                    REFERENCES "users"("user_id")
                    ON DELETE SET NULL,

            CONSTRAINT "unique_game_player_result"
                UNIQUE ("game_id", "player_id")
);

CREATE INDEX "idx_game_results_game" ON "game_results"("game_id", "final_rank");
CREATE INDEX "idx_game_results_user" ON "game_results"("user_id", "created_at" DESC);
CREATE INDEX "idx_game_results_perfect" ON "game_results"("perfect_score")
WHERE "perfect_score" = true;

COMMENT ON TABLE "game_results" IS 'Resultados finales con recompensas';

-- =====================================================================
-- TABLA: LEADERBOARDS (PRE-CALCULADOS)
-- =====================================================================
CREATE TABLE "leaderboards" (
            "leaderboard_id" BIGSERIAL PRIMARY KEY,
            "period" VARCHAR(20) NOT NULL,
            "period_start" DATE NOT NULL,
            "period_end" DATE,
            "user_id" INTEGER NOT NULL,

-- Categorías
            "category" VARCHAR(50) DEFAULT 'global',
            "category_id" INTEGER,

-- Métricas
            "score" BIGINT NOT NULL,
            "rank" INTEGER NOT NULL,
            "games_played" INTEGER DEFAULT 0,
            "games_won" INTEGER DEFAULT 0,
            "perfect_scores" INTEGER DEFAULT 0,
            "total_xp" BIGINT DEFAULT 0,

            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

            CONSTRAINT "fk_leaderboard_user"
                FOREIGN KEY ("user_id")
                    REFERENCES "users"("user_id")
                    ON DELETE CASCADE
);

CREATE INDEX "idx_leaderboards_period_rank" ON "leaderboards"("period", "category", "rank");
CREATE INDEX "idx_leaderboards_user" ON "leaderboards"("user_id", "period");
CREATE INDEX "idx_leaderboards_category" ON "leaderboards"("category", "category_id", "rank");

CREATE UNIQUE INDEX "idx_leaderboards_unique"
ON "leaderboards"("period", "period_start", "user_id", "category", COALESCE("category_id", 0));

COMMENT ON TABLE "leaderboards" IS 'Leaderboards pre-calculados';

-- =====================================================================
-- TABLA: BOARD_EVENTS (EVENTOS DEL TABLERO)
-- =====================================================================
CREATE TABLE "board_events" (
            "event_id" SERIAL PRIMARY KEY,
            "event_type" "BoardEventType" NOT NULL,
            "name" VARCHAR(100) NOT NULL,
            "description" VARCHAR(255),

-- Efectos
            "coin_effect" INTEGER DEFAULT 0 NOT NULL,
            "gem_effect" INTEGER DEFAULT 0 NOT NULL,
            "xp_effect" INTEGER DEFAULT 0 NOT NULL,
            "move_effect" INTEGER DEFAULT 0 NOT NULL,

-- Configuración
            "icon_url" VARCHAR(255),
            "color" VARCHAR(7),
            "sound_effect" VARCHAR(100),
            "animation_type" VARCHAR(50),

-- Frecuencia
            "spawn_probability" DECIMAL(5,2) DEFAULT 10.00,
            "is_active" BOOLEAN DEFAULT true,

            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_board_events_type" ON "board_events"("event_type");
CREATE INDEX "idx_board_events_active" ON "board_events"("is_active")
WHERE "is_active" = true;

COMMENT ON TABLE "board_events" IS 'Eventos del tablero de progresión';

-- =====================================================================
-- TABLA: BOSS_BATTLES (JEFES)
-- =====================================================================
CREATE TABLE "boss_battles" (
            "boss_id" SERIAL PRIMARY KEY,
            "name" VARCHAR(100) NOT NULL,
            "description" TEXT,
            "difficulty" INTEGER DEFAULT 5 NOT NULL,

-- Assets
            "image_url" VARCHAR(255) NOT NULL,
            "battle_background_url" VARCHAR(255),
            "victory_animation_url" VARCHAR(255),

-- Configuración
            "required_level" INTEGER DEFAULT 10,
            "health_points" INTEGER NOT NULL,
            "phases" INTEGER DEFAULT 1 NOT NULL,
            "questions_per_phase" INTEGER DEFAULT 5,
            "time_limit_per_question" INTEGER DEFAULT 30,

-- Mecánicas
            "phase_mechanics" JSONB,

-- Recompensas
            "reward_coins" INTEGER DEFAULT 500,
            "reward_gems" INTEGER DEFAULT 50,
            "reward_xp" INTEGER DEFAULT 1000,
            "reward_items" JSONB,
            "perfect_victory_bonus" JSONB,

-- Configuración
            "is_active" BOOLEAN DEFAULT true,
            "is_seasonal" BOOLEAN DEFAULT false,
            "season" VARCHAR(50),
            "unlock_requirements" JSONB,

            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_boss_battles_difficulty" ON "boss_battles"("difficulty");
CREATE INDEX "idx_boss_battles_level" ON "boss_battles"("required_level");
CREATE INDEX "idx_boss_battles_active" ON "boss_battles"("is_active")
WHERE "is_active" = true;

COMMENT ON TABLE "boss_battles" IS 'Batallas contra jefes épicos';

-- =====================================================================
-- TABLA: USER_BOSS_ATTEMPTS (INTENTOS CONTRA BOSSES)
-- =====================================================================
CREATE TABLE "user_boss_attempts" (
                  "attempt_id" BIGSERIAL PRIMARY KEY,
                  "user_id" INTEGER NOT NULL,
                  "boss_id" INTEGER NOT NULL,

-- Resultado
                  "is_victory" BOOLEAN DEFAULT false,
                  "is_perfect_victory" BOOLEAN DEFAULT false,

-- Estadísticas
                  "score" INTEGER DEFAULT 0,
                  "damage_dealt" INTEGER DEFAULT 0,
                  "damage_taken" INTEGER DEFAULT 0,
                  "time_taken_seconds" INTEGER,
                  "phases_completed" INTEGER DEFAULT 0,
                  "questions_answered" INTEGER,
                  "correct_answers" INTEGER,
                  "accuracy_percentage" DECIMAL(5,2),

-- Recompensas
                  "xp_earned" INTEGER DEFAULT 0,
                  "coins_earned" INTEGER DEFAULT 0,
                  "gems_earned" INTEGER DEFAULT 0,

                  "attempted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

                  CONSTRAINT "fk_boss_attempt_user"
                      FOREIGN KEY ("user_id")
                          REFERENCES "users"("user_id")
                          ON DELETE CASCADE,

                  CONSTRAINT "fk_boss_attempt_boss"
                      FOREIGN KEY ("boss_id")
                          REFERENCES "boss_battles"("boss_id")
                          ON DELETE CASCADE
);

CREATE INDEX "idx_boss_attempts_user" ON "user_boss_attempts"("user_id", "boss_id");
CREATE INDEX "idx_boss_attempts_victories" ON "user_boss_attempts"("boss_id", "is_victory");
CREATE INDEX "idx_boss_attempts_perfect" ON "user_boss_attempts"("is_perfect_victory")
WHERE "is_perfect_victory" = true;

COMMENT ON TABLE "user_boss_attempts" IS 'Historial de intentos contra bosses';

-- =====================================================================
-- TABLA: FRIENDSHIPS (AMIGOS)
-- =====================================================================
CREATE TABLE "friendships" (
           "friendship_id" SERIAL PRIMARY KEY,
           "user_id" INTEGER NOT NULL,
           "friend_id" INTEGER NOT NULL,
           "status" "FriendshipStatus" DEFAULT 'pending' NOT NULL,
           "requested_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
           "accepted_at" TIMESTAMP,
           "blocked_at" TIMESTAMP,

-- Metadata
           "games_played_together" INTEGER DEFAULT 0,
           "last_played_together" TIMESTAMP,

           CONSTRAINT "fk_friendship_user"
               FOREIGN KEY ("user_id")
                   REFERENCES "users"("user_id")
                   ON DELETE CASCADE,

           CONSTRAINT "fk_friendship_friend"
               FOREIGN KEY ("friend_id")
                   REFERENCES "users"("user_id")
                   ON DELETE CASCADE,

           CONSTRAINT "check_not_self_friend"
               CHECK ("user_id" != "friend_id"),

CONSTRAINT "unique_friendship"
UNIQUE ("user_id", "friend_id")
);

CREATE INDEX "idx_friendships_user_status" ON "friendships"("user_id", "status");
CREATE INDEX "idx_friendships_friend_status" ON "friendships"("friend_id", "status");
CREATE INDEX "idx_friendships_accepted" ON "friendships"("status")
WHERE "status" = 'accepted';

COMMENT ON TABLE "friendships" IS 'Sistema de amigos';

-- =====================================================================
-- TABLA: NOTIFICATIONS (NOTIFICACIONES)
-- =====================================================================
CREATE TABLE "notifications" (
             "notification_id" BIGSERIAL PRIMARY KEY,
             "user_id" INTEGER NOT NULL,
             "type" "NotificationType" NOT NULL,
             "title" VARCHAR(200) NOT NULL,
             "message" TEXT,
             "link_url" VARCHAR(255),
             "image_url" VARCHAR(255),

-- Estado
             "is_read" BOOLEAN DEFAULT false,
             "read_at" TIMESTAMP,
             "is_deleted" BOOLEAN DEFAULT false,

-- Data
             "data" JSONB,

-- Configuración
             "priority" VARCHAR(20) DEFAULT 'normal',
             "expires_at" TIMESTAMP,

             "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

             CONSTRAINT "fk_notification_user"
                 FOREIGN KEY ("user_id")
                     REFERENCES "users"("user_id")
                     ON DELETE CASCADE
);

CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id", "is_read", "created_at" DESC);
CREATE INDEX "idx_notifications_type" ON "notifications"("type");
CREATE INDEX "idx_notifications_expires" ON "notifications"("expires_at")
WHERE "expires_at" IS NOT NULL;

COMMENT ON TABLE "notifications" IS 'Sistema de notificaciones';

-- =====================================================================
-- TABLA: REALTIME_EVENTS (EVENTOS EN TIEMPO REAL)
-- =====================================================================
CREATE TABLE "realtime_events" (
    "event_id" BIGSERIAL PRIMARY KEY,
    "event_type" VARCHAR(50) NOT NULL,
    "room_id" VARCHAR(100),
    "user_id" INTEGER,
    "game_id" INTEGER,
    
-- Payload
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    
-- Entrega
    "target_user_ids" INTEGER[],
    "broadcast_to_room" BOOLEAN DEFAULT false,
    "delivery_status" VARCHAR(20) DEFAULT 'pending',
    "delivered_at" TIMESTAMP,
    "retry_count" INTEGER DEFAULT 0,
    
-- TTL y expiración
    "expires_at" TIMESTAMP,
    "is_processed" BOOLEAN DEFAULT false,
    "processed_at" TIMESTAMP,
    
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT "fk_realtime_event_user"
        FOREIGN KEY ("user_id")
            REFERENCES "users"("user_id")
            ON DELETE SET NULL,
            
    CONSTRAINT "fk_realtime_event_game"
        FOREIGN KEY ("game_id")
            REFERENCES "games"("game_id")
            ON DELETE CASCADE
);

CREATE INDEX "idx_realtime_events_type" ON "realtime_events"("event_type", "created_at" DESC);
CREATE INDEX "idx_realtime_events_room" ON "realtime_events"("room_id", "created_at" DESC);
CREATE INDEX "idx_realtime_events_user" ON "realtime_events"("user_id", "created_at" DESC);
CREATE INDEX "idx_realtime_events_game" ON "realtime_events"("game_id", "created_at" DESC);
CREATE INDEX "idx_realtime_events_pending" ON "realtime_events"("delivery_status", "created_at") 
WHERE "delivery_status" = 'pending';
CREATE INDEX "idx_realtime_events_expires" ON "realtime_events"("expires_at") 
WHERE "expires_at" IS NOT NULL AND "is_processed" = false;

COMMENT ON TABLE "realtime_events" IS 'Cola de eventos en tiempo real para websockets';

-- =====================================================================
-- TABLA: ACTIVITY_LOGS (LOGS DE ACTIVIDAD - PARTICIONADA)
-- =====================================================================
CREATE TABLE "activity_logs" (
             "log_id" BIGSERIAL,
             "user_id" INTEGER,
             "action" VARCHAR(100) NOT NULL,

-- Contexto
             "ip_address" INET,
             "user_agent" TEXT,
             "session_id" VARCHAR(255),

-- Metadata
             "resource_type" VARCHAR(50),
             "resource_id" INTEGER,
             "metadata" JSONB,

             "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

             CONSTRAINT "fk_activity_log_user"
                 FOREIGN KEY ("user_id")
                     REFERENCES "users"("user_id")
                     ON DELETE SET NULL,

             PRIMARY KEY ("log_id", "created_at")
) PARTITION BY RANGE ("created_at");

-- Crear particiones mensuales (ejemplo para 2025)
CREATE TABLE "activity_logs_2025_01" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE "activity_logs_2025_02" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE "activity_logs_2025_03" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE "activity_logs_2025_04" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE "activity_logs_2025_05" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE "activity_logs_2025_06" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE "activity_logs_2025_07" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE "activity_logs_2025_08" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE "activity_logs_2025_09" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE "activity_logs_2025_10" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE "activity_logs_2025_11" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE "activity_logs_2025_12" PARTITION OF "activity_logs"
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE "activity_logs_default" PARTITION OF "activity_logs" DEFAULT;

CREATE INDEX "idx_activity_logs_user" ON "activity_logs"("user_id", "created_at" DESC);
CREATE INDEX "idx_activity_logs_action" ON "activity_logs"("action", "created_at" DESC);
CREATE INDEX "idx_activity_logs_created" ON "activity_logs"("created_at" DESC);

COMMENT ON TABLE "activity_logs" IS 'Logs para auditoría y compliance (particionada por mes)';

-- =====================================================================
-- TABLA: USER_REPORTS (REPORTES)
-- =====================================================================
CREATE TABLE "user_reports" (
            "report_id" SERIAL PRIMARY KEY,
            "reporter_id" INTEGER NOT NULL,
            "reported_user_id" INTEGER,
            "reported_content_type" VARCHAR(50),
            "reported_content_id" INTEGER,

-- Reporte
            "reason" VARCHAR(100) NOT NULL,
            "description" TEXT NOT NULL,
            "evidence_urls" TEXT[],

-- Estado
            "status" VARCHAR(20) DEFAULT 'pending',
            "priority" VARCHAR(20) DEFAULT 'normal',
            "assigned_to" INTEGER,

-- Resolución
            "resolution" TEXT,
            "action_taken" VARCHAR(100),
            "resolved_at" TIMESTAMP,
            "resolved_by" INTEGER,

            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

            CONSTRAINT "fk_report_reporter"
                FOREIGN KEY ("reporter_id")
                    REFERENCES "users"("user_id")
                    ON DELETE CASCADE,

            CONSTRAINT "fk_report_reported_user"
                FOREIGN KEY ("reported_user_id")
                    REFERENCES "users"("user_id")
                    ON DELETE SET NULL
);

CREATE INDEX "idx_user_reports_status" ON "user_reports"("status", "priority");
CREATE INDEX "idx_user_reports_reported" ON "user_reports"("reported_user_id");
CREATE INDEX "idx_user_reports_created" ON "user_reports"("created_at" DESC);

COMMENT ON TABLE "user_reports" IS 'Sistema de reportes para moderación';

-- =====================================================================
-- TABLA: CHAT_WHITELIST (FRASES SEGURAS)
-- =====================================================================
CREATE TABLE "chat_whitelist" (
              "phrase_id" SERIAL PRIMARY KEY,
              "phrase" VARCHAR(200) NOT NULL UNIQUE,
              "category" VARCHAR(50),
              "language" VARCHAR(10) DEFAULT 'es',
              "is_active" BOOLEAN DEFAULT true,
              "usage_count" INTEGER DEFAULT 0,
              "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "idx_chat_whitelist_active" ON "chat_whitelist"("is_active")
WHERE "is_active" = true;
CREATE INDEX "idx_chat_whitelist_language" ON "chat_whitelist"("language");

COMMENT ON TABLE "chat_whitelist" IS 'Frases pre-aprobadas para chat seguro';

-- =====================================================================
-- TABLA: STREAK_HISTORY (HISTORIAL DE RACHAS)
-- =====================================================================
CREATE TABLE "streak_history" (
              "history_id" BIGSERIAL PRIMARY KEY,
              "user_id" INTEGER NOT NULL,
              "streak_length" INTEGER NOT NULL,
              "start_date" DATE NOT NULL,
              "end_date" DATE NOT NULL,
              "broken_reason" VARCHAR(50),
              "milestone_reached" INTEGER,
              "rewards_given" JSONB,
              "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

              CONSTRAINT "fk_streak_history_user"
                  FOREIGN KEY ("user_id")
                      REFERENCES "users"("user_id")
                      ON DELETE CASCADE,

              CONSTRAINT "check_valid_dates"
                  CHECK ("end_date" >= "start_date")
);

CREATE INDEX "idx_streak_history_user" ON "streak_history"("user_id", "end_date" DESC);
CREATE INDEX "idx_streak_history_milestone" ON "streak_history"("milestone_reached")
WHERE "milestone_reached" IS NOT NULL;

COMMENT ON TABLE "streak_history" IS 'Historial de rachas';

-- =====================================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN DE RENDIMIENTO
-- =====================================================================

-- Índices compuestos para leaderboards y rankings
CREATE INDEX "idx_user_profiles_xp_level" ON "user_profiles"("total_xp" DESC, "level" DESC) 
WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_user_profiles_active_level" ON "user_profiles"("level" DESC, "total_xp" DESC) 
WHERE "deleted_at" IS NULL;

-- Índices para búsqueda de juegos activos
CREATE INDEX "idx_games_teacher_status_date" ON "games"("teacher_id", "status", "created_at" DESC);

CREATE INDEX "idx_games_active" ON "games"("status", "created_at" DESC) 
WHERE "status" IN ('lobby', 'starting', 'active');

-- Índices para búsqueda de sets públicos
CREATE INDEX "idx_question_sets_public_featured" ON "question_sets"("is_public", "is_featured", "times_played" DESC) 
WHERE "is_public" = true AND "is_approved" = true AND "deleted_at" IS NULL;

CREATE INDEX "idx_question_sets_subject_difficulty" ON "question_sets"("subject", "difficulty", "times_played" DESC) 
WHERE "is_public" = true AND "deleted_at" IS NULL;

-- Índices para estadísticas de usuario
CREATE INDEX "idx_game_results_user_date" ON "game_results"("user_id", "created_at" DESC, "final_rank");

CREATE INDEX "idx_user_achievements_progress" ON "user_achievements"("user_id", "is_unlocked", "progress");

-- Índices para tienda y transacciones
CREATE INDEX "idx_shop_items_available_price" ON "shop_items"("is_available", "price_coins", "price_gems") 
WHERE "is_available" = true AND "deleted_at" IS NULL;

CREATE INDEX "idx_user_inventory_equipped_type" ON "user_inventory"("user_id", "is_equipped") 
WHERE "is_equipped" = true;

CREATE INDEX "idx_currency_transactions_user_type_date" ON "currency_transactions"("user_id", "currency_type", "created_at" DESC);

-- Índices para mascotas
CREATE INDEX "idx_user_pets_user_active" ON "user_pets"("user_id", "is_active", "evolution_stage") 
WHERE "is_active" = true;

-- Índices para búsqueda de amigos
CREATE INDEX "idx_friendships_pending" ON "friendships"("friend_id", "status", "requested_at" DESC) 
WHERE "status" = 'pending';

-- Índices para performance de websockets/realtime
CREATE INDEX "idx_realtime_events_room_pending" ON "realtime_events"("room_id", "delivery_status", "created_at") 
WHERE "delivery_status" = 'pending' AND "is_processed" = false;

CREATE INDEX "idx_realtime_events_target_users" ON "realtime_events" USING GIN("target_user_ids");

-- Índices para sesiones activas
CREATE INDEX "idx_sessions_user_last_activity" ON "user_sessions"("user_id", "last_activity" DESC) 
WHERE "is_active" = true;

COMMENT ON INDEX "idx_user_profiles_xp_level" IS 'Optimiza consultas de leaderboard global';
COMMENT ON INDEX "idx_games_teacher_status_date" IS 'Optimiza búsqueda de juegos por profesor';
COMMENT ON INDEX "idx_question_sets_public_featured" IS 'Optimiza catálogo público de sets';
COMMENT ON INDEX "idx_realtime_events_target_users" IS 'Optimiza entrega de eventos a múltiples usuarios';

-- =====================================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================================

-- Actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_currencies_updated_at
BEFORE UPDATE ON user_currencies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_sets_updated_at
BEFORE UPDATE ON question_sets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_items_updated_at
BEFORE UPDATE ON shop_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Resetear límites diarios
CREATE OR REPLACE FUNCTION reset_daily_currency_limits()
RETURNS void AS $$
BEGIN
UPDATE user_currencies
SET
coins_earned_today = 0,
last_daily_reset = CURRENT_DATE
WHERE last_daily_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Actualizar stats de question sets
CREATE OR REPLACE FUNCTION update_question_set_stats()
RETURNS TRIGGER AS $$
BEGIN
IF TG_OP = 'INSERT' THEN
UPDATE question_sets
SET total_questions = total_questions + 1
WHERE set_id = NEW.set_id;
ELSIF TG_OP = 'DELETE' THEN
UPDATE question_sets
SET total_questions = total_questions - 1
WHERE set_id = OLD.set_id;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_set_stats_trigger
AFTER INSERT OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION update_question_set_stats();

-- =====================================================================
-- FUNCIONES ADICIONALES DE UTILIDAD
-- =====================================================================

-- Función para soft delete de perfiles
CREATE OR REPLACE FUNCTION soft_delete_user_profile(p_user_id INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE user_id = p_user_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para restaurar perfil
CREATE OR REPLACE FUNCTION restore_user_profile(p_user_id INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET deleted_at = NULL 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar eventos procesados antiguos (ejecutar diariamente)
CREATE OR REPLACE FUNCTION cleanup_old_realtime_events(days_old INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM realtime_events
    WHERE is_processed = true 
    AND processed_at < CURRENT_TIMESTAMP - (days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE user_sessions
    SET is_active = false,
        revoked_at = CURRENT_TIMESTAMP,
        revoked_reason = 'expired'
    WHERE is_active = true 
    AND (expires_at < CURRENT_TIMESTAMP OR refresh_expires_at < CURRENT_TIMESTAMP);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para crear partición del próximo mes automáticamente
CREATE OR REPLACE FUNCTION create_next_month_partition(table_name TEXT)
RETURNS void AS $$
DECLARE
    next_month_start DATE;
    next_month_end DATE;
    partition_name TEXT;
BEGIN
    next_month_start := date_trunc('month', CURRENT_DATE + INTERVAL '1 month');
    next_month_end := date_trunc('month', CURRENT_DATE + INTERVAL '2 months');
    partition_name := table_name || '_' || to_char(next_month_start, 'YYYY_MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        table_name,
        next_month_start,
        next_month_end
    );
    
    RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Función para revocar todas las sesiones de un usuario (logout global)
CREATE OR REPLACE FUNCTION revoke_all_user_sessions(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    revoked_count INTEGER;
BEGIN
    UPDATE user_sessions
    SET is_active = false,
        revoked_at = CURRENT_TIMESTAMP,
        revoked_reason = 'user_logout_all'
    WHERE user_id = p_user_id AND is_active = true;
    
    GET DIAGNOSTICS revoked_count = ROW_COUNT;
    RETURN revoked_count;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar integridad de datos
CREATE OR REPLACE FUNCTION verify_data_integrity()
RETURNS TABLE(check_name TEXT, is_valid BOOLEAN, details TEXT) AS $$
BEGIN
    -- Verificar que las estadísticas de profiles coincidan
    RETURN QUERY
    SELECT 
        'user_profiles_stats'::TEXT,
        COUNT(*) = 0,
        'Usuarios con estadísticas inconsistentes: ' || COUNT(*)::TEXT
    FROM user_profiles
    WHERE total_correct_answers > total_questions_answered;
    
    -- Verificar que las monedas no excedan el límite
    RETURN QUERY
    SELECT 
        'currency_limits'::TEXT,
        COUNT(*) = 0,
        'Usuarios que exceden límite de monedas: ' || COUNT(*)::TEXT
    FROM user_currencies
    WHERE coins > coins_cap OR gems > gems_cap;
    
    -- Verificar sesiones huérfanas
    RETURN QUERY
    SELECT 
        'orphan_sessions'::TEXT,
        COUNT(*) = 0,
        'Sesiones sin usuario válido: ' || COUNT(*)::TEXT
    FROM user_sessions s
    LEFT JOIN users u ON s.user_id = u.user_id
    WHERE u.user_id IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION soft_delete_user_profile IS 'Marca un perfil como eliminado sin borrarlo';
COMMENT ON FUNCTION cleanup_old_realtime_events IS 'Limpia eventos procesados antiguos';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Revoca sesiones expiradas';
COMMENT ON FUNCTION create_next_month_partition IS 'Crea partición para el próximo mes';
COMMENT ON FUNCTION verify_data_integrity IS 'Verifica la integridad de los datos';

-- =====================================================================
-- DATOS INICIALES (SEEDS)
-- =====================================================================

-- Board events
INSERT INTO "board_events" ("event_type", "name", "description", "coin_effect", "gem_effect", "xp_effect", "move_effect", "icon_url", "color", "spawn_probability") VALUES
('bonus_coins', 'Tesoro de Monedas', 'Encuentras un cofre con monedas', 100, 0, 0, 0, '/events/coins.png', '#FFD700', 15.00),
('bonus_xp', 'Boost de Experiencia', 'Ganas experiencia extra', 0, 0, 50, 0, '/events/xp.png', '#9C27B0', 15.00),
('bonus_gems', 'Gema Brillante', 'Encuentras una gema valiosa', 0, 5, 0, 0, '/events/gem.png', '#00BCD4', 5.00),
('trap_lose_coins', 'Trampa Costosa', 'Pierdes algunas monedas', -50, 0, 0, 0, '/events/trap.png', '#F44336', 10.00),
('trap_go_back', 'Retroceso', 'Retrocedes en el tablero', 0, 0, 0, -3, '/events/back.png', '#FF5722', 8.00),
('teleport_forward', 'Teletransporte', 'Avanzas rápidamente', 0, 0, 0, 5, '/events/teleport.png', '#4CAF50', 7.00),
('quiz_challenge', 'Desafío Extra', 'Pregunta bonus por recompensa doble', 0, 0, 0, 0, '/events/quiz.png', '#2196F3', 12.00),
('powerup', 'Potenciador', 'Obtienes un powerup aleatorio', 0, 0, 0, 0, '/events/powerup.png', '#FFC107', 10.00),
('mystery_box', 'Caja Misteriosa', 'Recompensa aleatoria', 0, 0, 0, 0, '/events/mystery.png', '#9E9E9E', 15.00),
('boss_encounter', 'Encuentro con Jefe', 'Un jefe aparece', 0, 0, 0, 0, '/events/boss.png', '#D32F2F', 3.00);

-- Pets
INSERT INTO "pets" ("name", "description", "category", "rarity", "stage1_sprite_url", "stage2_sprite_url", "stage3_sprite_url", "abilities", "xp_to_stage2", "xp_to_stage3") VALUES
('Búho Sabio', 'Un búho estudioso que ama el conocimiento', 'academic', 'common', '/pets/owl_1.png', '/pets/owl_2.png', '/pets/owl_3.png', '{"xp_boost": 5}'::jsonb, 1000, 5000),
('Zorro Astuto', 'Un zorro inteligente y rápido', 'academic', 'common', '/pets/fox_1.png', '/pets/fox_2.png', '/pets/fox_3.png', '{"coin_finder": 10}'::jsonb, 1000, 5000),
('Dragón Escolar', 'Un poderoso dragón del conocimiento', 'fantasy', 'rare', '/pets/dragon_1.png', '/pets/dragon_2.png', '/pets/dragon_3.png', '{"xp_boost": 15, "luck_boost": 10}'::jsonb, 2000, 8000),
('Fénix Dorado', 'Renace con más fuerza', 'fantasy', 'epic', '/pets/phoenix_1.png', '/pets/phoenix_2.png', '/pets/phoenix_3.png', '{"xp_boost": 20, "streak_protector": true}'::jsonb, 3000, 12000),
('Unicornio Místico', 'Criatura legendaria de sabiduría', 'mythical', 'legendary', '/pets/unicorn_1.png', '/pets/unicorn_2.png', '/pets/unicorn_3.png', '{"xp_boost": 25, "coin_finder": 15, "luck_boost": 20}'::jsonb, 5000, 20000);

-- Achievements
INSERT INTO "achievements" ("name", "description", "category", "rarity", "icon_url", "points", "requirement_type", "requirement_value", "reward_coins", "reward_gems", "reward_xp") VALUES
('Primeros Pasos', 'Completa tu primer quiz', 'quiz', 'common', '/badges/first_steps.png', 10, 'total_quizzes', 1, 100, 0, 50),
('Estudiante Dedicado', 'Completa 10 quizzes', 'quiz', 'common', '/badges/dedicated.png', 20, 'total_quizzes', 10, 200, 5, 100),
('Maestro del Quiz', 'Completa 100 quizzes', 'quiz', 'rare', '/badges/master.png', 100, 'total_quizzes', 100, 1000, 50, 500),
('Perfección', 'Obtén 100% en un quiz', 'quiz', 'uncommon', '/badges/perfect.png', 30, 'perfect_scores', 1, 300, 10, 150),
('Guerrero Semanal', 'Mantén racha de 7 días', 'progression', 'uncommon', '/badges/week_warrior.png', 50, 'streak_days', 7, 500, 20, 250),
('Leyenda de Rachas', 'Mantén racha de 100 días', 'progression', 'legendary', '/badges/century.png', 500, 'streak_days', 100, 5000, 250, 2500),
('Mariposa Social', 'Agrega 10 amigos', 'social', 'common', '/badges/social.png', 25, 'friends_added', 10, 250, 10, 125),
('Coleccionista', 'Colecciona 5 mascotas', 'collection', 'uncommon', '/badges/collector.png', 60, 'total_pets', 5, 600, 30, 300),
('Campeón', 'Gana 50 juegos', 'quiz', 'rare', '/badges/champion.png', 100, 'games_won', 50, 1000, 50, 500);

-- Chat whitelist
INSERT INTO "chat_whitelist" ("phrase", "category", "language") VALUES
    ('¡Hola!', 'greeting', 'es'),
    ('Hola a todos', 'greeting', 'es'),
    ('Buenos días', 'greeting', 'es'),
    ('¡Buena suerte!', 'game_related', 'es'),
    ('¡Bien jugado!', 'game_related', 'es'),
    ('¡Excelente!', 'game_related', 'es'),
    ('¡Vamos!', 'game_related', 'es'),
    ('Esa era difícil', 'game_related', 'es'),
    ('¡Qué rápido!', 'game_related', 'es'),
    ('😊', 'emotion', 'es'),
    ('😄', 'emotion', 'es'),
    ('👍', 'emotion', 'es'),
    ('🎉', 'emotion', 'es'),
    ('⭐', 'emotion', 'es'),
    ('¿Listos?', 'question', 'es'),
    ('¿Empezamos?', 'question', 'es'),
    ('Sí', 'question', 'es'),
    ('No', 'question', 'es'),
    ('Ok', 'question', 'es'),
    ('¡Tú puedes!', 'emotion', 'es'),
    ('¡Sigue así!', 'emotion', 'es'),
    ('¡Muy bien!', 'emotion', 'es'),
    ('Adiós', 'greeting', 'es'),
    ('Hasta luego', 'greeting', 'es');

-- =====================================================================
-- TAREAS DE MANTENIMIENTO Y OPERACIÓN
-- =====================================================================

/*
TAREAS RECOMENDADAS PARA CRON/SCHEDULER:

1. LIMPIEZA DIARIA (ejecutar a las 3:00 AM):
   SELECT cleanup_expired_sessions();
   SELECT cleanup_old_realtime_events(7);
   SELECT reset_daily_currency_limits();

2. CREAR PARTICIONES MENSUALMENTE (ejecutar el día 20 de cada mes):
   SELECT create_next_month_partition('activity_logs');
   SELECT create_next_month_partition('game_answers');

3. VERIFICACIÓN DE INTEGRIDAD (ejecutar semanalmente):
   SELECT * FROM verify_data_integrity();

4. BACKUP Y ARCHIVADO (ejecutar mensualmente):
   -- Archivar particiones antiguas (más de 6 meses)
   -- Hacer backup de tablas críticas

5. ANÁLISIS Y VACUUM (ejecutar semanalmente):
   VACUUM ANALYZE;

ÍNDICES A MONITOREAR:
- Si las consultas de leaderboard son lentas, revisar idx_user_profiles_xp_level
- Si las búsquedas de juegos activos son lentas, revisar idx_games_teacher_status_date
- Si las notificaciones en tiempo real son lentas, revisar idx_realtime_events_room_pending

SOFT DELETE:
- Para eliminar un perfil sin borrarlo: SELECT soft_delete_user_profile(user_id);
- Para restaurar un perfil: SELECT restore_user_profile(user_id);

GESTIÓN DE SESIONES:
- Cerrar todas las sesiones de un usuario: SELECT revoke_all_user_sessions(user_id);
- Las sesiones expiradas se limpian automáticamente con cleanup_expired_sessions()

PARTICIONES:
- Las tablas activity_logs y game_answers están particionadas por mes
- Crear nuevas particiones antes de que comience el mes
- Las particiones antiguas se pueden archivar/eliminar según política de retención

MONITOREO DE RENDIMIENTO:
- Monitorear tamaño de tablas particionadas
- Revisar índices no utilizados con: 
  SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
- Revisar consultas lentas en pg_stat_statements
*/

-- =====================================================================
-- FIN DEL SCHEMA
-- =====================================================================