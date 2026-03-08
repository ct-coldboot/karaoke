import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import BigInuLogo from './BigInuLogo';
import { useAnnouncements } from '../hooks/useAnnouncements';

function useControllerUrl() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/info')
      .then((r) => r.json())
      .then((d: { ip: string; controllerPort: number }) => {
        setUrl(`http://${d.ip}:${d.controllerPort}`);
      })
      .catch(() => {});
  }, []);
  return url;
}

function QRCodeCanvas({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, url, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(() => {});
    }
  }, [url]);
  return <canvas ref={ref} />;
}

export default function IdleMode() {
  useAnnouncements(true);
  const controllerUrl = useControllerUrl();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#ff0066', '#00eeff', '#ffe600', '#cc00ff', '#ffffff'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let animId: number;

    function draw() {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      <div style={styles.glow} />
      <div style={styles.logoWrap}>
        <BigInuLogo width={520} />
      </div>
      <div style={styles.subtitle}>
        ♪ &nbsp; Search for a song on your phone to get started &nbsp; ♪
      </div>
      <div style={styles.subtitleJa}>
        ♪ &nbsp; スマホで曲を検索して、カラオケを始めましょう &nbsp; ♪
      </div>

      {controllerUrl && (
        <div style={styles.qrWrap}>
          <QRCodeCanvas url={controllerUrl} />
          <div style={styles.qrLabel}>Scan to control</div>
        </div>
      )}

      <div style={{ ...styles.corner, top: 24, left: 24 }}>
        {(['#ff0066', '#00eeff', '#ffe600'] as const).map((c, i) => (
          <div key={i} style={{ ...styles.dot, background: c }} />
        ))}
      </div>
      <div style={{ ...styles.corner, top: 24, right: 24, flexDirection: 'row-reverse' as const }}>
        {(['#cc00ff', '#00eeff', '#ff0066'] as const).map((c, i) => (
          <div key={i} style={{ ...styles.dot, background: c }} />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: '#0a0014',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  glow: {
    position: 'absolute',
    width: 700,
    height: 400,
    background: 'radial-gradient(ellipse, rgba(204,0,0,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  logoWrap: {
    position: 'relative',
    zIndex: 1,
    filter: 'drop-shadow(0 0 40px rgba(204,0,0,0.6)) drop-shadow(0 4px 24px rgba(0,0,0,0.8))',
    animation: 'logoPulse 3s ease-in-out infinite',
  },
  subtitle: {
    marginTop: 40,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 20,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 2,
    position: 'relative',
    zIndex: 1,
  },
  subtitleJa: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 1,
    position: 'relative',
    zIndex: 1,
  },
  qrWrap: {
    marginTop: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    zIndex: 1,
    background: '#fff',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0 0 30px rgba(255,0,102,0.4)',
  },
  qrLabel: {
    color: '#000',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  corner: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
  },
};
