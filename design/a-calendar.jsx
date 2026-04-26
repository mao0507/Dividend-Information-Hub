// A · Calendar (month view, dark terminal style)

function ACalendar() {
  const year = 2026, month = 4;
  const firstDow = 3; // April 1 2026 is a Wed-ish for demo
  const daysInMonth = 30;
  const today = 23;

  const events = {
    2: [{ c: '2884', n: '玉○金', a: 0.9, f: '年' }],
    4: [{ c: '3045', n: '台灣大', a: 4.75, f: '年' }],
    8: [{ c: '1101', n: '台○', a: 1.0, f: '年', pay: true }],
    11: [{ c: '2891', n: '中○金', a: 0.8, f: '年' }, { c: '2454', n: '聯○科', a: 18.0, f: '年' }],
    15: [{ c: '00919', n: '群益月配', a: 0.11, f: '月', pay: true }],
    16: [{ c: '00919', n: '群益月配', a: 0.11, f: '月' }],
    18: [{ c: '0056', n: '元大高息', a: 0.85, f: '季', hi: true }],
    20: [{ c: '00878', n: '國泰永續', a: 0.55, f: '季' }],
    22: [{ c: '0056', n: '元大高息', a: 0.85, f: '季', pay: true }, { c: '2884', n: '玉○金', a: 0.9, f: '年', pay: true }],
    23: [{ c: '2330', n: '台○電', a: 4.5, f: '季', hi: true, today: true }, { c: '2454', n: '聯○科', a: 18.0, f: '年' }, { c: '2891', n: '中○金', a: 0.8, f: '年' }],
    24: [{ c: '2884', n: '玉○金', a: 0.9, f: '年' }],
    28: [{ c: '1216', n: '統一', a: 2.7, f: '年' }, { c: '2207', n: '和泰車', a: 13.0, f: '年' }],
    30: [{ c: '2308', n: '台達電', a: 8.0, f: '年', hi: true }, { c: '2382', n: '廣達', a: 4.5, f: '年' }, { c: '3008', n: '大立光', a: 52.0, f: '年' }, { c: '2379', n: '瑞昱', a: 17.0, f: '年' }],
  };

  // Build cells (include prev/next padding)
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ pad: true, d: 31 - firstDow + i + 1 });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d });
  while (cells.length % 7 !== 0) cells.push({ pad: true, d: cells.length - daysInMonth - firstDow + 1 });

  return (
    <div style={{ width: 1440, height: 900, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, background: A.bg2, borderRight: `1px solid ${A.line}`, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${A.green}, #14a34a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 11, fontWeight: 700, color: A.bg }}>$</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>股息站</div>
        </div>
        {['儀表板', '除息行事曆', '自選股 · 8', '高股息排行', '視覺化分析', '試算', '提醒'].map((t, i) => (
          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, color: i === 1 ? A.text : A.textSoft, background: i === 1 ? A.bg3 : 'transparent', borderLeft: i === 1 ? `2px solid ${A.green}` : '2px solid transparent', marginBottom: 2 }}>{t}</div>
        ))}

        <div style={{ marginTop: 20, borderTop: `1px solid ${A.line}`, paddingTop: 14 }}>
          <div style={{ fontSize: 10, color: A.textFaint, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>圖例</div>
          {[
            ['● 除息', A.green],
            ['◆ 發放', A.amber],
            ['▲ 自選', '#60a5fa'],
            ['○ 今日', A.text],
          ].map(([t, c], i) => (
            <div key={i} style={{ fontSize: 11, color: A.textSoft, padding: '3px 0', fontFamily: A.fontMono }}><span style={{ color: c }}>{t.split(' ')[0]}</span> {t.split(' ')[1]}</div>
          ))}
        </div>

        <div style={{ marginTop: 20, borderTop: `1px solid ${A.line}`, paddingTop: 14 }}>
          <div style={{ fontSize: 10, color: A.textFaint, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>篩選</div>
          {['僅自選股', '含 ETF', '月配 · 季配 · 年配', '殖利率 > 5%'].map((t, i) => (
            <div key={i} style={{ fontSize: 11, padding: '5px 0', color: A.textSoft, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${A.lineStrong}`, background: i === 0 ? A.green : 'transparent' }} />{t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14 }}>
          <div style={{ fontSize: 13, color: A.textSoft }}>除息行事曆</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 4, padding: 3, background: A.bg2, borderRadius: 6 }}>
            {['日', '週', '月', '年'].map((t, i) => (
              <div key={i} style={{ padding: '4px 12px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 4, background: i === 2 ? A.bg3 : 'transparent', color: i === 2 ? A.text : A.textSoft }}>{t}</div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: A.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: A.textSoft }}>‹</div>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: A.fontSans, minWidth: 110, textAlign: 'center' }}>2026 · 4 月</div>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: A.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: A.textSoft }}>›</div>
          </div>
          <div style={{ padding: '6px 12px', background: A.green, color: A.bg, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>今天</div>
        </div>

        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, background: A.bg2, borderRadius: 8, overflow: 'hidden', border: `1px solid ${A.line}`, flex: 1 }}>
            {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
              <div key={i} style={{ padding: '8px 10px', fontSize: 11, fontFamily: A.fontMono, color: A.textFaint, background: A.bg2, borderBottom: `1px solid ${A.line}` }}>{d}</div>
            ))}
            {cells.map((c, i) => {
              const ev = events[c.d] || [];
              const isToday = c.d === today && !c.pad;
              return (
                <div key={i} style={{ background: A.bg, minHeight: 110, padding: 7, position: 'relative', opacity: c.pad ? 0.3 : 1, border: isToday ? `1px solid ${A.green}` : 'none', borderRadius: isToday ? 4 : 0 }}>
                  <div style={{ fontSize: 11, fontFamily: A.fontMono, color: isToday ? A.green : (c.pad ? A.textFaint : A.textSoft), fontWeight: isToday ? 700 : 400, marginBottom: 4 }}>{c.d}{isToday && <span style={{ marginLeft: 4, fontSize: 9 }}>TODAY</span>}</div>
                  {!c.pad && ev.slice(0, 3).map((e, j) => (
                    <div key={j} style={{
                      fontSize: 10,
                      padding: '2px 5px',
                      marginBottom: 2,
                      borderRadius: 3,
                      background: e.pay ? 'rgba(245,158,11,0.12)' : (e.hi ? 'rgba(34,197,94,0.15)' : A.bg3),
                      borderLeft: `2px solid ${e.pay ? A.amber : (e.hi ? A.green : '#60a5fa')}`,
                      color: A.text,
                      display: 'flex', alignItems: 'center', gap: 4,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      <span style={{ fontFamily: A.fontMono, fontSize: 9, color: A.textFaint }}>{e.c}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.n}</span>
                      <span style={{ fontFamily: A.fontMono, color: e.pay ? A.amber : A.green }}>{e.pay ? '◆' : '●'}{e.a}</span>
                    </div>
                  ))}
                  {ev.length > 3 && <div style={{ fontSize: 9, color: A.textFaint, fontFamily: A.fontMono, marginTop: 2 }}>+ {ev.length - 3} 更多</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${A.line}`, background: A.bg2, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 24, fontSize: 11, color: A.textSoft, fontFamily: A.fontMono }}>
          <div>本月 · 31 檔除息</div>
          <div style={{ color: A.green }}>● 含自選 5 檔</div>
          <div style={{ color: A.amber }}>◆ 發放 8 筆</div>
          <div>預計入帳 $6,840</div>
          <div style={{ flex: 1 }} />
          <div>最密集：4/30（4 檔）</div>
        </div>
      </div>
    </div>
  );
}

function ACalendarMobile() {
  return (
    <div style={{ width: 390, height: 844, background: A.bg, color: A.text, fontFamily: A.fontSans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 14, fontWeight: 600, fontFamily: A.fontMono }}>
        <div>9:41</div><div style={{ fontSize: 11 }}>● ▌ ▰</div>
      </div>
      <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: A.textFaint, fontFamily: A.fontMono }}>2026</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>4 月</div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: A.bg2, borderRadius: 6 }}>
          {['日', '週', '月'].map((t, i) => (
            <div key={i} style={{ padding: '5px 12px', fontSize: 11, fontFamily: A.fontMono, borderRadius: 4, background: i === 2 ? A.bg3 : 'transparent', color: i === 2 ? A.text : A.textSoft }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, padding: 10, background: A.bg2, borderRadius: 10 }}>
          {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
            <div key={i} style={{ fontSize: 10, fontFamily: A.fontMono, color: A.textFaint, textAlign: 'center' }}>{d}</div>
          ))}
          {[...Array(3)].map((_, i) => <div key={`p${i}`} />)}
          {[...Array(30)].map((_, i) => {
            const d = i + 1;
            const hasE = [2,4,8,11,15,16,18,20,22,23,24,28,30].includes(d);
            const hi = [18, 23, 30].includes(d);
            const today = d === 23;
            return (
              <div key={d} style={{ aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: A.fontMono, fontSize: 13, background: today ? A.green : (hi ? 'rgba(34,197,94,0.12)' : 'transparent'), color: today ? A.bg : A.text, borderRadius: 6, fontWeight: today ? 700 : 400 }}>
                {d}
                {hasE && <div style={{ width: 3, height: 3, background: today ? A.bg : A.green, borderRadius: '50%', marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>4/23 週四</div>
          <AChip>今日 · 除息 3</AChip>
        </div>
        {[
          { c: '2330', n: '台○電', a: 4.5, f: '季' },
          { c: '2454', n: '聯○科', a: 18.0, f: '年' },
          { c: '2891', n: '中○金', a: 0.8, f: '年' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginBottom: 8, background: A.bg2, borderRadius: 10, borderLeft: `3px solid ${A.green}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{e.n}</div>
                <div style={{ fontFamily: A.fontMono, fontSize: 10, color: A.textFaint }}>{e.c}</div>
              </div>
              <div style={{ fontSize: 11, color: A.textSoft, fontFamily: A.fontMono }}>{e.f}配 · 7/11 發放</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: A.fontMono, fontSize: 15, fontWeight: 600, color: A.green }}>${e.a}</div>
              <div style={{ fontSize: 9, color: A.textFaint, fontFamily: A.fontMono }}>每股現金</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ACalendar, ACalendarMobile });
