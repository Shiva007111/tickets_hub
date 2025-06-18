const client = require('../config/database')


async function createOrganiser({
  name,
  email_id,
  mobile_number,
  verification_status,
  organiser_id
}) {
  try {
    console.log("create organiser parameters", {name, email_id, mobile_number, verification_status, organiser_id})
    const OrgEmailExists = await getUserByEmail(email_id)
    const OrgNameExists = await getUserByName (name)

    if (OrgEmailExists){
      return {"status":false, "msg": "Email  Already taken"}
    }
    if (OrgNameExists) {
      return {"status": false, "msg": "Name alreay taken"}
    }
    const query = `INSERT INTO organisers (organiser_name, email_id, mobile_number, verification_status, organiser_id) 
       VALUES ($1, $2, $3, $4, $5)`
    const newOrganiser = await client.query(query, [name, email_id, mobile_number, verification_status, organiser_id]
      )
    //return newOrganiser.rows[0]
    return {"status": true, "msg": "Organiser Created Successfully"}
  }
  catch (error){
    console.error(error.message)
    return  {"status": false, "msg": error.message}
    //return error.message
  }
}


async function getAll({offset, limit}) {
  const query = `SELECT * FROM organisers ORDER BY created_at DESC OFFSET $1 LIMIT $2`

  const result = await client.query(query,[offset, limit])
  console.log("result--->", result)
  if (result.rows.length === 0){
    return {"status": false, "data": "No Data Found"}
  }
  return {"status": true, "data": result.rows}
}




async function getUserByEmail(email_id) {
  try{
    const result =  await client.query(
      'SELECT * FROM organisers WHERE email_id = $1', [email_id]
      );
    return result.rows[0]
  }
  catch(error){
    console.error("Error Fetching the organiser")
  }
}


async function getUserByName (name) {
  try {
    const query = `SELECT * FROM organisers WHERE organiser_name = $1`
    const result = await client.query(query, [name])
    return result.rows[0]
  }
  catch (error){
    console.error("error fetching the data", error.message )
  }
}




module.exports  = {
  createOrganiser,
  getUserByEmail,
  getUserByName,
  getAll
}