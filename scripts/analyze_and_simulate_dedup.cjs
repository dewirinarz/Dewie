const { Pool } = require('pg');
const fs = require('fs');

async function analyzeAndSimulate() {
  const pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: 'cloud_sql_production_database',
    ssl: false
  });

  try {
    // 1. Fetch all rows read-only
    const res = await pool.query('SELECT * FROM locations ORDER BY created_at ASC, id ASC');
    const allRows = res.rows;
    console.log('Total rows loaded for analysis:', allRows.length);

    // 2. Group by normalized kode_kdkmp
    const groupsByCode = new Map();
    const rowsWithoutCode = [];

    allRows.forEach(row => {
      const code = (row.kode_kdkmp || row.data?.kodeKDKMP || '').trim().toLowerCase();
      if (!code) {
        rowsWithoutCode.push(row);
      } else {
        const list = groupsByCode.get(code) || [];
        list.push(row);
        groupsByCode.set(code, list);
      }
    });

    const uniqueCodeCount = groupsByCode.size;
    const duplicatedGroups = [];
    const singleGroups = [];

    let totalDuplicatesToRemove = 0;
    const pairsMapping = [];

    groupsByCode.forEach((rows, codeKey) => {
      if (rows.length === 1) {
        singleGroups.push(rows[0]);
      } else {
        duplicatedGroups.push({ code: codeKey, count: rows.length, rows });
        totalDuplicatesToRemove += (rows.length - 1);

        // Determine canonical record:
        // Prioritize original verified IDs (kdkmp-001..007, or kdkmp-1792989...) over Ada-imp-
        rows.sort((a, b) => {
          const aIsOriginal = a.id.startsWith('kdkmp-00') ? 3 : (a.id.startsWith('kdkmp-1792989') ? 2 : (a.id.startsWith('kdkmp-') ? 1 : 0));
          const bIsOriginal = b.id.startsWith('kdkmp-00') ? 3 : (b.id.startsWith('kdkmp-1792989') ? 2 : (b.id.startsWith('kdkmp-') ? 1 : 0));
          if (aIsOriginal !== bIsOriginal) return bIsOriginal - aIsOriginal;
          // Tie-break: earlier created_at
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        const canonical = rows[0];
        const duplicates = rows.slice(1);

        pairsMapping.push({
          kode_kdkmp: canonical.kode_kdkmp || codeKey,
          nama_lokasi: canonical.nama_lokasi,
          kabupaten_kota: canonical.kabupaten_kota,
          kecamatan: canonical.kecamatan,
          desa_kelurahan: canonical.desa_kelurahan,
          canonical_id: canonical.id,
          canonical_created_at: canonical.created_at,
          duplicate_ids: duplicates.map(d => ({
            id: d.id,
            created_at: d.created_at,
            nama_lokasi: d.nama_lokasi
          })),
          duplicate_count: duplicates.length
        });
      }
    });

    // 3. Simulated deduplicated dataset
    const simulatedKeptRows = [];
    groupsByCode.forEach(rows => {
      simulatedKeptRows.push(rows[0]); // the canonical row
    });

    // 4. Verify integrity of simulated kept rows
    const keptUniqueIds = new Set(simulatedKeptRows.map(r => r.id));
    const keptUniqueCodes = new Set(simulatedKeptRows.map(r => (r.kode_kdkmp || '').trim().toLowerCase()));

    let withChecklist = 0;
    let fisikCount = 0;
    let sdmCount = 0;
    let sistemCount = 0;
    let produkCount = 0;
    let transaksiCount = 0;

    simulatedKeptRows.forEach(r => {
      const chk = r.data?.checklist;
      if (chk) {
        withChecklist++;
        if (chk.fisikSarpras) fisikCount++;
        if (chk.sdm || chk.sdmManajemen) sdmCount++;
        if (chk.sistem || chk.sistemOperasional) sistemCount++;
        if (chk.produk || chk.produkLayanan) produkCount++;
        if (chk.transaksi || chk.transaksiFinansial) transaksiCount++;
      }
    });

    // Count duplicate prefixes
    let adaImpDuplicates = 0;
    let kdkmpDuplicates = 0;
    pairsMapping.forEach(p => {
      p.duplicate_ids.forEach(d => {
        if (d.id.startsWith('Ada-imp-')) adaImpDuplicates++;
        else if (d.id.startsWith('kdkmp-')) kdkmpDuplicates++;
      });
    });

    const report = {
      summary: {
        totalRowsCurrent: allRows.length,
        totalUniqueCodes: uniqueCodeCount,
        groupsWithDuplicates: duplicatedGroups.length,
        groupsWithoutDuplicates: singleGroups.length,
        totalDuplicateRowsToRemove: totalDuplicatesToRemove,
        totalSimulatedKeptRows: simulatedKeptRows.length,
        rowsWithoutCode: rowsWithoutCode.length,
        duplicatePrefixBreakdown: {
          adaImpDuplicates,
          kdkmpDuplicates,
          otherDuplicates: totalDuplicatesToRemove - (adaImpDuplicates + kdkmpDuplicates)
        }
      },
      verificationOfSimulatedKeptDataset: {
        keptRowCount: simulatedKeptRows.length,
        keptUniqueIds: keptUniqueIds.size,
        keptUniqueCodes: keptUniqueCodes.size,
        withChecklist,
        fisikCount,
        sdmCount,
        sistemCount,
        produkCount,
        transaksiCount,
        allChecklists100Percent: withChecklist === simulatedKeptRows.length && fisikCount === simulatedKeptRows.length
      },
      sampleDuplicatePairs: pairsMapping.slice(0, 15)
    };

    // Save full mapping to disk for record-keeping
    fs.writeFileSync(
      './src/data/simulation_deduplication_mapping.json',
      JSON.stringify({ report, allPairs: pairsMapping }, null, 2),
      'utf8'
    );

    console.log('SIMULATION_REPORT_JSON:' + JSON.stringify(report, null, 2));

  } finally {
    await pool.end();
  }
}

analyzeAndSimulate().catch(err => {
  console.error('ANALYSIS_ERROR:', err);
  process.exit(1);
});
