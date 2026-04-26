// Hi-Fi A: Bloomberg / Linear dark terminal
// Deep near-black bg, green accent, monospace data, pixel-sharp type, dense.

const A = {
  bg: '#0a0a0b',
  bg2: '#101013',
  bg3: '#16161a',
  line: 'rgba(255,255,255,0.06)',
  lineStrong: 'rgba(255,255,255,0.14)',
  text: '#e8e8ea',
  textSoft: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.38)',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  fontSans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

function AChip({ children, c = A.green, bg = 'rgba(34,197,94,0.12)', style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px',
      background: bg, color: c,
      borderRadius: 4,
      fontFamily: A.fontMono, fontSize: 10, fontWeight: 500,
      letterSpacing: '0.02em',
      ...style,
    }}>{children}</span>
  );
}

function HiFiADesktop() {
  const picked = STOCKS[0];
  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${A.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: A.fontMono, fontSize: 9, color: A.textFaint }}>v2.4</div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: A.bg3, borderRadius: 6, fontSize: 12, color: A.textFaint }}>
            <span style={{ fontFamily: A.fontMono }}>⌘K</span>
            <span>搜尋股票</span>
          </div>
        </div>
        <div style={{ padding: '12px 10px', flex: 1 }}>
          {[
            { g: '主選單', items: [['◎', '儀表板', true], ['◫', '除息行事曆'], ['★', '自選股 · 8'], ['▲', '高股息排行'], ['⊞', '視覺化分析']] },
            { g: '工具', items: [['ƒ', '再投入試算'], ['◈', '同業比較'], ['⌁', '提醒設定']] },
          ].map((s, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: A.textFaint, letterSpacing: '0.15em', padding: '4px 10px', marginBottom: 2, textTransform: 'uppercase' }}>{s.g}</div>
              {s.items.map(([ic, t, active], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 13, color: active ? A.text : A.textSoft, background: active ? A.bg3 : 'transparent', marginBottom: 1, borderLeft: active ? `2px solid ${A.green}` : '2px solid transparent' }}>
                  <span style={{ fontFamily: A.fontMono, width: 12, fontSize: 11, color: active ? A.green : A.textFaint }}>{ic}</span>
                  {t}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${A.line}`, padding: 14 }}>
          <div style={{ fontSize: 10, color: A.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>2026 累計領息</div>
          <div style={{ fontSize: 22, fontFamily: A.fontMono, fontWeight: 600, marginTop: 2 }}>$48,260</div>
          <div style={{ fontSize: 10, color: A.green, fontFamily: A.fontMono }}>▲ +12.4% YoY</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
          <div style={{ fontSize: 13, color: A.textSoft }}>儀表板</div>
          <div style={{ width: 4, height: 4, background: A.textFaint, borderRadius: 2 }} />
          <div style={{ fontSize: 13 }}>總覽</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: A.bg2, borderRadius: 6, fontSize: 11, fontFamily: A.fontMono, color: A.textSoft }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: A.green, boxShadow: `0 0 8px ${A.green}` }} />
            台股即時 · 13:24:08
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['↓', '⌁', '⚙'].map((i, j) => (
              <div key={j} style={{ width: 30, height: 30, borderRadius: 6, background: A.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: A.textSoft }}>{i}</div>
            ))}
          </div>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 20, display: 'grid', gridTemplateColumns: '1.55fr 1fr', gridTemplateRows: 'auto 1fr', gap: 14 }}>
          {/* KPI strip */}
          <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { l: '今日除息', v: '3', s: '2330 · 2454 · 2891', c: A.green },
              { l: '本週除息', v: '14', s: '自選 5 檔', c: A.text },
              { l: '待填息', v: '8', s: '最久 42 天', c: A.amber },
              { l: '下次發放', v: '05/22', s: '預估 $6,840', c: A.text },
            ].map((k, i) => (
              <div key={i} style={{ padding: '12px 16px', background: A.bg2, borderRadius: 10, border: `1px solid ${A.line}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 10, color: A.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k.l}</div>
                <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4, color: k.c, fontFamily: A.fontMono, letterSpacing: '-0.02em' }}>{k.v}</div>
                <div style={{ fontSize: 11, color: A.textSoft, fontFamily: A.fontMono, marginTop: 2 }}>{k.s}</div>
                <div style={{ position: 'absolute', right: 10, top: 10, width: 20, height: 20, borderRadius: 5, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: A.textFaint }}>→</div>
              </div>
            ))}
          </div>

          {/* Hero chart */}
          <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 600 }}>{picked.name}</div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 13, color: A.textFaint }}>{picked.code} · {picked.sector}</div>
                  <AChip>{picked.freq}</AChip>
                  <AChip c={A.green}>連 {picked.streak} 年配息</AChip>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                  <div style={{ fontSize: 44, fontWeight: 700, fontFamily: A.fontMono, letterSpacing: '-0.02em' }}>${picked.price}</div>
                  <div style={{ fontSize: 15, color: picked.chg >= 0 ? A.red : A.green, fontFamily: A.fontMono }}>
                    {picked.chg >= 0 ? '▲' : '▼'} +$5.50 ({picked.chg}%)
                  </div>
                  <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono }}>今日 · 13:24 更新</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: A.bg3, borderRadius: 7 }}>
                {['1D', '1W', '1M', '6M', '1Y', '5Y', 'MAX'].map((t, i) => (
                  <div key={i} style={{ padding: '5px 10px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 4, background: i === 3 ? A.bg : 'transparent', color: i === 3 ? A.text : A.textSoft, fontWeight: i === 3 ? 600 : 400 }}>{t}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, marginTop: 14 }}>
              <StockChart width={760} height={330} theme="dark" accent={A.green} label="近 6 個月" />
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${A.line}`, fontSize: 10, fontFamily: A.fontMono, color: A.textFaint }}>
              <span style={{ width: 8, height: 8, background: A.red, borderRadius: 2 }} />
              <span>除息缺口</span>
              <div style={{ width: 10 }} />
              <span style={{ width: 8, height: 2, background: A.green }} />
              <span>股價</span>
              <div style={{ flex: 1 }} />
              <span>成交量 ▎ 52週高 $1,142 ▎ 低 $892 ▎ PE 28.4</span>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
            <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 16, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>自選股</div>
                <div style={{ fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>8 · 依除息日</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 40px', gap: 8, fontSize: 9, color: A.textFaint, fontFamily: A.fontMono, padding: '0 4px 6px', borderBottom: `1px solid ${A.line}` }}>
                <div>名稱</div><div style={{ textAlign: 'right' }}>股價</div><div style={{ textAlign: 'right' }}>配息</div><div style={{ textAlign: 'right' }}>除息</div><div style={{ textAlign: 'right' }}>填</div>
              </div>
              {STOCKS.slice(0, 7).map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 40px', gap: 8, fontSize: 11, padding: '7px 4px', alignItems: 'center', borderBottom: `1px solid ${A.line}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontFamily: A.fontMono, fontSize: 9, color: A.textFaint }}>{s.code}</span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{s.name}</span>
                    </div>
                    <Spark w={80} h={14} up={s.chg >= 0} series={makeSeries(40, i + 2, 100, [])} theme="dark" />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: A.fontMono, fontSize: 11, fontWeight: 500 }}>{s.price}</div>
                    <div style={{ fontFamily: A.fontMono, fontSize: 9, color: s.chg >= 0 ? A.red : A.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: A.fontMono, fontSize: 11 }}>${s.cash}</div>
                  <div style={{ textAlign: 'right', fontFamily: A.fontMono, fontSize: 11, color: A.textSoft }}>{s.exDate}</div>
                  <div style={{ textAlign: 'right', fontFamily: A.fontMono, fontSize: 10, color: s.filled >= 100 ? A.green : A.amber }}>{s.filled}%</div>
                </div>
              ))}
            </div>

            <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>未來 7 日除息</div>
                <div style={{ fontSize: 10, color: A.green, fontFamily: A.fontMono }}>+3 自選</div>
              </div>
              {[
                { d: '04/23', w: '今日', n: 3, hi: true, total: '$4,500' },
                { d: '04/24', w: '週五', n: 1, total: '$980' },
                { d: '04/28', w: '週二', n: 2, total: '—' },
                { d: '04/30', w: '週四', n: 4, hi: true, total: '$2,130' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 3 ? `1px solid ${A.line}` : 'none' }}>
                  <div style={{ width: 48, fontFamily: A.fontMono, fontSize: 12 }}>{e.d}</div>
                  <div style={{ width: 36, fontSize: 11, color: e.hi ? A.green : A.textSoft }}>{e.w}</div>
                  <div style={{ flex: 1, fontSize: 12 }}>除息 <b>{e.n}</b> 檔{e.hi && <span style={{ color: A.green, marginLeft: 6 }}>● 含自選</span>}</div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 11, color: A.textSoft }}>{e.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HiFiAMobile() {
  const picked = STOCKS[0];
  return (
    <div style={{ width: 390, height: 844, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600, fontFamily: A.fontMono }}>
        <div>9:41</div>
        <div style={{ display: 'flex', gap: 5, fontSize: 11 }}>● ▌ ▰</div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: A.textFaint }}>午安，存股族</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>$48,260</div>
            <div style={{ fontSize: 11, color: A.green, fontFamily: A.fontMono }}>▲ 2026 累計領息 · +12.4%</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }} />
        </div>

        {/* Hero stock card */}
        <div style={{ background: A.bg2, borderRadius: 16, border: `1px solid ${A.line}`, padding: 16, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{picked.name}</div>
            <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{picked.code}</div>
            <AChip style={{ marginLeft: 'auto' }}>今日除息</AChip>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: A.fontMono }}>${picked.price}</div>
            <div style={{ fontSize: 12, color: A.red, fontFamily: A.fontMono }}>▲ +{picked.chg}%</div>
          </div>
          <StockChart width={340} height={130} theme="dark" accent={A.green} showCrosshair={false} />
          <div style={{ display: 'flex', gap: 4, padding: 3, background: A.bg3, borderRadius: 6, marginTop: 4 }}>
            {['1D', '1W', '1M', '6M', '1Y'].map((t, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '5px 0', fontSize: 11, fontFamily: A.fontMono, borderRadius: 4, background: i === 3 ? A.bg : 'transparent', color: i === 3 ? A.text : A.textSoft }}>{t}</div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${A.line}`, marginTop: 10, paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div><div style={{ fontSize: 9, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>配息</div><div style={{ fontFamily: A.fontMono, fontSize: 15, fontWeight: 600 }}>${picked.cash}</div></div>
            <div><div style={{ fontSize: 9, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>殖利率</div><div style={{ fontFamily: A.fontMono, fontSize: 15, fontWeight: 600 }}>{picked.yield}%</div></div>
            <div><div style={{ fontSize: 9, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>發放日</div><div style={{ fontFamily: A.fontMono, fontSize: 15, fontWeight: 600 }}>{picked.payDate}</div></div>
          </div>
        </div>

        <div style={{ marginTop: 14, marginBottom: 6, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>自選股</div>
          <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono }}>8 檔</div>
        </div>
        {STOCKS.slice(1, 4).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginTop: 6, background: A.bg2, borderRadius: 10, border: `1px solid ${A.line}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 10, color: A.textSoft }}>{s.code.slice(-3)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>除息 {s.exDate} · 配 ${s.cash}</div>
            </div>
            <Spark w={50} h={18} up={s.chg >= 0} series={makeSeries(30, i + 5, 100, [])} theme="dark" />
            <div style={{ textAlign: 'right', width: 64 }}>
              <div style={{ fontFamily: A.fontMono, fontSize: 13, fontWeight: 500 }}>${s.price}</div>
              <div style={{ fontFamily: A.fontMono, fontSize: 10, color: s.chg >= 0 ? A.red : A.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ borderTop: `1px solid ${A.line}`, background: A.bg2, padding: '10px 6px 28px', display: 'flex' }}>
        {[['◎', '儀表'], ['◫', '行事曆'], ['★', '自選'], ['▲', '排行'], ['◐', '我']].map(([ic, t], i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', color: i === 0 ? A.green : A.textFaint }}>
            <div style={{ fontFamily: A.fontMono, fontSize: 16 }}>{ic}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HiFiADesktop, HiFiAMobile, A });
