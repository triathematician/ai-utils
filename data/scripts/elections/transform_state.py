import csv, json
from collections import defaultdict

results = defaultdict(lambda: defaultdict(lambda: {'DEMOCRAT': 0, 'REPUBLICAN': 0, 'total': 0}))

with open('1976-2020-president.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        year = int(row['year'])
        if year < 2000 or year > 2020:
            continue
        abbr = row['state_po']
        party = row.get('party_simplified', row.get('party_detailed', ''))
        votes = int(row['candidatevotes'] or 0)
        total = int(row['totalvotes'] or 0)
        if party == 'DEMOCRAT':
            results[year][abbr]['DEMOCRAT'] += votes
        elif party == 'REPUBLICAN':
            results[year][abbr]['REPUBLICAN'] += votes
        results[year][abbr]['total'] = max(results[year][abbr]['total'], total)

output = []
for year in sorted(results):
    for abbr in sorted(results[year]):
        row = results[year][abbr]
        d_v, r_v, total = row['DEMOCRAT'], row['REPUBLICAN'], row['total']
        if total == 0:
            continue
        output.append({'year': year, 'abbr': abbr, 'd': round(d_v/total*100, 1), 'r': round(r_v/total*100, 1)})

print(json.dumps(output, indent=2))
