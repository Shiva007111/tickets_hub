const { v4: uuidv4 } = require('uuid');
const client = require('../config/database');


async function getUniqid (entity) {
  switch (entity) {

  case "org":
    table = "organisers"
    column_id = "organiser_id"
    break;
  case "events":
    table = "events"
    column_id = "event_id"
    break;
  }
  while (true) {
    const id = uuidv4();
    const query = `SELECT * FROM ${table} WHERE ${column_id} = $1`
    console.log("query", query)
    const result =  await client.query(query, [id]);
    if (result.rows.length === 0){
      return id
    }
  }

}

async function pagination(page_no, page_size){
  const no = Number(page_no)
  const size = Number(page_size)
  return (no -1)*page_size
}

module.exports = {
  getUniqid,
  pagination
}