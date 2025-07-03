const client = require("../config/database");

async function create ({label, tier, tier_description, price, original_price, currency, total_capacity, event_id, tier_id}) {
  try {

    query = `INSERT INTO ticket_pricing (label, tier, tier_description, price, original_price, currency, total_capacity, available_quantity, event_id, tier_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`

    const pricingResult = await client.query(query, [label, tier, tier_description, price, original_price, currency, total_capacity, total_capacity, event_id, tier_id])

    return [true, pricingResult.rows[0]]

  }
  catch(err) {
    console.log("error while creating pricing for event" , err.message)
  }
}

module.exports = {
  create
}