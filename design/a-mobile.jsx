// A · Mobile · 個股詳情 + 排行

function ADetailMobile() {
  const s = STOCKS[0];
  return (
    <div style={{ width: 390, height: 844, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600, fontFamily: A.fontMono }}>
        <div>9:41</div><div style={{ fontSize: 11 }}>● ▌ ▰</div>
      </div>

      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: A.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.textSoft, fontSize: 16 }}>‹</div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>台○電</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: A.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.green, fontSize: 14 }}>★</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: A.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.textSoft, fontSize: 14 }}>⋯</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ fontFamily: A.fontMono, fontSize: 11, color: A.textFaint }}>2330 · TWSE · 半導體</div>
          <AChip c={A.amber} bg="rgba(245,158,11,0.12)">今日除息</AChip>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 38, fontWeight: 700, fontFamily: A.fontMono, letterSpacing: '-0.02em' }}>${s.price}</div>
          <div style={{ fontSize: 13, color: A.red, fontFamily: A.fontMono, fontWeight: 500 }}>▲ +$5.50 · +{s.chg}%</div>
        </div>
        <div style={{ fontSize: 10, color: A.textFaint, fontFamily: A.fontMono, marginTop: 2 }}>13:24 · 成交量 32.4K 張</div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: A.bg2, borderRadius: 12, padding: 14 }}>
          <StockChart width={358} height={180} theme="dark" accent={A.green} />
          <div style={{ display: 'flex', gap: 4, marginTop: 8, padding: 3, background: A.bg3, borderRadius: 6, justifyContent: 'space-between' }}>
            {['1D','1W','1M','6M','1Y','5Y','MAX'].map((t, i) => (
              <div key={i} style={{ flex: 1, padding: '5px 0', textAlign: 'center', fontSize: 10, fontFamily: A.fontMono, borderRadius: 4, background: i === 3 ? A.bg : 'transparent', color: i === 3 ? A.text : A.textSoft }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { l: '本次配息', v: '$4.50', s: '季配 · 現金', c: A.green },
          { l: '殖利率', v: '2.1%', s: '基於現價' },
          { l: '除息日', v: '今日', s: '4/23', c: A.green },
          { l: '發放日', v: '7/11', s: '預估入帳' },
          { l: '平均填息', v: '4 天', s: '過去 5 年', c: A.green },
          { l: '連續配息', v: '20 年', s: '穩定度 9.4' },
        ].map((k, i) => (
          <div key={i} style={{ padding: 11, background: A.bg2, borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.l}</div>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: A.fontMono, color: k.c || A.text, marginTop: 2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: A.textSoft, fontFamily: A.fontMono }}>{k.s}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 12, color: A.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>配息歷史</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56, padding: '0 2px' }}>
          {[6,7,8,9,10,10.5,11,13.5,16,18].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${(v/18)*100}%`, background: i === 9 ? A.green : A.bg3, borderRadius: 2 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, fontFamily: A.fontMono, color: A.textFaint }}>
          <span>'16</span><span>'17</span><span>'18</span><span>'19</span><span>'20</span><span>'21</span><span>'22</span><span>'23</span><span>'24</span><span>'25</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 8, padding: 16, borderTop: `1px solid ${A.line}` }}>
        <div style={{ flex: 1, padding: '12px 0', background: A.bg2, border: `1px solid ${A.lineStrong}`, borderRadius: 10, fontSize: 13, fontWeight: 500, textAlign: 'center', color: A.text }}>⚡ 設提醒</div>
        <div style={{ flex: 1.2, padding: '12px 0', background: A.green, color: A.bg, borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>檢視試算 →</div>
      </div>
    </div>
  );
}

function ARankingMobile() {
  const rows = [
    { rank: 1, code: '00919', name: '群益台灣精選', yld: 10.2, cash: 0.11, chg: 1.2 },
    { rank: 2, code: '0056', name: '元大高股息', yld: 7.8, cash: 0.85, chg: -0.3 },
    { rank: 3, code: '00878', name: '國泰永續', yld: 6.9, cash: 0.55, chg: 0.8 },
    { rank: 4, code: '2303', name: '聯○', yld: 6.6, cash: 3.5, chg: 0.5 },
    { rank: 5, code: '2881', name: '富○金', yld: 5.8, cash: 2.5, chg: -0.2 },
    { rank: 6, code: '2882', name: '國○金', yld: 5.2, cash: 2.2, chg: 0.4 },
    { rank: 7, code: '2880', name: '華○金', yld: 4.5, cash: 1.1, chg: -0.5 },
    { rank: 8, code: '2412', name: '中○電', yld: 4.3, cash: 4.75, chg: 0.2 },
  ];

  return (
    <div style={{ width: 390, height: 844, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600, fontFamily: A.fontMono }}>
        <div>9:41</div><div style={{ fontSize: 11 }}>● ▌ ▰</div>
      </div>

      <div style={{ padding: '8px 16px 10px' }}>
        <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase' }}>TOP RANKINGS</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>高股息排行</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 6 }}>
          {['殖利率 ↓', '月配', 'ETF', '金融', '填息快'].map((t, i) => (
            <div key={i} style={{ padding: '6px 12px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 20, background: i === 0 ? A.green : A.bg2, color: i === 0 ? A.bg : A.textSoft, border: i === 0 ? 'none' : `1px solid ${A.line}`, whiteSpace: 'nowrap', fontWeight: i === 0 ? 600 : 400 }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px 80px' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 6, background: A.bg2, borderRadius: 10, borderLeft: r.rank <= 3 ? `3px solid ${A.green}` : `3px solid transparent` }}>
            <div style={{ width: 26, textAlign: 'center', fontFamily: A.fontMono, fontSize: 14, fontWeight: 700, color: r.rank <= 3 ? A.green : A.textFaint }}>{String(r.rank).padStart(2, '0')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint, marginTop: 1 }}>{r.code} · 配息 ${r.cash}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: A.fontMono, fontSize: 15, fontWeight: 600, color: r.yld >= 6 ? A.green : A.text }}>{r.yld}%</div>
              <div style={{ fontFamily: A.fontMono, fontSize: 10, color: r.chg >= 0 ? A.red : A.green }}>{r.chg >= 0 ? '+' : ''}{r.chg}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom tab bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: A.bg2, borderTop: `1px solid ${A.line}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 28px' }}>
        {[['儀', false], ['曆', false], ['排', true], ['選', false], ['⚙', false]].map(([t, on], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? A.green : A.textFaint, fontSize: 10 }}>
            <div style={{ fontSize: 18, fontFamily: A.fontMono }}>{t}</div>
            <div style={{ fontSize: 9 }}>{['儀表板','行事曆','排行','自選','設定'][i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AAlertsMobile() {
  return (
    <div style={{ width: 390, height: 844, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600, fontFamily: A.fontMono }}>
        <div>9:41</div><div style={{ fontSize: 11 }}>● ▌ ▰</div>
      </div>

      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase' }}>INBOX</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>提醒中心</div>
        </div>
        <div style={{ padding: '6px 10px', background: 'rgba(34,197,94,0.15)', borderRadius: 20, fontSize: 11, color: A.green, fontFamily: A.fontMono, fontWeight: 600 }}>4 未讀</div>
      </div>

      <div style={{ padding: '0 16px', flex: 1, overflow: 'auto' }}>
        {[
          { hi: true, ic: '●', c: A.green, t: '台○電 今日除息', b: '每股 $4.50 · 預估入帳 $5,400', time: '2 分前' },
          { ic: '◆', c: A.amber, t: '0056 股利已入帳', b: '$3,400 已匯入證券戶頭', time: '09:30' },
          { ic: '✓', c: A.green, t: '00919 已完成填息', b: '連續 3 季填息', time: '08:00' },
          { ic: 'i', c: '#60a5fa', t: '中○電 公告股利', b: '現金 $4.75 · 連 28 年配息', time: '昨天' },
          { ic: '●', c: A.green, t: '玉○金 明日除息', b: '$0.9 + 股票股利 $0.1', time: '昨天' },
          { ic: '▼', c: A.red, t: '華○金 除息跌 -2.3%', b: '填息進度延緩', time: '4/20' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: 12, marginBottom: 6, background: n.hi ? 'rgba(34,197,94,0.06)' : A.bg2, borderRadius: 10, border: n.hi ? `1px solid rgba(34,197,94,0.3)` : `1px solid ${A.line}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.c, fontFamily: A.fontMono, fontWeight: 700, flexShrink: 0 }}>{n.ic}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{n.t}</div>
                <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{n.time}</div>
              </div>
              <div style={{ fontSize: 11, color: A.textSoft, marginTop: 3, lineHeight: 1.5 }}>{n.b}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: A.bg2, borderTop: `1px solid ${A.line}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 28px' }}>
        {['儀', '曆', '排', '選', '⚙'].map((t, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: A.textFaint, fontSize: 10 }}>
            <div style={{ fontSize: 18, fontFamily: A.fontMono }}>{t}</div>
            <div style={{ fontSize: 9 }}>{['儀表板','行事曆','排行','自選','設定'][i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ADetailMobile, ARankingMobile, AAlertsMobile });
