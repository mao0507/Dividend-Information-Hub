// Direction 3: 自選股優先 — 存股族視角
// 從「我的組合」出發，強調個人化、長期視角、年度累計。

function Dir3DesktopWatchlist() {
  return (
    <div style={{ width: 1200, height: 780, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 18 }}>
        <H size={26}>我的股息組合</H>
        <div style={{ display: 'flex', gap: 14, fontSize: 13, color: WF.inkSoft }}>
          {['我的組合', '行事曆', '排行榜', '查詢', '分析'].map((t, i) => (
            <div key={i} style={{ padding: '4px 0', borderBottom: i === 0 ? `2px solid ${WF.ink}` : '2px solid transparent', color: i === 0 ? WF.ink : WF.inkSoft }}>{t}</div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ border: `1px solid ${WF.lineSoft}`, borderRadius: 3, padding: '5px 10px', fontSize: 12, color: WF.inkFaint, width: 220, display: 'flex', gap: 6 }}>
          <span>🔍</span> 搜尋股票代號 / 名稱
        </div>
        <Btn small primary>+ 加入股票</Btn>
      </div>

      <div style={{ flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {/* Hero summary */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1.2, border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 16, background: WF.ink, color: WF.paper }}>
            <T size={11} c="rgba(255,255,255,0.65)">2026 年度預估領息</T>
            <H size={44} c={WF.paper} style={{ marginTop: 6 }}>NT$ 82,450</H>
            <T size={11} c="rgba(255,255,255,0.65)" style={{ marginTop: 6 }}>已入帳 $48,260 · 待入帳 $34,190 · 目標達成率 103%</T>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, marginTop: 10, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '58%', background: WF.paper }} />
              <div style={{ width: '42%', background: 'rgba(255,255,255,0.5)' }} />
            </div>
          </div>
          {[
            { l: '平均殖利率', v: '5.82%', s: '整體組合' },
            { l: '穩定度評分', v: '8.6 / 10', s: '連 5 年配息' },
            { l: '配息頻率', v: '月 3 · 季 5', s: '月月有息' },
          ].map((k, i) => (
            <div key={i} style={{ flex: 1, border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 14 }}>
              <T size={10} c={WF.inkFaint}>{k.l}</T>
              <H size={28} style={{ marginTop: 4 }}>{k.v}</H>
              <T size={10} c={WF.inkSoft} style={{ marginTop: 4 }}>{k.s}</T>
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <H size={22}>持有 8 檔</H>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 4, fontSize: 11 }}>
              <div style={{ padding: '3px 10px', border: `1px solid ${WF.line}`, borderRadius: 3, background: WF.ink, color: WF.paper }}>卡片</div>
              <div style={{ padding: '3px 10px', border: `1px solid ${WF.lineSoft}`, borderRadius: 3 }}>列表</div>
            </div>
            <T size={11} c={WF.inkSoft}>排序：</T>
            <div style={{ padding: '3px 10px', border: `1px solid ${WF.lineSoft}`, borderRadius: 3, fontSize: 11 }}>下次除息 ↓</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {SAMPLE_STOCKS.slice(0, 8).map((s, i) => (
              <div key={i} style={{
                border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12,
                background: WF.paper, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <T mono size={10} c={WF.inkFaint}>{s.code}</T>
                    <H size={20} style={{ marginTop: 1 }}>{s.name}</H>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <T mono size={16} weight={500}>${s.price}</T>
                    <T mono size={10} c={s.chg >= 0 ? WF.red : WF.green}>{s.chg >= 0 ? '+' : ''}{s.chg}%</T>
                  </div>
                </div>

                <Sparkline w="100%" h={40} dropAt={0.42 + (i % 4) * 0.05} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <T size={9} c={WF.inkFaint}>現金股利 · {s.freq}</T>
                    <T mono size={16} weight={500}>${s.cash.toFixed(2)}</T>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <T size={9} c={WF.inkFaint}>殖利率</T>
                    <T mono size={16} weight={500} c={s.yield >= 6 ? WF.green : WF.ink}>{s.yield}%</T>
                  </div>
                </div>

                {s.stock > 0 && (
                  <div style={{ fontSize: 10, padding: '3px 6px', background: WF.hi, borderRadius: 3, display: 'inline-block', alignSelf: 'flex-start' }}>
                    + 配股 {s.stock} 元
                  </div>
                )}

                <div style={{ borderTop: `1px dashed ${WF.lineFaint}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <T size={9} c={WF.inkFaint}>下次除息</T>
                    <T mono size={12}>{s.exDate}</T>
                  </div>
                  <FillRing pct={s.filled} size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dir3MobileWatchlist() {
  return (
    <div style={{ width: 320, height: 640, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: `1.5px solid ${WF.line}` }}>
        <T size={10} c={WF.inkFaint}>午安，存股族</T>
        <H size={22}>我的組合</H>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12, background: WF.ink, color: WF.paper }}>
          <T size={10} c="rgba(255,255,255,0.6)">2026 預估領息</T>
          <H size={30} c={WF.paper} style={{ marginTop: 4 }}>$82,450</H>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
            <span>已領 $48,260</span>
            <span>待領 $34,190</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
            <div style={{ width: '58%', height: '100%', background: WF.paper }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {['全部 8', '本月 5', '待填息 3', '月配 3'].map((t, i) => (
            <div key={i} style={{ padding: '4px 10px', border: `1px solid ${i === 0 ? WF.ink : WF.lineSoft}`, background: i === 0 ? WF.ink : 'transparent', color: i === 0 ? WF.paper : WF.ink, borderRadius: 12, fontSize: 11, whiteSpace: 'nowrap' }}>{t}</div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SAMPLE_STOCKS.slice(0, 4).map((s, i) => (
            <div key={i} style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <T mono size={10} c={WF.inkFaint}>{s.code}</T>
                    <T size={14} weight={500}>{s.name}</T>
                    <Pill style={{ fontSize: 9 }}>{s.freq}</Pill>
                  </div>
                  <T size={10} c={WF.inkSoft} style={{ marginTop: 2 }}>除息 {s.exDate} · 配 ${s.cash} · {s.yield}%</T>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <T mono size={15} weight={500}>${s.price}</T>
                  <T mono size={10} c={s.chg >= 0 ? WF.red : WF.green}>{s.chg >= 0 ? '+' : ''}{s.chg}%</T>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${WF.lineFaint}` }}>
                <T size={9} c={WF.inkFaint}>填息</T>
                <div style={{ flex: 1, height: 5, background: WF.lineFaint, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${s.filled}%`, height: '100%', background: s.filled >= 100 ? WF.green : WF.blue }} />
                </div>
                <T mono size={10}>{s.filled}%</T>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1.5px solid ${WF.line}`, display: 'flex', padding: '8px 4px' }}>
        {['儀表', '行事曆', '自選', '排行', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11, color: i === 2 ? WF.ink : WF.inkFaint, fontWeight: i === 2 ? 500 : 400 }}>
            <div style={{ width: 18, height: 18, margin: '0 auto 3px', border: `1px solid ${i === 2 ? WF.ink : WF.lineSoft}`, borderRadius: 3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dir3DesktopWatchlist, Dir3MobileWatchlist });
