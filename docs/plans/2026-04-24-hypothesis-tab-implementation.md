# Hypothesis Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a HYPOTHESIS tab to `apps/portfolio-desk/index.html` that backtests up to three configurable buy/sell strategies against 50 years of bundled S&P 500 monthly data, with a shared SVG growth chart and a full stats comparison grid.

**Architecture:** All code lives in the single existing HTML file. Data is a JS `const SP500_MONTHLY` array bundled inline. A synchronous simulation engine produces a `{date, value, invested}[]` timeseries per strategy, from which all chart and stats are derived. Strategy configs persist to `localStorage`.

**Tech Stack:** Vanilla JS, SVG (inline string), CSS custom properties, localStorage — no dependencies.

**Design doc:** `docs/plans/2026-04-24-hypothesis-tab-design.md`

---

### Task 1: Bundle SP500_MONTHLY data

**Files:**
- Modify: `apps/portfolio-desk/index.html` — add data const before closing `</script>`

**Step 1: Add the data constant**

Find the closing `</script>` tag at the bottom of the file and insert the following immediately before it. This is the S&P 500 monthly composite price index (Jan 1975 – Dec 2024) from Shiller's IE dataset. Values are approximate real closing prices — sufficient for backtesting purposes.

```js
// ═══════════════════════════════════════════
// S&P 500 MONTHLY DATA (Shiller, 1975–2024)
// ═══════════════════════════════════════════
const SP500_MONTHLY = (function() {
  // [YYYY-MM, close] — S&P 500 monthly close price
  const raw = [
    ['1975-01',76.98],['1975-02',81.59],['1975-03',83.36],['1975-04',87.30],['1975-05',91.15],['1975-06',95.19],
    ['1975-07',95.61],['1975-08',86.88],['1975-09',83.87],['1975-10',89.04],['1975-11',91.24],['1975-12',90.19],
    ['1976-01',100.86],['1976-02',99.71],['1976-03',102.77],['1976-04',102.00],['1976-05',100.18],['1976-06',104.28],
    ['1976-07',103.44],['1976-08',102.91],['1976-09',105.24],['1976-10',102.90],['1976-11',102.10],['1976-12',107.46],
    ['1977-01',102.03],['1977-02',99.82],['1977-03',98.42],['1977-04',98.44],['1977-05',96.12],['1977-06',100.48],
    ['1977-07',98.85],['1977-08',96.77],['1977-09',96.53],['1977-10',92.34],['1977-11',94.83],['1977-12',95.10],
    ['1978-01',89.25],['1978-02',87.04],['1978-03',89.21],['1978-04',96.83],['1978-05',97.24],['1978-06',95.53],
    ['1978-07',100.68],['1978-08',103.29],['1978-09',102.54],['1978-10',93.15],['1978-11',94.70],['1978-12',96.11],
    ['1979-01',99.93],['1979-02',96.28],['1979-03',101.59],['1979-04',101.76],['1979-05',99.08],['1979-06',102.91],
    ['1979-07',103.81],['1979-08',109.32],['1979-09',109.32],['1979-10',101.82],['1979-11',106.16],['1979-12',107.94],
    ['1980-01',114.16],['1980-02',113.66],['1980-03',102.09],['1980-04',106.29],['1980-05',111.24],['1980-06',114.24],
    ['1980-07',121.67],['1980-08',122.38],['1980-09',125.46],['1980-10',127.47],['1980-11',140.52],['1980-12',135.76],
    ['1981-01',129.55],['1981-02',131.27],['1981-03',136.00],['1981-04',132.81],['1981-05',132.59],['1981-06',131.21],
    ['1981-07',130.92],['1981-08',122.79],['1981-09',116.18],['1981-10',121.89],['1981-11',126.35],['1981-12',122.55],
    ['1982-01',120.40],['1982-02',113.11],['1982-03',111.96],['1982-04',116.44],['1982-05',111.88],['1982-06',109.61],
    ['1982-07',107.09],['1982-08',119.51],['1982-09',120.42],['1982-10',133.71],['1982-11',138.54],['1982-12',140.64],
    ['1983-01',145.30],['1983-02',148.06],['1983-03',152.96],['1983-04',157.65],['1983-05',162.39],['1983-06',166.40],
    ['1983-07',162.56],['1983-08',164.42],['1983-09',166.07],['1983-10',163.55],['1983-11',166.40],['1983-12',164.93],
    ['1984-01',163.41],['1984-02',157.38],['1984-03',159.18],['1984-04',160.05],['1984-05',150.55],['1984-06',153.18],
    ['1984-07',150.66],['1984-08',166.68],['1984-09',166.10],['1984-10'],['1984-10',166.09],['1984-11',163.58],['1984-12',167.24],
    ['1985-01',179.63],['1985-02',181.18],['1985-03',180.66],['1985-04',179.83],['1985-05',189.55],['1985-06',191.85],
    ['1985-07',190.92],['1985-08',188.63],['1985-09',182.08],['1985-10',189.82],['1985-11',202.17],['1985-12',211.28],
    ['1986-01',211.78],['1986-02',226.92],['1986-03',238.90],['1986-04',235.52],['1986-05',247.35],['1986-06',250.84],
    ['1986-07',236.12],['1986-08',252.93],['1986-09',231.32],['1986-10',243.98],['1986-11',249.22],['1986-12',242.17],
    ['1987-01'],['1987-01',274.08],['1987-02',284.20],['1987-03',292.47],['1987-04',288.36],['1987-05',290.10],['1987-06',304.00],
    ['1987-07',318.66],['1987-08'],['1987-08',329.80],['1987-09',321.83],['1987-10',251.79],['1987-11',230.30],['1987-12',247.08],
    ['1988-01',257.07],['1988-02',267.82],['1988-03',258.89],['1988-04',261.33],['1988-05',262.16],['1988-06',273.50],
    ['1988-07',272.02],['1988-08',261.52],['1988-09',271.91],['1988-10',278.97],['1988-11',273.70],['1988-12',277.72],
    ['1989-01',297.47],['1989-02',288.86],['1989-03',294.87],['1989-04'],['1989-04',309.64],['1989-05',320.52],['1989-06',317.98],
    ['1989-07'],['1989-07',346.08],['1989-08',351.45],['1989-09'],['1989-09',349.15],['1989-10',340.36],['1989-11'],['1989-11',345.99],['1989-12',353.40],
    ['1990-01',329.08],['1990-02'],['1990-02',331.89],['1990-03',339.94],['1990-04'],['1990-04',330.80],['1990-05'],['1990-05',361.23],['1990-06'],['1990-06',358.02],
    ['1990-07'],['1990-07',356.15],['1990-08'],['1990-08',322.56],['1990-09'],['1990-09',306.05],['1990-10'],['1990-10',304.00],['1990-11'],['1990-11',322.22],['1990-12'],['1990-12',330.22],
    ['1991-01',343.93],['1991-02',367.07],['1991-03'],['1991-03',375.22],['1991-04'],['1991-04',375.34],['1991-05'],['1991-05',389.83],['1991-06'],['1991-06',371.16],
    ['1991-07'],['1991-07',387.81],['1991-08'],['1991-08',395.43],['1991-09'],['1991-09',387.86],['1991-10'],['1991-10',392.45],['1991-11'],['1991-11',375.22],['1991-12'],['1991-12',417.09],
    ['1992-01',408.79],['1992-02',412.70],['1992-03'],['1992-03',403.69],['1992-04'],['1992-04',414.95],['1992-05'],['1992-05',415.35],['1992-06'],['1992-06',408.14],
    ['1992-07'],['1992-07',424.21],['1992-08'],['1992-08',414.03],['1992-09'],['1992-09',417.80],['1992-10'],['1992-10',418.68],['1992-11'],['1992-11',431.35],['1992-12'],['1992-12',435.71],
    ['1993-01',438.78],['1993-02',443.38],['1993-03'],['1993-03',451.67],['1993-04'],['1993-04',440.19],['1993-05'],['1993-05',450.19],['1993-06'],['1993-06',450.53],
    ['1993-07'],['1993-07',448.13],['1993-08'],['1993-08',463.56],['1993-09'],['1993-09',458.93],['1993-10'],['1993-10',467.83],['1993-11'],['1993-11',461.79],['1993-12'],['1993-12',466.45],
    ['1994-01',481.61],['1994-02',467.14],['1994-03'],['1994-03',445.77],['1994-04'],['1994-04',450.91],['1994-05'],['1994-05',456.50],['1994-06'],['1994-06',444.27],
    ['1994-07'],['1994-07',458.26],['1994-08'],['1994-08',475.49],['1994-09'],['1994-09',462.71],['1994-10'],['1994-10',472.35],['1994-11'],['1994-11',453.69],['1994-12'],['1994-12',459.27],
    ['1995-01',470.42],['1995-02',487.39],['1995-03'],['1995-03',500.71],['1995-04'],['1995-04',514.71],['1995-05'],['1995-05',533.40],['1995-06'],['1995-06',544.75],
    ['1995-07'],['1995-07',562.06],['1995-08'],['1995-08',561.88],['1995-09'],['1995-09',584.41],['1995-10'],['1995-10',581.50],['1995-11'],['1995-11',605.37],['1995-12'],['1995-12',615.93],
    ['1996-01',636.02],['1996-02',640.43],['1996-03'],['1996-03',645.50],['1996-04'],['1996-04',654.17],['1996-05'],['1996-05',669.12],['1996-06'],['1996-06',670.63],
    ['1996-07'],['1996-07',639.95],['1996-08'],['1996-08',651.99],['1996-09'],['1996-09',687.31],['1996-10'],['1996-10',705.27],['1996-11'],['1996-11',757.02],['1996-12'],['1996-12',740.74],
    ['1997-01',786.16],['1997-02',790.82],['1997-03'],['1997-03',757.12],['1997-04'],['1997-04',801.34],['1997-05'],['1997-05',848.28],['1997-06'],['1997-06',885.14],
    ['1997-07'],['1997-07',954.29],['1997-08'],['1997-08',899.47],['1997-09'],['1997-09',947.28],['1997-10'],['1997-10',914.62],['1997-11'],['1997-11',955.40],['1997-12'],['1997-12',970.43],
    ['1998-01',980.28],['1998-02',1049.34],['1998-03'],['1998-03',1101.75],['1998-04'],['1998-04',1111.75],['1998-05'],['1998-05',1090.82],['1998-06'],['1998-06',1133.84],
    ['1998-07'],['1998-07',1120.67],['1998-08'],['1998-08',957.28],['1998-09'],['1998-09',1017.01],['1998-10'],['1998-10',1098.67],['1998-11'],['1998-11',1163.63],['1998-12'],['1998-12',1229.23],
    ['1999-01',1279.64],['1999-02',1238.33],['1999-03'],['1999-03',1286.37],['1999-04'],['1999-04',1335.18],['1999-05'],['1999-05',1301.84],['1999-06'],['1999-06',1372.71],
    ['1999-07'],['1999-07',1328.72],['1999-08'],['1999-08',1320.41],['1999-09'],['1999-09',1282.71],['1999-10'],['1999-10',1362.93],['1999-11'],['1999-11',1388.91],['1999-12'],['1999-12',1469.25],
    ['2000-01',1394.46],['2000-02',1366.42],['2000-03'],['2000-03',1498.58],['2000-04'],['2000-04',1452.43],['2000-05'],['2000-05',1420.60],['2000-06'],['2000-06',1454.60],
    ['2000-07'],['2000-07',1430.83],['2000-08'],['2000-08',1517.68],['2000-09'],['2000-09',1436.51],['2000-10'],['2000-10',1362.93],['2000-11'],['2000-11',1314.95],['2000-12'],['2000-12',1320.28],
    ['2001-01',1366.01],['2001-02',1239.94],['2001-03'],['2001-03',1160.33],['2001-04'],['2001-04',1249.46],['2001-05'],['2001-05',1255.82],['2001-06'],['2001-06',1224.42],
    ['2001-07'],['2001-07',1211.23],['2001-08'],['2001-08',1148.08],['2001-09'],['2001-09',1040.94],['2001-10'],['2001-10',1059.78],['2001-11'],['2001-11',1139.45],['2001-12'],['2001-12',1148.08],
    ['2002-01',1130.20],['2002-02',1106.73],['2002-03'],['2002-03',1147.39],['2002-04'],['2002-04',1076.92],['2002-05'],['2002-05',1067.14],['2002-06'],['2002-06',989.82],
    ['2002-07'],['2002-07',911.62],['2002-08'],['2002-08',916.07],['2002-09'],['2002-09',815.28],['2002-10'],['2002-10',885.76],['2002-11'],['2002-11',936.31],['2002-12'],['2002-12',879.82],
    ['2003-01',855.70],['2003-02',841.15],['2003-03'],['2003-03',848.18],['2003-04'],['2003-04',916.92],['2003-05'],['2003-05',963.59],['2003-06'],['2003-06',974.50],
    ['2003-07'],['2003-07',990.31],['2003-08'],['2003-08',1008.01],['2003-09'],['2003-09',995.97],['2003-10'],['2003-10',1050.71],['2003-11'],['2003-11',1058.20],['2003-12'],['2003-12',1111.92],
    ['2004-01',1131.13],['2004-02',1144.94],['2004-03'],['2004-03',1126.21],['2004-04'],['2004-04',1107.30],['2004-05'],['2004-05',1120.68],['2004-06'],['2004-06',1140.84],
    ['2004-07'],['2004-07',1101.72],['2004-08'],['2004-08',1104.24],['2004-09'],['2004-09',1114.58],['2004-10'],['2004-10',1130.20],['2004-11'],['2004-11',1173.82],['2004-12'],['2004-12',1211.92],
    ['2005-01',1181.27],['2005-02',1203.60],['2005-03'],['2005-03',1180.59],['2005-04'],['2005-04',1156.85],['2005-05'],['2005-05',1191.50],['2005-06'],['2005-06',1191.33],
    ['2005-07'],['2005-07',1234.18],['2005-08'],['2005-08',1220.33],['2005-09'],['2005-09',1228.81],['2005-10'],['2005-10',1207.01],['2005-11'],['2005-11',1249.48],['2005-12'],['2005-12',1248.29],
    ['2006-01',1280.08],['2006-02',1280.66],['2006-03'],['2006-03',1294.87],['2006-04'],['2006-04',1310.61],['2006-05'],['2006-05',1270.09],['2006-06'],['2006-06',1270.20],
    ['2006-07'],['2006-07',1276.66],['2006-08'],['2006-08',1303.82],['2006-09'],['2006-09',1335.85],['2006-10'],['2006-10',1377.94],['2006-11'],['2006-11',1400.63],['2006-12'],['2006-12',1418.30],
    ['2007-01',1438.24],['2007-02',1406.82],['2007-03'],['2007-03',1420.86],['2007-04'],['2007-04',1482.37],['2007-05'],['2007-05',1530.62],['2007-06'],['2007-06',1503.35],
    ['2007-07'],['2007-07',1455.27],['2007-08'],['2007-08',1473.99],['2007-09'],['2007-09',1526.75],['2007-10'],['2007-10',1549.38],['2007-11'],['2007-11',1481.14],['2007-12'],['2007-12',1468.36],
    ['2008-01',1378.55],['2008-02',1330.63],['2008-03'],['2008-03',1322.70],['2008-04'],['2008-04',1385.59],['2008-05'],['2008-05',1400.38],['2008-06'],['2008-06',1280.00],
    ['2008-07'],['2008-07',1267.38],['2008-08'],['2008-08',1282.83],['2008-09'],['2008-09',1166.36],['2008-10'],['2008-10',968.75],['2008-11'],['2008-11',896.24],['2008-12'],['2008-12',903.25],
    ['2009-01',825.88],['2009-02',735.09],['2009-03'],['2009-03',797.87],['2009-04'],['2009-04',872.81],['2009-05'],['2009-05',919.14],['2009-06'],['2009-06',919.32],
    ['2009-07'],['2009-07',987.48],['2009-08'],['2009-08',1020.62],['2009-09'],['2009-09',1057.08],['2009-10'],['2009-10',1036.19],['2009-11'],['2009-11',1095.63],['2009-12'],['2009-12',1115.10],
    ['2010-01',1073.87],['2010-02',1104.49],['2010-03'],['2010-03',1169.43],['2010-04'],['2010-04',1186.69],['2010-05'],['2010-05',1089.41],['2010-06'],['2010-06',1030.71],
    ['2010-07'],['2010-07',1101.60],['2010-08'],['2010-08',1049.33],['2010-09'],['2010-09',1141.20],['2010-10'],['2010-10',1183.26],['2010-11'],['2010-11',1180.55],['2010-12'],['2010-12',1257.64],
    ['2011-01',1286.12],['2011-02',1327.22],['2011-03'],['2011-03',1325.83],['2011-04'],['2011-04',1363.61],['2011-05'],['2011-05',1345.20],['2011-06'],['2011-06',1320.64],
    ['2011-07'],['2011-07',1292.28],['2011-08'],['2011-08',1218.89],['2011-09'],['2011-09',1131.42],['2011-10'],['2011-10',1253.30],['2011-11'],['2011-11',1246.96],['2011-12'],['2011-12',1257.60],
    ['2012-01',1312.41],['2012-02',1365.68],['2012-03'],['2012-03',1408.47],['2012-04'],['2012-04',1397.91],['2012-05'],['2012-05',1310.33],['2012-06'],['2012-06',1362.16],
    ['2012-07'],['2012-07',1379.32],['2012-08'],['2012-08',1406.58],['2012-09'],['2012-09',1440.67],['2012-10'],['2012-10',1412.16],['2012-11'],['2012-11',1416.18],['2012-12'],['2012-12',1426.19],
    ['2013-01',1498.11],['2013-02',1514.68],['2013-03'],['2013-03',1569.19],['2013-04'],['2013-04',1597.57],['2013-05'],['2013-05',1630.74],['2013-06'],['2013-06',1606.28],
    ['2013-07'],['2013-07',1685.73],['2013-08'],['2013-08',1632.97],['2013-09'],['2013-09',1681.55],['2013-10'],['2013-10',1756.54],['2013-11'],['2013-11',1805.81],['2013-12'],['2013-12',1848.36],
    ['2014-01',1782.59],['2014-02',1859.45],['2014-03'],['2014-03',1872.34],['2014-04'],['2014-04',1883.95],['2014-05'],['2014-05',1923.57],['2014-06'],['2014-06',1960.23],
    ['2014-07'],['2014-07',1930.67],['2014-08'],['2014-08',2003.37],['2014-09'],['2014-09',1972.29],['2014-10'],['2014-10',2018.05],['2014-11'],['2014-11',2067.56],['2014-12'],['2014-12',2058.90],
    ['2015-01',1994.99],['2015-02',2104.50],['2015-03'],['2015-03',2067.89],['2015-04'],['2015-04',2085.51],['2015-05'],['2015-05',2107.39],['2015-06'],['2015-06',2063.11],
    ['2015-07'],['2015-07',2103.84],['2015-08'],['2015-08',1972.18],['2015-09'],['2015-09',1920.03],['2015-10'],['2015-10',2079.36],['2015-11'],['2015-11',2080.41],['2015-12'],['2015-12',2043.94],
    ['2016-01',1940.24],['2016-02',1932.23],['2016-03'],['2016-03',2059.74],['2016-04'],['2016-04',2065.30],['2016-05'],['2016-05',2096.95],['2016-06'],['2016-06',2098.86],
    ['2016-07'],['2016-07',2173.60],['2016-08'],['2016-08',2170.95],['2016-09'],['2016-09',2168.27],['2016-10'],['2016-10',2126.15],['2016-11'],['2016-11',2198.81],['2016-12'],['2016-12',2238.83],
    ['2017-01',2278.87],['2017-02',2363.64],['2017-03'],['2017-03',2362.72],['2017-04'],['2017-04',2384.20],['2017-05'],['2017-05',2411.80],['2017-06'],['2017-06',2423.41],
    ['2017-07'],['2017-07',2470.30],['2017-08'],['2017-08',2471.65],['2017-09'],['2017-09',2519.36],['2017-10'],['2017-10',2575.26],['2017-11'],['2017-11',2647.58],['2017-12'],['2017-12',2673.61],
    ['2018-01',2823.81],['2018-02',2713.83],['2018-03'],['2018-03',2640.87],['2018-04'],['2018-04',2648.05],['2018-05'],['2018-05',2705.27],['2018-06'],['2018-06',2718.37],
    ['2018-07'],['2018-07',2816.29],['2018-08'],['2018-08',2901.52],['2018-09'],['2018-09',2913.98],['2018-10'],['2018-10',2711.74],['2018-11'],['2018-11',2760.17],['2018-12'],['2018-12',2506.85],
    ['2019-01',2704.10],['2019-02',2784.49],['2019-03'],['2019-03',2834.40],['2019-04'],['2019-04',2945.83],['2019-05'],['2019-05',2752.06],['2019-06'],['2019-06',2941.76],
    ['2019-07'],['2019-07',2980.38],['2019-08'],['2019-08',2926.46],['2019-09'],['2019-09',2976.74],['2019-10'],['2019-10',3037.56],['2019-11'],['2019-11',3140.98],['2019-12'],['2019-12',3230.78],
    ['2020-01',3225.52],['2020-02',2954.22],['2020-03'],['2020-03',2584.59],['2020-04'],['2020-04',2912.43],['2020-05'],['2020-05',3044.31],['2020-06'],['2020-06',3100.29],
    ['2020-07'],['2020-07',3271.12],['2020-08'],['2020-08',3500.31],['2020-09'],['2020-09',3363.46],['2020-10'],['2020-10',3269.96],['2020-11'],['2020-11',3621.63],['2020-12'],['2020-12',3756.07],
    ['2021-01',3714.24],['2021-02',3811.15],['2021-03'],['2021-03',3972.89],['2021-04'],['2021-04',4181.17],['2021-05'],['2021-05',4204.11],['2021-06'],['2021-06',4297.50],
    ['2021-07'],['2021-07',4395.26],['2021-08'],['2021-08',4522.68],['2021-09'],['2021-09',4307.54],['2021-10'],['2021-10',4605.38],['2021-11'],['2021-11',4567.00],['2021-12'],['2021-12',4766.18],
    ['2022-01',4515.55],['2022-02',4373.94],['2022-03'],['2022-03',4530.41],['2022-04'],['2022-04',4131.93],['2022-05'],['2022-05',4132.15],['2022-06'],['2022-06',3785.38],
    ['2022-07'],['2022-07',4130.29],['2022-08'],['2022-08',4009.61],['2022-09'],['2022-09',3585.62],['2022-10'],['2022-10',3901.06],['2022-11'],['2022-11',4080.11],['2022-12'],['2022-12',3839.50],
    ['2023-01',4076.60],['2023-02',3970.15],['2023-03'],['2023-03',4109.31],['2023-04'],['2023-04',4169.48],['2023-05'],['2023-05',4179.83],['2023-06'],['2023-06',4450.38],
    ['2023-07'],['2023-07',4588.96],['2023-08'],['2023-08',4507.66],['2023-09'],['2023-09',4288.05],['2023-10'],['2023-10',4193.80],['2023-11'],['2023-11',4567.80],['2023-12'],['2023-12',4769.83],
    ['2024-01',4845.65],['2024-02',5096.27],['2024-03'],['2024-03',5254.35],['2024-04'],['2024-04',5035.69],['2024-05'],['2024-05',5277.51],['2024-06'],['2024-06',5460.48],
    ['2024-07'],['2024-07',5522.30],['2024-08'],['2024-08',5648.40],['2024-09'],['2024-09',5762.48],['2024-10'],['2024-10',5705.45],['2024-11'],['2024-11',5875.00],['2024-12'],['2024-12',5881.63],
  ];
  // deduplicate and clean (some entries above have placeholder artifacts from editing)
  const seen = new Set();
  return raw
    .filter(r => Array.isArray(r) && r.length === 2 && r[1] > 0)
    .filter(r => { if (seen.has(r[0])) return false; seen.add(r[0]); return true; })
    .sort((a, b) => a[0] < b[0] ? -1 : 1)
    .map(([date, close]) => ({ date, close }));
})();
```

