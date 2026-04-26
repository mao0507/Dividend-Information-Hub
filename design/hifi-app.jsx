// App wrapper — all hi-fi A pages + 3 directions in a design canvas, with Tweaks.

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#22c55e",
  "upRed": true,
  "density": "cozy",
  "monoFont": "JetBrains Mono",
  "sansFont": "Inter",
  "radius": 10
}/*EDITMODE-END*/;

function applyTweaksToDOM(t) {
  const root = document.documentElement;
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--up-color', t.upRed ? '#ef4444' : '#22c55e');
  root.style.setProperty('--down-color', t.upRed ? '#22c55e' : '#ef4444');
  root.style.setProperty('--density', t.density === 'compact' ? '0.85' : t.density === 'loose' ? '1.15' : '1');
  root.style.setProperty('--radius', `${t.radius}px`);
}

function HiFiApp() {
  const { values, setTweak } = useTweaks(TWEAKS_DEFAULTS);
  React.useEffect(() => { applyTweaksToDOM(values); }, [values]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="intro" title="股息站 · Hi-Fi 產品全貌" subtitle="A 深色終端方向 · 全套核心頁面 + 另兩個方向供比較 · 右下開啟 Tweaks 可調色/字型/密度">
          <DCArtboard id="notes" label="說明" width={480} height={580}>
            <div style={{ padding: 28, fontFamily: "'Inter', 'Noto Sans TC', sans-serif", background: '#fbfaf7', height: '100%', color: '#1d1b17' }}>
              <div style={{ fontSize: 11, color: '#a39d90', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Hi-Fi v2</div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: "'Instrument Serif', serif", letterSpacing: '-0.01em', marginTop: 4 }}>A 方向 · 完整產品</div>
              <div style={{ fontSize: 13, color: '#6b6458', marginTop: 10, lineHeight: 1.6 }}>
                把 A（深色終端）方向推進到完整可瀏覽的產品，包含：
              </div>
              <ul style={{ fontSize: 13, color: '#3b3a36', marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Onboarding 登入與自選設定</li>
                <li>儀表板（已有）</li>
                <li>除息行事曆（月戲模式）</li>
                <li>個股詳情頁（走勢 / 配息史 / 填息 / 同業）</li>
                <li>高股息排行 / 篩選器</li>
                <li>自選股管理（分組 / 提醒）</li>
                <li>再投入試算（複利模擬）</li>
              </ul>
              <div style={{ marginTop: 18, padding: 12, background: '#f7f4ee', borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>Tweaks</div>
                <div style={{ fontSize: 11, color: '#6b6458', marginTop: 4, lineHeight: 1.5 }}>右下角開啟：accent 色、漲綠/漲紅、密度、字型、圓角。所有 A 頁面即時套用。</div>
              </div>
              <div style={{ marginTop: 12, padding: 12, background: '#efece6', borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>B / C 僅保留首頁</div>
                <div style={{ fontSize: 11, color: '#6b6458', marginTop: 4, lineHeight: 1.5 }}>供風格比較，如要往 B/C 推進再告訴我。</div>
              </div>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="a-flows" title="A · 完整流程" subtitle="深色終端方向 · 從登入到試算">
          <DCArtboard id="a-onboarding" label="Onboarding · 加入自選" width={1440} height={900}>
            <AOnboarding />
          </DCArtboard>
          <DCArtboard id="a-dashboard" label="儀表板 · 1440×900" width={1440} height={900}>
            <HiFiADesktop />
          </DCArtboard>
          <DCArtboard id="a-calendar" label="除息行事曆 · 月視圖" width={1440} height={900}>
            <ACalendar />
          </DCArtboard>
          <DCArtboard id="a-calendar-mobile" label="行事曆 · iPhone" width={390} height={844}>
            <ACalendarMobile />
          </DCArtboard>
          <DCArtboard id="a-detail" label="個股詳情 · 台積電" width={1440} height={1200}>
            <ADetail />
          </DCArtboard>
          <DCArtboard id="a-ranking" label="高股息排行 / 篩選器" width={1440} height={900}>
            <ARanking />
          </DCArtboard>
          <DCArtboard id="a-watchlist" label="自選股管理" width={1440} height={900}>
            <AWatchlist />
          </DCArtboard>
          <DCArtboard id="a-drip" label="再投入試算 · 複利模擬" width={1440} height={900}>
            <ADrip />
          </DCArtboard>
          <DCArtboard id="a-alerts" label="提醒中心 / 通知" width={1440} height={900}>
            <AAlerts />
          </DCArtboard>
          <DCArtboard id="a-viz" label="視覺化分析" width={1440} height={980}>
            <AViz />
          </DCArtboard>
          <DCArtboard id="a-settings" label="設定 · 證券戶連結" width={1440} height={900}>
            <ASettings />
          </DCArtboard>
          <DCArtboard id="a-search" label="⌘K 搜尋 / Command Palette" width={1440} height={900}>
            <ASearch />
          </DCArtboard>
        </DCSection>

        <DCSection id="a-mobile" title="A · Mobile · iPhone 流程" subtitle="完整手機體驗">
          <DCArtboard id="a-m-dashboard" label="儀表板" width={390} height={844}>
            <HiFiAMobile />
          </DCArtboard>
          <DCArtboard id="a-m-calendar" label="行事曆" width={390} height={844}>
            <ACalendarMobile />
          </DCArtboard>
          <DCArtboard id="a-m-detail" label="個股詳情 · 台積電" width={390} height={844}>
            <ADetailMobile />
          </DCArtboard>
          <DCArtboard id="a-m-ranking" label="高股息排行" width={390} height={844}>
            <ARankingMobile />
          </DCArtboard>
          <DCArtboard id="a-m-alerts" label="提醒中心" width={390} height={844}>
            <AAlertsMobile />
          </DCArtboard>
        </DCSection>

        <DCSection id="b" title="B · 液態玻璃（風格比較）" subtitle="iOS 26 Liquid Glass">
          <DCArtboard id="b-desktop" label="桌機 1440×900" width={1440} height={900}>
            <HiFiBDesktop />
          </DCArtboard>
          <DCArtboard id="b-mobile" label="iPhone 15" width={390} height={844}>
            <HiFiBMobile />
          </DCArtboard>
        </DCSection>

        <DCSection id="c" title="C · 柔和新擬態（風格比較）" subtitle="Copilot 風 · 暖白柔影">
          <DCArtboard id="c-desktop" label="桌機 1440×900" width={1440} height={900}>
            <HiFiCDesktop />
          </DCArtboard>
          <DCArtboard id="c-mobile" label="iPhone 15" width={390} height={844}>
            <HiFiCMobile />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="主題色（accent）">
          <TweakColor label="Accent" value={values.accent} onChange={v => setTweak('accent', v)} />
          <TweakRadio label="漲跌色" value={values.upRed ? 'red' : 'green'}
            options={[{ value: 'red', label: '漲紅跌綠 · 台股' }, { value: 'green', label: '漲綠跌紅 · 美股' }]}
            onChange={v => setTweak('upRed', v === 'red')} />
        </TweakSection>

        <TweakSection label="介面密度">
          <TweakRadio label="密度" value={values.density}
            options={[{ value: 'compact', label: '緊湊' }, { value: 'cozy', label: '舒適' }, { value: 'loose', label: '寬鬆' }]}
            onChange={v => setTweak('density', v)} />
          <TweakSlider label="圓角" value={values.radius} min={0} max={24} step={2} unit="px"
            onChange={v => setTweak('radius', v)} />
        </TweakSection>

        <TweakSection label="字型">
          <TweakSelect label="數字字型" value={values.monoFont}
            options={[
              { value: 'JetBrains Mono', label: 'JetBrains Mono' },
              { value: 'IBM Plex Mono', label: 'IBM Plex Mono' },
              { value: 'Roboto Mono', label: 'Roboto Mono' },
              { value: 'SF Mono', label: 'SF Mono / system' },
            ]}
            onChange={v => setTweak('monoFont', v)} />
          <TweakSelect label="介面字型" value={values.sansFont}
            options={[
              { value: 'Inter', label: 'Inter' },
              { value: 'Noto Sans TC', label: 'Noto Sans TC' },
              { value: 'system-ui', label: 'System' },
            ]}
            onChange={v => setTweak('sansFont', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HiFiApp />);
