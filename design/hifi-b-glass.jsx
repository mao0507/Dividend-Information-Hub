// Hi-Fi B: Liquid Glass — iOS 26 style. Frosted panels over vivid gradient mesh background.

const B = {
  text: '#fff',
  textSoft: 'rgba(255,255,255,0.75)',
  textFaint: 'rgba(255,255,255,0.5)',
  glass: 'rgba(255,255,255,0.12)',
  glassStrong: 'rgba(255,255,255,0.22)',
  border: 'rgba(255,255,255,0.25)',
  green: '#4ade80',
  red: '#ff6b6b',
  fontSans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const glassBg = {
  background: 'radial-gradient(at 20% 20%, #ff6b9d 0%, transparent 45%), radial-gradient(at 80% 15%, #6366f1 0%, transparent 50%), radial-gradient(at 50% 85%, #06b6d4 0%, transparent 45%), radial-gradient(at 90% 90%, #f59e0b 0%, transparent 40%), #1a0b2e',
};

function GCard({ children, style, strong = false }) {
  return (
    <div style={{
      background: strong ? B.glassStrong : B.glass,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: `1px solid ${B.border}`,
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
      ...style,
    }}>{children}</div>
  );
}

function HiFiBDesktop() {
  const picked = STOCKS[0];
  return (
    <div style={{ width: 1440, height: 900, ...glassBg, color: B.text, fontFamily: B.fontSans, padding: 24, display: 'flex', gap: 20, overflow: 'hidden' }}>
      {/* Sidebar */}
      <GCard style={{ width: 200, padding: 18, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#4ade80,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>$</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '行事曆', '自選股', '排行榜', '分析', '試算', '提醒'].map((t, i) => (
          <div key={i} style={{ padding: '10px 12px', marginBottom: 3, borderRadius: 10, fontSize: 13, background: i === 0 ? 'rgba(255,255,255,0.2)' : 'transparent', color: i === 0 ? B.text : B.textSoft, fontWeight: i === 0 ? 600 : 400 }}>
            {t}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 14, marginTop: 10 }}>
          <div style={{ fontSize: 10, color: B.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>今年累計</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: B.fontMono, marginTop: 2 }}>$48,260</div>
        </div>
      </GCard>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { l: '今日除息', v: '3 檔', s: '含自選 1' },
            { l: '本週', v: '14 檔', s: '+5 自選' },
            { l: '平均殖利率', v: '5.82%', s: '你的組合' },
            { l: '下次發放', v: '05/22', s: '$6,840' },
          ].map((k, i) => (
            <GCard key={i} style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: B.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.l}</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, fontFamily: B.fontMono, letterSpacing: '-0.02em' }}>{k.v}</div>
              <div style={{ fontSize: 11, color: B.textSoft, fontFamily: B.fontMono, marginTop: 2 }}>{k.s}</div>
            </GCard>
          ))}
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, overflow: 'hidden' }}>
          <GCard strong style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.01em' }}>{picked.name}</div>
                  <div style={{ fontFamily: B.fontMono, fontSize: 14, color: B.textFaint }}>{picked.code}</div>
                  <div style={{ padding: '3px 10px', background: 'rgba(74,222,128,0.25)', color: B.green, borderRadius: 20, fontSize: 11, fontWeight: 500 }}>季配息</div>
                  <div style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 11 }}>連 20 年</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <div style={{ fontSize: 56, fontWeight: 700, fontFamily: B.fontMono, letterSpacing: '-0.03em' }}>${picked.price}</div>
                  <div style={{ fontSize: 17, color: B.red, fontFamily: B.fontMono, fontWeight: 500 }}>+$5.50 ({picked.chg}%)</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: `1px solid ${B.border}` }}>
                {['1D', '1W', '1M', '6M', '1Y', 'MAX'].map((t, i) => (
                  <div key={i} style={{ padding: '6px 12px', fontSize: 11, fontFamily: B.fontMono, borderRadius: 6, background: i === 3 ? 'rgba(255,255,255,0.3)' : 'transparent', color: B.text, fontWeight: i === 3 ? 600 : 400 }}>{t}</div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, marginTop: 16 }}>
              <StockChart width={760} height={340} theme="glass" accent={B.green} />
            </div>
          </GCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
            <GCard style={{ padding: 20, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>自選股</div>
              {STOCKS.slice(0, 5).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 4 ? `1px solid ${B.border}` : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: B.textFaint, fontFamily: B.fontMono }}>除息 {s.exDate} · {s.freq}</div>
                  </div>
                  <Spark w={60} h={22} up={s.chg >= 0} series={makeSeries(30, i + 4, 100, [])} theme="glass" />
                  <div style={{ textAlign: 'right', width: 70 }}>
                    <div style={{ fontFamily: B.fontMono, fontSize: 13, fontWeight: 500 }}>${s.price}</div>
                    <div style={{ fontFamily: B.fontMono, fontSize: 10, color: s.chg >= 0 ? B.red : B.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
                  </div>
                </div>
              ))}
            </GCard>

            <GCard style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: B.textSoft, fontStyle: 'italic', fontFamily: "'Instrument Serif', serif" }}>本月</div>
              <div style={{ fontSize: 38, fontWeight: 700, fontFamily: B.fontMono, letterSpacing: '-0.02em', marginTop: 2 }}>$6,840</div>
              <div style={{ fontSize: 11, color: B.textSoft }}>5 檔除息 · 3 檔待發放</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #4ade80, #06b6d4)' }} />
              </div>
            </GCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function HiFiBMobile() {
  const picked = STOCKS[0];
  return (
    <div style={{ width: 390, height: 844, ...glassBg, color: B.text, fontFamily: B.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600 }}>
        <div>9:41</div><div style={{ fontSize: 11 }}>● ▌ ▰</div>
      </div>
      <div style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: B.textFaint }}>午安</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>你的股息</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#06b6d4)' }} />
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GCard strong style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: B.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>2026 累計領息</div>
          <div style={{ fontSize: 34, fontWeight: 700, fontFamily: B.fontMono, letterSpacing: '-0.02em', marginTop: 2 }}>$48,260</div>
          <div style={{ fontSize: 11, color: B.green, fontFamily: B.fontMono }}>▲ +12.4% YoY · 目標達成 60%</div>
        </GCard>

        <GCard strong style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{picked.name}</div>
            <div style={{ fontFamily: B.fontMono, fontSize: 10, color: B.textFaint }}>{picked.code}</div>
            <div style={{ marginLeft: 'auto', padding: '2px 8px', background: 'rgba(74,222,128,0.3)', color: B.green, borderRadius: 10, fontSize: 10 }}>今日除息</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: B.fontMono }}>${picked.price}</div>
            <div style={{ fontSize: 13, color: B.red, fontFamily: B.fontMono }}>+{picked.chg}%</div>
          </div>
          <StockChart width={340} height={140} theme="glass" accent={B.green} showCrosshair={false} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${B.border}` }}>
            <div><div style={{ fontSize: 9, color: B.textFaint }}>配息</div><div style={{ fontFamily: B.fontMono, fontSize: 15, fontWeight: 600 }}>${picked.cash}</div></div>
            <div><div style={{ fontSize: 9, color: B.textFaint }}>殖利率</div><div style={{ fontFamily: B.fontMono, fontSize: 15, fontWeight: 600 }}>{picked.yield}%</div></div>
            <div><div style={{ fontSize: 9, color: B.textFaint }}>發放</div><div style={{ fontFamily: B.fontMono, fontSize: 15, fontWeight: 600 }}>{picked.payDate}</div></div>
          </div>
        </GCard>

        <div style={{ fontSize: 13, fontWeight: 600, color: B.textSoft, marginTop: 4 }}>本週除息</div>
        {STOCKS.slice(1, 3).map((s, i) => (
          <GCard key={i} style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: B.textFaint, fontFamily: B.fontMono }}>{s.exDate} · 配 ${s.cash}</div>
            </div>
            <Spark w={50} h={18} up={s.chg >= 0} series={makeSeries(30, i + 8, 100, [])} theme="glass" />
            <div style={{ textAlign: 'right', width: 60 }}>
              <div style={{ fontFamily: B.fontMono, fontSize: 13 }}>${s.price}</div>
              <div style={{ fontFamily: B.fontMono, fontSize: 10, color: s.chg >= 0 ? B.red : B.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
            </div>
          </GCard>
        ))}
      </div>

      <div style={{ margin: 10, padding: '10px 6px 24px', display: 'flex', ...{ background: B.glass, backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: `1px solid ${B.border}`, borderRadius: 24 } }}>
        {['儀表', '行事曆', '自選', '排行', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', color: i === 0 ? B.text : B.textFaint }}>
            <div style={{ width: 24, height: 24, margin: '0 auto 3px', borderRadius: 8, background: i === 0 ? 'rgba(255,255,255,0.25)' : 'transparent' }} />
            <div style={{ fontSize: 10 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HiFiBDesktop, HiFiBMobile, B, glassBg, GCard });
