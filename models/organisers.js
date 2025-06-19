const client = require("../config/database");

async function createOrganiser({
  name,
  email_id,
  mobile_number,
  verification_status,
  organiser_id,
}) {
  try {
    console.log("create organiser parameters", {
      name,
      email_id,
      mobile_number,
      verification_status,
      organiser_id,
    });
    const OrgEmailExists = await getUserByEmail(email_id);
    const OrgNameExists = await getUserByName(name);

    if (OrgEmailExists) {
      return { status: false, msg: "Email  Already taken" };
    }
    if (OrgNameExists) {
      return { status: false, msg: "Name alreay taken" };
    }
    const query = `INSERT INTO organisers (organiser_name, email_id, mobile_number, verification_status, organiser_id) 
       VALUES ($1, $2, $3, $4, $5)`;
    const newOrganiser = await client.query(query, [
      name,
      email_id,
      mobile_number,
      verification_status,
      organiser_id,
    ]);
    //return newOrganiser.rows[0]
    return { status: true, msg: "Organiser Created Successfully" };
  } catch (error) {
    console.error(error.message);
    return { status: false, msg: error.message };
    //return error.message
  }
}


async function update({name, mobile_number, verification_status, id}) {
  try {
    console.log({name, mobile_number, verification_status, id})

    const query = `
      UPDATE organisers 
      SET organiser_name = $1, mobile_number = $2, verification_status = $3 
      WHERE organiser_id = $4
    `;
    const result  = await client.query(query, [name, mobile_number, verification_status, id])
    return {new_status: true, new_data: "Records Updated Successfully"}
  }
  catch (err) {
    console.log("crashing in update", err.msg)
    return {new_status: false, new_data: err.message}    
  }
}

async function getAll({ offset, limit }) {
  const query = `SELECT * FROM organisers ORDER BY created_at DESC OFFSET $1 LIMIT $2`;

  const result = await client.query(query, [offset, limit]);
  if (result.rows.length === 0) {
    return { status: false, data: "No Data Found" };
  }
  const total_count = await  getTotalCount();
  console.log("Total Count", total_count);
  const data_count = result.rows.length;
  const obj = {
    total_count: Number(total_count),
    data_count: data_count,
    data: result.rows,
  };
  return { status: true, data: obj };
}

async function getItem(id) {
  const  query = `SELECT * FROM organisers WHERE organiser_id = $1`;
  const result = await client.query(query, [id])
  if (result.rows.length === 0) {
    return {status: false, data: "No data Found"}
  }
  else {
    return {status: true, data:result.rows[0]}
  }

}

async function getTotalCount() {
  const query = `SELECT COUNT(*) FROM  organisers`;
  const result = await client.query(query);
  console.log("result for count", result.rows[0]["count"]);
  return result.rows[0]["count"];
}

async function getUserByEmail(email_id) {
  try {
    const result = await client.query(
      "SELECT * FROM organisers WHERE email_id = $1",
      [email_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error Fetching the organiser");
  }
}

async function getUserByName(name) {
  try {
    const query = `SELECT * FROM organisers WHERE organiser_name = $1`;
    const result = await client.query(query, [name]);
    return result.rows[0];
  } catch (error) {
    console.error("error fetching the data", error.message);
  }
}

module.exports = {
  createOrganiser,
  getUserByEmail,
  getUserByName,
  getAll,
  getItem,
  update
};
