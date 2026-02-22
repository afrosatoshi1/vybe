// ── VYBE Audio Engine ────────────────────────────────────────────
class AudioEngine {
  constructor() {
    this.ctx       = null
    this.bpm       = 120
    this.step      = 0
    this.iv        = null
    this.isPlaying = false
    this.volumes   = Array(8).fill(0.8)
    this.muted     = Array(8).fill(false)
  }

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  noise(dur) {
    const ctx = this.ctx
    const sz  = Math.ceil(ctx.sampleRate * dur)
    const buf = ctx.createBuffer(1, sz, ctx.sampleRate)
    const d   = buf.getChannelData(0)
    for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  playNote(type, step = 0, vol = 1) {
    if (!this.ctx) return
    const ctx = this.ctx, t = ctx.currentTime

    const gain = ctx.createGain()
    gain.connect(ctx.destination)

    if (type === 'kick') {
      const o = ctx.createOscillator()
      o.connect(gain)
      o.frequency.setValueAtTime(200, t)
      o.frequency.exponentialRampToValueAtTime(0.01, t + 0.5)
      gain.gain.setValueAtTime(1.2 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5)
      o.start(t); o.stop(t + 0.5)
    } else if (type === 'snare') {
      const s = ctx.createBufferSource(); s.buffer = this.noise(0.18)
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200
      s.connect(f); f.connect(gain)
      gain.gain.setValueAtTime(0.9 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18)
      s.start(t)
    } else if (type === 'hihat') {
      const s = ctx.createBufferSource(); s.buffer = this.noise(0.04)
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 9000
      s.connect(f); f.connect(gain)
      gain.gain.setValueAtTime(0.4 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04)
      s.start(t)
    } else if (type === 'clap') {
      ;[0, 0.01, 0.02].forEach(off => {
        const s = ctx.createBufferSource(); s.buffer = this.noise(0.1)
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.6 * vol, t + off)
        g.gain.exponentialRampToValueAtTime(0.01, t + off + 0.1)
        s.connect(g); g.connect(ctx.destination); s.start(t + off)
      })
    } else if (type === 'bass') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300
      o.connect(f); f.connect(gain)
      o.frequency.setValueAtTime(55, t)
      gain.gain.setValueAtTime(0.8 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35)
      o.start(t); o.stop(t + 0.35)
    } else if (type === 'mel') {
      const notes = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25]
      const o = ctx.createOscillator(); o.type = 'sine'
      o.connect(gain)
      o.frequency.setValueAtTime(notes[step % notes.length], t)
      gain.gain.setValueAtTime(0.4 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)
      o.start(t); o.stop(t + 0.3)
    } else if (type === 'perc') {
      const s = ctx.createBufferSource(); s.buffer = this.noise(0.08)
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500
      s.connect(f); f.connect(gain)
      gain.gain.setValueAtTime(0.5 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08)
      s.start(t)
    } else if (type === 'cymb') {
      const s = ctx.createBufferSource(); s.buffer = this.noise(0.35)
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 11000
      s.connect(f); f.connect(gain)
      gain.gain.setValueAtTime(0.25 * vol, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35)
      s.start(t)
    }
  }

  playStep(grid, step) {
    if (!this.ctx) return
    const ids = ['kick','snare','hihat','clap','bass','mel','perc','cymb']
    ids.forEach((id, i) => {
      if (!this.muted[i] && grid[i]?.[step]) {
        this.playNote(id, step, this.volumes[i])
      }
    })
  }

  start(getGrid, onStep) {
    this.init(); this.isPlaying = true
    const ms = (60 / this.bpm / 4) * 1000
    this.iv = setInterval(() => {
      this.playStep(getGrid(), this.step)
      onStep(this.step)
      this.step = (this.step + 1) % 32
    }, ms)
  }

  stop() {
    this.isPlaying = false
    clearInterval(this.iv); this.iv = null; this.step = 0
  }

  setBPM(bpm) {
    this.bpm = bpm
    if (this.isPlaying) {
      // Hot-reload BPM
      this.stop()
      return true // signal to restart
    }
    return false
  }
}

export const AE = new AudioEngine()
export default AE
