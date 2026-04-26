// Direction 2: 行事曆為核心 - 時間驅動
// 首頁就是月曆。時間感強。配息是一個「事件流」。

function Dir2DesktopCalendar() {
  // build a mock month — April 2026
  const dim = 30;
  const startDow = 2; // April 1 is a Wed-ish
  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);
  while (days.length % 7) days.push(null);

  const events = {
    2: [{ c: '0056', t: '0.85', k: 'ex' }],
    16: [{ c: '00919', t: '0.11', k: 'ex' }],
    18: [{ c: '0056', t: '0.85', k: 'ex', hi: true }, { c: '2884', t: '1.20', k: 'ex' }],
    20: [{ c: '00878', t: '0.55', k: 'ex', hi: true }],
    23: [{ c: '2330', t: '4.50', k: 'ex', hi: true }, { c: '2454', t: '18.0', k: 'ex' }, { c: '2891', t: '0.8', k: 'ex' }],
    25: [{ c: '2880', t: '1.10', k: 'ex', hi: true }],
    8: [{ c: '2412', t: '付', k: 'pay' }],
    11: [{ c: '1101', t: '付', k: 'pay' }],
    22: [{ c: '0056', t: '付', k: 'pay', hi: true }],
  };

  const dow = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div style={{ width: 1200, height: 780, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '12px 20px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <H size={24}>股息行事曆</H>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn small>儀表板</Btn>
          <Btn small>自選</Btn>
          <Btn small>排行</Btn>
          <Btn small>設定</Btn>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Calendar */}
        <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', border: `1.5px solid ${WF.line}`, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ padding: '4px 10px', borderRight: `1px solid ${WF.line}`, fontSize: 12 }}>‹</div>
              <div style={{ padding: '4px 12px', fontSize: 12 }}>今天</div>
              <div style={{ padding: '4px 10px', borderLeft: `1px solid ${WF.line}`, fontSize: 12 }}>›</div>
            </div>
            <H size={28}>2026 年 4 月</H>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 8, fontSize: 11, color: WF.inkSoft, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: WF.red, borderRadius: 2 }}></span>除息日</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: WF.green, borderRadius: 2 }}></span>發放日</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: WF.hi, borderRadius: 2, border: `1px solid ${WF.line}` }}></span>自選</div>
            </div>
            <div style={{ display: 'flex', border: `1px solid ${WF.lineSoft}`, borderRadius: 3, overflow: 'hidden', fontSize: 11 }}>
              <div style={{ padding: '3px 10px', background: WF.ink, color: WF.paper }}>月</div>
              <div style={{ padding: '3px 10px' }}>週</div>
              <div style={{ padding: '3px 10px' }}>列表</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: `1px solid ${WF.line}`, borderLeft: `1px solid ${WF.line}` }}>
            {dow.map((d, i) => (
              <div key={i} style={{ padding: '6px 8px', borderRight: `1px solid ${WF.line}`, borderBottom: `1px solid ${WF.line}`, fontFamily: WF.fontHead, fontSize: 16, color: i === 0 || i === 6 ? WF.inkFaint : WF.ink }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', borderLeft: `1px solid ${WF.line}` }}>
            {days.map((d, i) => {
              const es = d && events[d] ? events[d] : [];
              const isToday = d === 23;
              return (
                <div key={i} style={{
                  borderRight: `1px solid ${WF.line}`, borderBottom: `1px solid ${WF.line}`,
                  padding: '4px 5px', background: isToday ? '#fff9e0' : 'transparent',
                  display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden',
                  minHeight: 80,
                }}>
                  {d && (
                    <T mono size={11} c={isToday ? WF.ink : WF.inkSoft} weight={isToday ? 700 : 400}>{d}{isToday ? ' · 今日' : ''}</T>
                  )}
                  {es.map((e, j) => (
                    <div key={j} style={{
                      fontSize: 10, padding: '1px 4px',
                      borderRadius: 2,
                      background: e.k === 'pay' ? (e.hi ? '#e8f5ef' : WF.paper) : (e.hi ? WF.hi : WF.paper),
                      border: `1px solid ${e.k === 'pay' ? WF.green : WF.red}`,
                      borderLeft: `3px solid ${e.k === 'pay' ? WF.green : WF.red}`,
                      color: WF.ink, fontFamily: WF.fontMono,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {e.c} · {e.t}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar — selected day detail */}
        <div style={{ width: 300, borderLeft: `1.5px solid ${WF.line}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div>
            <T size={10} c={WF.inkFaint}>選取日</T>
            <H size={24}>4/23 · 週四</H>
            <T size={11} c={WF.inkSoft} style={{ marginTop: 4 }}>3 檔除息 · 自選含 1 檔</T>
          </div>

          <div style={{ borderTop: `1px dashed ${WF.lineSoft}`, paddingTop: 10 }}>
            {[
              { c: '2330', n: '台○電', cash: '4.50', freq: '季配', yld: '2.1%', price: '$1,085', chg: '+0.5%', up: true, hi: true },
              { c: '2454', n: '聯○科', cash: '18.0', freq: '年配', yld: '1.8%', price: '$985', chg: '-0.8%', up: false },
              { c: '2891', n: '中○金', cash: '0.80', freq: '年配', yld: '4.2%', price: '$19.2', chg: '+1.1%', up: true },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: `1px dashed ${WF.lineFaint}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <T mono size={11} c={WF.inkFaint}>{s.c}</T>
                  <T size={14} weight={500}>{s.n}</T>
                  {s.hi && <Pill c={WF.red} bg="#fff0ef">自選</Pill>}
                  <div style={{ flex: 1 }} />
                  <T mono size={12} weight={500}>{s.price}</T>
                  <T mono size={10} c={s.up ? WF.red : WF.green}>{s.chg}</T>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11 }}>
                  <div><T size={10} c={WF.inkFaint}>現金股利</T><T mono size={13}>${s.cash}</T></div>
                  <div><T size={10} c={WF.inkFaint}>頻率</T><T size={12}>{s.freq}</T></div>
                  <div><T size={10} c={WF.inkFaint}>殖利率</T><T mono size={13}>{s.yld}</T></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px dashed ${WF.lineSoft}`, paddingTop: 10 }}>
            <T size={10} c={WF.inkFaint} style={{ marginBottom: 4 }}>本月統計</T>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><T size={10} c={WF.inkFaint}>自選除息</T><H size={20}>5 檔</H></div>
              <div><T size={10} c={WF.inkFaint}>預計入帳</T><H size={20}>$6,840</H></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dir2MobileCalendar() {
  const dim = 30;
  const startDow = 2;
  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);
  while (days.length % 7) days.push(null);
  const has = { 2: 1, 16: 1, 18: 2, 20: 1, 23: 3, 25: 1 };
  const hasPay = { 8: 1, 11: 1, 22: 1 };
  const dow = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div style={{ width: 320, height: 640, background: WF.paper, color: WF.ink, display: 'flex', flexDirection: 'column', fontFamily: WF.fontBody, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px 8px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>‹</div>
        <H size={22} style={{ flex: 1, textAlign: 'center' }}>4 月 2026</H>
        <div style={{ width: 22, height: 22, border: `1px solid ${WF.line}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>›</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 6px' }}>
        {dow.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, color: WF.inkFaint, padding: '4px 0', fontFamily: WF.fontHead }}>{d}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 6px', gap: 2 }}>
        {days.map((d, i) => {
          const isToday = d === 23;
          return (
            <div key={i} style={{
              aspectRatio: '1 / 1',
              border: `1px solid ${isToday ? WF.ink : WF.lineFaint}`,
              background: isToday ? WF.hi : 'transparent',
              borderRadius: 4,
              padding: 3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <T mono size={11} c={d ? WF.ink : WF.lineFaint} weight={isToday ? 700 : 400}>{d || ''}</T>
              <div style={{ display: 'flex', gap: 2 }}>
                {d && has[d] && Array.from({ length: has[d] }).slice(0, 3).map((_, j) => (
                  <span key={`e${j}`} style={{ width: 4, height: 4, borderRadius: '50%', background: WF.red }} />
                ))}
                {d && hasPay[d] && <span style={{ width: 4, height: 4, borderRadius: '50%', background: WF.green }} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 14px', borderTop: `1.5px solid ${WF.line}`, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <H size={20}>4/23 · 今日</H>
          <T size={10} c={WF.inkFaint}>3 檔除息</T>
        </div>
        {[
          { c: '2330', n: '台○電', cash: '4.50', price: '$1,085', chg: '+0.5%', up: true, hi: true },
          { c: '2454', n: '聯○科', cash: '18.0', price: '$985', chg: '-0.8%', up: false },
          { c: '2891', n: '中○金', cash: '0.80', price: '$19.2', chg: '+1.1%', up: true },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', marginBottom: 6,
            border: `1px solid ${s.hi ? WF.red : WF.lineSoft}`,
            borderLeft: `3px solid ${s.hi ? WF.red : WF.lineSoft}`,
            background: s.hi ? '#fff0ef' : WF.paper,
            borderRadius: 3,
          }}>
            <T mono size={10} c={WF.inkFaint}>{s.c}</T>
            <T size={13} weight={500} style={{ flex: 1 }}>{s.n}</T>
            <div style={{ textAlign: 'right' }}>
              <T mono size={12} weight={500}>{s.price}</T>
              <T mono size={9} c={s.up ? WF.red : WF.green}>配 ${s.cash} · {s.chg}</T>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1.5px solid ${WF.line}`, display: 'flex', padding: '8px 4px' }}>
        {['儀表', '行事曆', '自選', '排行', '我'].map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11, color: i === 1 ? WF.ink : WF.inkFaint, fontWeight: i === 1 ? 500 : 400 }}>
            <div style={{ width: 18, height: 18, margin: '0 auto 3px', border: `1px solid ${i === 1 ? WF.ink : WF.lineSoft}`, borderRadius: 3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dir2DesktopCalendar, Dir2MobileCalendar });
