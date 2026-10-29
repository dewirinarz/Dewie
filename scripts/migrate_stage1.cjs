const { Pool } = require('pg');

async function migrateStage1() {
  const devPool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: 'cloud_sql_development_database',
    ssl: false
  });

  const prodPool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: 'cloud_sql_production_database',
    ssl: false
  });

  try {
    // 1. Fetch source rows from Dev DB
    const devRes = await devPool.query('SELECT * FROM locations ORDER BY id');
    console.log('Total rows in Dev DB:', devRes.rows.length);

    // 2. Fetch existing rows from Prod DB
    const prodRes = await prodPool.query('SELECT id, kode_kdkmp, nama_lokasi FROM locations ORDER BY id');
    const prodMap = new Map();
    prodRes.rows.forEach(r => prodMap.set(r.id, r));
    console.log('Existing rows in Prod DB:', prodMap.size);

    let addedCount = 0;
    let skippedCount = 0;
    let conflictCount = 0;

    const itemsToInsert = [];

    for (const devRow of devRes.rows) {
      const existingProd = prodMap.get(devRow.id);
      if (existingProd) {
        // Verify that existing baseline data matches
        const sameName = existingProd.nama_lokasi === devRow.nama_lokasi;
        const sameCode = existingProd.kode_kdkmp === devRow.kode_kdkmp;
        if (sameName && sameCode) {
          skippedCount++;
        } else {
          conflictCount++;
          console.warn('Conflict on ID:', devRow.id);
        }
      } else {
        itemsToInsert.push(devRow);
      }
    }

    if (conflictCount > 0) {
      throw new Error('Migration aborted due to ' + conflictCount + ' conflicts.');
    }

    console.log('Items to insert into Prod DB:', itemsToInsert.length);

    // 3. Batch insert using transaction
    const batchSize = 100;
    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize);
      const client = await prodPool.connect();
      try {
        await client.query('BEGIN');
        for (const row of batch) {
          const insertSql = 
            'INSERT INTO locations (id, kode_kdkmp, nama_lokasi, provinsi, kabupaten_kota, kecamatan, desa_kelurahan, data, created_at, updated_at) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ' +
            'ON CONFLICT (id) DO NOTHING';
          await client.query(insertSql, [
            row.id,
            row.kode_kdkmp,
            row.nama_lokasi,
            row.provinsi,
            row.kabupaten_kota,
            row.kecamatan,
            row.desa_kelurahan,
            row.data,
            row.created_at || new Date(),
            row.updated_at || new Date()
          ]);
          addedCount++;
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Batch error at index ' + i + ':', err);
        throw err;
      } finally {
        client.release();
      }
    }

    // 4. Verification in Production DB
    const finalProdCountRes = await prodPool.query('SELECT count(*) as total_rows, count(DISTINCT id) as unique_ids FROM locations');
    const finalProdCount = Number(finalProdCountRes.rows[0].total_rows);
    const finalProdUniqueIds = Number(finalProdCountRes.rows[0].unique_ids);

    // 5. Verification in Development DB (must be unchanged)
    const finalDevCountRes = await devPool.query('SELECT count(*) as total_rows FROM locations');
    const finalDevCount = Number(finalDevCountRes.rows[0].total_rows);

    console.log('MIGRATION_RESULT_JSON:' + JSON.stringify({
      status: 'SUCCESS',
      sourceTotalDev: devRes.rows.length,
      existingInProdBefore: prodMap.size,
      itemsAddedToProd: addedCount,
      itemsSkippedIdentical: skippedCount,
      conflicts: conflictCount,
      finalProdTotalRows: finalProdCount,
      finalProdUniqueIds: finalProdUniqueIds,
      finalDevTotalRows: finalDevCount
    }));

  } finally {
    await devPool.end();
    await prodPool.end();
  }
}

migrateStage1().catch(err => {
  console.error('MIGRATION_FAILED:', err);
  process.exit(1);
});
