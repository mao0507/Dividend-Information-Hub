import { join } from 'node:path';
import {
  loadTwseSeedUniverseFromFile,
  mergeTwseDayAllWithMetadata,
} from './twse-seed-universe';

describe('mergeTwseDayAllWithMetadata', () => {
  const rows = [
    [
      '2330',
      '台灣積體電路製造股份有限公司',
      '1',
      '1',
      '1',
      '1',
      '1',
      '1',
      '1',
      '1',
    ],
    ['0050', '元大台灣50', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['031234X', '測試權證', '1', '1', '1', '1', '1', '1', '1', '1'],
  ];

  const shortByCode = new Map<string, string>([['2330', '台積電']]);
  const industryByCode = new Map<string, string>([['2330', '半導體業']]);

  it('maps company with industry, ETF numeric-only, warrant with alpha', () => {
    const out = mergeTwseDayAllWithMetadata(rows, shortByCode, industryByCode);
    expect(out).toHaveLength(3);
    const by = Object.fromEntries(out.map((x) => [x.code, x]));
    expect(by['2330']?.sector).toBe('半導體業');
    expect(by['2330']?.isEtf).toBe(false);
    expect(by['0050']?.isEtf).toBe(true);
    expect(by['0050']?.sector).toBe('ETF');
    expect(by['031234X']?.isEtf).toBe(false);
    expect(by['031234X']?.sector).toBe('權證及其他');
  });
});

describe('loadTwseSeedUniverseFromFile', () => {
  it('loads wrapped snapshot JSON', async () => {
    const path = join(__dirname, 'fixtures', 'sample-universe.json');
    const rows = await loadTwseSeedUniverseFromFile(path);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.code).toBe('2330');
  });
});
