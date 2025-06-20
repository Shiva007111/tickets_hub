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

async function getAll(table) {
  validateTable(table);
  const result = await client.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
  return result.rows;
}

async function deleteById(table, id) {
  validateTable(table);
  const result = await client.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result;
}

module.exports = {
  createIfNotExists,
  getAll,
  deleteById
};
