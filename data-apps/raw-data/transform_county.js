const fs = require('fs');

const csv = fs.readFileSync('countypres_2000-2024.csv', 'utf8');
const lines = csv.split('\n');
const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
const h = Object.fromEntries(headers.map((k, i) => [k, i]));

// {year: {fips: {hasTOTAL, D_total, R_total, D_other, R_other, total}}}
const results = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cols = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
    else { cur += ch; }
  }
  cols.push(cur);

  const get = k => (cols[h[k]] || '').trim().replace(/^"|"$/g, '');

  if (get('office') !== 'US PRESIDENT') continue;

  const year  = parseInt(get('year'));
  const fips  = get('county_fips').padStart(5, '0');
  const party = get('party');
  const mode  = get('mode');
  const votes = parseInt(get('candidatevotes')) || 0;
  const total = parseInt(get('totalvotes')) || 0;

  if (!fips || fips === '00000') continue;

  if (!results[year]) results[year] = {};
  if (!results[year][fips]) results[year][fips] = { hasTOTAL: false, D_total: 0, R_total: 0, D_other: 0, R_other: 0, total: 0 };
  const r = results[year][fips];

  r.total = Math.max(r.total, total);

  if (mode === 'TOTAL') {
    r.hasTOTAL = true;
    if (party === 'DEMOCRAT')   r.D_total += votes;
    if (party === 'REPUBLICAN') r.R_total += votes;
  } else {
    if (party === 'DEMOCRAT')   r.D_other += votes;
    if (party === 'REPUBLICAN') r.R_other += votes;
  }
}

const output = [];
for (const year of Object.keys(results).sort((a, b) => a - b)) {
  for (const fips of Object.keys(results[year]).sort()) {
    const r = results[year][fips];
    const D = r.hasTOTAL ? r.D_total : r.D_other;
    const R = r.hasTOTAL ? r.R_total : r.R_other;
    if (!r.total) continue;
    output.push({
      year: parseInt(year),
      fips,
      d: Math.round(D / r.total * 1000) / 10,
      r: Math.round(R / r.total * 1000) / 10
    });
  }
}

fs.writeFileSync('../vote-analysis/results-county.json', JSON.stringify(output));
console.log(`${output.length} rows, years: ${[...new Set(output.map(r => r.year))].join(', ')}`);
