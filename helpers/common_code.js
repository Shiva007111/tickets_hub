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
  case "plans":
    table = "ticket_pricing"
    column_id = "tier_id"
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


async function getuniq_txnid() {
  const timestamp =  Date.now()
  const random = Math.floor(Math.random() * 1000)
  console.log('timestamp', timestamp, random)
  const id = `${timestamp}${random}`;
  console.log("uniq_code ------------->", id)
  return id
}

async function getOrderId() {
  return  `ORD_${crypto.randomUUID().split('-')[4]}_${Date.now()}`
}

module.exports = {
  getUniqid,
  pagination,
  getuniq_txnid,
  getOrderId
}
