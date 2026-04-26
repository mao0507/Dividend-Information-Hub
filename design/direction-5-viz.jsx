// Direction 5: 圖像化資料視覺化 — 以圖表為主角
// 少文字 · 多視覺。橫向 bar chart + 堆疊熱度圖 + 時間軸。
// 靈感：FT / Pudding / 資料新聞風格。

function Dir5DesktopViz() {
  const bars = SAMPLE_STOCKS.slice(0, 8).sort((a, b) => b.yield - a.yield);
  const maxY = 12;

  return (
    <div style={{ width: 1200, height: 780, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '14px 28px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 18 }}>
        <H size={24}>股息視覺化</H>
        <div style={{ flex: 1, display: 'flex', gap: 20, fontSize: 12, color: WF.inkSoft }}>
          {['總覽', '殖利率分布', '配息月份熱度', '填息速度', '我的組合'].map((t, i) => (
            <div key={i} style={{ color: i === 0 ? WF.ink : WF.inkSoft, fontWeight: i === 0 ? 500 : 400, borderBottom: i === 0 ? `2px solid ${WF.ink}` : 'none', paddingBottom: 3 }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '18px 28px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gridTemplateRows: 'auto 1fr', gap: 14, overflow: 'hidden' }}>
        {/* Headline bar chart */}
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3', border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <H size={22}>殖利率分布</H>
            <T size={10} c={WF.inkFaint} mono>Y軸 = 股票 · X軸 = 年化殖利率 %</T>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bars.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px', alignItems: 'center', gap: 10, fontSize: 11 }}>
                <div style={{ textAlign: 'right' }}>
                  <T size={12} weight={500}>{s.name}</T>
                  <T mono size={9} c={WF.inkFaint}>{s.code} · ${s.price}</T>
                </div>
                <div style={{ position: 'relative', height: 22, background: WF.lineFaint, borderRadius: 2 }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: `${(s.yield / maxY) * 100}%`, height: '100%',
                    background: s.yield >= 6 ? WF.green : WF.ink,
                    borderRadius: 2,
                  }} />
                  <div style={{
                    position: 'absolute', top: '50%', left: `${(s.yield / maxY) * 100}%`,
                    transform: 'translate(4px, -50%)',
                    fontFamily: WF.fontMono, fontSize: 10, color: WF.inkSoft,
                  }}>
                    {s.freq}
                  </div>
                </div>
                <T mono size={14} weight={500} c={s.yield >= 6 ? WF.green : WF.ink}>{s.yield}%</T>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px dashed ${WF.lineFaint}`, paddingTop: 10, marginTop: 10, display: 'flex', gap: 18, fontSize: 10, color: WF.inkSoft }}>
            <div>中位數 4.4%</div>
            <div>高於 6% 有 3 檔</div>
            <div>平均 5.1%</div>
            <div style={{ flex: 1 }} />
            <T size={10} mono>0%</T>
            <div style={{ flex: 1 }} />
            <T size={10} mono>12%</T>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <H size={18}>配息月份熱度</H>
            <T size={10} c={WF.inkFaint}>我的組合 · 8 檔</T>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            {Array.from({ length: 12 }).map((_, m) => {
              const heat = [2, 0, 2, 1, 4, 1, 3, 3, 1, 0, 2, 1][m];
              const opacity = heat === 0 ? 0.08 : 0.2 + heat * 0.18;
              return (
                <div key={m} style={{
                  aspectRatio: '1 / 1',
                  background: `rgba(58, 119, 102, ${opacity})`,
                  border: `1px solid ${WF.lineFaint}`,
                  borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: WF.fontMono, fontSize: 10,
                  color: heat >= 3 ? WF.paper : WF.inkSoft,
                  fontWeight: heat >= 3 ? 700 : 400,
                }}>
                  {heat || ''}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, marginTop: 4 }}>
            {['1','2','3','4','5','6','7','8','9','10','11','12'].map((m, i) => (
              <div key={i} style={{ textAlign: 'center', fontFamily: WF.fontMono, fontSize: 9, color: WF.inkFaint }}>{m}</div>
            ))}
          </div>
          <T size={10} c={WF.inkSoft} style={{ marginTop: 8 }}>月月有息 ✓ 10 月空窗可考慮補月配 ETF</T>
        </div>

        {/* Donut */}
        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 14, overflow: 'hidden', display: 'flex', gap: 12 }}>
          <div>
            <H size={18}>配息組成</H>
            <T size={10} c={WF.inkFaint} style={{ marginTop: 2 }}>頻率佔比</T>
            <svg width="120" height="120" viewBox="0 0 42 42" style={{ marginTop: 8 }}>
              <circle cx="21" cy="21" r="15.9" fill="none" stroke={WF.lineFaint} strokeWidth="5" />
              <circle cx="21" cy="21" r="15.9" fill="none" stroke={WF.ink} strokeWidth="5" strokeDasharray="50 100" strokeDashoffset="25" />
              <circle cx="21" cy="21" r="15.9" fill="none" stroke={WF.green} strokeWidth="5" strokeDasharray="20 100" strokeDashoffset="-25" />
              <circle cx="21" cy="21" r="15.9" fill="none" stroke={WF.blue} strokeWidth="5" strokeDasharray="30 100" strokeDashoffset="-45" />
            </svg>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            {[
              { c: WF.ink, l: '年配', v: '50%', n: '4 檔' },
              { c: WF.green, l: '季配', v: '30%', n: '3 檔' },
              { c: WF.blue, l: '月配', v: '20%', n: '1 檔' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, background: r.c, borderRadius: 2 }} />
                <T size={12} weight={500}>{r.l}</T>
                <div style={{ flex: 1 }} />
                <T mono size={13}>{r.v}</T>
                <T size={10} c={WF.inkFaint}>{r.n}</T>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dir5MobileViz() {
  const bars = SAMPLE_STOCKS.slice(0, 5).sort((a, b) => b.yield - a.yield);
  return (
    <div style={{ width: 320, height: 640, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: `1.5px solid ${WF.line}` }}>
        <H size={22}>視覺化</H>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12 }}>
          <T size={10} c={WF.inkFaint}>殖利率分布</T>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {bars.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 36px', gap: 6, alignItems: 'center' }}>
                <T size={11}>{s.name}</T>
                <div style={{ height: 14, background: WF.lineFaint, borderRadius: 2 }}>
                  <div style={{ width: `${(s.yield / 12) * 100}%`, height: '100%', background: s.yield >= 6 ? WF.green : WF.ink, borderRadius: 2 }} />
                </div>
                <T mono size={11} c={s.yield >= 6 ? WF.green : WF.ink}>{s.yield}%</T>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12 }}>
          <T size={10} c={WF.inkFaint}>配息月份熱度</T>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, marginTop: 6 }}>
            {Array.from({ length: 12 }).map((_, m) => {
              const heat = [2, 0, 2, 1, 4, 1, 3, 3, 1, 0, 2, 1][m];
              const opacity = heat === 0 ? 0.08 : 0.2 + heat * 0.18;
              return (
                <div key={m} style={{ aspectRatio: '1 / 1', background: `rgba(58, 119, 102, ${opacity})`, border: `1px solid ${WF.lineFaint}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.fontMono, fontSize: 8, color: heat >= 3 ? WF.paper : WF.inkFaint }}>{heat || ''}</div>
              );
            })}
          </div>
        </div>

        <div style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12 }}>
          <T size={10} c={WF.inkFaint}>月月有息進度</T>
          <H size={22} style={{ marginTop: 4 }}>10 / 12 個月</H>
          <div style={{ height: 5, background: WF.lineFaint, marginTop: 6, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '83%', height: '100%', background: WF.green }} />
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1.5px solid ${WF.line}`, display: 'flex', padding: '8px 4px' }}>
        {['儀表', '行事曆', '自選', '視覺', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11, color: i === 3 ? WF.ink : WF.inkFaint, fontWeight: i === 3 ? 500 : 400 }}>
            <div style={{ width: 18, height: 18, margin: '0 auto 3px', border: `1px solid ${i === 3 ? WF.ink : WF.lineSoft}`, borderRadius: 3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// Direction 6: 日式新聞紙 — 縱向排版、編號、大量留白、資訊體感很「紙本」
// 極簡到幾乎沒有元件，仰賴 typography + 編號 + 分隔線。

function Dir6DesktopPaper() {
  return (
    <div style={{ width: 1200, height: 780, background: '#fdfbf5', color: WF.ink, fontFamily: WF.fontBody, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 48px 14px', borderBottom: `2px solid ${WF.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <T size={10} c={WF.inkFaint} style={{ letterSpacing: '0.3em' }}>DIVIDEND · DAILY · 股息日報</T>
          <H size={44} style={{ marginTop: 4, lineHeight: 1 }}>股息日報</H>
        </div>
        <div style={{ textAlign: 'right' }}>
          <T mono size={11} c={WF.inkFaint}>2026 年 4 月 23 日</T>
          <T mono size={11} c={WF.inkFaint}>VOL. 124 · 週四</T>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 48px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 32, overflow: 'hidden' }}>
        {/* Main article — today's ex-div */}
        <div style={{ borderRight: `1px solid ${WF.lineSoft}`, paddingRight: 32 }}>
          <T mono size={10} c={WF.inkFaint} style={{ letterSpacing: '0.2em' }}>01 · 今日除息</T>
          <H size={34} style={{ marginTop: 6, lineHeight: 1.05 }}>台○電 今日除息 配現金 4.50</H>
          <T size={12} c={WF.inkSoft} style={{ marginTop: 8, lineHeight: 1.6 }}>
            季配 · 2026 Q1 · 依據持股股東名冊，將於 7 月 11 日發放。連 20 年配息，過去五年平均 4 天填息。
          </T>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, paddingTop: 12, borderTop: `1px dashed ${WF.lineSoft}` }}>
            <div><T size={10} c={WF.inkFaint}>現價</T><H size={24}>$1,085</H></div>
            <div><T size={10} c={WF.inkFaint}>本次配息</T><H size={24}>$4.50</H></div>
            <div><T size={10} c={WF.inkFaint}>殖利率</T><H size={24}>2.1%</H></div>
          </div>

          <Hatch w="100%" h={140} label="PRICE CHART · EX-DIV MARKED" style={{ marginTop: 16 }} />

          <T size={11} c={WF.inkSoft} style={{ marginTop: 12, lineHeight: 1.7 }}>
            同日另有 2 檔除息 · 聯○科 $18.00（年配）與中○金 $0.80（年配）。此外本週預計除息共 14 檔，其中包含你自選股中的 5 檔。
          </T>
        </div>

        {/* Middle column — today's list */}
        <div style={{ borderRight: `1px solid ${WF.lineSoft}`, paddingRight: 32 }}>
          <T mono size={10} c={WF.inkFaint} style={{ letterSpacing: '0.2em' }}>02 · 今日事件</T>
          <H size={22} style={{ marginTop: 6 }}>除息 3 · 發放 1</H>

          {[
            { num: '壹', c: '2330', n: '台○電', price: '$1,085', chg: '+0.5%', up: true, amt: '$4.50', note: '季配 · 自選' },
            { num: '貳', c: '2454', n: '聯○科', price: '$985', chg: '-0.8%', up: false, amt: '$18.00', note: '年配' },
            { num: '參', c: '2891', n: '中○金', price: '$19.2', chg: '+1.1%', up: true, amt: '$0.80', note: '年配' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: `1px dashed ${WF.lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <H size={18} c={WF.inkFaint}>{s.num}</H>
                <T size={16} weight={500}>{s.n}</T>
                <T mono size={10} c={WF.inkFaint}>{s.c}</T>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                <T mono size={14} weight={500}>{s.price}</T>
                <T mono size={11} c={s.up ? WF.red : WF.green}>{s.chg}</T>
                <T mono size={14}>配 {s.amt}</T>
              </div>
              <T size={10} c={WF.inkSoft} style={{ marginTop: 2 }}>{s.note}</T>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <T mono size={10} c={WF.inkFaint}>發放入帳</T>
            <div style={{ marginTop: 6 }}>
              <T size={13}>0056 · 高股息ETF</T>
              <T mono size={11} c={WF.inkSoft}>$0.85 × 持股 → 估 $4,250</T>
            </div>
          </div>
        </div>

        {/* Right column — short-form news ticker */}
        <div>
          <T mono size={10} c={WF.inkFaint} style={{ letterSpacing: '0.2em' }}>03 · 本週預告</T>
          <H size={22} style={{ marginTop: 6 }}>未來 7 日</H>

          {[
            { d: '04/24 週五', n: '1 檔', note: '2884' },
            { d: '04/28 週二', n: '2 檔', note: '含自選 1' },
            { d: '04/30 週四', n: '4 檔', note: '' },
            { d: '05/02 週五', n: '4 檔', note: '含自選 2' },
            { d: '05/06 週二', n: '1 檔', note: '' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 8, alignItems: 'baseline', padding: '10px 0', borderBottom: `1px dashed ${WF.lineSoft}` }}>
              <T mono size={11}>{e.d}</T>
              <T size={13}>除息 <b>{e.n}</b></T>
              <T size={10} c={WF.inkFaint}>{e.note}</T>
            </div>
          ))}

          <div style={{ marginTop: 18, padding: 14, background: WF.ink, color: WF.paper, borderRadius: 4 }}>
            <T size={10} c="rgba(255,255,255,0.6)" style={{ letterSpacing: '0.2em' }}>— 本月結算 —</T>
            <H size={28} c={WF.paper} style={{ marginTop: 6 }}>$6,840</H>
            <T size={11} c="rgba(255,255,255,0.7)">預計入帳總額</T>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1.5px solid ${WF.line}`, padding: '10px 48px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: WF.inkFaint, fontFamily: WF.fontMono }}>
        <div>股息日報 · DIVIDEND DAILY</div>
        <div>今日除息 3 · 本週 14 · 月度 31 · 自選含 5</div>
        <div>頁 1 / 6</div>
      </div>
    </div>
  );
}

function Dir6MobilePaper() {
  return (
    <div style={{ width: 320, height: 640, background: '#fdfbf5', color: WF.ink, fontFamily: WF.fontBody, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: `2px solid ${WF.line}` }}>
        <T size={9} c={WF.inkFaint} style={{ letterSpacing: '0.25em' }}>DIVIDEND DAILY</T>
        <H size={28} style={{ marginTop: 2 }}>股息日報</H>
        <T mono size={10} c={WF.inkFaint} style={{ marginTop: 2 }}>04/23 · 週四 · VOL. 124</T>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 18px' }}>
        <T mono size={9} c={WF.inkFaint} style={{ letterSpacing: '0.2em' }}>01 · 頭條</T>
        <H size={22} style={{ marginTop: 4, lineHeight: 1.1 }}>台○電今日除息<br/>配現金 $4.50</H>
        <T size={11} c={WF.inkSoft} style={{ marginTop: 6, lineHeight: 1.6 }}>
          季配 · 你持股 1,000 股 · 預計入帳 $4,500，7/11 發放
        </T>

        <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${WF.lineSoft}` }}>
          <div><T size={9} c={WF.inkFaint}>現價</T><H size={18}>$1,085</H></div>
          <div><T size={9} c={WF.inkFaint}>殖利率</T><H size={18}>2.1%</H></div>
          <div><T size={9} c={WF.inkFaint}>配息</T><H size={18}>$4.50</H></div>
        </div>

        <div style={{ marginTop: 16 }}>
          <T mono size={9} c={WF.inkFaint} style={{ letterSpacing: '0.2em' }}>02 · 同日除息</T>
          {[
            { n: '聯○科', p: '$985', a: '$18.00' },
            { n: '中○金', p: '$19.2', a: '$0.80' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '8px 0', borderBottom: `1px dashed ${WF.lineSoft}` }}>
              <T size={13} weight={500}>{s.n}</T>
              <div style={{ flex: 1 }} />
              <T mono size={12}>{s.p}</T>
              <T mono size={12} c={WF.inkFaint}>配 {s.a}</T>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1.5px solid ${WF.line}`, display: 'flex', padding: '8px 4px' }}>
        {['頭條', '行事曆', '自選', '排行', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11, color: i === 0 ? WF.ink : WF.inkFaint, fontWeight: i === 0 ? 500 : 400 }}>
            <div style={{ width: 18, height: 18, margin: '0 auto 3px', border: `1px solid ${i === 0 ? WF.ink : WF.lineSoft}`, borderRadius: 3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dir5DesktopViz, Dir5MobileViz, Dir6DesktopPaper, Dir6MobilePaper });
