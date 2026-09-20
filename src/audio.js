function noiseBuffer(ctx, seconds = 0.2) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

function envGain(ctx, time, peak, attack, decay, sustain = 0.0001) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), time + attack)
  gain.gain.exponentialRampToValueAtTime(sustain, time + attack + decay)
  return gain
}

export function triggerSound(ctx, dest, type, time) {
  switch (type) {
    case 'hat': {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(150, time)
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.12)
      gain.gain.setValueAtTime(1, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28)
      osc.connect(gain).connect(dest)
      osc.start(time)
      osc.stop(time + 0.3)
      break
    }
    case 'kick': {
      const osc = ctx.createOscillator()
      const oscGain = envGain(ctx, time, 0.35, 0.005, 0.12)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, time)
      osc.connect(oscGain).connect(dest)
      osc.start(time)
      osc.stop(time + 0.15)

      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer(ctx, 0.25)
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 1200
      const nGain = envGain(ctx, time, 0.55, 0.002, 0.16)
      noise.connect(filter).connect(nGain).connect(dest)
      noise.start(time)
      noise.stop(time + 0.2)
      break
    }
    case 'snare': {
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer(ctx, 0.15)
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 7000
      const gain = envGain(ctx, time, 0.28, 0.001, 0.05)
      noise.connect(filter).connect(gain).connect(dest)
      noise.start(time)
      noise.stop(time + 0.08)
      break
    }
    case 'clap': {
      const bursts = [0, 0.012, 0.024, 0.045]
      for (const offset of bursts) {
        const noise = ctx.createBufferSource()
        noise.buffer = noiseBuffer(ctx, 0.2)
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 1400
        filter.Q.value = 0.8
        const gain = envGain(ctx, time + offset, 0.4, 0.001, 0.08)
        noise.connect(filter).connect(gain).connect(dest)
        noise.start(time + offset)
        noise.stop(time + offset + 0.12)
      }
      break
    }
    case 'perc': {
      const osc = ctx.createOscillator()
      const gain = envGain(ctx, time, 0.45, 0.002, 0.14)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(420, time)
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.12)
      osc.connect(gain).connect(dest)
      osc.start(time)
      osc.stop(time + 0.16)
      break
    }
    case 'stab': {
      const freqs = [196, 246.94, 293.66]
      for (const freq of freqs) {
        const osc = ctx.createOscillator()
        const gain = envGain(ctx, time, 0.12, 0.01, 0.22)
        osc.type = 'sawtooth'
        osc.frequency.value = freq
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1800, time)
        filter.frequency.exponentialRampToValueAtTime(400, time + 0.25)
        osc.connect(filter).connect(gain).connect(dest)
        osc.start(time)
        osc.stop(time + 0.3)
      }
      break
    }
    case 'ride': {
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer(ctx, 0.4)
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 4500
      const gain = envGain(ctx, time, 0.22, 0.002, 0.28)
      noise.connect(filter).connect(gain).connect(dest)
      noise.start(time)
      noise.stop(time + 0.35)
      break
    }
    case 'keys': {
      const osc = ctx.createOscillator()
      const gain = envGain(ctx, time, 0.22, 0.008, 0.35)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(261.63, time)
      osc.connect(gain).connect(dest)
      osc.start(time)
      osc.stop(time + 0.4)
      break
    }
    default:
      break
  }
}

export function createEngine({ getPattern, getBpm, onStep }) {
  let ctx = null
  let master = null
  let timerId = null
  let nextNoteTime = 0
  let currentStep = 0
  let playing = false

  const lookahead = 25
  const scheduleAhead = 0.12

  function ensureContext() {
    if (!ctx) {
      ctx = new AudioContext()
      master = ctx.createGain()
      master.gain.value = 0.85
      master.connect(ctx.destination)
    }
    return ctx
  }

  function secondsPerStep() {
    return 60 / getBpm() / 4
  }

  function scheduleStep(step, time) {
    const pattern = getPattern()
    for (const [id, cells] of Object.entries(pattern)) {
      if (cells[step]) triggerSound(ctx, master, id, time)
    }
  }

  function scheduler() {
    if (!playing || !ctx) return
    while (nextNoteTime < ctx.currentTime + scheduleAhead) {
      const step = currentStep
      const time = nextNoteTime
      scheduleStep(step, time)
      const delay = Math.max(0, (time - ctx.currentTime) * 1000)
      window.setTimeout(() => onStep(step), delay)
      nextNoteTime += secondsPerStep()
      currentStep = (currentStep + 1) % 16
    }
  }

  return {
    async play() {
      ensureContext()
      await ctx.resume()
      if (playing) return
      playing = true
      currentStep = 0
      nextNoteTime = ctx.currentTime + 0.05
      scheduler()
      timerId = window.setInterval(scheduler, lookahead)
    },
    stop() {
      playing = false
      if (timerId) window.clearInterval(timerId)
      timerId = null
      onStep(-1)
    },
    isPlaying() {
      return playing
    },
    async tap(type) {
      ensureContext()
      await ctx.resume()
      triggerSound(ctx, master, type, ctx.currentTime)
    },
  }
}
