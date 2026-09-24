
/**
 * Professional Trading Sound Engine
 * Synthesizes high-quality audio feedback using Web Audio API
 * Inspired by premium platforms like IQ Option
 */

class SoundEngine {
  private context: AudioContext | null = null;

  private initContext() {
    try {
      if (typeof window === 'undefined') return;
      if (!this.context) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.context = new AudioCtx();
        }
      }
      if (this.context && this.context.state === 'suspended') {
        this.context.resume().catch(() => {});
      }
    } catch (e) {
      // Audio not permitted or failed, silently fallback
    }
  }

  /**
   * Short, crisp "Click" for opening a trade (Desktop only, silent on phone/mobile)
   */
  playTradeOpen(isMobile?: boolean) {
    try {
      if (
        isMobile ||
        (typeof window !== 'undefined' && (
          window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        ))
      ) {
        return;
      }

      this.initContext();
      if (!this.context) return;

      const curTime = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, curTime);
      osc.frequency.exponentialRampToValueAtTime(440, curTime + 0.1);

      gain.gain.setValueAtTime(0.15, curTime);
      gain.gain.exponentialRampToValueAtTime(0.01, curTime + 0.1);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start(curTime);
      osc.stop(curTime + 0.1);
    } catch (e) {
      // Silently catch audio errors
    }
  }

  /**
   * Pleasant ascending chime for a Winning trade
   */
  playWin() {
    try {
      this.initContext();
      if (!this.context) return;

      const now = this.context.currentTime;
      // First Note
      this.playTone(659.25, now, 0.1, 0.15); // E5
      // Second Note
      this.playTone(880.00, now + 0.1, 0.1, 0.15); // A5
      // Third Note
      this.playTone(1046.50, now + 0.2, 0.3, 0.15); // C6
    } catch (e) {
      // Silently catch audio errors
    }
  }

  /**
   * Subtle low-frequency "Thud" for a Losing trade
   */
  playLoss() {
    try {
      this.initContext();
      if (!this.context) return;

      const curTime = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, curTime);
      osc.frequency.exponentialRampToValueAtTime(110, curTime + 0.3);

      gain.gain.setValueAtTime(0.2, curTime);
      gain.gain.linearRampToValueAtTime(0, curTime + 0.3);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start(curTime);
      osc.stop(curTime + 0.3);
    } catch (e) {
      // Silently catch audio errors
    }
  }

  /**
   * Neutral double-tap for Draw/Refund
   */
  playDraw() {
    try {
      this.initContext();
      if (!this.context) return;
      const now = this.context.currentTime;
      this.playTone(440, now, 0.05, 0.1);
      this.playTone(440, now + 0.1, 0.05, 0.1);
    } catch (e) {
      // Silently catch audio errors
    }
  }

  private playTone(freq: number, start: number, duration: number, volume: number) {
    try {
      if (!this.context) return;
      const safeStart = Math.max(this.context.currentTime, start);
      const safeEnd = safeStart + Math.max(0.01, duration);

      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, safeStart);
      
      gain.gain.setValueAtTime(Math.max(0.001, volume), safeStart);
      gain.gain.exponentialRampToValueAtTime(0.001, safeEnd);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start(safeStart);
      osc.stop(safeEnd);
    } catch (e) {
      // Silently catch audio errors
    }
  }
}

export const soundEngine = new SoundEngine();
