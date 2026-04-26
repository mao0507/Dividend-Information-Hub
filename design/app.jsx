// Main app — wraps all wireframes in a design canvas
// Tweaks: 字體切換、顯示標題附註

const TWEAKS = /*EDITMODE-BEGIN*/{
  "handwrittenFont": true,
  "showAnnotations": true,
  "density": "normal"
}/*EDITMODE-END*/;

function App() {
  const [tweakOpen, setTweakOpen] = React.useState(false);
  const [tweakAvail, setTweakAvail] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(TWEAKS);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweakOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweakOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    setTweakAvail(true);
    return () => window.removeEventListener('message', handler);
  }, []);

  const setTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  React.useEffect(() => {
    const root = document.documentElement;
    if (!tweaks.handwrittenFont) {
      root.style.setProperty('--font-head', 'Noto Sans TC, system-ui, sans-serif');
      root.style.setProperty('--font-hand', 'Noto Sans TC, system-ui, sans-serif');
      WF.fontHead = 'Noto Sans TC, system-ui, sans-serif';
      WF.fontHand = 'Noto Sans TC, system-ui, sans-serif';
    } else {
      WF.fontHead = "'Caveat', cursive";
      WF.fontHand = "'Kalam', 'Caveat', cursive";
    }
  }, [tweaks.handwrittenFont]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="intro" title="台股配息資訊站 · Wireframes" subtitle="4 種方向 × 桌機/手機 + 個股頁 3 種佈局 · 低保真探索">
          <DCArtboard id="legend" label="設計系統 · 圖例" width={520} height={440}>
            <div style={{ padding: 22, fontFamily: WF.fontBody, background: WF.paper, height: '100%', overflow: 'hidden' }}>
              <H size={28}>設計系統</H>
              <T size={12} c={WF.inkSoft} style={{ marginTop: 4, marginBottom: 16 }}>Wireframe 共用的視覺語彙</T>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <T size={10} c={WF.inkFaint} style={{ marginBottom: 4 }}>手寫標題 (Caveat)</T>
                  <H size={24}>股息站</H>
                </div>
                <div>
                  <T size={10} c={WF.inkFaint} style={{ marginBottom: 4 }}>正文 (Noto Sans TC)</T>
                  <T size={14}>今日除息 3 檔</T>
                </div>
                <div>
                  <T size={10} c={WF.inkFaint} style={{ marginBottom: 4 }}>數據 (Mono)</T>
                  <T mono size={16}>$4.50 · 2.1%</T>
                </div>
                <div>
                  <T size={10} c={WF.inkFaint} style={{ marginBottom: 4 }}>佔位圖像</T>
                  <Hatch w="100%" h={28} label="IMG" />
                </div>
              </div>

              <div style={{ marginTop: 18, borderTop: `1px dashed ${WF.lineSoft}`, paddingTop: 14 }}>
                <T size={10} c={WF.inkFaint} style={{ marginBottom: 8 }}>語意色</T>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, background: WF.red, borderRadius: 2 }} /><T size={11}>除息 · 缺口</T></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, background: WF.green, borderRadius: 2 }} /><T size={11}>填息 · 發放</T></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, background: WF.blue, borderRadius: 2 }} /><T size={11}>進度</T></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, background: WF.hi, borderRadius: 2, border: `1px solid ${WF.line}` }} /><T size={11}>自選強調</T></div>
                </div>
              </div>

              <div style={{ marginTop: 14, borderTop: `1px dashed ${WF.lineSoft}`, paddingTop: 14 }}>
                <T size={10} c={WF.inkFaint} style={{ marginBottom: 6 }}>元件</T>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Btn small>次要</Btn>
                  <Btn small primary>主要</Btn>
                  <Pill>季配</Pill>
                  <Pill c={WF.red} bg="#fff0ef">自選</Pill>
                  <FillRing pct={62} size={28} />
                  <Sparkline w={70} h={22} />
                </div>
              </div>
            </div>
          </DCArtboard>

          <DCArtboard id="notes" label="關於這份 wireframe" width={520} height={440}>
            <div style={{ padding: 24, fontFamily: WF.fontBody, background: WF.paper, height: '100%', overflow: 'hidden' }}>
              <H size={24}>閱讀指引</H>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.6 }}>
                <T size={13}>• <b>4 個方向</b>，每個都有桌機 + 手機版，能看到同一組資訊在不同骨架下的感覺。</T>
                <T size={13}>• <b>個股詳情頁</b> 另有 3 種佈局變體（分區、時間軸、問答）。</T>
                <T size={13}>• 股票名稱用「○」遮字以避免複製真實品牌介面；實作時會用真實資料。</T>
                <T size={13}>• 佔位圖像以斜線色塊呈現，標註應放什麼內容。</T>
                <T size={13}>• <b>色彩克制</b>：只有除息/填息/自選使用語意色，其餘維持黑白手感。</T>
                <T size={13}>• 右上角「Tweaks」可切換手寫字體 on/off，預覽正式字體的感覺。</T>
              </div>

              <div style={{ marginTop: 18, padding: 12, background: WF.hi, borderRadius: 4, border: `1px solid ${WF.line}` }}>
                <T size={11} weight={700}>下一步建議</T>
                <T size={11} style={{ marginTop: 4 }}>1. 挑出你偏好的首頁方向（1/2/3/4）</T>
                <T size={11}>2. 挑出個股頁偏好的佈局（A/B/C）</T>
                <T size={11}>3. 告訴我要混搭什麼（例如 方向2 首頁 + DetailC 個股頁）</T>
                <T size={11}>4. 我再做成高保真 mockup</T>
              </div>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="dir1" title="方向 1 · Dashboard 高密度" subtitle="存股族一眼掃完全部 · 類 Linear / Bloomberg terminal">
          <DCArtboard id="d1-desktop" label="桌機 · 儀表板" width={1200} height={780}>
            <Dir1DesktopDashboard />
          </DCArtboard>
          <DCArtboard id="d1-mobile" label="手機 · 儀表板" width={320} height={640}>
            <Dir1MobileDashboard />
          </DCArtboard>
        </DCSection>

        <DCSection id="dir2" title="方向 2 · 行事曆為核心" subtitle="時間驅動 · 配息是一條事件流">
          <DCArtboard id="d2-desktop" label="桌機 · 月曆" width={1200} height={780}>
            <Dir2DesktopCalendar />
          </DCArtboard>
          <DCArtboard id="d2-mobile" label="手機 · 月曆" width={320} height={640}>
            <Dir2MobileCalendar />
          </DCArtboard>
        </DCSection>

        <DCSection id="dir3" title="方向 3 · 自選股優先" subtitle="從『我的組合』出發 · 個人化長期視角">
          <DCArtboard id="d3-desktop" label="桌機 · 自選" width={1200} height={780}>
            <Dir3DesktopWatchlist />
          </DCArtboard>
          <DCArtboard id="d3-mobile" label="手機 · 自選" width={320} height={640}>
            <Dir3MobileWatchlist />
          </DCArtboard>
        </DCSection>

        <DCSection id="dir4" title="方向 4 · 雜誌式卡片" subtitle="精簡留白 · 排行榜為封面">
          <DCArtboard id="d4-desktop" label="桌機 · 雜誌" width={1200} height={780}>
            <Dir4DesktopMagazine />
          </DCArtboard>
          <DCArtboard id="d4-mobile" label="手機 · 雜誌" width={320} height={640}>
            <Dir4MobileMagazine />
          </DCArtboard>
        </DCSection>

        <DCSection id="dir5" title="方向 5 · 圖像化資料視覺化" subtitle="圖表為主角 · 少文字多視覺 · FT / Pudding 風">
          <DCArtboard id="d5-desktop" label="桌機 · 視覺化" width={1200} height={780}>
            <Dir5DesktopViz />
          </DCArtboard>
          <DCArtboard id="d5-mobile" label="手機 · 視覺化" width={320} height={640}>
            <Dir5MobileViz />
          </DCArtboard>
        </DCSection>

        <DCSection id="dir6" title="方向 6 · 報紙排版" subtitle="縱向編排 · 編號導讀 · 像在讀一份財經日報">
          <DCArtboard id="d6-desktop" label="桌機 · 日報" width={1200} height={780}>
            <Dir6DesktopPaper />
          </DCArtboard>
          <DCArtboard id="d6-mobile" label="手機 · 日報" width={320} height={640}>
            <Dir6MobilePaper />
          </DCArtboard>
        </DCSection>

        <DCSection id="detail" title="個股詳情頁 · 3 種佈局" subtitle="獨立探討：點進一檔股票之後，怎麼呈現？">
          <DCArtboard id="det-a" label="A · 經典分區" width={720} height={900}>
            <DetailA />
          </DCArtboard>
          <DCArtboard id="det-b" label="B · 配息時間軸" width={720} height={900}>
            <DetailB />
          </DCArtboard>
          <DCArtboard id="det-c" label="C · 問答摘要式" width={720} height={900}>
            <DetailC />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      {tweakOpen && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          background: WF.paper, border: `1.5px solid ${WF.line}`, borderRadius: 6,
          padding: 16, width: 260, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          fontFamily: WF.fontBody,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <H size={20}>Tweaks</H>
            <div style={{ cursor: 'pointer', fontSize: 14 }} onClick={() => setTweakOpen(false)}>✕</div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={tweaks.handwrittenFont} onChange={e => setTweak('handwrittenFont', e.target.checked)} />
            <T size={12}>手寫字體（標題）</T>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={tweaks.showAnnotations} onChange={e => setTweak('showAnnotations', e.target.checked)} />
            <T size={12}>顯示設計註解</T>
          </label>

          <T size={10} c={WF.inkFaint} style={{ marginTop: 10, lineHeight: 1.5 }}>
            關閉手寫字體可預覽正式中文 UI 字型的效果。
          </T>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
