// Hi-Fi C: Soft / Copilot-ish — warm off-white, generous radii, soft elevated shadows, humane.

const C = {
  bg: '#f4f1ec',
  surface: '#fbfaf7',
  surfaceAlt: '#f7f4ee',
  ink: '#1d1b17',
  inkSoft: '#6b6458',
  inkFaint: '#a39d90',
  line: 'rgba(60,50,30,0.08)',
  green: '#16a34a',
  red: '#dc2626',
  amber: '#ea580c',
  blue: '#2563eb',
  lavender: '#7c3aed',
  shadow: '0 2px 4px rgba(60,40,20,0.04), 0 12px 32px -8px rgba(60,40,20,0.12)',
  shadowSoft: '0 1px 2px rgba(60,40,20,0.04), 0 6px 20px -6px rgba(60,40,20,0.1)',
  fontSans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
  fontSerif: "'Instrument Serif', serif",
  fontMono: "'JetBrains Mono', monospace",
};

function CCard({ children, style, padding = 20 }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 20,
      padding,
      boxShadow: C.shadowSoft,
      ...style,
    }}>{children}</div>
  );
}

function HiFiCDesktop() {
  const picked = STOCKS[0];
  return (
    <div style={{ width: 1440, height: 900, background: C.bg, color: C.ink, fontFamily: C.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 240, padding: '22px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: C.ink, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSerif, fontStyle: 'italic', fontSize: 18, fontWeight: 400 }}>$</div>
          <div style={{ fontSize: 17, fontWeight: 600, fontFamily: C.fontSerif, letterSpacing: '-0.01em' }}>股息站</div>
        </div>

        <div style={{ padding: '0 10px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: C.surface, borderRadius: 10, fontSize: 12, color: C.inkFaint, boxShadow: C.shadowSoft }}>
            <span>🔍</span> 搜尋 <span style={{ marginLeft: 'auto', fontFamily: C.fontMono, fontSize: 10 }}>⌘K</span>
          </div>
        </div>

        {[
          { items: [['◆', '總覽', true], ['◷', '行事曆'], ['♥', '自選 · 8'], ['▲', '排行榜'], ['✦', '分析']] },
          { title: '工具', items: [['ƒ', '再投入試算'], ['⚖', '同業比較'], ['◔', '提醒']] },
        ].map((g, gi) => (
          <div key={gi} style={{ marginTop: gi > 0 ? 18 : 4 }}>
            {g.title && <div style={{ fontSize: 10, color: C.inkFaint, padding: '0 10px', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{g.title}</div>}
            {g.items.map(([ic, t, active], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13, background: active ? C.surface : 'transparent', color: active ? C.ink : C.inkSoft, fontWeight: active ? 600 : 400, marginBottom: 2, boxShadow: active ? C.shadowSoft : 'none' }}>
                <span style={{ width: 14, fontSize: 13, color: active ? C.lavender : C.inkFaint }}>{ic}</span>{t}
              </div>
            ))}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <CCard style={{ margin: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: C.inkFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>2026 累計</div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 2, fontFamily: C.fontSerif, fontStyle: 'italic', letterSpacing: '-0.02em' }}>$48,260</div>
          <div style={{ fontSize: 11, color: C.green }}>↑ +12.4% 較去年</div>
        </CCard>
      </div>

      <div style={{ flex: 1, padding: '22px 28px', display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: C.inkFaint }}>2026 年 4 月 23 日 · 週四</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 2, fontFamily: C.fontSerif, letterSpacing: '-0.01em' }}>午安，今天有 <span style={{ fontStyle: 'italic' }}>3 檔</span> 自選股除息</div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 18, overflow: 'hidden' }}>
          <CCard padding={28} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#fde68a,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontMono, fontSize: 11, fontWeight: 600 }}>2330</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 600, fontFamily: C.fontSerif, letterSpacing: '-0.01em' }}>{picked.name}</div>
                    <div style={{ fontSize: 12, color: C.inkFaint }}>半導體 · 台灣 50 · <span style={{ color: C.green, fontWeight: 500 }}>今日除息</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 16 }}>
                  <div style={{ fontSize: 52, fontWeight: 700, fontFamily: C.fontMono, letterSpacing: '-0.03em' }}>${picked.price}</div>
                  <div style={{
                    padding: '4px 10px', background: 'rgba(220,38,38,0.1)', color: C.red,
                    borderRadius: 8, fontSize: 13, fontFamily: C.fontMono, fontWeight: 600,
                  }}>▲ +$5.50 · +{picked.chg}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 4, background: C.surfaceAlt, borderRadius: 12 }}>
                {['1D', '1W', '1M', '6M', '1Y', 'MAX'].map((t, i) => (
                  <div key={i} style={{ padding: '6px 12px', fontSize: 11, fontFamily: C.fontMono, borderRadius: 8, background: i === 3 ? C.ink : 'transparent', color: i === 3 ? C.surface : C.inkSoft, fontWeight: i === 3 ? 600 : 400 }}>{t}</div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, marginTop: 18 }}>
              <StockChart width={760} height={340} theme="soft" accent={C.lavender} />
            </div>
          </CCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: '今日除息', v: '3', s: '含自選 1', color: C.green },
                { l: '本月入帳', v: '$6,840', s: '5 檔', color: C.lavender },
                { l: '殖利率', v: '5.82%', s: '組合均值', color: C.blue },
                { l: '穩定度', v: '8.6', s: '/ 10', color: C.amber },
              ].map((k, i) => (
                <CCard key={i} padding={16}>
                  <div style={{ fontSize: 11, color: C.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.l}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: k.color, fontFamily: C.fontMono, letterSpacing: '-0.02em' }}>{k.v}</div>
                  <div style={{ fontSize: 10, color: C.inkFaint, marginTop: 2 }}>{k.s}</div>
                </CCard>
              ))}
            </div>

            <CCard padding={18} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>自選股</div>
                <div style={{ fontSize: 11, color: C.inkFaint }}>8 檔</div>
              </div>
              {STOCKS.slice(0, 5).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 4 ? `1px solid ${C.line}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: ['#fde68a', '#fbcfe8', '#bbf7d0', '#bae6fd', '#ddd6fe'][i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontMono, fontSize: 9, fontWeight: 600 }}>{s.code.slice(-3)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: C.inkFaint }}>{s.freq} · 除息 {s.exDate}</div>
                  </div>
                  <Spark w={50} h={18} up={s.chg >= 0} series={makeSeries(30, i + 3, 100, [])} theme="soft" />
                  <div style={{ textAlign: 'right', width: 60 }}>
                    <div style={{ fontFamily: C.fontMono, fontSize: 13, fontWeight: 500 }}>${s.price}</div>
                    <div style={{ fontFamily: C.fontMono, fontSize: 10, color: s.chg >= 0 ? C.red : C.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
                  </div>
                </div>
              ))}
            </CCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function HiFiCMobile() {
  const picked = STOCKS[0];
  return (
    <div style={{ width: 390, height: 844, background: C.bg, color: C.ink, fontFamily: C.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600 }}>
        <div>9:41</div><div style={{ fontSize: 11 }}>● ▌ ▰</div>
      </div>
      <div style={{ padding: '4px 18px 10px', display: 'flex', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: C.inkFaint }}>2026 年 4 月 23 日</div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: C.fontSerif, letterSpacing: '-0.01em' }}>午安 <span style={{ fontStyle: 'italic' }}>存股族</span></div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.surface, boxShadow: C.shadowSoft }} />
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <CCard padding={16}>
          <div style={{ fontSize: 10, color: C.inkFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>2026 累計領息</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: C.fontMono, letterSpacing: '-0.02em', marginTop: 2 }}>$48,260</div>
          <div style={{ fontSize: 11, color: C.green }}>↑ +12.4% YoY</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {[0.6, 0.8, 1, 0.7, 0.9, 0.5, 0.75, 0.88, 0.95, 0.6, 0.72, 0.85].map((h, i) => (
              <div key={i} style={{ flex: 1, height: 28, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: `${h * 100}%`, background: i === 3 ? C.lavender : C.surfaceAlt, borderRadius: 3, border: i === 3 ? 'none' : `1px solid ${C.line}` }} />
              </div>
            ))}
          </div>
        </CCard>

        <CCard padding={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#fde68a,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontMono, fontSize: 10, fontWeight: 600 }}>2330</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: C.fontSerif, letterSpacing: '-0.01em' }}>{picked.name}</div>
              <div style={{ fontSize: 10, color: C.inkFaint }}>今日除息 · 季配</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: C.fontMono }}>${picked.price}</div>
              <div style={{ fontSize: 11, color: C.red, fontFamily: C.fontMono }}>+{picked.chg}%</div>
            </div>
          </div>
          <StockChart width={340} height={140} theme="soft" accent={C.lavender} showCrosshair={false} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
            <div><div style={{ fontSize: 9, color: C.inkFaint }}>配息</div><div style={{ fontFamily: C.fontMono, fontSize: 15, fontWeight: 600 }}>${picked.cash}</div></div>
            <div><div style={{ fontSize: 9, color: C.inkFaint }}>殖利率</div><div style={{ fontFamily: C.fontMono, fontSize: 15, fontWeight: 600 }}>{picked.yield}%</div></div>
            <div><div style={{ fontSize: 9, color: C.inkFaint }}>發放</div><div style={{ fontFamily: C.fontMono, fontSize: 15, fontWeight: 600 }}>{picked.payDate}</div></div>
          </div>
        </CCard>

        <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, fontFamily: C.fontSerif, fontStyle: 'italic', marginTop: 2 }}>自選股</div>
        {STOCKS.slice(1, 3).map((s, i) => (
          <CCard key={i} padding={12} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: ['#fbcfe8', '#bbf7d0'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontMono, fontSize: 9, fontWeight: 600 }}>{s.code.slice(-3)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: C.inkFaint }}>{s.exDate} · ${s.cash}</div>
            </div>
            <Spark w={50} h={18} up={s.chg >= 0} series={makeSeries(30, i + 7, 100, [])} theme="soft" />
            <div style={{ textAlign: 'right', width: 56 }}>
              <div style={{ fontFamily: C.fontMono, fontSize: 13 }}>${s.price}</div>
              <div style={{ fontFamily: C.fontMono, fontSize: 10, color: s.chg >= 0 ? C.red : C.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
            </div>
          </CCard>
        ))}
      </div>

      <div style={{ margin: 14, padding: '10px 6px 26px', display: 'flex', background: C.surface, borderRadius: 24, boxShadow: C.shadow }}>
        {[['◆','儀表'],['◷','行事曆'],['♥','自選'],['▲','排行'],['◐','我']].map(([ic, t], i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', color: i === 0 ? C.lavender : C.inkFaint }}>
            <div style={{ fontSize: 16 }}>{ic}</div>
            <div style={{ fontSize: 10, marginTop: 2, fontWeight: i === 0 ? 600 : 400 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HiFiCDesktop, HiFiCMobile, C, CCard });
