// A · 提醒中心 + 視覺化分析 + 設定 + ⌘K 搜尋

function AAlerts() {
  const rules = [
    { on: true, label: '除息日 T-3 提醒', match: '所有自選股', channel: 'Email + Push', count: 8 },
    { on: true, label: '股利公告', match: '核心持股', channel: 'Push', count: 3 },
    { on: true, label: '填息達 80%', match: '所有自選股', channel: 'Push', count: 5 },
    { on: false, label: '殖利率超過 6%', match: '追蹤清單', channel: 'Email', count: 12 },
    { on: true, label: '除息當日跌幅 > 2%', match: '所有自選股', channel: 'Push', count: 8 },
    { on: false, label: '配息低於前一年', match: '核心持股', channel: 'Email', count: 3 },
  ];

  const notifs = [
    { t: '2 分鐘前', cat: 'ex', hi: true, title: '台○電 今日除息', body: '每股現金 $4.50 · 基準日 4/23 · 預估 7/11 入帳 $5,400', tag: '2330' },
    { t: '今天 09:30', cat: 'pay', title: '0056 股利已入帳', body: '$850 × 4 張 = $3,400 已匯入證券戶頭', tag: '0056' },
    { t: '今天 08:00', cat: 'fill', title: '00919 已完成填息', body: '連續 3 季填息 · 平均 2.3 天', tag: '00919' },
    { t: '昨天 15:00', cat: 'news', title: '中○電 公告 114 年股利', body: '現金 $4.75 · 年減 0% · 創配息紀錄 28 年', tag: '2412' },
    { t: '昨天 11:20', cat: 'ex', title: '玉○金 明日除息', body: '每股現金 $0.9 + 股票股利 $0.1 · 持 2,000 股預估 $1,800', tag: '2884' },
    { t: '4/21', cat: 'yield', title: '聯○ 殖利率達 6.6%', body: '符合你的篩選條件「> 6%」· 目前股價 $52.8', tag: '2303' },
    { t: '4/20', cat: 'drop', title: '華○金 除息日跌 -2.3%', body: '填息進度延緩 · 建議觀察接下來 5 日', tag: '2880' },
  ];

  const catStyle = {
    ex: { c: A.green, bg: 'rgba(34,197,94,0.12)', ic: '●' },
    pay: { c: A.amber, bg: 'rgba(245,158,11,0.12)', ic: '◆' },
    fill: { c: A.green, bg: 'rgba(34,197,94,0.12)', ic: '✓' },
    news: { c: '#60a5fa', bg: 'rgba(96,165,250,0.12)', ic: 'i' },
    yield: { c: '#a78bfa', bg: 'rgba(167,139,250,0.12)', ic: '%' },
    drop: { c: A.red, bg: 'rgba(239,68,68,0.12)', ic: '▼' },
  };

  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股', '高股息排行', '視覺化', '試算', '提醒中心', '設定'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 6 ? A.text : A.textSoft, background: i === 6 ? A.bg3 : 'transparent', borderLeft: i === 6 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1 }}>{t}</span>
            {i === 6 && <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.green, padding: '1px 5px', background: 'rgba(34,197,94,0.15)', borderRadius: 3 }}>12</span>}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14 }}>
          <div style={{ fontSize: 13 }}>提醒中心</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: A.textSoft }}>全部標為已讀</div>
          <div style={{ padding: '6px 12px', background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 6, fontSize: 12, color: A.textSoft }}>⚙ 通知設定</div>
          <div style={{ padding: '6px 12px', background: A.green, color: A.bg, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>+ 新規則</div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, overflow: 'hidden' }}>
          {/* Notifications feed */}
          <div style={{ padding: 20, overflow: 'auto', borderRight: `1px solid ${A.line}` }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['全部 · 12', '除息 · 5', '發放 · 3', '新聞 · 2', '未讀 · 4'].map((t, i) => (
                <div key={i} style={{ padding: '5px 12px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 20, background: i === 0 ? A.green : A.bg2, color: i === 0 ? A.bg : A.textSoft, border: i === 0 ? 'none' : `1px solid ${A.line}`, fontWeight: i === 0 ? 600 : 400 }}>{t}</div>
              ))}
            </div>

            {notifs.map((n, i) => {
              const st = catStyle[n.cat];
              return (
                <div key={i} style={{ display: 'flex', gap: 14, padding: 14, marginBottom: 8, background: n.hi ? 'rgba(34,197,94,0.05)' : A.bg2, border: `1px solid ${n.hi ? 'rgba(34,197,94,0.3)' : A.line}`, borderRadius: 10, position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.c, fontFamily: A.fontMono, fontWeight: 700, flexShrink: 0 }}>{st.ic}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{n.title}</div>
                      <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, padding: '1px 5px', background: A.bg3, borderRadius: 3 }}>{n.tag}</span>
                      {n.hi && <span style={{ width: 6, height: 6, borderRadius: '50%', background: A.green }} />}
                    </div>
                    <div style={{ fontSize: 12, color: A.textSoft, marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>
                    <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, marginTop: 6 }}>{n.t}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules */}
          <div style={{ padding: 20, overflow: 'auto', background: A.bg2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>提醒規則</div>
            <div style={{ fontSize: 11, color: A.textFaint, marginBottom: 16 }}>已啟用 4 條 · 共 6 條</div>

            {rules.map((r, i) => (
              <div key={i} style={{ padding: 14, marginBottom: 8, background: A.bg, borderRadius: 10, border: `1px solid ${A.line}`, opacity: r.on ? 1 : 0.55 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: r.on ? A.green : A.bg3, position: 'relative', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ position: 'absolute', top: 2, left: r.on ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: r.on ? A.bg : A.textSoft, transition: 'left .2s' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, marginTop: 3 }}>{r.match} · {r.channel}</div>
                  </div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, padding: '2px 6px', background: A.bg3, borderRadius: 3 }}>觸發 {r.count}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 14, padding: 14, border: `1px dashed ${A.lineStrong}`, borderRadius: 10, textAlign: 'center', fontSize: 12, color: A.textSoft }}>+ 新增自訂規則</div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${A.line}` }}>
              <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>通知管道</div>
              {[['Email', 'liu@example.com', true], ['Push', 'iPhone 15 Pro', true], ['LINE Notify', '未綁定', false]].map(([l, v, on], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: on ? A.green : A.textFaint }} />
                  <span style={{ minWidth: 80 }}>{l}</span>
                  <span style={{ flex: 1, fontFamily: A.fontMono, fontSize: 11, color: A.textSoft }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AViz() {
  // Sector distribution
  const sectors = [
    { n: '半導體', v: 42, c: '#22c55e' },
    { n: '金融', v: 24, c: '#60a5fa' },
    { n: '電信', v: 12, c: '#a78bfa' },
    { n: 'ETF', v: 15, c: '#f59e0b' },
    { n: '其他', v: 7, c: '#6b7280' },
  ];

  // Income per month 2026 projection
  const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const income = [1200, 900, 2400, 6840, 4200, 2800, 12400, 8900, 4200, 3100, 2800, 9800];
  const maxI = Math.max(...income);

  // Heatmap: sector × month
  const heat = sectors.slice(0, 4).map((s, si) =>
    months.map((_, mi) => {
      const n = Math.sin((si * 3 + mi) * 1.3) * 0.5 + 0.5;
      return Math.round(n * 100);
    })
  );

  // Cumulative stack by year
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const stackData = years.map((y, i) => ({
    y,
    semi: 8 + i * 4,
    fin: 6 + i * 2.5,
    etf: 4 + i * 3.2,
    other: 3 + i * 1.2,
  }));

  return (
    <div style={{ width: 1440, height: 980, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股', '高股息排行', '視覺化', '試算', '提醒中心', '設定'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 4 ? A.text : A.textSoft, background: i === 4 ? A.bg3 : 'transparent', borderLeft: i === 4 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>視覺化分析</div>
            <div style={{ fontSize: 12, color: A.textFaint, marginTop: 4 }}>你的股息組合 · 2026 年度</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 4, padding: 3, background: A.bg2, borderRadius: 6 }}>
            {['2024', '2025', '2026'].map((t, i) => (
              <div key={i} style={{ padding: '5px 12px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 4, background: i === 2 ? A.bg3 : 'transparent', color: i === 2 ? A.text : A.textSoft }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Row 1: donut + monthly bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 18, marginBottom: 18 }}>
          <div style={{ background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>產業分布</div>
            <div style={{ fontSize: 11, color: A.textFaint, marginTop: 3 }}>按市值比重</div>
            <div style={{ position: 'relative', width: 220, height: 220, margin: '20px auto 14px' }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                {(() => {
                  let acc = 0;
                  const total = sectors.reduce((a, s) => a + s.v, 0);
                  return sectors.map((s, i) => {
                    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
                    acc += s.v;
                    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
                    const r1 = 70, r2 = 100;
                    const x1 = 110 + r2 * Math.cos(start), y1 = 110 + r2 * Math.sin(start);
                    const x2 = 110 + r2 * Math.cos(end), y2 = 110 + r2 * Math.sin(end);
                    const x3 = 110 + r1 * Math.cos(end), y3 = 110 + r1 * Math.sin(end);
                    const x4 = 110 + r1 * Math.cos(start), y4 = 110 + r1 * Math.sin(start);
                    const large = end - start > Math.PI ? 1 : 0;
                    return (
                      <path key={i} d={`M ${x1} ${y1} A ${r2} ${r2} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${large} 0 ${x4} ${y4} Z`} fill={s.c} stroke={A.bg2} strokeWidth="2" />
                    );
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>總市值</div>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: A.fontMono, color: A.green, letterSpacing: '-0.02em' }}>$3.42M</div>
                <div style={{ fontSize: 10, color: A.textSoft, fontFamily: A.fontMono }}>8 檔 · 3 分組</div>
              </div>
            </div>
            {sectors.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: s.c }} />
                <span style={{ flex: 1 }}>{s.n}</span>
                <span style={{ fontFamily: A.fontMono, color: A.textSoft }}>{s.v}%</span>
                <span style={{ fontFamily: A.fontMono, color: A.textFaint, fontSize: 11, width: 72, textAlign: 'right' }}>${(s.v * 342 / 100 / 10).toFixed(1)}萬</span>
              </div>
            ))}
          </div>

          <div style={{ background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>月度股息收入</div>
                <div style={{ fontSize: 11, color: A.textFaint, marginTop: 3 }}>2026 預估 · $59,540</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 11, fontFamily: A.fontMono, color: A.textSoft }}>最高：7月 $12,400</div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-end', gap: 8, height: 220 }}>
              {income.map((v, i) => {
                const h = (v / maxI) * 200;
                const isPeak = v === maxI;
                const isCurrent = i === 3; // April
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontFamily: A.fontMono, fontSize: 9, color: isPeak ? A.amber : A.textFaint }}>${(v / 1000).toFixed(1)}K</div>
                    <div style={{ width: '100%', height: h, background: isCurrent ? `linear-gradient(to top, ${A.green}, #86efac)` : isPeak ? `linear-gradient(to top, ${A.amber}, #fbbf24)` : A.bg3, borderRadius: 4, border: isCurrent ? `1px solid ${A.green}` : 'none' }} />
                    <div style={{ fontFamily: A.fontMono, fontSize: 10, color: isCurrent ? A.green : A.textFaint }}>{months[i]}月</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: heatmap */}
        <div style={{ background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 12, padding: 20, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>產業 × 月份 · 除息熱度</div>
              <div style={{ fontSize: 11, color: A.textFaint, marginTop: 3 }}>顏色越深代表該產業在該月的配息比重越高</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>
              低 <div style={{ width: 14, height: 14, background: 'rgba(34,197,94,0.1)' }} />
              <div style={{ width: 14, height: 14, background: 'rgba(34,197,94,0.3)' }} />
              <div style={{ width: 14, height: 14, background: 'rgba(34,197,94,0.55)' }} />
              <div style={{ width: 14, height: 14, background: 'rgba(34,197,94,0.8)' }} />
              <div style={{ width: 14, height: 14, background: A.green }} /> 高
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(12, 1fr)', gap: 4 }}>
            <div />
            {months.map((m, i) => <div key={i} style={{ fontSize: 10, fontFamily: A.fontMono, color: A.textFaint, textAlign: 'center' }}>{m}月</div>)}
            {heat.map((row, si) => (
              <React.Fragment key={si}>
                <div style={{ fontSize: 12, color: A.textSoft, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: sectors[si].c, marginRight: 8 }} />
                  {sectors[si].n}
                </div>
                {row.map((v, mi) => (
                  <div key={mi} style={{ aspectRatio: '1.6/1', background: `rgba(34,197,94,${0.08 + (v / 100) * 0.8})`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 10, color: v > 60 ? A.bg : A.textSoft, fontWeight: v > 60 ? 600 : 400 }}>
                    {v > 40 ? v : ''}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Row 3: stacked growth */}
        <div style={{ background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>年度累計股息 · 6 年</div>
              <div style={{ fontSize: 11, color: A.textFaint, marginTop: 3 }}>按產業分層 · 平均年成長 18.4%</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontFamily: A.fontMono, color: A.textSoft }}>
              {[['半導體', '#22c55e'], ['金融', '#60a5fa'], ['ETF', '#f59e0b'], ['其他', '#6b7280']].map(([n, c], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{n}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 240 }}>
            {stackData.map((d, i) => {
              const total = d.semi + d.fin + d.etf + d.other;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontFamily: A.fontMono, fontSize: 11, color: A.textSoft }}>${total.toFixed(1)}K</div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: d.semi * 5, background: '#22c55e' }} />
                    <div style={{ height: d.fin * 5, background: '#60a5fa' }} />
                    <div style={{ height: d.etf * 5, background: '#f59e0b' }} />
                    <div style={{ height: d.other * 5, background: '#6b7280' }} />
                  </div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 11, color: i === years.length - 1 ? A.green : A.textFaint, fontWeight: i === years.length - 1 ? 600 : 400 }}>{d.y}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ASettings() {
  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股', '高股息排行', '視覺化', '試算', '提醒中心', '設定'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 7 ? A.text : A.textSoft, background: i === 7 ? A.bg3 : 'transparent', borderLeft: i === 7 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <div style={{ fontSize: 13 }}>設定</div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', overflow: 'hidden' }}>
          <div style={{ padding: 20, borderRight: `1px solid ${A.line}` }}>
            {['帳號', '個人資料', '通知', '證券戶連結', '訂閱方案', '資料匯出', '外觀', '安全', '關於'].map((t, i) => (
              <div key={i} style={{ padding: '9px 12px', borderRadius: 6, fontSize: 13, color: i === 3 ? A.text : A.textSoft, background: i === 3 ? A.bg2 : 'transparent', borderLeft: i === 3 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
            ))}
          </div>

          <div style={{ padding: 28, overflow: 'auto' }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>證券戶連結</div>
            <div style={{ fontSize: 12, color: A.textFaint, marginTop: 4, marginBottom: 24 }}>連結證券戶可自動同步持股、成本、股利入帳</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { n: '元大證券', on: true, last: '2 分鐘前同步', holdings: 5, icon: 'Y' },
                { n: '永豐證券', on: true, last: '今天 09:00 同步', holdings: 3, icon: 'S' },
                { n: '玉山證券', on: false, last: '未連結', holdings: 0, icon: 'E' },
                { n: '國泰證券', on: false, last: '未連結', holdings: 0, icon: 'C' },
              ].map((b, i) => (
                <div key={i} style={{ padding: 16, background: A.bg2, border: `1px solid ${b.on ? 'rgba(34,197,94,0.3)' : A.line}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: b.on ? `linear-gradient(135deg, ${A.green}, #14a34a)` : A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 18, fontWeight: 700, color: b.on ? A.bg : A.textFaint }}>{b.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{b.n}</div>
                    <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, marginTop: 2 }}>{b.last}{b.on && ` · ${b.holdings} 檔`}</div>
                  </div>
                  {b.on
                    ? <AChip c={A.green} bg="rgba(34,197,94,0.12)">✓ 已連結</AChip>
                    : <div style={{ padding: '5px 12px', background: A.bg3, borderRadius: 6, fontSize: 11, color: A.textSoft }}>連結</div>}
                </div>
              ))}
            </div>

            <div style={{ padding: 16, background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: A.amber, color: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>!</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: A.amber }}>資料安全</div>
                <div style={{ fontSize: 12, color: A.textSoft, marginTop: 4, lineHeight: 1.5 }}>
                  我們僅以唯讀權限同步持股、交易紀錄與股利入帳。永遠不會進行下單、轉帳或任何寫入操作。連結採用 OAuth + 雙因子驗證，密碼永不經過我們的伺服器。
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>同步偏好</div>
              {[
                ['自動同步持股', '每 5 分鐘', true],
                ['自動同步股利入帳', '即時', true],
                ['合併顯示多戶頭持股', '依代號彙總', true],
                ['在電子郵件中接收對帳單', '每月 1 日', false],
              ].map(([l, v, on], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < 3 ? `1px solid ${A.line}` : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{l}</div>
                    <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, marginTop: 2 }}>{v}</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? A.green : A.bg3, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: on ? A.bg : A.textSoft }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ASearch() {
  // Command palette overlay on top of a dashboard glimpse
  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, position: 'relative', overflow: 'hidden' }}>
      {/* Dimmed dashboard backdrop */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25, filter: 'blur(2px)' }}>
        <HiFiADesktop />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} />

      {/* Command palette */}
      <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', width: 720, background: '#15151a', border: `1px solid ${A.lineStrong}`, borderRadius: 14, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${A.line}` }}>
          <span style={{ fontSize: 16, color: A.textFaint }}>🔍</span>
          <div style={{ flex: 1, fontSize: 16, color: A.text }}>台積<span style={{ background: A.green, color: A.bg, width: 2, height: 18, display: 'inline-block', marginLeft: 2, verticalAlign: 'middle' }} /></div>
          <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, padding: '2px 6px', background: A.bg3, borderRadius: 3 }}>ESC</span>
        </div>

        <div style={{ maxHeight: 460, overflow: 'auto' }}>
          <div style={{ padding: '10px 22px 6px', fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: A.fontMono }}>股票 · 3</div>
          {[
            { c: '2330', n: '台○電', s: '半導體 · 季配', price: 1085, hi: true },
            { c: '3443', n: '創○電', s: '半導體 · 年配', price: 452 },
            { c: '4994', n: '傳○電', s: '電子 · 年配', price: 68.5 },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', background: r.hi ? 'rgba(34,197,94,0.1)' : 'transparent', borderLeft: r.hi ? `2px solid ${A.green}` : '2px solid transparent' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 10, color: A.textSoft }}>{r.c}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.n}</div>
                <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, marginTop: 1 }}>{r.s}</div>
              </div>
              <div style={{ fontFamily: A.fontMono, fontSize: 13, color: A.text }}>${r.price}</div>
              {r.hi && <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, padding: '2px 6px', background: A.bg3, borderRadius: 3 }}>↵</span>}
            </div>
          ))}

          <div style={{ padding: '10px 22px 6px', fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: A.fontMono, marginTop: 4 }}>動作</div>
          {[
            ['⚡', '為「台○電」建立除息提醒', '⌘ A'],
            ['★', '將「台○電」加入自選', '⌘ S'],
            ['$', '試算 1,000 股「台○電」10 年股息', '⌘ D'],
            ['📅', '跳到台○電下次除息日（5/16）', ''],
          ].map(([ic, l, k], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 12, color: A.green }}>{ic}</div>
              <div style={{ flex: 1, fontSize: 13 }}>{l}</div>
              {k && <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, padding: '2px 6px', background: A.bg3, borderRadius: 3 }}>{k}</span>}
            </div>
          ))}

          <div style={{ padding: '10px 22px 6px', fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: A.fontMono, marginTop: 4 }}>最近瀏覽</div>
          {[
            ['0056', '元大高股息'],
            ['00919', '群益台灣精選高息'],
          ].map(([c, n], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>↻</div>
              <div style={{ flex: 1, fontSize: 13, color: A.textSoft }}><span style={{ fontFamily: A.fontMono, fontSize: 11, color: A.textFaint, marginRight: 8 }}>{c}</span>{n}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 22px', borderTop: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>
          <span>↑↓ 移動</span>
          <span>↵ 開啟</span>
          <span>⌘↵ 新分頁</span>
          <div style={{ flex: 1 }} />
          <span>由 股息站 提供</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AAlerts, AViz, ASettings, ASearch });