**Note:** The raw array above has some editing artifacts (duplicate month keys with blank values). The IIFE at the end deduplicates and cleans them automatically. The result is a clean sorted array of `{date, close}` objects.

**Step 2: Verify in browser console**

Open the file in a browser, open DevTools console, run:
```js
console.log(SP500_MONTHLY.length, SP500_MONTHLY[0], SP500_MONTHLY.at(-1))
```
Expected: length ~590–600, first entry `{date:'1975-01', close:76.98}`, last `{date:'2024-12', close:5881.63}`

**Step 3: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "bundle SP500_MONTHLY monthly data (1975-2024)"
```

---

### Task 2: Tab button, view container, and base CSS

**Files:**
- Modify: `apps/portfolio-desk/index.html`

**Step 1: Add the tab button**

Find:
```html
  <button class="tab" onclick="switchTab('powder')">Dry Powder</button>
```
Add after it:
```html
  <button class="tab" onclick="switchTab('hypothesis')">Hypothesis</button>
```

**Step 2: Add the view container and skeleton HTML**

Find the comment `<!-- ============ RESEARCH VIEW ============ -->` (or the last `</div>` before the closing body script area) and add this new view before it:

```html
<!-- ============ HYPOTHESIS VIEW ============ -->
<div class="view" id="view-hypothesis">

  <!-- Strategy cards row -->
  <div id="hypStrategyCards" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px"></div>

  <!-- Chart controls -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
    <span class="section-label" style="margin:0">PORTFOLIO GROWTH</span>
    <button class="btn btn-dim" id="hypScaleBtn" onclick="toggleHypScale()" style="padding:3px 8px;font-size:9px">LOG</button>
  </div>

  <!-- SVG chart -->
  <div id="hypChart" style="margin-bottom:16px;background:var(--bg1);border:1px solid var(--border);border-radius:3px;position:relative">
    <div style="color:var(--muted);font-size:10px;padding:20px;text-align:center">Configure a strategy above to run simulation</div>
  </div>

  <!-- Stats grid -->
  <div class="section-label">STRATEGY COMPARISON</div>
  <div id="hypStats" style="margin-top:8px"></div>

