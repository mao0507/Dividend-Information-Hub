// A · Ranking / Screener + Watchlist management + DRIP calculator + Login/Onboarding

function ARanking() {
  const rows = [
    { rank: 1, code: '00919', name: '群益台灣精選高息', freq: '月配', yld: 10.2, cash: 0.11, cat: 'ETF', fill: 92, price: 23.40, chg: 1.2, mark: '新高' },
    { rank: 2, code: '0056', name: '元大高股息', freq: '季配', yld: 7.8, cash: 0.85, cat: 'ETF', fill: 78, price: 43.62, chg: -0.3 },
    { rank: 3, code: '00878', name: '國泰永續高股息', freq: '季配', yld: 6.9, cash: 0.55, cat: 'ETF', fill: 65, price: 22.85, chg: 0.8 },
    { rank: 4, code: '2303', name: '聯○', freq: '年配', yld: 6.6, cash: 3.5, cat: '半導體', fill: 45, price: 52.8, chg: 0.5 },
    { rank: 5, code: '2881', name: '富○金', freq: '年配', yld: 5.8, cash: 2.5, cat: '金融', fill: 82, price: 82.5, chg: -0.2 },
    { rank: 6, code: '2882', name: '國○金', freq: '年配', yld: 5.2, cash: 2.2, cat: '金融', fill: 88, price: 68.3, chg: 0.4 },
    { rank: 7, code: '2880', name: '華○金', freq: '年配', yld: 4.5, cash: 1.1, cat: '金融', fill: 30, price: 28.70, chg: -0.5 },
    { rank: 8, code: '2412', name: '中○電', freq: '年配', yld: 4.3, cash: 4.75, cat: '電信', fill: 88, price: 110.5, chg: 0.2, mark: '連28年' },
    { rank: 9, code: '2884', name: '玉○金', freq: '年配', yld: 3.8, cash: 0.9, cat: '金融', fill: 15, price: 24.20, chg: 0.1 },
    { rank: 10, code: '1101', name: '台○', freq: '年配', yld: 3.1, cash: 1.0, cat: '水泥', fill: 72, price: 32.45, chg: 0.3 },
  ];

  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股', '高股息排行', '視覺化', '試算'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 3 ? A.text : A.textSoft, background: i === 3 ? A.bg3 : 'transparent', borderLeft: i === 3 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
        ))}

        <div style={{ marginTop: 20, borderTop: `1px solid ${A.line}`, paddingTop: 14 }}>
          <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>預設篩選</div>
          {['殖利率 > 6%', '連續 10 年以上', '月配 ETF', '金融股', '填息 < 30 天', '市值前 50'].map((t, i) => (
            <div key={i} style={{ fontSize: 12, padding: '6px 10px', color: i === 0 ? A.green : A.textSoft, background: i === 0 ? 'rgba(34,197,94,0.08)' : 'transparent', borderRadius: 6, marginBottom: 2 }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14 }}>
          <div style={{ fontSize: 13, color: A.textSoft }}>高股息排行</div>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '6px 10px', background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 6, fontSize: 12, color: A.textSoft }}>⇣ 匯出 CSV</div>
          <div style={{ padding: '6px 12px', background: A.green, color: A.bg, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>+ 新篩選</div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${A.line}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            ['殖利率', '> 3%'],
            ['配息頻率', '全部'],
            ['產業', '全部'],
            ['連續配息', '> 5 年'],
            ['填息天數', '不限'],
            ['市值', '> 100 億'],
          ].map(([l, v], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: A.bg2, border: `1px solid ${A.lineStrong}`, borderRadius: 20, fontSize: 11 }}>
              <span style={{ color: A.textFaint, fontFamily: A.fontMono }}>{l}</span>
              <span style={{ fontFamily: A.fontMono, color: A.text }}>{v}</span>
              <span style={{ color: A.textFaint, marginLeft: 2 }}>▾</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono }}>篩選結果 · 247 檔</div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 20 }}>
          <div style={{ background: A.bg2, borderRadius: 10, border: `1px solid ${A.line}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 60px 1.2fr 70px 80px 80px 80px 90px 100px 80px', padding: '10px 16px', background: A.bg3, fontSize: 10, color: A.textFaint, fontFamily: A.fontMono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div>#</div><div>代號</div><div>名稱</div><div>頻率</div><div style={{ textAlign: 'right' }}>殖利率 ↓</div><div style={{ textAlign: 'right' }}>配息</div><div style={{ textAlign: 'right' }}>股價</div><div style={{ textAlign: 'right' }}>漲跌</div><div>填息率</div><div>動作</div>
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 60px 1.2fr 70px 80px 80px 80px 90px 100px 80px', padding: '12px 16px', alignItems: 'center', borderBottom: i < 9 ? `1px solid ${A.line}` : 'none', fontSize: 13 }}>
                <div style={{ fontFamily: A.fontMono, fontSize: 13, fontWeight: 600, color: r.rank <= 3 ? A.green : A.textSoft }}>{String(r.rank).padStart(2, '0')}</div>
                <div style={{ fontFamily: A.fontMono, fontSize: 11, color: A.textFaint }}>{r.code}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 9, color: A.textFaint, padding: '1px 6px', background: A.bg3, borderRadius: 3, fontFamily: A.fontMono }}>{r.cat}</span>
                  {r.mark && <AChip c={A.amber} bg="rgba(245,158,11,0.15)">{r.mark}</AChip>}
                </div>
                <div><AChip>{r.freq}</AChip></div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right', fontWeight: 600, color: r.yld >= 6 ? A.green : A.text }}>{r.yld}%</div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right' }}>${r.cash}</div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right' }}>${r.price}</div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right', color: r.chg >= 0 ? A.red : A.green }}>{r.chg >= 0 ? '+' : ''}{r.chg}%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 4, background: A.bg3, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${r.fill}%`, height: '100%', background: r.fill >= 90 ? A.green : r.fill >= 60 ? A.amber : '#60a5fa' }} />
                  </div>
                  <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, width: 24, textAlign: 'right' }}>{r.fill}%</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 5, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: A.textSoft }}>★</div>
                  <div style={{ width: 24, height: 24, borderRadius: 5, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: A.textSoft }}>⚡</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AWatchlist() {
  const groups = [
    { name: '核心', color: A.green, count: 3, stocks: [STOCKS[0], STOCKS[4], STOCKS[6]] },
    { name: '高股息 ETF', color: '#60a5fa', count: 3, stocks: [STOCKS[1], STOCKS[2], STOCKS[3]] },
    { name: '觀察中', color: A.amber, count: 2, stocks: [STOCKS[5], STOCKS[7]] },
  ];

  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股', '高股息排行', '視覺化'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 2 ? A.text : A.textSoft, background: i === 2 ? A.bg3 : 'transparent', borderLeft: i === 2 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
        ))}
        <div style={{ marginTop: 20, fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>分組</div>
        {groups.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, fontSize: 12, color: A.textSoft, marginBottom: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
            <span style={{ flex: 1 }}>{g.name}</span>
            <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{g.count}</span>
          </div>
        ))}
        <div style={{ padding: '6px 10px', fontSize: 12, color: A.textFaint }}>+ 新增分組</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14 }}>
          <div style={{ fontSize: 13 }}>自選股</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 6, fontSize: 12, color: A.textSoft, width: 240 }}>
            <span>🔍</span> 搜尋或輸入代號 ⌘K
          </div>
          <div style={{ padding: '6px 12px', background: A.green, color: A.bg, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>+ 新增</div>
        </div>

        {/* Summary */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { l: '自選股總數', v: '8 檔', s: '分 3 組' },
            { l: '總市值', v: '$3.42M', s: '+$24,850 今日' },
            { l: '今年領息', v: '$48,260', s: '+12.4% YoY' },
            { l: '待除息', v: '5 檔', s: '本週內' },
          ].map((k, i) => (
            <div key={i} style={{ padding: '14px 16px', background: A.bg2, borderRadius: 10, border: `1px solid ${A.line}` }}>
              <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.l}</div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: A.fontMono, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: A.textSoft, fontFamily: A.fontMono }}>{k.s}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}` }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: g.color }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 11, fontFamily: A.fontMono, color: A.textFaint }}>{g.count} 檔</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 11, color: A.textFaint }}>⋮</div>
              </div>
              {g.stocks.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 80px 100px 100px 120px 80px', gap: 10, padding: '12px 18px', alignItems: 'center', borderBottom: i < g.stocks.length - 1 ? `1px solid ${A.line}` : 'none' }}>
                  <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>⋮⋮</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{s.code} · {s.sector}</div>
                  </div>
                  <div><Spark w={80} h={22} up={s.chg >= 0} series={makeSeries(30, gi * 10 + i, 100, [])} theme="dark" /></div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: A.fontMono, fontSize: 14, fontWeight: 500 }}>${s.price}</div>
                    <div style={{ fontFamily: A.fontMono, fontSize: 10, color: s.chg >= 0 ? A.red : A.green }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>下次除息</div>
                    <div style={{ fontFamily: A.fontMono, fontSize: 12 }}>{s.exDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>配息</div>
                    <div style={{ fontFamily: A.fontMono, fontSize: 12, color: A.green }}>${s.cash}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AChip c={s.filled >= 100 ? A.green : A.amber} bg={s.filled >= 100 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'}>
                      {s.filled >= 100 ? '✓ 已填息' : `填 ${s.filled}%`}
                    </AChip>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 5, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: A.green }}>⚡</div>
                    <div style={{ width: 24, height: 24, borderRadius: 5, background: A.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: A.textSoft }}>⋮</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ADrip() {
  // 10-year compound projection
  const years = Array.from({ length: 11 }, (_, i) => i);
  const principal = 500000, yld = 0.065, growth = 0.06;
  const withReinvest = years.map(y => principal * Math.pow(1 + yld + growth, y));
  const withoutReinvest = years.map(y => principal + principal * yld * y);

  const maxV = Math.max(...withReinvest);

  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股', '高股息排行', '視覺化', '再投入試算'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 5 ? A.text : A.textSoft, background: i === 5 ? A.bg3 : 'transparent', borderLeft: i === 5 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
        ))}
      </div>

      <div style={{ flex: 1, padding: 28, overflow: 'hidden' }}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>再投入試算</div>
        <div style={{ fontSize: 12, color: A.textFaint, marginTop: 4 }}>複利效果模擬 · 股息自動再投入 vs 領出花用</div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: 760 }}>
          {/* Inputs */}
          <div style={{ background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>參數</div>
            {[
              { l: '初始投入', v: '$500,000', slider: 0.5 },
              { l: '每月定期加碼', v: '$10,000', slider: 0.2 },
              { l: '平均殖利率', v: '6.5%', slider: 0.65 },
              { l: '每股股利成長率', v: '6.0% / 年', slider: 0.5 },
              { l: '投資期間', v: '10 年', slider: 0.5 },
              { l: '稅率（補充保費）', v: '2.11%', slider: 0.21 },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: A.textSoft }}>{f.l}</div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 12, color: A.green }}>{f.v}</div>
                </div>
                <div style={{ position: 'relative', height: 4, background: A.bg3, borderRadius: 2 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: `${f.slider * 100}%`, height: '100%', background: A.green, borderRadius: 2 }} />
                  <div style={{ position: 'absolute', left: `calc(${f.slider * 100}% - 6px)`, top: -4, width: 12, height: 12, background: A.text, borderRadius: '50%', boxShadow: '0 0 0 2px ' + A.bg }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${A.line}` }}>
              <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>目標</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, fontFamily: A.fontMono }}>年領 $240,000</div>
                  <div style={{ fontSize: 11, color: A.textSoft, fontFamily: A.fontMono }}>每月 $20,000 被動收入</div>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: 10, background: 'rgba(34,197,94,0.08)', borderRadius: 6, borderLeft: `3px solid ${A.green}`, fontSize: 12, color: A.green }}>
                預計 <b>第 8.4 年</b> 達成 · 提前 1.6 年
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ background: A.bg2, border: `1px solid ${A.line}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: A.textFaint }}>10 年後資產</div>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: A.fontMono, color: A.green, letterSpacing: '-0.02em' }}>${(withReinvest[10] / 1000000).toFixed(2)}M</div>
                <div style={{ fontSize: 11, color: A.textSoft, fontFamily: A.fontMono }}>較不再投入多 +${((withReinvest[10] - withoutReinvest[10]) / 10000).toFixed(0)} 萬</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: A.textFaint }}>第 10 年年息</div>
                <div style={{ fontSize: 28, fontWeight: 600, fontFamily: A.fontMono }}>${(withReinvest[10] * 0.065 / 10000).toFixed(0)}萬</div>
                <div style={{ fontSize: 11, color: A.green, fontFamily: A.fontMono }}>月均 ${(withReinvest[10] * 0.065 / 12).toFixed(0)}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 4, padding: 3, background: A.bg3, borderRadius: 6 }}>
                {['5Y', '10Y', '20Y', '30Y'].map((t, i) => (
                  <div key={i} style={{ padding: '5px 12px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 4, background: i === 1 ? A.bg : 'transparent', color: i === 1 ? A.text : A.textSoft }}>{t}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, marginTop: 18, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 880 380" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dripGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={A.green} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={A.green} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                  <line key={i} x1="0" x2="880" y1={p * 340 + 20} y2={p * 340 + 20} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 4" />
                ))}
                <path d={`${withReinvest.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 10) * 880} ${20 + (1 - v / maxV) * 340}`).join(' ')} L 880 360 L 0 360 Z`} fill="url(#dripGrad)" />
                <path d={withReinvest.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 10) * 880} ${20 + (1 - v / maxV) * 340}`).join(' ')} fill="none" stroke={A.green} strokeWidth="2.5" />
                <path d={withoutReinvest.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 10) * 880} ${20 + (1 - v / maxV) * 340}`).join(' ')} fill="none" stroke={A.textFaint} strokeWidth="1.5" strokeDasharray="5 4" />
                {/* Milestone marker Y8.4 */}
                <line x1={(8.4 / 10) * 880} x2={(8.4 / 10) * 880} y1="20" y2="360" stroke={A.amber} strokeDasharray="3 3" />
                <circle cx={(8.4 / 10) * 880} cy={20 + (1 - withReinvest[8] / maxV) * 340} r="5" fill={A.amber} stroke={A.bg} strokeWidth="2" />
                <text x={(8.4 / 10) * 880 + 10} y={20 + (1 - withReinvest[8] / maxV) * 340 - 10} fill={A.amber} fontSize="11" fontFamily="'JetBrains Mono'" fontWeight="600">目標達成 · Y8.4</text>
              </svg>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 2, fontSize: 10, color: A.textFaint, fontFamily: A.fontMono, marginTop: 6, textAlign: 'center' }}>
              {years.map(y => <div key={y}>Y{y}</div>)}
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${A.line}`, fontSize: 11, fontFamily: A.fontMono }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 2, background: A.green }} /><span style={{ color: A.textSoft }}>股息再投入</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 2, background: A.textFaint, borderStyle: 'dashed' }} /><span style={{ color: A.textSoft }}>領出花用</span></div>
              <div style={{ flex: 1 }} />
              <div style={{ color: A.textSoft }}>通膨調整後 · 實質報酬率 8.1%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AOnboarding() {
  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      {/* Left · visual */}
      <div style={{ width: 640, background: 'radial-gradient(at 30% 40%, rgba(34,197,94,0.15), transparent 60%), #08080a', display: 'flex', flexDirection: 'column', padding: 48, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 15, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>股息站</div>
        </div>

        <div style={{ marginTop: 90 }}>
          <div style={{ fontSize: 12, color: A.green, fontFamily: A.fontMono, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>Dividend · Intelligence</div>
          <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>每一檔配息<br />都值得被追蹤</div>
          <div style={{ fontSize: 15, color: A.textSoft, marginTop: 20, lineHeight: 1.6, maxWidth: 460 }}>
            台股 2,000+ 檔股票與 ETF 的除息日、現金與股票股利、填息進度、發放明細。一站看懂你的被動收入。
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Mini stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { v: '2,047', l: '檔股票' },
            { v: '312', l: 'ETF' },
            { v: '即時', l: '除息提醒' },
          ].map((k, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${A.line}`, borderRadius: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: A.fontMono, color: A.green }}>{k.v}</div>
              <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, marginTop: 2 }}>{k.l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, fontSize: 10, color: A.textFaint, fontFamily: A.fontMono, letterSpacing: '0.1em' }}>© 2026 STOCK DIVIDEND · TWSE REAL-TIME</div>
      </div>

      {/* Right · form */}
      <div style={{ flex: 1, background: A.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: 380 }}>
          {/* Stepper */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ flex: 1, height: 3, background: n <= 2 ? A.green : A.bg3, borderRadius: 2 }} />
            ))}
          </div>

          <div style={{ fontSize: 12, color: A.textFaint, fontFamily: A.fontMono, letterSpacing: '0.15em' }}>STEP 02 / 04</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8, letterSpacing: '-0.01em' }}>加入你的自選股</div>
          <div style={{ fontSize: 13, color: A.textSoft, marginTop: 8, lineHeight: 1.5 }}>我們會幫你追蹤除息日、填息進度、以及每季的預估入帳金額。</div>

          {/* Search input */}
          <div style={{ marginTop: 24, padding: '12px 14px', background: A.bg2, border: `1px solid ${A.lineStrong}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: A.textFaint }}>🔍</span>
            <span style={{ fontSize: 13, color: A.textSoft }}>搜尋股票代號或名稱</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, padding: '2px 6px', background: A.bg3, borderRadius: 3 }}>⌘K</span>
          </div>

          {/* Suggested */}
          <div style={{ marginTop: 18, fontSize: 11, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>熱門推薦</div>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              ['2330', '台○電', true],
              ['0056', '元大高息', true],
              ['00878', '國泰永續'],
              ['00919', '群益月配', true],
              ['2412', '中○電'],
              ['2880', '華○金'],
              ['1101', '台○'],
            ].map(([c, n, on], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: `1px solid ${on ? A.green : A.lineStrong}`, background: on ? 'rgba(34,197,94,0.1)' : 'transparent', borderRadius: 20, fontSize: 12 }}>
                <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{c}</span>
                <span>{n}</span>
                {on && <span style={{ color: A.green }}>✓</span>}
                {!on && <span style={{ color: A.textFaint }}>+</span>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: A.textSoft }}>已選 <span style={{ color: A.green, fontFamily: A.fontMono, fontWeight: 600 }}>3</span> 檔</div>

          <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '12px 20px', background: A.bg2, border: `1px solid ${A.lineStrong}`, borderRadius: 10, fontSize: 14, fontWeight: 500, textAlign: 'center', color: A.textSoft }}>略過</div>
            <div style={{ flex: 2, padding: '12px 20px', background: A.green, color: A.bg, borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>下一步 · 設定提醒 →</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ARanking, AWatchlist, ADrip, AOnboarding });
