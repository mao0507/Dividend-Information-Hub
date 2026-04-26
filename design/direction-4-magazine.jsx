// Direction 4: 雜誌式卡片 — 精簡、大留白、排行榜導向
// 首頁像一本財經月刊的封面。少即是多。

function Dir4DesktopMagazine() {
  return (
    <div style={{ width: 1200, height: 780, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '16px 40px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center' }}>
        <H size={26}>股息站</H>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 13 }}>
          {['每日快訊', '高股息排行', '行事曆', '自選股', '工具'].map((t, i) => (
            <div key={i} style={{ color: i === 1 ? WF.ink : WF.inkSoft, fontWeight: i === 1 ? 500 : 400, borderBottom: i === 1 ? `2px solid ${WF.ink}` : 'none', paddingBottom: 3 }}>{t}</div>
          ))}
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ flex: 1, padding: '24px 40px', overflow: 'hidden', display: 'flex', gap: 24 }}>
        {/* Left — hero rank */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <T size={11} c={WF.inkFaint} style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>2026 · 第二季</T>
            <H size={44} style={{ marginTop: 4, lineHeight: 1 }}>高股息排行榜</H>
            <T size={13} c={WF.inkSoft} style={{ marginTop: 6 }}>依近 12 月殖利率排序 · 連 3 年配息穩定篩選</T>
          </div>

          <div style={{ flex: 1, borderTop: `1.5px solid ${WF.line}` }}>
            {SAMPLE_STOCKS.slice(0, 5).map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 90px 110px 90px',
                alignItems: 'center', gap: 16,
                padding: '14px 0',
                borderBottom: `1px dashed ${WF.lineSoft}`,
              }}>
                <H size={32} c={i === 0 ? WF.red : WF.inkFaint}>#{i+1}</H>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <H size={22}>{s.name}</H>
                    <T mono size={11} c={WF.inkFaint}>{s.code}</T>
                  </div>
                  <T size={11} c={WF.inkSoft} style={{ marginTop: 2 }}>{s.freq} · 連 {8 - i} 年配息 · 下次 {s.exDate}</T>
                </div>
                <div>
                  <T size={9} c={WF.inkFaint}>殖利率</T>
                  <T mono size={20} weight={500} c={s.yield >= 6 ? WF.green : WF.ink}>{s.yield}%</T>
                </div>
                <div>
                  <T size={9} c={WF.inkFaint}>股價 · 配息</T>
                  <T mono size={16} weight={500}>${s.price}</T>
                  <T mono size={10} c={s.chg >= 0 ? WF.red : WF.green}>{s.chg >= 0 ? '+' : ''}{s.chg}% · ${s.cash}</T>
                </div>
                <Sparkline w={90} h={32} dropAt={0.42 + (i % 3) * 0.06} />
              </div>
            ))}
          </div>
        </div>

        {/* Right — secondary cards */}
        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 18 }}>
            <T size={10} c={WF.inkFaint} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>本週除息</T>
            <H size={36} style={{ marginTop: 6 }}>14 檔</H>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { d: '週四 4/23', n: '3 檔', hi: true },
                { d: '週五 4/24', n: '1 檔' },
                { d: '下週二 4/28', n: '2 檔' },
                { d: '下週四 4/30', n: '4 檔' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderTop: i === 0 ? `1px dashed ${WF.lineFaint}` : 'none' }}>
                  <T size={12} c={e.hi ? WF.ink : WF.inkSoft} weight={e.hi ? 500 : 400}>{e.d}{e.hi ? ' · 今日' : ''}</T>
                  <T mono size={12}>{e.n}</T>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 18, background: WF.hi }}>
            <T size={10} c={WF.inkSoft} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>編輯精選</T>
            <H size={22} style={{ marginTop: 6 }}>月月配 ETF 全解</H>
            <T size={11} c={WF.inkSoft} style={{ marginTop: 6 }}>00919 連續 18 個月配息 · 真的月月有錢進帳嗎？深度比較</T>
            <Hatch w="100%" h={72} label="HERO IMAGE" style={{ marginTop: 10 }} />
          </div>

          <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 18 }}>
            <T size={10} c={WF.inkFaint} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>最快填息</T>
            <div style={{ marginTop: 8 }}>
              {[
                { n: '台○電', d: '3 天' },
                { n: '統○', d: '5 天' },
                { n: '國○金', d: '8 天' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                  <T size={13}>{e.n}</T>
                  <T mono size={12} c={WF.green}>{e.d}</T>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dir4MobileMagazine() {
  return (
    <div style={{ width: 320, height: 640, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <H size={20}>股息站</H>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>☰</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <T size={9} c={WF.inkFaint} style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>2026 · Q2</T>
          <H size={30} style={{ marginTop: 2, lineHeight: 1 }}>高股息排行</H>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {SAMPLE_STOCKS.slice(0, 4).map((s, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr auto',
              alignItems: 'center', gap: 10,
              padding: '12px 0',
              borderBottom: `1px dashed ${WF.lineSoft}`,
            }}>
              <H size={22} c={i === 0 ? WF.red : WF.inkFaint}>{i+1}</H>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <T size={15} weight={500}>{s.name}</T>
                  <T mono size={9} c={WF.inkFaint}>{s.code}</T>
                </div>
                <T size={10} c={WF.inkSoft} style={{ marginTop: 1 }}>{s.freq} · 除息 {s.exDate}</T>
              </div>
              <div style={{ textAlign: 'right' }}>
                <T mono size={14} weight={500}>${s.price}</T>
                <T mono size={10} c={s.yield >= 6 ? WF.green : WF.inkFaint}>{s.yield}% · ${s.cash}</T>
              </div>
            </div>
          ))}
        </div>

        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12, background: WF.hi }}>
          <T size={9} c={WF.inkSoft} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>編輯精選</T>
          <T size={14} weight={500} style={{ marginTop: 3 }}>月月配 ETF 全解</T>
        </div>
      </div>

      <div style={{ borderTop: `1.5px solid ${WF.line}`, display: 'flex', padding: '8px 4px' }}>
        {['首頁', '行事曆', '排行', '自選', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11, color: i === 0 ? WF.ink : WF.inkFaint, fontWeight: i === 0 ? 500 : 400 }}>
            <div style={{ width: 18, height: 18, margin: '0 auto 3px', border: `1px solid ${i === 0 ? WF.ink : WF.lineSoft}`, borderRadius: 3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dir4DesktopMagazine, Dir4MobileMagazine });
