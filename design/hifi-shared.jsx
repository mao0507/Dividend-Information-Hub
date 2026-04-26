// Shared data + premium stock chart for hi-fi designs.

const STOCKS = [
  { code: '2330', name: '台○電', sector: '半導體', freq: '季配', cash: 4.5, stock: 0, exDate: '05/16', payDate: '07/11', yield: 2.1, filled: 100, price: 1085, chg: 0.5, streak: 20, fillDays: 3 },
  { code: '0056', name: '元大高股息', sector: 'ETF', freq: '季配', cash: 0.85, stock: 0, exDate: '04/18', payDate: '05/22', yield: 7.8, filled: 62, price: 43.62, chg: -0.3, streak: 17, fillDays: null },
  { code: '00878', name: '國泰永續高股息', sector: 'ETF', freq: '季配', cash: 0.55, stock: 0, exDate: '05/20', payDate: '06/18', yield: 6.9, filled: 45, price: 22.85, chg: 0.8, streak: 4, fillDays: null },
  { code: '00919', name: '群益台灣精選高息', sector: 'ETF', freq: '月配', cash: 0.11, stock: 0, exDate: '04/16', payDate: '05/15', yield: 10.2, filled: 100, price: 23.40, chg: 1.2, streak: 3, fillDays: 2 },
  { code: '2412', name: '中○電', sector: '電信', freq: '年配', cash: 4.75, stock: 0, exDate: '07/11', payDate: '08/15', yield: 4.3, filled: 88, price: 110.5, chg: 0.2, streak: 28, fillDays: 18 },
  { code: '2880', name: '華○金', sector: '金融', freq: '年配', cash: 1.1, stock: 0.1, exDate: '07/25', payDate: '08/20', yield: 4.5, filled: 30, price: 28.70, chg: -0.5, streak: 12, fillDays: null },
  { code: '1101', name: '台○', sector: '水泥', freq: '年配', cash: 1.0, stock: 0, exDate: '07/14', payDate: '08/11', yield: 3.1, filled: 72, price: 32.45, chg: 0.3, streak: 30, fillDays: null },
  { code: '2884', name: '玉○金', sector: '金融', freq: '年配', cash: 0.9, stock: 0.1, exDate: '04/24', payDate: '05/22', yield: 3.8, filled: 15, price: 24.20, chg: 0.1, streak: 15, fillDays: null },
];

// Build a realistic-looking stock price series with an ex-dividend gap.
function makeSeries(n = 180, seed = 1, startPrice = 100, divAt = [0.3, 0.6, 0.85], divPct = 0.035) {
  const rng = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(seed * 1000);
  const pts = [];
  let p = startPrice;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // slight upward drift + noise
    p *= 1 + (rng() - 0.48) * 0.018 + 0.0006;
    // ex-div gap
    divAt.forEach(d => {
      const idx = Math.floor(d * n);
      if (i === idx) p *= 1 - divPct;
    });
    pts.push(p);
  }
  return pts;
}

