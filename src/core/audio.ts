/**
 * GLaDIS Synthesized Audio Engine (Web Audio API)
 * Generates immersive ambient drones, terminal click sounds, alarms, Morse beacons, and TTS intercom static.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientNode: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;

  constructor() { }

  private init() {
    if (this.ctx) return;
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  // Play a simple terminal click/beep
  playBeep(freq = 1200, duration = 0.05, type: OscillatorType = 'sine', volume = 0.08) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Play an error bi-tone
  playError() {
    this.playBeep(220, 0.15, 'sawtooth', 0.1);
    setTimeout(() => this.playBeep(180, 0.25, 'sawtooth', 0.1), 100);
  }

  // Play system success chime
  playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.25, 'sine', 0.06);
      }, idx * 100);
    });
  }

  // Start GLaDOS testing room ambient drone (low eerie hum)
  startAmbientDrone() {
    this.init();
    if (!this.ctx || this.ambientNode) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    // Deep oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 hum

    // Lowpass filter to make it muddy and dark
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    // LFO for slow volume throbbing
    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 5-second cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    this.lfoNode.connect(lfoGain);
    lfoGain.connect(this.ambientGain.gain);

    osc.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    osc.start();
    this.lfoNode.start();

    this.ambientNode = osc;
  }

  stopAmbientDrone() {
    if (this.ambientNode) {
      try {
        this.ambientNode.stop();
        this.lfoNode?.stop();
      } catch (e) { }
      this.ambientNode = null;
      this.lfoNode = null;
    }
  }

  // Play static radio crackle (white noise burst)
  playRadioCrackle(duration = 0.25, volume = 0.05) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make it sound like a radio transceiver
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1000, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    noiseNode.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start();
  }

  // Play Morse code spelling "CAKE"
  // Morse: C (-.-.) A (.-) K (-.-) E (.)
  // Dot: 120ms, Dash: 360ms, Space within letter: 120ms, Space between letters: 360ms
  playMorseSequence(onComplete?: () => void) {
    this.init();
    if (!this.ctx) return;

    // C (-.-.) A (.-) K (-.-) E (.)
    const sequence = [
      { t: 'dash', d: 360 }, { t: 'gap', d: 120 },
      { t: 'dot', d: 120 }, { t: 'gap', d: 120 },
      { t: 'dash', d: 360 }, { t: 'gap', d: 120 },
      { t: 'dot', d: 120 }, { t: 'gap', d: 360 }, // End of C

      { t: 'dot', d: 120 }, { t: 'gap', d: 120 },
      { t: 'dash', d: 360 }, { t: 'gap', d: 360 }, // End of A

      { t: 'dash', d: 360 }, { t: 'gap', d: 120 },
      { t: 'dot', d: 120 }, { t: 'gap', d: 120 },
      { t: 'dash', d: 360 }, { t: 'gap', d: 360 }, // End of K

      { t: 'dot', d: 120 } // E
    ];

    let accumulatedTime = 0;
    sequence.forEach((item) => {
      setTimeout(() => {
        if (item.t === 'dot') {
          this.playBeep(750, 0.12, 'sine', 0.08);
        } else if (item.t === 'dash') {
          this.playBeep(750, 0.36, 'sine', 0.08);
        }
      }, accumulatedTime);
      accumulatedTime += item.d;
    });

    if (onComplete) {
      setTimeout(onComplete, accumulatedTime + 500);
    }
  }

  // Emergency Siren Synth for Stage 4 Self Destruct
  playSelfDestructAlarm() {
    if ((window as any).showStage5EmergencyOverlay === false) {
      return;
    }
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(405, this.ctx.currentTime);

    // Modulate pitch over 1 second (siren sweep)
    const sweepDuration = 1.0;
    osc1.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + sweepDuration / 2);
    osc1.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + sweepDuration);

    osc2.frequency.linearRampToValueAtTime(805, this.ctx.currentTime + sweepDuration / 2);
    osc2.frequency.linearRampToValueAtTime(405, this.ctx.currentTime + sweepDuration);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + sweepDuration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(this.ctx.currentTime + sweepDuration);
    osc2.stop(this.ctx.currentTime + sweepDuration);
  }

}

export const audio = new AudioEngine();
