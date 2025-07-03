const client = require("../config/database");
const common_code = require("../helpers/common_code")

async function createEvent ({title, 
  organiser_id,
  description,
  language_id,
  location_id,
  event_status,
  start_time,
  end_time,
  duration,
  is_free,
  venue_type,
  thumbnails,
  genres
}) {
  try {
    console.log("create event parameters", {title,
  organiser_id, 
  description,
  language_id,
  location_id,
  event_status,
  start_time,
  end_time,
  duration,
  is_free,
  venue_type,
  thumbnails,
  genres
    })

  const event_id = await common_code.getUniqid("events")

  await client.query('BEGIN');

  query = `INSERT INTO events (title, description, language_id, location_id, status, start_time, end_time, duration, is_free, venue_type, thumbnails, event_id, organiser_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`
  
  const eventResult = await client.query(query, [title, description, language_id, location_id, event_status, start_time, end_time, duration, is_free, venue_type, thumbnails, event_id, organiser_id])
  const newEventId = eventResult.rows[0].id;

  // Insert genre mappings
  for (const genreId of genres) {
    await client.query(
      `INSERT INTO event_genres (event_id, genre_id) VALUES ($1, $2)`,
      [newEventId, genreId]
    );
  }
  await client.query('COMMIT');

  return  [true, eventResult.rows[0]]
  
  }
  catch(err) {
    console.log("error in event Creation", err.message)
    return [false, err.message]
  }
}

async function getEvents(orgId,offset, limit) {
  try{
    const query = `SELECT * FROM events WHERE organiser_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3`
    const result = await client.query(query, [orgId, offset, limit])
    if(result.rows.length === 0){
      return [false, "Data Not Found"]
    }
    else {
      return [true, result.rows]
    }
  }
  catch(err){
    console.log("error -> ", err.message)
    return [false, err.message]
  }
}


async function getItem(eventId) {
  const query = `SELECT * FROM event WHERE event_id = $1`
  const result = await client.query(query, [eventId])
  if(result.rows.length === 0){
    return [false, "Data Not Found"]
  }
  else {
    return [true, result.rows[0]]
  }
}

module.exports = {
  createEvent,
  getEvents
}
