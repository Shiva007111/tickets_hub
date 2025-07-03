async function create ({label, tier, tier_description, price, original_price, currency, total_capacity, available_quantity, booked_quantity}) {
  try {



    query = `INSERT INTO events (label, tier, tier_description, price, orginal_price, currency, total_capacity, available_quantity, booked_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`

    const pricingResult = await client.query(query, [label, tier, tier_description, price, original_price, currency, total_capacity, available_quantity, booked_quantity])

    return [true, pricingResult]

  }
  catch(err) {
    console.log("error while creating pricing for event" , err.message)
  }
}