const client = require("../config/database");

async function create ({label, tier, tier_description, price, original_price, currency, total_capacity, event_id, tier_id}) {
  try {

    query = `INSERT INTO ticket_pricing (label, tier, tier_description, price, original_price, currency, total_capacity, available_quantity, event_id, tier_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`

    const pricingResult = await client.query(query, [label, tier, tier_description, price, original_price, currency, total_capacity, total_capacity, event_id, tier_id])

    return [true, pricingResult.rows[0]]

  }
  catch(err) {
    console.log("error while creating pricing for event" , err.message)
    return [false, err.message]
  }
}


async function updateTierById(tier_id, updateData) {
  try {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = fields.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const query = `
      UPDATE ticket_pricing
      SET ${setClause}
      WHERE tier_id = $${fields.length + 1}
      RETURNING *;
    `;

    const result = await client.query(query, [...values, tier_id]);

    if (result.rows.length > 0) {
      return [true, result.rows[0]];
    } else {
      return [false, null];
    }
  } catch (err) {
    console.log("error while updating pricing tier:", err.message);
    return [false, null];
  }
}

async function getItem(tier_id) {
  try {
    const query = `SELECT * FROM ticket_pricing WHERE tier_id = $1`;
    const result = await client.query(query, [tier_id]);

    if (result.rows.length > 0) {
      return [true, result.rows[0]];
    } else {
      return [false, "Data Not Found"];
    }
  } catch (err) {
    console.log("error while fetching ticket tier:", err.message);
    return [false, err.message];
  }
}


async function deleteItem(tier_id) {
  try {
    const query = `DELETE FROM ticket_pricing WHERE tier_id = $1 RETURNING *`;
    const result = await client.query(query, [tier_id]);

    if (result.rowCount > 0) {
      return [true, result.rows[0]]; // returning deleted row info if needed
    } else {
      return [false, null];
    }
  } catch (err) {
    console.log("error while deleting ticket tier:", err.message);
    return [false, null];
  }
}


async function getAllByEvent(event_id) {
  try {
    const query = `
      SELECT * FROM ticket_pricing
      WHERE event_id = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [event_id]);

    if (result.rows.length > 0) {
      return [true, result.rows];
    } else {
      return [false, []];
    }
  } catch (err) {
    console.log("error while fetching ticket tiers by event_id:", err.message);
    return [false, null];
  }
}





module.exports = {
  create,
  updateTierById,
  getItem,
  deleteItem,
  getAllByEvent
}