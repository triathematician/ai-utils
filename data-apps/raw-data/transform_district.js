const fs = require('fs');

// Normalize district IDs: "AK-AL" → "AK-01", ensure zero-padded 2-digit number
function normalizeId(raw) {
  if (!raw || !raw.includes('-')) return null;
  const [state, dist] = raw.trim().split('-');
  if (!state || !dist) return null;
  const num = dist === 'AL' ? '01' : dist.padStart(2, '0');
  return `${state}-${num}`;
}

const output = [];

// ── Daily Kos: 2008, 2012, 2016, 2020 on 2020 district lines ──────────────
// Header row 1: ,,,2020,,2016,,2012,,2008,
// Header row 2: District,Incumbent,Party,Biden,Trump,Clinton,Trump,Obama,Romney,Obama,McCain
const dkFile = 'Daily Kos Elections 2008, 2012, 2016 & 2020 presidential election results for congressional districts used in 2020 elections - Results.csv';
const dkLines = fs.readFileSync(dkFile, 'utf8').split('\n').slice(2); // skip 2 header rows

for (const line of dkLines) {
  const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  const id = normalizeId(cols[0]);
  if (!id) continue;

  const years = [
    { year: 2020, d: cols[3], r: cols[4] },
    { year: 2016, d: cols[5], r: cols[6] },
    { year: 2012, d: cols[7], r: cols[8] },
    { year: 2008, d: cols[9], r: cols[10] },
  ];

  for (const { year, d, r } of years) {
    const dv = parseFloat(d), rv = parseFloat(r);
    if (isNaN(dv) || isNaN(rv)) continue;
    output.push({ year, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
  }
}

// ── Downballot: 2024 on 2024 district lines ────────────────────────────────
// Row 1: branding/subscribe row  (skip)
// Row 2: year headers            (skip)
// Row 3: candidate headers       (skip)
// Row 4+: data  →  cols: District(0), Incumbent(1), Party(2), Harris(3), Trump(4), Margin(5), Biden(6), Trump(7), Margin(8)
const dbFile = "The Downballot's 2020 & 2024 presidential election results for congressional districts used in the 2024 elections - Percentages.csv";
const dbLines = fs.readFileSync(dbFile, 'utf8').split('\n').slice(3); // skip 3 header rows

for (const line of dbLines) {
  const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  const id = normalizeId(cols[0]);
  if (!id) continue;
  const dv = parseFloat(cols[3]), rv = parseFloat(cols[4]);
  if (isNaN(dv) || isNaN(rv)) continue;
  output.push({ year: 2024, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
}

output.sort((a, b) => a.year - b.year || a.district.localeCompare(b.district));

fs.writeFileSync('../vote-analysis/results-district.json', JSON.stringify(output));
console.log(`${output.length} rows, years: ${[...new Set(output.map(r => r.year))].join(', ')}`);

// Spot-checks
const check = (year, dist, label) => {
  const row = output.find(r => r.year === year && r.district === dist);
  console.log(`  ${label} (${year} ${dist}):`, row ? `D ${row.d} R ${row.r}` : 'NOT FOUND');
};
check(2020, 'TX-07', 'TX-07 Biden flip');
check(2024, 'PA-07', 'PA-07 2024');
check(2008, 'AK-01', 'AK at-large 2008');
