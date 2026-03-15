import { useEffect, useRef } from 'react'

const PALETTE = [
  [139, 92, 246],
  [59, 130, 246],
  [6, 182, 212],
  [236, 72, 153],
  [245, 158, 11],
  [16, 185, 129],
]

function getY(line, x, w, h, t) {
  const progress = x / w
  const primary = Math.sin(x * line.frequency + t) * line.amplitude
  const secondary = Math.sin(x * line.harmonicFreq + t * 1.7) * line.amplitude * line.harmonic
  const slow = Math.sin(x * 0.0003 + t * 0.4 + line.phase) * line.amplitude * 0.5
  const drift = Math.sin(t * 0.15 + line.phase) * h * 0.03
  const edgeFade = Math.sin(progress * Math.PI)
  return line.baseY + (primary + secondary + slow) * edgeFade + drift
}

function SwirlyBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let time = 0
    let lines = []

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      initLines(canvas.width, canvas.height, dpr)
    }

    function initLines(w, h, dpr) {
      lines = []
      const count = 18
      for (let i = 0; i < count; i++) {
        const color = PALETTE[i % PALETTE.length]
        const nodeCount = 2 + Math.floor(Math.random() * 2) // 2 or 3
        const nodes = []
        for (let n = 0; n < nodeCount; n++) {
          nodes.push({
            speed: 0.0004 + Math.random() * 0.0008,
            offset: Math.random() * Math.PI * 2,
            radius: (3 + Math.random() * 2.5) * dpr,
          })
        }
        lines.push({
          baseY: (h * 0.15) + (h * 0.7) * (i / (count - 1)),
          amplitude: h * (0.06 + Math.random() * 0.12),
          frequency: 0.0008 + Math.random() * 0.0012,
          speed: 0.0003 + Math.random() * 0.0006,
          phase: Math.random() * Math.PI * 2,
          color,
          opacity: 0.12 + Math.random() * 0.18,
          width: (1.2 + Math.random() * 2.5) * dpr,
          harmonic: 0.3 + Math.random() * 0.5,
          harmonicFreq: 0.002 + Math.random() * 0.003,
          nodes,
        })
      }
    }

    function draw() {
      time++
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      for (const line of lines) {
        const t = time * line.speed + line.phase

        // Draw line
        ctx.beginPath()
        ctx.lineWidth = line.width
        ctx.strokeStyle = `rgba(${line.color[0]},${line.color[1]},${line.color[2]},${line.opacity})`
        ctx.lineCap = 'round'

        const segments = 200
        for (let i = 0; i <= segments; i++) {
          const x = (w * i) / segments
          const y = getY(line, x, w, h, t)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Draw nodes traveling along the line
        for (const node of line.nodes) {
          // Each node oscillates back and forth across the line
          // using a sine wave to get a smooth position between 0.1 and 0.9
          const rawProgress = Math.sin(time * node.speed + node.offset)
          const progress = 0.15 + (rawProgress * 0.5 + 0.5) * 0.7 // maps to 0.15–0.85
          const nx = w * progress
          const ny = getY(line, nx, w, h, t)

          // Solid circle
          ctx.beginPath()
          ctx.fillStyle = `rgba(${line.color[0]},${line.color[1]},${line.color[2]},${line.opacity + 0.15})`
          ctx.arc(nx, ny, node.radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div className="swirly-bg">
      <canvas ref={canvasRef} />
      <div className="swirly-overlay" />
      <div className="swirly-grain" />
    </div>
  )
}

export default SwirlyBackground
