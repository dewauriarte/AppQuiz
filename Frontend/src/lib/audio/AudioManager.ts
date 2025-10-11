import { Howl, Howler } from 'howler';

interface SoundConfig {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeSounds();
  }

  private async initializeSounds() {
    try {
      // Configurar volumen global
      Howler.volume(0.5);

      // Cargar efectos de sonido básicos
      await this.loadSound('correct', '/sounds/correct.mp3', {
        volume: 0.6,
        preload: true,
      });

      await this.loadSound('wrong', '/sounds/wrong.mp3', {
        volume: 0.5,
        preload: true,
      });

      await this.loadSound('combo', '/sounds/combo.mp3', {
        volume: 0.7,
        preload: true,
      });

      await this.loadSound('levelup', '/sounds/levelup.mp3', {
        volume: 0.8,
        preload: true,
      });

      await this.loadSound('coin', '/sounds/coin.mp3', {
        volume: 0.4,
        preload: true,
      });

      await this.loadSound('button', '/sounds/button.mp3', {
        volume: 0.3,
        preload: true,
      });

      await this.loadSound('notification', '/sounds/notification.mp3', {
        volume: 0.5,
        preload: true,
      });

      this.isInitialized = true;
      console.log('✅ AudioManager initialized');
    } catch (error) {
      console.warn('⚠️ AudioManager initialization failed:', error);
    }
  }

  private async loadSound(id: string, src: string, options: SoundConfig = {}): Promise<void> {
      return new Promise((resolve, _reject) => {
      const sound = new Howl({
        src: [src],
        html5: true, // Usar HTML5 Audio para mejor compatibilidad
        preload: options.preload ?? false,
        volume: options.volume ?? 0.5,
        loop: options.loop ?? false,
        onload: () => resolve(),
        onloaderror: (id, error) => {
          console.warn(`Failed to load sound ${id}:`, error);
          resolve(); // No fallar completamente si un sonido falla
        },
      });

      this.sounds.set(id, sound);
    });
  }

  play(id: string): void {
    if (!this.isInitialized) return;

    const sound = this.sounds.get(id);
    if (sound) {
      try {
        sound.play();
      } catch (error) {
        console.warn(`Failed to play sound ${id}:`, error);
      }
    }
  }

  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.stop();
    }
  }

  setVolume(category: 'sfx' | 'music' | 'master', volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (category === 'master') {
      Howler.volume(clampedVolume);
    } else if (category === 'sfx') {
      this.sounds.forEach(sound => {
        sound.volume(clampedVolume);
      });
    } else if (category === 'music' && this.music) {
      this.music.volume(clampedVolume);
    }
  }

  mute(muted: boolean): void {
    Howler.mute(muted);
  }

  getVolume(category: 'sfx' | 'music' | 'master'): number {
    if (category === 'master') {
      return Howler.volume();
    } else if (category === 'sfx') {
      const sound = this.sounds.get('correct');
      return sound?.volume() ?? 0.5;
    } else if (category === 'music' && this.music) {
      return this.music.volume();
    }
    return 0.5;
  }

  // Métodos específicos para el juego
  playCorrect(): void {
    this.play('correct');
  }

  playWrong(): void {
    this.play('wrong');
  }

  playCombo(): void {
    this.play('combo');
  }

  playLevelUp(): void {
    this.play('levelup');
  }

  playCoin(): void {
    this.play('coin');
  }

  playButton(): void {
    this.play('button');
  }

  playNotification(): void {
    this.play('notification');
  }
}

// Crear instancia singleton
export const audioManager = new AudioManager();

// Hook para usar el audio manager en componentes React
export const useAudioManager = () => {
  return {
    play: audioManager.play.bind(audioManager),
    playCorrect: audioManager.playCorrect.bind(audioManager),
    playWrong: audioManager.playWrong.bind(audioManager),
    playCombo: audioManager.playCombo.bind(audioManager),
    playLevelUp: audioManager.playLevelUp.bind(audioManager),
    playCoin: audioManager.playCoin.bind(audioManager),
    playButton: audioManager.playButton.bind(audioManager),
    playNotification: audioManager.playNotification.bind(audioManager),
    setVolume: audioManager.setVolume.bind(audioManager),
    mute: audioManager.mute.bind(audioManager),
    getVolume: audioManager.getVolume.bind(audioManager),
  };
};
