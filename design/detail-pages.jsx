// Individual stock detail pages — 3 layout variations
// All show 台○電 (2330) as example. Different info architectures.

// Layout A: 經典分區 - 標題區 + 圖表 + 左右欄資料
function DetailA() {
  return (
    <div style={{ width: 720, height: 900, background: WF.paper, color: WF.ink, fontFamily: WF.fontBody, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', borderBottom: `1.5px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <T size={13} c={WF.inkSoft}>‹ 返回</T>
        <div style={{ flex: 1 }} />
        <Btn small>加入自選</Btn>
        <Btn small>🔔 提醒</Btn>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <H size={40}>台○電</H>
            <T mono size={16} c={WF.inkFaint}>2330</T>
            <Pill>季配</Pill>
            <Pill c={WF.green} bg="#e8f5ef">連 20 年配息</Pill>
          </div>
          <T size={12} c={WF.inkSoft} style={{ marginTop: 4 }}>半導體 · 台灣 50 成分股 · 穩定度 9.6 / 10</T>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          {[
            { l: '最新股價', v: '$1,085', s: '+0.5%' },
            { l: '今年殖利率', v: '2.1%', s: '年化' },
            { l: '總股利', v: '$18.00', s: '4 次 × 4.5' },
            { l: '下次除息', v: '05/16', s: '剩 23 天' },
          ].map((k, i) => (
            <div key={i} style={{ border: `1.5px solid ${WF.line}`, borderRadius: 4, padding: 12 }}>
              <T size={10} c={WF.inkFaint}>{k.l}</T>
              <H size={24} style={{ marginTop: 2 }}>{k.v}</H>
              <T size={10} c={WF.inkSoft} mono style={{ marginTop: 2 }}>{k.s}</T>
            </div>
          ))}
        </div>

        <Frame title="股價走勢 · 除息缺口標註" headRight="近 1 年" dense>
          <Hatch w="100%" h={180} label="PRICE CHART WITH EX-DIVIDEND GAPS" />
          <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 10, color: WF.inkSoft }}>
            <div><span style={{ display: 'inline-block', width: 10, height: 2, background: WF.ink, verticalAlign: 'middle' }}></span> 股價</div>
            <div><span style={{ display: 'inline-block', width: 10, height: 2, background: WF.red, verticalAlign: 'middle' }}></span> 除息缺口</div>
            <div><span style={{ display: 'inline-block', width: 10, height: 2, background: WF.green, verticalAlign: 'middle' }}></span> 填息後</div>
          </div>
        </Frame>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, overflow: 'hidden' }}>
          <Frame title="歷史配息" dense>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 50px 60px 60px 1fr', fontSize: 10, color: WF.inkFaint, paddingBottom: 5, borderBottom: `1px dashed ${WF.lineFaint}` }}>
              <div>除息日</div><div>現金</div><div>發放日</div><div>填息</div><div>填息天數</div>
            </div>
            {[
              { d: '2026/02/14', c: '4.50', p: '03/10', f: 100, days: '3 天' },
              { d: '2025/11/14', c: '4.00', p: '12/12', f: 100, days: '5 天' },
              { d: '2025/08/15', c: '4.00', p: '09/11', f: 100, days: '2 天' },
              { d: '2025/05/16', c: '3.50', p: '06/13', f: 100, days: '7 天' },
              { d: '2025/02/15', c: '3.00', p: '03/14', f: 100, days: '1 天' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 50px 60px 60px 1fr', fontSize: 11, padding: '6px 0', borderBottom: `1px dashed ${WF.lineFaint}`, alignItems: 'center' }}>
                <T mono size={10}>{r.d}</T>
                <T mono size={11}>${r.c}</T>
                <T mono size={10}>{r.p}</T>
                <T mono size={10} c={WF.green}>✓ 填</T>
                <T size={10} c={WF.inkSoft}>{r.days}</T>
              </div>
            ))}
          </Frame>

          <Frame title="配息再投入試算" dense>
            <T size={11} c={WF.inkSoft} style={{ marginBottom: 6 }}>假設持股 1,000 股 · 配息全數再買進</T>
            <Hatch w="100%" h={100} label="COMPOUND GROWTH CHART" />
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><T size={10} c={WF.inkFaint}>5 年後</T><T mono size={16}>1,112 股</T></div>
              <div><T size={10} c={WF.inkFaint}>10 年後</T><T mono size={16}>1,241 股</T></div>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}

