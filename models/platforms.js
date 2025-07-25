const client = require('../config/database');

const allowedTables = ['genres', 'locations', 'languages'];

function validateTable(table) {
  if (!allowedTables.includes(table)) {
    throw new Error("Invalid table name");
  }
}

async function createIfNotExists(table, name) {
  validateTable(table);

  const checkQuery = `SELECT * FROM ${table} WHERE name = $1`;
  const exists = await client.query(checkQuery, [name]);

  if (exists.rows.length > 0) {
    return { status: false, msg: "Item already exists" };
  }

  const insertQuery = `INSERT INTO ${table} (name) VALUES ($1) RETURNING *`;
  const result = await client.query(insertQuery, [name]);
  return { status: true, data: result.rows[0] };
}

async function getAll(table, offset, limit) {
  validateTable(table);
  query = `SELECT * FROM ${table} ORDER BY created_at DESC OFFSET $1 LIMIT $2`
  const result = await client.query(query, [offset, limit]);
  return result.rows;
}

async function deleteById(table, id) {
  validateTable(table);
  const result = await client.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result;
}

async function getItem(table, id) {
  validateTable(table)
  const query  = `SELECT * FROM ${table} WHERE id = $1 `
  const exists = await client.query(query, [id])
  if (exists.rows.length === 0 ){
    return [false , "Item not found"]
  }
  else {
    return [true, exists.rows[0]]
  }

}

async function getNamesByIds(table, ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(', ');
    const query = `SELECT id, name FROM ${table} WHERE id IN (${placeholders})`;
    const result = await client.query(query, ids);

    return result.rows; // Array of {id, name}
  } catch (err) {
    console.log(`Error in getNamesByIds(${table}):`, err.message);
    return [];
  }
}


module.exports = {
  createIfNotExists,
  getAll,
  deleteById,
  getItem,
  getNamesByIds
};
