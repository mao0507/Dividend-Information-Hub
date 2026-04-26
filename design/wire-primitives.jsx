// Shared wireframe primitives — boxes, placeholders, tiny icons.
// Everything b&w + sketchy, restrained accent colors only for financial semantics.

const WF = {
  ink: '#1a1a1a',
  inkSoft: '#555',
  inkFaint: '#888',
  paper: '#fafaf7',
  line: '#1a1a1a',
  lineSoft: '#bbb',
  lineFaint: '#e5e5e0',
  red: '#c44',
  green: '#3a7',
  blue: '#47a',
  hi: '#ffeaa0',
  fontHand: "'Kalam', 'Caveat', cursive",
  fontHead: "'Caveat', cursive",
  fontBody: "'Noto Sans TC', 'Kalam', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// Sketchy border via double-outline trick + slight rotation, but kept simple.
const sketchBorder = (c = WF.line, w = 1.5) => ({
  border: `${w}px solid ${c}`,
  borderRadius: '3px',
});

// Hatched placeholder block (diagonal stripes)
function Hatch({ w, h, label, style, dense = false }) {
  const stripe = dense
    ? 'repeating-linear-gradient(-45deg, transparent 0 4px, rgba(0,0,0,0.08) 4px 5px)'
    : 'repeating-linear-gradient(-45deg, transparent 0 7px, rgba(0,0,0,0.06) 7px 8px)';
  return (
    <div style={{
      width: w, height: h,
      background: stripe,
      border: `1px dashed ${WF.lineSoft}`,
      borderRadius: 3,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: WF.fontMono, fontSize: 10, color: WF.inkFaint,
      letterSpacing: '0.05em',
      ...style,
    }}>
      {label}
    </div>
  );
}

// Handwritten label
function H({ children, size = 22, c = WF.ink, style, as = 'div' }) {
  const Tag = as;
  return (
    <Tag style={{
      fontFamily: WF.fontHead,
      fontSize: size,
      color: c,
      lineHeight: 1.1,
      fontWeight: 700,
      ...style,
    }}>{children}</Tag>
  );
}

// Body text (scrawly but readable)
function T({ children, size = 12, c = WF.ink, weight = 400, style, mono = false }) {
  return (
    <div style={{
      fontFamily: mono ? WF.fontMono : WF.fontBody,
      fontSize: size,
      color: c,
      fontWeight: weight,
      lineHeight: 1.35,
      ...style,
    }}>{children}</div>
  );
}

// A fake line of text — used to signal "words go here" without committing copy
function FakeLine({ w = '100%', h = 8, style }) {
  return <div style={{ width: w, height: h, background: WF.lineFaint, borderRadius: 2, ...style }} />;
}

// Button (sketchy)
function Btn({ children, style, primary = false, small = false }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: small ? '4px 10px' : '7px 14px',
      border: `1.5px solid ${WF.line}`,
      background: primary ? WF.ink : 'transparent',
      color: primary ? WF.paper : WF.ink,
      borderRadius: 4,
      fontFamily: WF.fontBody,
      fontSize: small ? 11 : 13,
      fontWeight: 500,
      cursor: 'pointer',
      ...style,
    }}>{children}</div>
  );
}

