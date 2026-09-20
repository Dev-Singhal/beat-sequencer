export function TrackIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2.1',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (name) {
    case 'hat':
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="6.2" />
          <circle cx="12" cy="13" r="2.1" />
        </svg>
      )
    case 'kick':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="14" rx="7" ry="5.2" />
          <path d="M6.2 11.2c.6-2.6 2.8-4.4 5.8-4.4s5.2 1.8 5.8 4.4" />
          <path d="M12 6.8V4.6M8.2 8.2 7 6.8M15.8 8.2 17 6.8" />
        </svg>
      )
    case 'snare':
      return (
        <svg {...common}>
          <circle cx="12" cy="13.5" r="6" />
          <path d="M12 7.5V5.2M8.4 18.2l-1.4 1.5M4.8 9.2 16.8 17" />
        </svg>
      )
    case 'ride':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="13" rx="7.2" ry="3.4" />
          <path d="M5.2 13c.4-3.4 3.2-6.2 6.8-6.2s6.4 2.8 6.8 6.2" />
          <circle cx="12" cy="10.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'perc':
      return (
        <svg {...common}>
          <ellipse cx="8.2" cy="15.2" rx="4.4" ry="2.6" />
          <path d="M3.8 15.2V11.4c0-1.5 2-2.6 4.4-2.6s4.4 1.1 4.4 2.6v3.8" />
          <ellipse cx="15.6" cy="14.4" rx="4.2" ry="2.4" />
          <path d="M11.4 14.4V11c0-1.4 1.9-2.5 4.2-2.5s4.2 1.1 4.2 2.5v3.4" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...common}>
          <rect x="9" y="3.5" width="6" height="10.5" rx="3" />
          <path d="M6.8 11.2a5.2 5.2 0 0 0 10.4 0M12 16.6V20M9.2 20h5.6" />
        </svg>
      )
    case 'clap':
      return (
        <svg {...common}>
          <path d="M8.2 14.2c-1.6-1.4-1.8-3.8-.4-5.2 1.2-1.2 3-.8 4 1.1" />
          <path d="M15.8 14.2c1.6-1.4 1.8-3.8.4-5.2-1.2-1.2-3-.8-4 1.1" />
          <path d="M8.6 15.4c.4 2.4 1.8 3.8 3.4 3.8s3-1.4 3.4-3.8" />
        </svg>
      )
    case 'keys':
      return (
        <svg {...common}>
          <rect x="4.5" y="6" width="15" height="12" rx="1.6" />
          <path d="M9.5 6v12M14.5 6v12M9.5 6v7.2h2.2M14.5 6v7.2h2.2" />
        </svg>
      )
    default:
      return null
  }
}

export function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="6.2" y="5.5" width="4.2" height="13" rx="1.1" />
      <rect x="13.6" y="5.5" width="4.2" height="13" rx="1.1" />
    </svg>
  )
}

export function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h3.2c.7 0 1.3.4 1.7 1l2.2 3.2" />
      <path d="M4 17h3.2c.7 0 1.3-.4 1.7-1l1.4-2" />
      <path d="M16 7h4" />
      <path d="M18 5l2 2-2 2" />
      <path d="M16 17h4" />
      <path d="M18 15l2 2-2 2" />
    </svg>
  )
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 6.2 8 10l4-3.8" />
    </svg>
  )
}
