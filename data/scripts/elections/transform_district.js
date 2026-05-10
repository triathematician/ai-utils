const fs = require('fs');

// CSV line parser that handles quoted fields containing commas
function parseCSVLine(line) {
  const cols = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  cols.push(cur.trim());
  return cols;
}

// Normalize district IDs: "AK-AL" → "AK-01", ensure zero-padded 2-digit number
function normalizeId(raw) {
  if (!raw || !raw.includes('-')) return null;
  const [state, dist] = raw.trim().split('-');
  if (!state || !dist) return null;
  const num = dist === 'AL' ? '01' : dist.padStart(2, '0');
  return `${state}-${num}`;
}

const output = [];

// ── Daily Kos: 2000, 2004, 2008 on 2006-2010 district lines ──────────────────
// Row 1: ,,,2008,,2004,,2000,
// Row 2: CD,Incumbent,Party,Obama,McCain,Kerry,Bush,Gore,Bush
const dk0810File = 'Daily Kos Elections 2008 presidential election results for congressional districts used in 2006, 2008 & 2010 elections - Results.csv';
const dk0810Lines = fs.readFileSync(dk0810File, 'utf8').split('\n').slice(2); // skip 2 header rows

for (const line of dk0810Lines) {
  const cols = parseCSVLine(line);
  const id = normalizeId(cols[0]);
  if (!id) continue;

  const years = [
    { year: 2008, d: cols[3], r: cols[4] },
    { year: 2004, d: cols[5], r: cols[6] },
    { year: 2000, d: cols[7], r: cols[8] },
  ];

  for (const { year, d, r } of years) {
    const dv = parseFloat(d), rv = parseFloat(r);
    if (isNaN(dv) || isNaN(rv)) continue;
    output.push({ year, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
  }
}

// ── Daily Kos: 2012 on 2012-2014 district lines (113th Congress) ──────────────
// Expected header row 1: ,,,2012,,2008,  (or similar)
// Expected header row 2: District,Incumbent,Party,Obama,Romney,...
// TODO: verify column layout once file is downloaded
const dk1214File = 'Daily Kos Elections 2008 & 2012 presidential election results for congressional districts used in 2012 & 2014 elections - Results.csv';
if (fs.existsSync(dk1214File)) {
  const dk1214Lines = fs.readFileSync(dk1214File, 'utf8').split('\n').slice(2);
  for (const line of dk1214Lines) {
    const cols = parseCSVLine(line);
    const id = normalizeId(cols[0]);
    if (!id) continue;
    // 2012 results: cols[3]=Obama, cols[4]=Romney  (verify once file is available)
    const dv = parseFloat(cols[3]), rv = parseFloat(cols[4]);
    if (isNaN(dv) || isNaN(rv)) continue;
    output.push({ year: 2012, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
  }
  console.log('2012 data loaded from 2012-2014 file.');
} else {
  console.warn('WARNING: 2012-2014 file not found — 2012 data will use fallback from 2020-lines file.');
  // Fallback: extract 2012 from the 2020-lines file (missing FL, but better than nothing)
  const dkFile = 'Daily Kos Elections 2008, 2012, 2016 & 2020 presidential election results for congressional districts used in 2020 elections - Results.csv';
  const dkLines = fs.readFileSync(dkFile, 'utf8').split('\n').slice(2);
  for (const line of dkLines) {
    const cols = parseCSVLine(line);
    const id = normalizeId(cols[0]);
    if (!id) continue;
    const dv = parseFloat(cols[7]), rv = parseFloat(cols[8]); // Obama/Romney 2012
    if (isNaN(dv) || isNaN(rv)) continue;
    output.push({ year: 2012, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
  }
}

// ── Daily Kos: 2016, 2020 on 2020 district lines (116th Congress) ─────────────
// Row 1: ,,,2020,,2016,,2012,,2008,
// Row 2: District,Incumbent,Party,Biden,Trump,Clinton,Trump,Obama,Romney,Obama,McCain
const dkFile = 'Daily Kos Elections 2008, 2012, 2016 & 2020 presidential election results for congressional districts used in 2020 elections - Results.csv';
const dkLines = fs.readFileSync(dkFile, 'utf8').split('\n').slice(2);

for (const line of dkLines) {
  const cols = parseCSVLine(line);
  const id = normalizeId(cols[0]);
  if (!id) continue;

  const years = [
    { year: 2020, d: cols[3], r: cols[4] },
    { year: 2016, d: cols[5], r: cols[6] },
  ];

  for (const { year, d, r } of years) {
    const dv = parseFloat(d), rv = parseFloat(r);
    if (isNaN(dv) || isNaN(rv)) continue;
    output.push({ year, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
  }
}

// ── Downballot: 2024 on 2024 district lines (118th Congress) ─────────────────
// Row 1: branding/subscribe row  (skip)
// Row 2: year headers            (skip)
// Row 3: candidate headers       (skip)
// Row 4+: District(0), Incumbent(1), Party(2), Harris(3), Trump(4), Margin(5), Biden(6), Trump(7), Margin(8)
const dbFile = "The Downballot's 2020 & 2024 presidential election results for congressional districts used in the 2024 elections - Percentages.csv";
const dbLines = fs.readFileSync(dbFile, 'utf8').split('\n').slice(3);

for (const line of dbLines) {
  const cols = parseCSVLine(line);
  const id = normalizeId(cols[0]);
  if (!id) continue;
  const dv = parseFloat(cols[3]), rv = parseFloat(cols[4]);
  if (isNaN(dv) || isNaN(rv)) continue;
  output.push({ year: 2024, district: id, d: Math.round(dv * 10) / 10, r: Math.round(rv * 10) / 10 });
}

output.sort((a, b) => a.year - b.year || a.district.localeCompare(b.district));

fs.writeFileSync('../vote-analysis/results-district.json', JSON.stringify(output));
const years = [...new Set(output.map(r => r.year))];
console.log(`${output.length} rows, years: ${years.join(', ')}`);

// Spot-checks
const check = (year, dist, label) => {
  const row = output.find(r => r.year === year && r.district === dist);
  console.log(`  ${label} (${year} ${dist}):`, row ? `D ${row.d} R ${row.r}` : 'NOT FOUND');
};
check(2008, 'CA-14', 'CA-14 Obama 2008 (was missing)');
check(2008, 'FL-13', 'FL-13 Obama 2008 (was missing)');
check(2004, 'TX-22', 'TX-22 Kerry 2004');
check(2000, 'AK-01', 'AK at-large 2000');
check(2012, 'TX-07', 'TX-07 2012');
check(2020, 'TX-07', 'TX-07 Biden flip');
check(2024, 'PA-07', 'PA-07 2024');