// Tag / pill
function Pill({ children, c, bg, style }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      border: `1px solid ${c || WF.line}`,
      background: bg || 'transparent',
      color: c || WF.ink,
      borderRadius: 10,
      fontFamily: WF.fontBody,
      fontSize: 10,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// Section frame with dashed heading
function Frame({ title, children, style, headRight, dense }) {
  return (
    <div style={{
      border: `1.5px solid ${WF.line}`,
      borderRadius: 4,
      background: WF.paper,
      padding: dense ? '10px 12px' : '14px 16px',
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 10, paddingBottom: 6,
          borderBottom: `1px dashed ${WF.lineSoft}`,
        }}>
          <H size={20}>{title}</H>
          {headRight && <div style={{ fontFamily: WF.fontMono, fontSize: 10, color: WF.inkFaint }}>{headRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// Fake sparkline - ex-dividend gap style
function Sparkline({ w = 120, h = 36, gap = true, dropAt = 0.45, trend = 'up' }) {
  // Use a fixed internal viewBox width so w can be "100%" or numeric.
  const VB = 120;
  const isNumeric = typeof w === 'number';
  const pts = [];
  const N = 30;
  let y = 0.5;
  for (let i = 0; i < N; i++) {
    y += (Math.sin(i * 0.7) * 0.04) + (trend === 'up' ? 0.005 : -0.003);
    const gx = i / (N - 1);
    let gy = y;
    if (gap && gx > dropAt && gx < dropAt + 0.03) {
      // gap
    } else if (gap && gx >= dropAt + 0.03) {
      gy = y - 0.12;
    }
    pts.push([gx * VB, (1 - Math.max(0, Math.min(1, gy))) * h]);
  }
  const before = pts.filter((_, i) => i / (N - 1) <= dropAt);
  const after = pts.filter((_, i) => i / (N - 1) > dropAt + 0.03);
  const path1 = before.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const path2 = after.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const gapX = dropAt * VB;
  return (
    <svg
      width={isNumeric ? w : '100%'}
      height={h}
      viewBox={`0 0 ${VB} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <path d={path1} stroke={WF.ink} fill="none" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <path d={path2} stroke={WF.green} fill="none" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      {gap && (
        <>
          <line x1={gapX} y1={0} x2={gapX} y2={h} stroke={WF.red} strokeDasharray="2 2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx={gapX} cy={h / 2} r="2" fill={WF.red} />
        </>
      )}
    </svg>
  );
}

// Tiny doughnut/progress ring for 填息
function FillRing({ pct = 62, size = 36, label }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={WF.lineFaint} strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct >= 100 ? WF.green : WF.blue}
          strokeWidth="3" strokeDasharray={`${dash} ${c}`} strokeDashoffset={c/4} transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: WF.fontMono, fontSize: 9, color: WF.ink,
      }}>{label ?? `${pct}%`}</div>
    </div>
  );
}

// Sample data — recognizable Taiwan dividend stocks, no branded UI
const SAMPLE_STOCKS = [
  { code: '2330', name: '台○電', freq: '季配', cash: 4.5, stock: 0, exDate: '05/16', payDate: '07/11', yield: 2.1, filled: 100, nextEst: '08/15', price: 1085, chg: 0.5 },
  { code: '0056', name: '高股息ETF', freq: '季配', cash: 0.85, stock: 0, exDate: '04/18', payDate: '05/22', yield: 7.8, filled: 62, nextEst: '07/18', price: 43.62, chg: -0.3 },
  { code: '00878', name: '國民ETF', freq: '季配', cash: 0.55, stock: 0, exDate: '05/20', payDate: '06/18', yield: 6.9, filled: 45, nextEst: '08/20', price: 22.85, chg: 0.8 },
  { code: '00919', name: '月月配ETF', freq: '月配', cash: 0.11, stock: 0, exDate: '04/16', payDate: '05/15', yield: 10.2, filled: 100, nextEst: '05/16', price: 23.40, chg: 1.2 },
  { code: '2412', name: '中○電', freq: '年配', cash: 4.75, stock: 0, exDate: '07/11', payDate: '08/15', yield: 4.3, filled: 88, nextEst: '07/11', price: 110.5, chg: 0.2 },
  { code: '2880', name: '華○金', freq: '年配', cash: 1.1, stock: 0.1, exDate: '07/25', payDate: '08/20', yield: 4.5, filled: 30, nextEst: '07/25', price: 28.70, chg: -0.5 },
  { code: '2002', name: '中○', freq: '年配', cash: 0.5, stock: 0, exDate: '08/04', payDate: '09/01', yield: 1.8, filled: 0, nextEst: '08/04', price: 28.15, chg: -1.1 },
  { code: '1101', name: '台○', freq: '年配', cash: 1.0, stock: 0, exDate: '07/14', payDate: '08/11', yield: 3.1, filled: 72, nextEst: '07/14', price: 32.45, chg: 0.3 },
];

Object.assign(window, { WF, Hatch, H, T, FakeLine, Btn, Pill, Frame, Sparkline, FillRing, SAMPLE_STOCKS, sketchBorder });
