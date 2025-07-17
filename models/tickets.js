const client  = require('../config/database.js')

async function create(data) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO tickets (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await client.query(query, values);
  return [true, result.rows[0]];
}

module.exports = {
  create
}
