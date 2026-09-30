import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createEngine, renderPatternToMp3 } from './audio'
import { ChevronIcon, DownloadIcon, PauseIcon, PlayIcon } from './icons'
import { STEPS, TRACKS, emptyPattern, randomPattern, wandIcon } from './tracks'

const BPM_OPTIONS = [80, 90, 100, 110, 120, 128, 136, 140, 146, 150, 160, 174]

export default function App() {
  const [pattern, setPattern] = useState(emptyPattern)
  const [bpm, setBpm] = useState(146)
  const [playing, setPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [downloadSeconds, setDownloadSeconds] = useState(5)
  const [isRendering, setIsRendering] = useState(false)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const downloadModalRef = useRef(null)

  const patternRef = useRef(pattern)
  const bpmRef = useRef(bpm)

  const isPatternEmpty = useMemo(
    () => Object.values(pattern).every((cells) => cells.every((on) => !on)),
    [pattern],
  )

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])

  const engine = useMemo(
    () =>
      createEngine({
        getPattern: () => patternRef.current,
        getBpm: () => bpmRef.current,
        onStep: setCurrentStep,
      }),
    [],
  )

  const togglePlay = useCallback(async () => {
    if (engine.isPlaying()) {
      engine.stop()
      setPlaying(false)
      return
    }
    await engine.play()
    setPlaying(true)
  }, [engine])

  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== 'Space') return
      const tag = event.target.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      event.preventDefault()
      togglePlay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay])

  useEffect(() => () => engine.stop(), [engine])

  const isPaintingRef = useRef(false)
  const paintValueRef = useRef(false)

  useEffect(() => {
    const onMouseUp = () => {
      isPaintingRef.current = false
    }
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [])

  function setCell(trackId, step, value) {
    setPattern((prev) => {
      if (prev[trackId][step] === value) return prev
      const next = { ...prev, [trackId]: [...prev[trackId]] }
      next[trackId][step] = value
      return next
    })
  }

  function startPaint(trackId, step) {
    const value = !pattern[trackId][step]
    isPaintingRef.current = true
    paintValueRef.current = value
    setCell(trackId, step, value)
  }

  function continuePaint(trackId, step) {
    if (!isPaintingRef.current) return
    setCell(trackId, step, paintValueRef.current)
  }

  const [bpmOpen, setBpmOpen] = useState(false)
  const bpmRootRef = useRef(null)

  useEffect(() => {
    if (!bpmOpen) return
    function onPointerDown(event) {
      if (bpmRootRef.current && !bpmRootRef.current.contains(event.target)) {
        setBpmOpen(false)
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setBpmOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [bpmOpen])

  useEffect(() => {
    if (!downloadModalOpen) return
    function onPointerDown(event) {
      if (downloadModalRef.current && !downloadModalRef.current.contains(event.target)) {
        setDownloadModalOpen(false)
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setDownloadModalOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [downloadModalOpen])

  async function handleDownload() {
    if (isRendering) return
    setIsRendering(true)
    try {
      const blob = await renderPatternToMp3({
        pattern: patternRef.current,
        bpm: bpmRef.current,
        durationSeconds: downloadSeconds,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `beat-${downloadSeconds}s.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setDownloadModalOpen(false)
    } finally {
      setIsRendering(false)
    }
  }

  return (
    <div className="app">
      <section className="deck">
        <header className="toolbar">
          <button
            type="button"
            className={['play', playing ? 'playing' : ''].filter(Boolean).join(' ')}
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            aria-pressed={playing}
          >
            <span className="play-pulse" />
            <span className="play-rim">
              <span className="play-shadow" />
              <span className="play-face">
                <span className="play-icon" key={playing ? 'pause' : 'play'}>
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </span>
              </span>
            </span>
          </button>

          <div className="bpm" ref={bpmRootRef}>
            <button
              type="button"
              className="bpm-trigger"
              onClick={() => setBpmOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={bpmOpen}
            >
              <span className="bpm-rim">
                <span className="bpm-shadow" />
                <span className="bpm-face">
                  <span className="bpm-label">BPM</span>
                  <span className="bpm-value">{bpm}</span>
                  <span className="bpm-caret">
                    <ChevronIcon />
                  </span>
                </span>
              </span>
            </button>
            {bpmOpen && (
              <ul className="bpm-menu" role="listbox">
                {BPM_OPTIONS.map((value) => (
                  <li key={value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={value === bpm}
                      className={['bpm-option', value === bpm ? 'selected' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        setBpm(value)
                        setBpmOpen(false)
                      }}
                    >
                      {value}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="spacer" />

          <button
            type="button"
            className="pill"
            onClick={() => setPattern(emptyPattern())}
            disabled={isPatternEmpty}
          >
            <span className="pill-rim">
              <span className="pill-shadow" />
              <span className="pill-face">
                <span className="pill-label">Clear</span>
              </span>
            </span>
          </button>
          <button type="button" className="pill pill-icon-only" onClick={() => setPattern(randomPattern())} title="Randomize pattern">
            <span className="pill-rim">
              <span className="pill-shadow" />
              <span className="pill-face">
                <img src={wandIcon} alt="Random" className="pill-icon" />
              </span>
            </span>
          </button>

          <button
            type="button"
            className="pill pill-icon-only"
            onClick={() => setDownloadModalOpen(true)}
            disabled={isPatternEmpty}
            title="Download as MP3"
          >
            <span className="pill-rim">
              <span className="pill-shadow" />
              <span className="pill-face">
                <DownloadIcon className="pill-icon" />
              </span>
            </span>
          </button>
        </header>

        {downloadModalOpen && (
          <div className="modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" aria-label="Export as MP3" ref={downloadModalRef}>
              <h2 className="modal-title">Export MP3</h2>
              <p className="modal-subtitle">Choose a length for your download</p>

              <div className="modal-duration">
                <div className="duration-track">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={downloadSeconds}
                    onChange={(event) => setDownloadSeconds(Number(event.target.value))}
                    className="duration-slider"
                    aria-label="Download length in seconds"
                  />
                </div>
                <span className="duration-value">{downloadSeconds}s</span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setDownloadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pill"
                  onClick={handleDownload}
                  disabled={isRendering || isPatternEmpty}
                >
                  <span className="pill-rim">
                    <span className="pill-shadow" />
                    <span className="pill-face">
                      <DownloadIcon className="pill-icon" />
                      <span className="pill-label">{isRendering ? 'Rendering…' : 'Download'}</span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="board">
          {TRACKS.map((track) => (
            <div className="row" key={track.id}>
              <button
                type="button"
                className="track-btn"
                style={{ color: track.color }}
                onClick={() => engine.tap(track.id)}
                title={`Preview ${track.name}`}
              >
                <img src={track.icon} alt="" className="track-icon" />
              </button>
              {pattern[track.id].map((on, step) => {
                const group = Math.floor(step / 4) % 2 === 0 ? 'group-a' : 'group-b'
                return (
                  <button
                    key={`${track.id}-${step}`}
                    type="button"
                    className={[
                      'cell',
                      group,
                      on ? 'on' : '',
                      currentStep === step ? 'playhead' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ '--accent': track.color }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      startPaint(track.id, step)
                    }}
                    onMouseEnter={() => continuePaint(track.id, step)}
                    aria-label={`${track.name} step ${step + 1}`}
                    aria-pressed={on}
                  />
                )
              })}
            </div>
          ))}
          <div className="step-numbers">
            <span className="gutter" />
            {Array.from({ length: STEPS }, (_, step) => (
              <span key={step} className={currentStep === step ? 'active' : ''}>
                {step + 1}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
