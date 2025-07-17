const client = require('../config/database.js')



async function create (txnObj) {
  
  const fields = Object.keys(txnObj);
  const formatted_fields = `(${fields.join(',')})`
  console.log('fields--->', fields)
  var values = []
  for (key of fields) {
    values.push(txnObj[key])
  }
  const placeholders = `(${fields.map((_, idx) => `$${idx+1}`).join(',')})`;
  const insert_clause = `${formatted_fields} VALUES ${placeholders}`;




  query = `INSERT INTO transactions
           ${insert_clause}
          RETURNING *;`
  console.log("insert_clause and its values", insert_clause, placeholders, values, fields);
  const result = await client.query(query, [...values]);  
  return [true, result.rows[0]]
}

async function getByOrderIdAndStatus(order_id, status) {
  const query = `SELECT * FROM transactions WHERE order_id = $1 AND txn_status = $2`;
  const result = await client.query(query, [order_id, status]);
  return result.rows[0];
}

async function create_callback_trans(data) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO transactions (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await client.query(query, values);
  return [true, result.rows[0]];
}


module.exports = {
  create,
  getByOrderIdAndStatus,
  create_callback_trans
}
