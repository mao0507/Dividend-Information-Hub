// A · Stock detail page — chart + candlestick + volume + dividend history + fill speed + peers

function ADetail() {
  const s = STOCKS[0];
  // Dividend history last 10 years
  const hist = [
    { y: 2016, cash: 6.0, stock: 0, yield: 3.5, fillDays: 12 },
    { y: 2017, cash: 7.0, stock: 0, yield: 3.3, fillDays: 8 },
    { y: 2018, cash: 8.0, stock: 0, yield: 3.6, fillDays: 45 },
    { y: 2019, cash: 9.0, stock: 0, yield: 3.4, fillDays: 3 },
    { y: 2020, cash: 10.0, stock: 0, yield: 2.3, fillDays: 1 },
    { y: 2021, cash: 10.5, stock: 0, yield: 1.7, fillDays: 2 },
    { y: 2022, cash: 11.0, stock: 0, yield: 2.3, fillDays: 18 },
    { y: 2023, cash: 13.5, stock: 0, yield: 2.4, fillDays: 6 },
    { y: 2024, cash: 16.0, stock: 0, yield: 2.0, fillDays: 2 },
    { y: 2025, cash: 18.0, stock: 0, yield: 2.1, fillDays: 3 },
  ];
  const maxCash = 20;

  return (
    <div style={{ width: 1440, height: 1200, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>最近瀏覽</div>
        {[['2330', '台○電', true], ['0056', '元大高息'], ['2412', '中○電'], ['2884', '玉○金'], ['2454', '聯○科']].map(([c, n, on], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, fontSize: 12, background: on ? A.bg3 : 'transparent', color: on ? A.text : A.textSoft, marginBottom: 2, borderLeft: on ? `2px solid ${A.green}` : '2px solid transparent' }}>
            <span style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{c}</span>{n}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10 }}>
          <div style={{ fontSize: 12, color: A.textSoft }}>儀表板 › 自選 ›</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>台○電</div>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '6px 12px', background: A.bg2, border: `1px solid ${A.lineStrong}`, borderRadius: 6, fontSize: 12, color: A.textSoft }}>★ 已加自選</div>
          <div style={{ padding: '6px 12px', background: A.green, color: A.bg, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>⚡ 設提醒</div>
        </div>

        {/* Header */}
        <div style={{ padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#fde68a,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 18, fontWeight: 700, color: A.bg }}>2330</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 26, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontFamily: A.fontMono, fontSize: 13, color: A.textFaint }}>TWSE · 半導體 · 台灣 50</div>
                <AChip>季配息</AChip>
                <AChip c={A.green}>連 20 年配息</AChip>
                <AChip c={A.amber} bg="rgba(245,158,11,0.12)">今日除息</AChip>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
                <div style={{ fontSize: 48, fontWeight: 700, fontFamily: A.fontMono, letterSpacing: '-0.02em' }}>${s.price}</div>
                <div style={{ fontSize: 16, color: A.red, fontFamily: A.fontMono, fontWeight: 500 }}>▲ +$5.50 · +{s.chg}%</div>
                <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono }}>13:24 · 成交量 32.4K 張</div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {[
              { l: '本次配息', v: '$4.50', s: '現金 · 季配' },
              { l: '年化殖利率', v: `${s.yield}%`, s: '基於現價' },
              { l: '除息日', v: '今日', s: s.exDate, c: A.green },
              { l: '發放日', v: s.payDate, s: '預估入帳' },
              { l: '平均填息', v: '4 天', s: '過去 5 年', c: A.green },
              { l: '配息穩定度', v: '9.4', s: '/ 10', c: A.amber },
            ].map((k, i) => (
              <div key={i} style={{ padding: 14, background: A.bg2, borderRadius: 10, border: `1px solid ${A.line}` }}>
                <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.l}</div>
                <div style={{ fontSize: 22, fontWeight: 600, marginTop: 3, fontFamily: A.fontMono, color: k.c || A.text }}>{k.v}</div>
                <div style={{ fontSize: 10, color: A.textSoft, fontFamily: A.fontMono, marginTop: 1 }}>{k.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart card */}
        <div style={{ padding: '18px 28px' }}>
          <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>股價走勢</div>
              <div style={{ marginLeft: 16, display: 'flex', gap: 4, padding: 3, background: A.bg3, borderRadius: 6 }}>
                {['K 線', '折線', '區域'].map((t, i) => (
                  <div key={i} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 4, background: i === 1 ? A.bg : 'transparent', color: i === 1 ? A.text : A.textSoft }}>{t}</div>
                ))}
              </div>
              <div style={{ marginLeft: 8, display: 'flex', gap: 4, padding: 3, background: A.bg3, borderRadius: 6 }}>
                {['1D','1W','1M','6M','1Y','5Y','MAX'].map((t, i) => (
                  <div key={i} style={{ padding: '5px 10px', fontSize: 10, fontFamily: A.fontMono, borderRadius: 4, background: i === 4 ? A.bg : 'transparent', color: i === 4 ? A.text : A.textSoft }}>{t}</div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: A.textSoft, fontFamily: A.fontMono }}>
                <div>+ 大盤</div>
                <div>+ 台積電 ADR</div>
                <div>+ 0056</div>
              </div>
            </div>
            <StockChart width={1360} height={340} theme="dark" accent={A.green} />
            {/* Volume mini */}
            <div style={{ marginTop: 6, height: 60, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const h = 15 + ((i * 37) % 45);
                const red = ((i * 13) % 5) < 3;
                return <div key={i} style={{ flex: 1, height: h, background: red ? 'rgba(239,68,68,0.45)' : 'rgba(34,197,94,0.45)' }} />;
              })}
            </div>
            <div style={{ marginTop: 4, fontSize: 10, color: A.textFaint, fontFamily: A.fontMono }}>成交量 · 60 日 · 平均 28.6K 張</div>
          </div>
        </div>

        {/* Dividend history */}
        <div style={{ padding: '0 28px 18px' }}>
          <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>配息歷史 · 10 年</div>
                <div style={{ fontSize: 11, color: A.textFaint, marginTop: 2 }}>現金股利 + 殖利率 + 填息天數</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: A.fontMono, color: A.textSoft }}>
                <div>累計 $109.0</div>
                <div>5 年 CAGR 12.4%</div>
                <div>平均填息 10 天</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180 }}>
              {hist.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textSoft }}>${h.cash}</div>
                  <div style={{ width: '100%', background: A.bg3, borderRadius: 4, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 130, position: 'relative' }}>
                    <div style={{ width: '100%', height: `${(h.cash / maxCash) * 100}%`, background: `linear-gradient(to top, ${A.green}, #86efac)`, borderRadius: 4 }} />
                    <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontFamily: A.fontMono, color: A.textFaint }}>{h.yield}%</div>
                  </div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{h.y}</div>
                  <div style={{ fontFamily: A.fontMono, fontSize: 9, color: h.fillDays > 30 ? A.amber : A.green, padding: '1px 5px', background: h.fillDays > 30 ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)', borderRadius: 3 }}>{h.fillDays}d</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fill progress + Peers row */}
        <div style={{ padding: '0 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>填息進度</div>
            <div style={{ fontSize: 11, color: A.textFaint, marginBottom: 14 }}>本次除息 4/23 起 · 目標價 $1,089.50</div>

            <div style={{ position: 'relative', height: 120 }}>
              {/* Timeline */}
              <svg width="100%" height="120" viewBox="0 0 600 120">
                <defs>
                  <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="30" x2="570" y1="100" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* ex-div marker */}
                <line x1="80" x2="80" y1="20" y2="100" stroke={A.red} strokeDasharray="3 3" />
                <circle cx="80" cy="80" r="4" fill={A.red} />
                <text x="80" y="115" fill={A.red} fontSize="10" textAnchor="middle" fontFamily="'JetBrains Mono'">除息 4/23</text>
                {/* target */}
                <line x1="80" x2="570" y1="30" y2="30" stroke={A.green} strokeDasharray="2 4" opacity="0.5" />
                <text x="575" y="34" fill={A.green} fontSize="10" fontFamily="'JetBrains Mono'">$1,089.50 · 目標</text>
                {/* actual fill path */}
                <path d="M 80 80 Q 160 72, 240 60 T 400 42 T 560 35" fill="none" stroke={A.green} strokeWidth="2" />
                <path d="M 80 80 Q 160 72, 240 60 T 400 42 T 560 35 L 560 100 L 80 100 Z" fill="url(#fillGrad)" />
                <circle cx="560" cy="35" r="5" fill={A.green} stroke={A.bg} strokeWidth="2" />
                <text x="555" y="25" fill={A.green} fontSize="11" textAnchor="end" fontFamily="'JetBrains Mono'" fontWeight="600">填息 98%</text>
              </svg>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10, paddingTop: 14, borderTop: `1px solid ${A.line}` }}>
              <div>
                <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>進度</div>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: A.fontMono, color: A.green }}>98%</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>天數</div>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: A.fontMono }}>3 天</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>剩餘</div>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: A.fontMono, color: A.textSoft }}>$0.50</div>
              </div>
            </div>
          </div>

          <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>同業比較 · 半導體</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono }}>6 檔</div>
            </div>
            {[
              { c: '2330', n: '台○電', price: 1085, yld: 2.1, cash: 18.0, mkt: '28.1T', hi: true },
              { c: '2454', n: '聯○科', price: 985, yld: 1.8, cash: 18.0, mkt: '1.3T' },
              { c: '2379', n: '瑞○', price: 480, yld: 3.5, cash: 17.0, mkt: '245B' },
              { c: '2308', n: '台達電', price: 345, yld: 2.3, cash: 8.0, mkt: '896B' },
              { c: '3008', n: '大立光', price: 2850, yld: 1.8, cash: 52.0, mkt: '381B' },
              { c: '2303', n: '聯○', price: 52.8, yld: 6.6, cash: 3.5, mkt: '657B' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '45px 1fr 70px 55px 55px', gap: 8, padding: '9px 0', fontSize: 12, alignItems: 'center', borderBottom: i < 5 ? `1px solid ${A.line}` : 'none', background: p.hi ? 'rgba(34,197,94,0.06)' : 'transparent', margin: p.hi ? '0 -10px' : 0, padding: p.hi ? '9px 10px' : '9px 0', borderRadius: p.hi ? 4 : 0 }}>
                <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{p.c}</div>
                <div style={{ fontWeight: p.hi ? 600 : 400 }}>{p.n}{p.hi && <span style={{ marginLeft: 6, color: A.green, fontSize: 9 }}>● 本股</span>}</div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right' }}>${p.price}</div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right', color: p.yld >= 5 ? A.green : A.text }}>{p.yld}%</div>
                <div style={{ fontFamily: A.fontMono, textAlign: 'right', color: A.textSoft, fontSize: 11 }}>{p.mkt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings + DRIP */}
        <div style={{ padding: '0 28px 28px' }}>
          <div style={{ background: A.bg2, borderRadius: 12, border: `1px solid ${A.line}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>持有分析</div>
              <div style={{ marginLeft: 10, fontSize: 11, color: A.textFaint }}>你的持倉 · 1,200 股</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
              {[
                { l: '持有成本', v: '$920.50', s: '平均 · 2,300 張' },
                { l: '現值', v: '$1,302,000', s: '+$198,600', c: A.red },
                { l: '價差報酬', v: '+17.9%', s: '未實現', c: A.red },
                { l: '累積配息', v: '$62,100', s: '2020–2025' },
                { l: '遞延總報酬', v: '+22.4%', s: '含股息再投入', c: A.green },
              ].map((k, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, fontFamily: A.fontMono, color: k.c || A.text, marginTop: 2 }}>{k.v}</div>
                  <div style={{ fontSize: 10, color: A.textSoft, fontFamily: A.fontMono }}>{k.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ADetail });