// Layout B: 時間軸 - 以「事件」為中心
function DetailB() {
  return (
    <div style={{ width: 720, height: 900, background: WF.paper, color: WF.ink, fontFamily: WF.fontBody, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 28px', borderBottom: `1.5px solid ${WF.line}` }}>
        <T size={11} c={WF.inkSoft}>‹ 返回排行</T>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
          <H size={44}>台○電</H>
          <T mono size={14} c={WF.inkFaint}>2330</T>
        </div>
        <T size={12} c={WF.inkSoft} style={{ marginTop: 4 }}>季配息 · 2026 年度累計 $8.50 · 連 20 年配息</T>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 28px', display: 'flex', flexDirection: 'column' }}>
        <H size={22} style={{ marginBottom: 12 }}>配息時間軸</H>

        <div style={{ position: 'relative', paddingLeft: 24, flex: 1, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: WF.lineFaint }} />

          {[
            { d: '2026/05/16', label: '下次除息', est: true, amt: '$4.50 (估)', freq: 'Q2' },
            { d: '2026/02/14', label: '已除息', amt: '$4.50', freq: 'Q1', filled: '3 天填息', current: true },
            { d: '2025/11/14', label: '已除息', amt: '$4.00', freq: 'Q4', filled: '5 天填息' },
            { d: '2025/08/15', label: '已除息', amt: '$4.00', freq: 'Q3', filled: '2 天填息' },
            { d: '2025/05/16', label: '已除息', amt: '$3.50', freq: 'Q2', filled: '7 天填息' },
          ].map((e, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 22 }}>
              <div style={{
                position: 'absolute', left: -22, top: 4, width: 14, height: 14, borderRadius: '50%',
                background: e.est ? WF.paper : (e.current ? WF.red : WF.ink),
                border: `2px solid ${e.est ? WF.lineSoft : WF.ink}`,
                borderStyle: e.est ? 'dashed' : 'solid',
              }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <T mono size={12} c={WF.inkFaint}>{e.d}</T>
                <Pill c={e.est ? WF.inkFaint : (e.current ? WF.red : WF.ink)} style={{ fontSize: 10 }}>{e.label}</Pill>
                <Pill style={{ fontSize: 10 }}>{e.freq}</Pill>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 4 }}>
                <H size={22} c={e.est ? WF.inkFaint : WF.ink}>{e.amt}</H>
                {e.filled && <T size={11} c={WF.green}>✓ {e.filled}</T>}
                {e.est && <T size={11} c={WF.inkFaint}>依前 4 季估算</T>}
              </div>
              {e.current && (
                <div style={{ marginTop: 6, padding: '6px 10px', background: WF.hi, borderRadius: 3, fontSize: 11, display: 'inline-block' }}>
                  你持股 1,000 股 · 已入帳 $4,500
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px dashed ${WF.lineSoft}`, paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div><T size={10} c={WF.inkFaint}>平均填息天數</T><H size={20}>4 天</H></div>
          <div><T size={10} c={WF.inkFaint}>近 5 年填息率</T><H size={20}>100%</H></div>
          <div><T size={10} c={WF.inkFaint}>年化殖利率</T><H size={20}>2.1%</H></div>
        </div>
      </div>
    </div>
  );
}

// Layout C: 摘要優先 - 頂部大數字、下方是「問答」格式
function DetailC() {
  return (
    <div style={{ width: 720, height: 900, background: WF.paper, color: WF.ink, fontFamily: WF.fontBody, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 28px 16px', borderBottom: `1.5px solid ${WF.line}`, background: WF.ink, color: WF.paper }}>
        <T size={11} c="rgba(255,255,255,0.6)">‹ 2330 · 半導體</T>
        <H size={48} c={WF.paper} style={{ marginTop: 6 }}>台○電</H>
        <div style={{ display: 'flex', gap: 32, marginTop: 14 }}>
          <div>
            <T size={10} c="rgba(255,255,255,0.6)">年度總股利</T>
            <H size={28} c={WF.paper}>$18.00</H>
          </div>
          <div>
            <T size={10} c="rgba(255,255,255,0.6)">殖利率</T>
            <H size={28} c={WF.paper}>2.1%</H>
          </div>
          <div>
            <T size={10} c="rgba(255,255,255,0.6)">配息頻率</T>
            <H size={28} c={WF.paper}>季配</H>
          </div>
          <div>
            <T size={10} c="rgba(255,255,255,0.6)">連續配息</T>
            <H size={28} c={WF.paper}>20 年</H>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { q: '下次什麼時候配息？', a: '2026/05/16 除息，預估 $4.50，發放日 07/11', extra: '距今 23 天' },
          { q: '最近一次配多少？', a: '2026/02/14 除息 $4.50，3 天就填息了', extra: '✓ 已填息' },
          { q: '有沒有配股票？', a: '沒有，只發放現金股利', extra: null },
          { q: '今年我總共領多少？', a: '若持股 1,000 股，預估全年領 $18,000', extra: '已入帳 $8,500' },
        ].map((qa, i) => (
          <div key={i} style={{ borderBottom: `1px dashed ${WF.lineSoft}`, paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <H size={16} c={WF.inkFaint}>Q</H>
              <T size={14} weight={500}>{qa.q}</T>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6, paddingLeft: 4 }}>
              <H size={16} c={WF.ink}>A</H>
              <div style={{ flex: 1 }}>
                <T size={14}>{qa.a}</T>
                {qa.extra && <T size={11} c={WF.green} mono style={{ marginTop: 2 }}>{qa.extra}</T>}
              </div>
            </div>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <Hatch w="100%" h={100} label="STOCK PRICE + DIVIDEND GAPS" />
      </div>
    </div>
  );
}

Object.assign(window, { DetailA, DetailB, DetailC });
