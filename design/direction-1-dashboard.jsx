// Direction 1: Dashboard 高密度
// 存股族一眼掃完所有重要資訊。類 Linear/Bloomberg terminal 但極簡。
// 左側 nav、中間主要資訊、右側次要。資訊密度刻意拉高。

function Dir1DesktopDashboard() {
  return (
    <div style={{ width: 1200, height: 780, background: WF.paper, color: WF.ink, display: 'flex', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      {/* Left nav */}
      <div style={{ width: 180, borderRight: `1.5px solid ${WF.line}`, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <H size={22} style={{ marginBottom: 14 }}>股息站</H>
        <T size={10} c={WF.inkFaint} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>主選單</T>
        {['儀表板 ●', '除息行事曆', '自選股', '排行榜', '個股查詢', '年度總覽', '再投入試算', '產業比較', '提醒設定'].map((t, i) => (
          <div key={i} style={{
            padding: '6px 8px', fontSize: 13,
            background: i === 0 ? WF.ink : 'transparent',
            color: i === 0 ? WF.paper : WF.ink,
            borderRadius: 3,
          }}>{t}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px dashed ${WF.lineSoft}`, paddingTop: 10, marginTop: 10 }}>
          <T size={10} c={WF.inkFaint}>2026 年度累計領息</T>
          <H size={26} style={{ marginTop: 2 }}>NT$ 48,260</H>
          <T size={10} c={WF.green} style={{ marginTop: 2 }}>+12.4% vs 去年同期</T>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '14px 18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Top strip — today's key info */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: '今日除息', v: '3 檔', s: '0056 · 00919 · 2884' },
            { l: '本週除息', v: '14 檔', s: '自選中 5 檔' },
            { l: '待填息', v: '8 檔', s: '最久 42 天' },
            { l: '下次發放', v: '05/22', s: '預估 NT$ 6,840' },
          ].map((k, i) => (
            <div key={i} style={{ flex: 1, border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: '8px 12px' }}>
              <T size={10} c={WF.inkFaint}>{k.l}</T>
              <H size={22} style={{ marginTop: 2 }}>{k.v}</H>
              <T size={10} c={WF.inkSoft} mono style={{ marginTop: 2 }}>{k.s}</T>
            </div>
          ))}
        </div>

        {/* Middle — watchlist table + sidebar */}
        <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
          <Frame title="我的自選股配息追蹤" headRight="8 檔 · 依除息日排序" style={{ flex: 1.6, display: 'flex', flexDirection: 'column' }} dense>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 70px 50px 80px 55px 55px 60px 65px 80px 1fr', gap: 6, fontSize: 10, color: WF.inkFaint, paddingBottom: 6, borderBottom: `1px dashed ${WF.lineFaint}` }}>
              <div>代號</div><div>名稱</div><div>頻率</div><div>股價</div><div>現金</div><div>股票</div><div>殖利率</div><div>除息日</div><div>填息</div><div>走勢</div>
            </div>
            {SAMPLE_STOCKS.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 70px 50px 80px 55px 55px 60px 65px 80px 1fr', gap: 6, fontSize: 12, alignItems: 'center', padding: '7px 0', borderBottom: `1px dashed ${WF.lineFaint}` }}>
                <T mono size={11}>{s.code}</T>
                <T size={12}>{s.name}</T>
                <Pill style={{ fontSize: 9 }}>{s.freq}</Pill>
                <div>
                  <T mono size={12} weight={500}>${s.price}</T>
                  <T mono size={9} c={s.chg >= 0 ? WF.red : WF.green}>{s.chg >= 0 ? '+' : ''}{s.chg}%</T>
                </div>
                <T mono size={11}>{s.cash.toFixed(2)}</T>
                <T mono size={11} c={s.stock ? WF.ink : WF.inkFaint}>{s.stock ? s.stock.toFixed(2) : '—'}</T>
                <T mono size={11} c={s.yield >= 6 ? WF.green : WF.ink}>{s.yield}%</T>
                <T mono size={11}>{s.exDate}</T>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 5, background: WF.lineFaint, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${s.filled}%`, height: '100%', background: s.filled >= 100 ? WF.green : WF.blue }} />
                  </div>
                  <T mono size={9} c={WF.inkSoft}>{s.filled}%</T>
                </div>
                <Sparkline w={80} h={22} dropAt={0.4 + (i % 3) * 0.08} />
              </div>
            ))}
          </Frame>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Frame title="未來 14 天" dense style={{ flex: 1 }}>
              {[
                { d: '04/23', w: '四', n: 3, hi: true },
                { d: '04/24', w: '五', n: 1 },
                { d: '04/28', w: '二', n: 2 },
                { d: '05/02', w: '五', n: 4, hi: true },
                { d: '05/06', w: '二', n: 1 },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 4 ? `1px dashed ${WF.lineFaint}` : 'none' }}>
                  <div style={{ width: 42, textAlign: 'center', padding: '3px 0', border: `1px solid ${e.hi ? WF.red : WF.lineSoft}`, borderRadius: 3, background: e.hi ? '#fff0ef' : 'transparent' }}>
                    <T mono size={11} weight={500}>{e.d}</T>
                    <T size={9} c={WF.inkFaint}>{e.w}</T>
                  </div>
                  <div style={{ flex: 1 }}>
                    <T size={12}>{e.n} 檔除息{e.hi ? ' · 含自選' : ''}</T>
                    <FakeLine h={5} w="80%" style={{ marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </Frame>

            <Frame title="穩定度評分 Top" dense style={{ flex: 1 }}>
              {[
                { c: '2412', n: '中○電', s: 9.6 },
                { c: '1101', n: '台○', s: 9.2 },
                { c: '2880', n: '華○金', s: 8.8 },
                { c: '0056', n: '高息ETF', s: 8.4 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                  <T mono size={10} c={WF.inkFaint}>#{i+1}</T>
                  <T mono size={11}>{r.c}</T>
                  <T size={12} style={{ flex: 1 }}>{r.n}</T>
                  <div style={{ width: 60, height: 6, background: WF.lineFaint, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${r.s * 10}%`, height: '100%', background: WF.ink }} />
                  </div>
                  <T mono size={11} weight={500}>{r.s}</T>
                </div>
              ))}
            </Frame>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dir1MobileDashboard() {
  return (
    <div style={{ width: 320, height: 640, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 8px', borderBottom: `1.5px solid ${WF.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <H size={22}>股息站</H>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🔔</div>
            <div style={{ width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: 3 }} />
          </div>
        </div>
        <T size={10} c={WF.inkFaint} style={{ marginTop: 2 }}>2026 · 4 月</T>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12, background: WF.ink, color: WF.paper }}>
          <T size={10} c="rgba(255,255,255,0.7)">年度累計領息</T>
          <H size={32} c={WF.paper} style={{ marginTop: 4 }}>NT$ 48,260</H>
          <T size={10} c="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>目標 80,000 · 已達 60%</T>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: WF.paper }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 10 }}>
            <T size={10} c={WF.inkFaint}>今日除息</T>
            <H size={20}>3 檔</H>
          </div>
          <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 10 }}>
            <T size={10} c={WF.inkFaint}>待填息</T>
            <H size={20}>8 檔</H>
          </div>
        </div>

        <Frame title="自選股" headRight="8 檔" style={{ flex: 1, overflow: 'hidden' }} dense>
          {SAMPLE_STOCKS.slice(0, 4).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < 3 ? `1px dashed ${WF.lineFaint}` : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <T mono size={11} c={WF.inkFaint}>{s.code}</T>
                  <T size={13} weight={500}>{s.name}</T>
                </div>
                <T size={10} c={WF.inkSoft} style={{ marginTop: 2 }}>{s.freq} · 除息 {s.exDate}</T>
              </div>
              <div style={{ textAlign: 'right' }}>
                <T mono size={12} weight={500}>${s.price}</T>
                <T size={9} c={s.chg >= 0 ? WF.red : WF.green} mono>{s.chg >= 0 ? '+' : ''}{s.chg}% · {s.yield}%</T>
              </div>
              <FillRing pct={s.filled} size={28} />
            </div>
          ))}
        </Frame>
      </div>

      <div style={{ borderTop: `1.5px solid ${WF.line}`, display: 'flex', padding: '8px 4px' }}>
        {['儀表', '行事曆', '自選', '排行', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11, color: i === 0 ? WF.ink : WF.inkFaint, fontWeight: i === 0 ? 500 : 400 }}>
            <div style={{ width: 18, height: 18, margin: '0 auto 3px', border: `1px solid ${i === 0 ? WF.ink : WF.lineSoft}`, borderRadius: 3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dir1DesktopDashboard, Dir1MobileDashboard });