// Premium stock chart — gradient fill under line, ex-div markers, crosshair, grid.
// theme: 'dark' | 'glass' | 'soft'
function StockChart({
  width = 800, height = 320, series, theme = 'dark',
  accent = '#22c55e', divPoints = [0.3, 0.6, 0.85],
  showGrid = true, showCrosshair = true, label = '近 6 個月',
  hoverIndex,
}) {
  const W = width, H = height;
  const padL = 48, padR = 56, padT = 24, padB = 28;
  const inner = { w: W - padL - padR, h: H - padT - padB };
  const s = series || makeSeries(180, 7, 100, divPoints);
  const min = Math.min(...s) * 0.995;
  const max = Math.max(...s) * 1.005;
  const x = i => padL + (i / (s.length - 1)) * inner.w;
  const y = v => padT + (1 - (v - min) / (max - min)) * inner.h;

  const pathLine = s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const pathFill = `${pathLine} L ${x(s.length - 1).toFixed(1)} ${y(min).toFixed(1)} L ${x(0).toFixed(1)} ${y(min).toFixed(1)} Z`;

  const themes = {
    dark: { bg: 'transparent', grid: 'rgba(255,255,255,0.05)', label: 'rgba(255,255,255,0.4)', labelStrong: 'rgba(255,255,255,0.85)', divColor: '#ef4444' },
    glass: { bg: 'transparent', grid: 'rgba(255,255,255,0.18)', label: 'rgba(255,255,255,0.65)', labelStrong: 'rgba(255,255,255,0.95)', divColor: '#ff6b6b' },
    soft: { bg: 'transparent', grid: 'rgba(0,0,0,0.06)', label: 'rgba(30,30,30,0.4)', labelStrong: 'rgba(20,20,20,0.85)', divColor: '#dc2626' },
  };
  const th = themes[theme];
  const gradId = `g-${theme}-${Math.random().toString(36).slice(2, 7)}`;

  // Y grid ticks
  const yTicks = 4;
  const ticks = [];
  for (let i = 0; i <= yTicks; i++) {
    const v = min + (max - min) * (i / yTicks);
    ticks.push(v);
  }

  // X labels (approx months)
  const xLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

  const hoverI = hoverIndex ?? Math.floor(s.length * 0.72);
  const hv = s[hoverI];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={theme === 'dark' ? 0.35 : theme === 'glass' ? 0.45 : 0.25} />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showGrid && ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={th.grid} strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 4'} />
          <text x={W - padR + 8} y={y(t) + 4} fill={th.label} fontSize="10" fontFamily="'JetBrains Mono', monospace">${t.toFixed(2)}</text>
        </g>
      ))}

      {xLabels.map((m, i) => (
        <text key={i} x={padL + (i / (xLabels.length - 1)) * inner.w} y={H - padB + 16} fill={th.label} fontSize="10" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">{m}</text>
      ))}

      {/* Ex-div markers */}
      {divPoints.map((d, i) => {
        const dx = padL + d * inner.w;
        return (
          <g key={i}>
            <line x1={dx} x2={dx} y1={padT} y2={H - padB} stroke={th.divColor} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
            <circle cx={dx} cy={padT + 6} r="3" fill={th.divColor} />
          </g>
        );
      })}

      <path d={pathFill} fill={`url(#${gradId})`} />
      <path d={pathLine} fill="none" stroke={accent} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />

      {/* Crosshair on hover index */}
      {showCrosshair && (
        <g>
          <line x1={x(hoverI)} x2={x(hoverI)} y1={padT} y2={H - padB} stroke={th.label} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <circle cx={x(hoverI)} cy={y(hv)} r="5" fill={theme === 'soft' ? '#fff' : '#0a0a0a'} stroke={accent} strokeWidth="2" />
          <g transform={`translate(${x(hoverI) + 10}, ${y(hv) - 30})`}>
            <rect x="0" y="0" width="88" height="40" rx="6" fill={theme === 'soft' ? '#0a0a0a' : 'rgba(255,255,255,0.08)'} />
            <text x="10" y="16" fill={theme === 'soft' ? '#fff' : th.labelStrong} fontSize="10" fontFamily="'JetBrains Mono', monospace">04/02 · 週三</text>
            <text x="10" y="32" fill={accent} fontSize="13" fontFamily="'JetBrains Mono', monospace" fontWeight="600">${hv.toFixed(2)}</text>
          </g>
        </g>
      )}
    </svg>
  );
}

// Small sparkline — accepts numeric or 100% width via viewBox.
function Spark({ w = 120, h = 36, series, up = true, theme = 'dark' }) {
  const VB = 120;
  const s = series || makeSeries(60, 3, 100, []);
  const min = Math.min(...s), max = Math.max(...s);
  const path = s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (s.length - 1)) * VB} ${(1 - (v - min) / (max - min)) * h}`).join(' ');
  const color = up ? (theme === 'soft' ? '#dc2626' : '#ef4444') : '#22c55e'; // 台股慣例紅漲綠跌
  const isNum = typeof w === 'number';
  return (
    <svg width={isNum ? w : '100%'} height={h} viewBox={`0 0 ${VB} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Calendar mini-dot data for hero
function monthEvents(month = 4) {
  return {
    2: ['0056'], 8: ['1101·發'], 16: ['00919'], 18: ['0056'],
    20: ['00878'], 23: ['2330', '2454', '2891'], 24: ['2884'], 25: ['2880'],
  };
}

Object.assign(window, { STOCKS, makeSeries, StockChart, Spark, monthEvents });