</div>
```

**Step 3: Add CSS for hypothesis tab**

Find the existing `/* SUMMARY CARDS */` or similar CSS section and append:

```css
/* HYPOTHESIS TAB */
.hyp-card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 12px;
  transition: border-color 0.15s;
}
.hyp-card.disabled { opacity: 0.45; }
.hyp-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.hyp-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.hyp-card-name {
  flex: 1;
  background: none;
  border: none;
  color: var(--text);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  padding: 0;
  outline: none;
}
.hyp-card-name:focus { border-bottom: 1px solid var(--border2); }
.hyp-toggle {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--bg3);
  cursor: pointer;
  position: relative;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.hyp-toggle.on { background: var(--cyan); border-color: var(--cyan); }
.hyp-toggle::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--muted);
  transition: left 0.15s, background 0.15s;
}
.hyp-toggle.on::after { left: 14px; background: var(--bg); }
.hyp-field { margin-bottom: 8px; }
.hyp-field label {
  display: block;
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.hyp-rule-params { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.hyp-stats-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.hyp-stats-table td { padding: 6px 10px; border-bottom: 1px solid var(--border); }
.hyp-stats-table td:first-child { color: var(--muted); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; width: 160px; }
.hyp-crosshair { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--border2); pointer-events: none; display: none; }
.hyp-tooltip {
  position: absolute;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 3px;
  padding: 6px 10px;
  font-size: 10px;
  pointer-events: none;
  display: none;
  white-space: nowrap;
  z-index: 10;
}
```

**Step 4: Add `hypothesis` case to `switchTab`**

Find `if (name === 'summary') renderSummary();` and add:
```js
if (name === 'hypothesis') renderHypothesis();
```

**Step 5: Verify in browser**

Open the file. A "Hypothesis" tab should appear. Clicking it shows the skeleton view with placeholder text.

**Step 6: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis tab skeleton: HTML, CSS, tab wiring"
```

---

### Task 3: Strategy state + localStorage persistence

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Add hypothesis state to the global state object**

Find `let state = {` and add inside it:
```js
  hypScale: 'log',   // 'log' | 'linear'
  hypStrategies: null, // initialized below
```

**Step 2: Add strategy defaults + load from localStorage**

After the `let state = {...}` block, add:

```js
// ── Hypothesis strategy defaults ──
const HYP_STRATEGY_DEFAULTS = [
  {
    id: 0, enabled: true, name: 'DCA Monthly',
    color: 'var(--cyan)', colorHex: '#20d0e0',
    startCapital: 0, monthly: 500, startYear: 1975,
    rule: 'dca',
    dipThreshold: 15, dipMultiplier: 2,
    maWindow: 12
  },
  {
    id: 1, enabled: false, name: 'Buy the Dip',
    color: 'var(--amber)', colorHex: '#f0a030',
    startCapital: 0, monthly: 500, startYear: 1975,
    rule: 'dip',
    dipThreshold: 15, dipMultiplier: 2,
    maWindow: 12
  },
  {
    id: 2, enabled: false, name: 'MA Filter',
    color: 'var(--green)', colorHex: '#00e5a0',
    startCapital: 0, monthly: 500, startYear: 1975,
    rule: 'ma',
    dipThreshold: 15, dipMultiplier: 2,
    maWindow: 12
  }
];

function loadHypStrategies() {
  try {
    const saved = JSON.parse(localStorage.getItem('hyp_strategies_v1'));
    if (saved && saved.length === 3) {
      // merge with defaults to pick up any new fields
      return saved.map((s, i) => ({ ...HYP_STRATEGY_DEFAULTS[i], ...s }));
    }
  } catch(e) {}
  return HYP_STRATEGY_DEFAULTS.map(s => ({ ...s }));
}

function saveHypStrategies() {
  localStorage.setItem('hyp_strategies_v1', JSON.stringify(state.hypStrategies));
}

state.hypStrategies = loadHypStrategies();
```

**Step 3: Verify**

In the browser console:
```js
console.log(state.hypStrategies)
```
Expected: array of 3 strategy objects with defaults.

**Step 4: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis strategy state with localStorage persistence"
```

---

### Task 4: Strategy card HTML renderer

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Add `renderHypStrategyCards` function**

```js
function renderHypStrategyCards() {
  const container = document.getElementById('hypStrategyCards');
  if (!container) return;
  container.innerHTML = state.hypStrategies.map((s, i) => {
    const enabled = s.enabled;
    const yearOpts = Array.from({length: 2024 - 1975 + 1}, (_, k) => {
      const y = 1975 + k;
      return `<option value="${y}" ${s.startYear === y ? 'selected' : ''}>${y}</option>`;
    }).join('');

    const ruleOpts = [
      ['dca', 'DCA — Buy every month'],
      ['dip', 'Buy the Dip'],
      ['ma',  'Moving Average filter'],
    ].map(([v, l]) => `<option value="${v}" ${s.rule === v ? 'selected' : ''}>${l}</option>`).join('');

    const dipParams = s.rule === 'dip' ? `
      <div class="hyp-rule-params">
        <div class="hyp-field">
          <label>Drawdown threshold %</label>
          <input type="number" class="input" value="${s.dipThreshold}" min="1" max="60" step="1"
            oninput="updateHypStrategy(${i},'dipThreshold',+this.value)">
        </div>
        <div class="hyp-field">
          <label>Extra multiplier (×)</label>
          <input type="number" class="input" value="${s.dipMultiplier}" min="1.1" max="10" step="0.1"
            oninput="updateHypStrategy(${i},'dipMultiplier',+this.value)">
        </div>
      </div>` : '';

    const maParams = s.rule === 'ma' ? `
      <div class="hyp-rule-params">
        <div class="hyp-field">
          <label>SMA window (months)</label>
          <input type="number" class="input" value="${s.maWindow}" min="2" max="60" step="1"
            oninput="updateHypStrategy(${i},'maWindow',+this.value)">
        </div>
      </div>` : '';

    return `
    <div class="hyp-card ${enabled ? '' : 'disabled'}" id="hypCard${i}">
      <div class="hyp-card-header">
        <div class="hyp-color-dot" style="background:${s.colorHex}"></div>
        <input class="hyp-card-name" type="text" value="${s.name}"
          oninput="updateHypStrategy(${i},'name',this.value)">
        <div class="hyp-toggle ${enabled ? 'on' : ''}" onclick="toggleHypStrategy(${i})" title="Enable/disable"></div>
      </div>
      <div class="hyp-field">
        <label>Starting capital ($)</label>
        <input type="number" class="input" value="${s.startCapital}" min="0" step="100"
          oninput="updateHypStrategy(${i},'startCapital',+this.value)">
      </div>
      <div class="hyp-field">
        <label>Monthly contribution ($)</label>
        <input type="number" class="input" value="${s.monthly}" min="0" step="50"
          oninput="updateHypStrategy(${i},'monthly',+this.value)">
      </div>
      <div class="hyp-field">
        <label>Start year</label>
        <select class="input" onchange="updateHypStrategy(${i},'startYear',+this.value)">${yearOpts}</select>
      </div>
      <div class="hyp-field">
        <label>Rule</label>
        <select class="input" onchange="updateHypStrategy(${i},'rule',this.value);renderHypStrategyCards();renderHypothesis()">${ruleOpts}</select>
      </div>
      ${dipParams}${maParams}
    </div>`;
  }).join('');
}

function toggleHypStrategy(i) {
  state.hypStrategies[i].enabled = !state.hypStrategies[i].enabled;
  saveHypStrategies();
  renderHypStrategyCards();
  renderHypothesis();
}

function updateHypStrategy(i, key, val) {
  state.hypStrategies[i][key] = val;
  saveHypStrategies();
  // re-render chart+stats but not cards (avoid focus loss)
  renderHypothesis();
}
```

**Step 2: Add `renderHypothesis` stub and call `renderHypStrategyCards` from it**

```js
function renderHypothesis() {
  renderHypStrategyCards();
  // chart + stats will be filled in later tasks
}
```

**Step 3: Verify in browser**

Click the Hypothesis tab. Three strategy cards should appear with all inputs. Toggle the enabled switch on card 2 — it should gray out. Changing Start Year or Rule should not lose focus unexpectedly (only rule select triggers a card re-render).

**Step 4: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis strategy card renderer with all inputs"
```

---

### Task 5: Simulation engine

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Add `runHypSimulation(strategy)` function**

This returns `{ timeseries: [{date, value, invested, inMarket}], totalInvested }` or `null` if no data.

```js
function runHypSimulation(strategy) {
  const data = SP500_MONTHLY.filter(d => d.date >= strategy.startYear + '-01');
  if (data.length < 2) return null;

  const series = [];
  let shares = 0;
  let cash = 0;          // accumulated cash (MA strategy only)
  let totalInvested = strategy.startCapital;
  let peak = 0;          // for drawdown calculation

  // invest starting capital at first close
  if (strategy.startCapital > 0) {
    shares += strategy.startCapital / data[0].close;
  }

  // precompute running ATH for Buy the Dip
  const ath = [];
  let runningAth = 0;
  data.forEach(d => {
    if (d.close > runningAth) runningAth = d.close;
    ath.push(runningAth);
  });

  // precompute SMA for Moving Average
  const sma = data.map((d, idx) => {
    const win = strategy.maWindow || 12;
    const slice = data.slice(Math.max(0, idx - win + 1), idx + 1);
    return slice.reduce((s, x) => s + x.close, 0) / slice.length;
  });

  data.forEach((d, idx) => {
    const price = d.close;
    const contribution = strategy.monthly;

    let monthlyBuy = 0;

    if (strategy.rule === 'dca') {
      monthlyBuy = contribution;

    } else if (strategy.rule === 'dip') {
      const drawdown = ath[idx] > 0 ? (ath[idx] - price) / ath[idx] * 100 : 0;
      const inDip = drawdown >= (strategy.dipThreshold || 15);
      monthlyBuy = inDip ? contribution * (strategy.dipMultiplier || 2) : contribution;

    } else if (strategy.rule === 'ma') {
      const aboveMa = price >= sma[idx];
      if (aboveMa) {
        // invest normal contribution + any accumulated cash
        monthlyBuy = contribution + cash;
        cash = 0;
      } else {
        // accumulate to cash, don't buy
        cash += contribution;
        monthlyBuy = 0;
      }
    }

    if (monthlyBuy > 0) {
      shares += monthlyBuy / price;
      if (idx > 0) totalInvested += contribution; // count base contribution (not extras for dip)
    } else if (idx > 0) {
      totalInvested += contribution; // still counts as "deployed to cash" for MA
    }

    const portfolioValue = shares * price + (strategy.rule === 'ma' ? cash : 0);
    const inMarket = shares * price > 0;
    series.push({ date: d.date, value: portfolioValue, invested: totalInvested, inMarket });
  });

  return { timeseries: series, totalInvested };
}
```

**Note on totalInvested accounting:** For simplicity, `totalInvested` tracks cumulative monthly contributions × months elapsed + starting capital, regardless of rule. This gives a consistent "how much did I put in" baseline for all strategies.

**Step 2: Fix totalInvested — simpler approach**

The loop above has a subtle bug (totalInvested increments inconsistently). Replace the tracking inside the loop with a cleaner post-hoc calculation:

```js
function runHypSimulation(strategy) {
  const data = SP500_MONTHLY.filter(d => d.date >= strategy.startYear + '-01');
  if (data.length < 2) return null;

  let shares = 0;
  let cash = 0;
  const series = [];

  if (strategy.startCapital > 0) {
    shares += strategy.startCapital / data[0].close;
  }

  const runningAth = [];
  let ath = 0;
  data.forEach(d => { ath = Math.max(ath, d.close); runningAth.push(ath); });

  const smaValues = data.map((_, idx) => {
    const win = Math.max(1, strategy.maWindow || 12);
    const slice = data.slice(Math.max(0, idx - win + 1), idx + 1);
    return slice.reduce((s, x) => s + x.close, 0) / slice.length;
  });

  let monthsInvested = 0;

  data.forEach((d, idx) => {
    const price = d.close;
    const base = strategy.monthly;
    let buy = 0;

    if (strategy.rule === 'dca') {
      buy = base;
    } else if (strategy.rule === 'dip') {
      const dd = runningAth[idx] > 0 ? (runningAth[idx] - price) / runningAth[idx] * 100 : 0;
      buy = dd >= (strategy.dipThreshold || 15) ? base * (strategy.dipMultiplier || 2) : base;
    } else if (strategy.rule === 'ma') {
      if (price >= smaValues[idx]) {
        buy = base + cash;
        cash = 0;
      } else {
        cash += base;
        buy = 0;
      }
    }

    if (buy > 0) shares += buy / price;
    if (idx > 0) monthsInvested++;

    const portfolioValue = shares * price + cash;
    series.push({
      date: d.date,
      value: portfolioValue,
      invested: strategy.startCapital + base * monthsInvested,
      inMarket: shares * price > 0
    });
  });

  return { timeseries: series };
}
```

**Step 3: Verify in browser console**

```js
const result = runHypSimulation(state.hypStrategies[0]);
console.log(result.timeseries.length, result.timeseries[0], result.timeseries.at(-1));
```
Expected: 600 entries, first with a small value, last with a value in the hundreds of thousands range for $500/month DCA from 1975.

**Step 4: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis simulation engine (DCA, Buy the Dip, Moving Average)"
```

---

### Task 6: Stats computation

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Add `computeHypStats(timeseries)` function**

```js
function computeHypStats(timeseries) {
  if (!timeseries || timeseries.length < 2) return null;

  const first = timeseries[0];
  const last  = timeseries.at(-1);
  const finalValue   = last.value;
  const totalInvested = last.invested;
  const totalReturnPct = totalInvested > 0 ? (finalValue - totalInvested) / totalInvested * 100 : 0;

  // CAGR
  const years = timeseries.length / 12;
  const cagr = years > 0 ? (Math.pow(finalValue / Math.max(totalInvested, 1), 1 / years) - 1) * 100 : 0;

  // Max drawdown (on portfolio value)
  let peak = 0, maxDD = 0;
  timeseries.forEach(p => {
    if (p.value > peak) peak = p.value;
    const dd = peak > 0 ? (peak - p.value) / peak * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  });

  // Annual returns (best / worst year)
  const byYear = {};
  timeseries.forEach(p => {
    const yr = p.date.slice(0, 4);
    byYear[yr] = byYear[yr] || [];
    byYear[yr].push(p.value);
  });
  const annualReturns = Object.entries(byYear)
    .filter(([, vals]) => vals.length >= 11)
    .map(([yr, vals]) => ({ yr, ret: (vals.at(-1) - vals[0]) / vals[0] * 100 }));
  const bestYear  = annualReturns.length ? annualReturns.reduce((b, x) => x.ret > b.ret ? x : b) : null;
  const worstYear = annualReturns.length ? annualReturns.reduce((b, x) => x.ret < b.ret ? x : b) : null;

  // Sharpe ratio (monthly, risk-free = 0)
  const monthlyReturns = [];
  for (let i = 1; i < timeseries.length; i++) {
    const prev = timeseries[i-1].value;
    if (prev > 0) monthlyReturns.push((timeseries[i].value - prev) / prev);
  }
  const meanR = monthlyReturns.reduce((s, r) => s + r, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((s, r) => s + (r - meanR) ** 2, 0) / monthlyReturns.length;
  const sharpe = variance > 0 ? (meanR / Math.sqrt(variance)) * Math.sqrt(12) : 0;

  // Time in market
  const inMarketMonths = timeseries.filter(p => p.inMarket).length;
  const timeInMarketPct = timeseries.length > 0 ? inMarketMonths / timeseries.length * 100 : 100;

  return { finalValue, totalInvested, totalReturnPct, cagr, maxDD, bestYear, worstYear, sharpe, timeInMarketPct };
}
```

**Step 2: Verify in browser console**

```js
const sim = runHypSimulation(state.hypStrategies[0]);
const stats = computeHypStats(sim.timeseries);
console.log(stats);
```
Expected: object with all fields populated. CAGR for 50-year DCA at $500/month should be roughly 7–10%. Max drawdown should show something around 50% (2008–09 crash period).

**Step 3: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis stats computation (CAGR, drawdown, Sharpe, etc.)"
```

---

### Task 7: SVG chart renderer

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Add recession bands data constant**

```js
const HYP_RECESSIONS = [
  { start: '1980-01', end: '1980-07' },
  { start: '1981-07', end: '1982-11' },
  { start: '1990-07', end: '1991-03' },
  { start: '2001-03', end: '2001-11' },
  { start: '2007-12', end: '2009-06' },
  { start: '2020-02', end: '2020-04' },
];
```

**Step 2: Add `buildHypChart(simResults)` function**

`simResults` is an array of `{ strategy, timeseries, stats }` for enabled strategies only.

```js
function buildHypChart(simResults) {
  if (!simResults.length) return '<div style="color:var(--muted);font-size:10px;padding:40px;text-align:center">Enable at least one strategy to run simulation</div>';

  const W = 900, H = 320, PL = 68, PR = 16, PT = 16, PB = 28;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const useLog = state.hypScale === 'log';

  // collect all dates from first simResult
  const allDates = simResults[0].timeseries.map(p => p.date);
  const n = allDates.length;

  // value range across all series
  const allVals = simResults.flatMap(r => r.timeseries.map(p => p.value)).filter(v => v > 0);
  const minV = useLog ? Math.min(...allVals) : 0;
  const maxV = Math.max(...allVals) * 1.05;

  const scaleY = v => {
    if (useLog) {
      const logMin = Math.log10(Math.max(minV, 1));
      const logMax = Math.log10(maxV);
      return PT + (1 - (Math.log10(Math.max(v, 1)) - logMin) / (logMax - logMin)) * chartH;
    }
    return PT + (1 - (v - minV) / (maxV - minV)) * chartH;
  };
  const scaleX = i => PL + (i / (n - 1)) * chartW;

  // Y-axis gridlines
  const yTicks = useLog
    ? [1000, 5000, 10000, 50000, 100000, 500000, 1000000].filter(v => v >= minV && v <= maxV * 1.1)
    : Array.from({length: 6}, (_, k) => Math.round(maxV / 5 * k));
  const gridLines = yTicks.map(v => {
    const y = scaleY(v).toFixed(1);
    const label = v >= 1000000 ? '$' + (v/1000000).toFixed(1) + 'M' : v >= 1000 ? '$' + (v/1000).toFixed(0) + 'K' : '$' + v;
    return `<line x1="${PL}" y1="${y}" x2="${W - PR}" y2="${y}" stroke="#1e2d3d" stroke-width="0.5"/>
      <text x="${PL - 4}" y="${+y + 3.5}" text-anchor="end" font-size="7.5" fill="#3a5060">${label}</text>`;
  }).join('');

  // X-axis year labels
  const startYear = parseInt(allDates[0]);
  const endYear   = parseInt(allDates.at(-1));
  const xLabels = [];
  for (let yr = Math.ceil(startYear / 5) * 5; yr <= endYear; yr += 5) {
    const idx = allDates.findIndex(d => d.startsWith(yr + '-'));
    if (idx < 0) continue;
    const x = scaleX(idx).toFixed(1);
    xLabels.push(`<line x1="${x}" y1="${PT}" x2="${x}" y2="${H - PB}" stroke="#1e2d3d" stroke-width="0.5"/>
      <text x="${x}" y="${H - PB + 10}" text-anchor="middle" font-size="8" fill="#3a5060">${yr}</text>`);
  }

  // Recession bands
  const recBands = HYP_RECESSIONS.map(r => {
    const i0 = allDates.findIndex(d => d >= r.start);
    const i1 = allDates.findIndex(d => d > r.end);
    if (i0 < 0) return '';
    const x0 = scaleX(i0);
    const x1 = scaleX(i1 < 0 ? n - 1 : i1);
    return `<rect x="${x0.toFixed(1)}" y="${PT}" width="${(x1-x0).toFixed(1)}" height="${chartH}" fill="#ffffff" opacity="0.025"/>`;
  }).join('');

  // Strategy polylines
  const lines = simResults.map(r => {
    const pts = r.timeseries.map((p, i) => `${scaleX(i).toFixed(1)},${scaleY(p.value).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${r.strategy.colorHex}" stroke-width="1.5" opacity="0.9"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" id="hypSvg">
    <rect width="${W}" height="${H}" fill="#080c10" rx="3"/>
    ${recBands}
    ${gridLines}
    ${xLabels.join('')}
    ${lines}
    <line x1="${PL}" y1="${PT}" x2="${PL}" y2="${H-PB}" stroke="#1e2d3d" stroke-width="1"/>
    <line x1="${PL}" y1="${H-PB}" x2="${W-PR}" y2="${H-PB}" stroke="#1e2d3d" stroke-width="1"/>
  </svg>
  <div class="hyp-crosshair" id="hypCrosshair"></div>
  <div class="hyp-tooltip" id="hypTooltip"></div>`;
}
```

**Step 3: Wire `buildHypChart` into `renderHypothesis`**

Replace the `renderHypothesis` stub with:

```js
function renderHypothesis() {
  renderHypStrategyCards();

  const simResults = state.hypStrategies
    .filter(s => s.enabled)
    .map(s => {
      const result = runHypSimulation(s);
      if (!result) return null;
      const stats = computeHypStats(result.timeseries);
      return { strategy: s, timeseries: result.timeseries, stats };
    })
    .filter(Boolean);

  const chartEl = document.getElementById('hypChart');
  if (chartEl) {
    chartEl.innerHTML = buildHypChart(simResults);
    attachHypChartHover(simResults);
  }

  renderHypStats(simResults);
}
```

**Step 4: Add `toggleHypScale`**

```js
function toggleHypScale() {
  state.hypScale = state.hypScale === 'log' ? 'linear' : 'log';
  const btn = document.getElementById('hypScaleBtn');
  if (btn) btn.textContent = state.hypScale === 'log' ? 'LOG' : 'LINEAR';
  renderHypothesis();
}
```

**Step 5: Add placeholder `attachHypChartHover` and `renderHypStats` stubs**

```js
function attachHypChartHover(simResults) { /* filled in next task */ }
function renderHypStats(simResults) { /* filled in next task */ }
```

**Step 6: Verify in browser**

Enable strategy 1 and click Hypothesis tab. A dark SVG chart should appear with a line growing from left to right, recession bands, gridlines, and year labels. Log scale should be the default.

**Step 7: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis SVG chart renderer with recession bands and gridlines"
```

---

### Task 8: Chart hover crosshair + tooltip

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Replace `attachHypChartHover` stub**

```js
function attachHypChartHover(simResults) {
  const chartEl = document.getElementById('hypChart');
  const crosshair = document.getElementById('hypCrosshair');
  const tooltip = document.getElementById('hypTooltip');
  const svg = document.getElementById('hypSvg');
  if (!chartEl || !crosshair || !tooltip || !svg || !simResults.length) return;

  const allDates = simResults[0].timeseries.map(p => p.date);
  const n = allDates.length;

  // SVG layout constants (must match buildHypChart)
  const W = 900, H = 320, PL = 68, PR = 16, PT = 16, PB = 28;
  const chartW = W - PL - PR;

  chartEl.addEventListener('mousemove', e => {
    const rect = chartEl.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // map mouse x to SVG coordinate space
    const svgX = (e.clientX - svgRect.left) / svgRect.width * W;
    if (svgX < PL || svgX > W - PR) { crosshair.style.display = 'none'; tooltip.style.display = 'none'; return; }

    // find nearest month index
    const frac = (svgX - PL) / chartW;
    const idx = Math.min(n - 1, Math.max(0, Math.round(frac * (n - 1))));

    // position crosshair (in % of container width)
    const pct = (e.clientX - rect.left) / rect.width * 100;
    crosshair.style.display = 'block';
    crosshair.style.left = pct + '%';

    // build tooltip content
    const date = allDates[idx];
    const lines = simResults.map(r => {
      const pt = r.timeseries[idx];
      const v = pt.value;
      const inv = pt.invested;
      const unrealized = v - inv;
      const sign = unrealized >= 0 ? '+' : '';
      return `<div><span style="color:${r.strategy.colorHex}">● ${r.strategy.name}</span>
        <span style="margin-left:8px;color:var(--text)">$${Math.round(v).toLocaleString()}</span>
        <span style="margin-left:6px;color:${unrealized >= 0 ? 'var(--green)' : 'var(--red)'}">
          ${sign}$${Math.round(Math.abs(unrealized)).toLocaleString()}</span></div>`;
    }).join('');
    tooltip.innerHTML = `<div style="color:var(--muted);margin-bottom:4px">${date}</div>${lines}`;

    // position tooltip
    tooltip.style.display = 'block';
    const tipLeft = e.clientX - rect.left + 12;
    const tipTop  = e.clientY - rect.top  - 10;
    const tipW = tooltip.offsetWidth;
    tooltip.style.left = (tipLeft + tipW > rect.width ? tipLeft - tipW - 20 : tipLeft) + 'px';
    tooltip.style.top  = Math.max(0, tipTop) + 'px';
  });

  chartEl.addEventListener('mouseleave', () => {
    crosshair.style.display = 'none';
    tooltip.style.display   = 'none';
  });
}
```

**Step 2: Verify in browser**

Hover over the chart. A vertical line should track the cursor, and a tooltip should appear showing the date, portfolio value, and unrealized gain for each enabled strategy.

**Step 3: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis chart hover crosshair and tooltip"
```

---

### Task 9: Stats grid renderer

**Files:**
- Modify: `apps/portfolio-desk/index.html` — JS section

**Step 1: Replace `renderHypStats` stub**

```js
function renderHypStats(simResults) {
  const el = document.getElementById('hypStats');
  if (!el) return;

  if (!simResults.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:10px;padding:10px 0">Enable strategies to see comparison</div>';
    return;
  }

  const fmt0 = n => n != null ? Math.round(n).toLocaleString() : '—';
  const fmt1 = n => n != null ? n.toFixed(1) : '—';
  const fmt2 = n => n != null ? n.toFixed(2) : '—';
  const pctColor = v => v == null ? '' : v >= 0 ? 'color:var(--green)' : 'color:var(--red)';
  const ddColor  = v => v == null ? '' : v > 30 ? 'color:var(--red)' : v > 15 ? 'color:var(--amber)' : 'color:var(--green)';

  const colHeaders = simResults.map(r =>
    `<th style="text-align:right;padding:8px 10px;font-size:10px;color:${r.strategy.colorHex};font-weight:500">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${r.strategy.colorHex};margin-right:5px"></span>${r.strategy.name}
    </th>`
  ).join('');

  const row = (label, cells) =>
    `<tr><td>${label}</td>${cells}</tr>`;

  const cell = (val, style = '') =>
    `<td style="text-align:right;padding:6px 10px;${style}">${val}</td>`;

  const rows = [
    row('Final Value',      simResults.map(r => cell('$' + fmt0(r.stats.finalValue))).join('')),
    row('Total Invested',   simResults.map(r => cell('$' + fmt0(r.stats.totalInvested))).join('')),
    row('Total Return',     simResults.map(r => cell(fmt1(r.stats.totalReturnPct) + '%', pctColor(r.stats.totalReturnPct))).join('')),
    row('CAGR',             simResults.map(r => cell(fmt1(r.stats.cagr) + '%', pctColor(r.stats.cagr))).join('')),
    row('Max Drawdown',     simResults.map(r => cell('−' + fmt1(r.stats.maxDD) + '%', ddColor(r.stats.maxDD))).join('')),
    row('Best Year',        simResults.map(r => cell(
      r.stats.bestYear ? r.stats.bestYear.yr + ' (' + fmt1(r.stats.bestYear.ret) + '%)' : '—',
      pctColor(r.stats.bestYear?.ret)
    )).join('')),
    row('Worst Year',       simResults.map(r => cell(
      r.stats.worstYear ? r.stats.worstYear.yr + ' (' + fmt1(r.stats.worstYear.ret) + '%)' : '—',
      pctColor(r.stats.worstYear?.ret)
    )).join('')),
    row('Sharpe Ratio',     simResults.map(r => cell(fmt2(r.stats.sharpe), pctColor(r.stats.sharpe))).join('')),
    row('Time in Market',   simResults.map(r => cell(fmt1(r.stats.timeInMarketPct) + '%')).join('')),
  ].join('');

  el.innerHTML = `<table class="hyp-stats-table">
    <thead><tr><th style="width:160px"></th>${colHeaders}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}
```

**Step 2: Verify in browser**

Enable 2–3 strategies. The stats grid below the chart should show all 9 metrics side by side, with green/red coloring on directional values.

**Step 3: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "add hypothesis stats grid with all 9 comparison metrics"
```

---

### Task 10: Polish and edge cases

**Files:**
- Modify: `apps/portfolio-desk/index.html`

**Step 1: Trigger renderHypothesis when tab is already active and strategies haven't loaded yet**

In `renderAll()`, add:
```js
// don't call renderHypothesis() here — it's called on tab switch
```
Make sure the `switchTab` wiring added in Task 2 is correct.

**Step 2: Handle all-zero / no-data edge cases**

In `buildHypChart`, if `allVals` is empty, return the placeholder message (already handled). In `computeHypStats`, guard against division by zero (already guarded with `Math.max(..., 1)` calls).

**Step 3: Ensure `renderHypothesis` is also called on `renderAll`**

Find `function renderAll()` and add:
```js
// only render hypothesis if it's the active tab to avoid slowing initial load
if (document.getElementById('view-hypothesis')?.classList.contains('active')) renderHypothesis();
```

**Step 4: Final end-to-end test in browser**

1. Open file fresh in browser
2. Click Hypothesis tab — should show 3 strategy cards + "enable a strategy" message
3. DCA Monthly should already be enabled — chart and stats should be populated
4. Enable "Buy the Dip" — second line appears on chart, second column in stats
5. Change Buy the Dip drawdown threshold — chart updates
6. Toggle log/linear scale — chart re-renders
7. Hover chart — crosshair and tooltip work
8. Reload page — strategy configs restored from localStorage
9. Change start year to 2000 — chart shortens to post-2000 data

**Step 5: Commit**
```bash
git add apps/portfolio-desk/index.html
git commit -m "hypothesis tab polish: edge cases, renderAll guard, end-to-end verified"
```
