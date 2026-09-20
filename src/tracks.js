import clap from './assets/icons/clap.png'
import hat from './assets/icons/hat.png'
import keys from './assets/icons/keys.png'
import kick from './assets/icons/kick.png'
import mic from './assets/icons/mic.png'
import ride from './assets/icons/ride.png'
import snare from './assets/icons/snare.png'
import toms from './assets/icons/toms.png'

export { default as wandIcon } from './assets/icons/wand.png'

export const STEPS = 16

export const TRACKS = [
  { id: 'hat', name: 'Hi-hat', color: '#2ee6c8', icon: hat },
  { id: 'kick', name: 'Kick', color: '#ff3b4a', icon: kick },
  { id: 'snare', name: 'Snare', color: '#ff7a1a', icon: snare },
  { id: 'ride', name: 'Ride', color: '#f0c000', icon: ride },
  { id: 'perc', name: 'Toms', color: '#4da6ff', icon: toms },
  { id: 'stab', name: 'Vocal', color: '#b56bff', icon: mic },
  { id: 'clap', name: 'Clap', color: '#3ddc7a', icon: clap },
  { id: 'keys', name: 'Keys', color: '#ff2e9a', icon: keys },
]

export function emptyPattern() {
  return Object.fromEntries(TRACKS.map((track) => [track.id, Array(STEPS).fill(false)]))
}

export function randomPattern() {
  const pattern = emptyPattern()
  for (const track of TRACKS) {
    for (let step = 0; step < STEPS; step += 1) {
      pattern[track.id][step] = Math.random() < 0.2
    }
  }
  return pattern
}
