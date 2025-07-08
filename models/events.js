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
  try{
    console.log("EVENT ID", eventId)
    const query = `SELECT * FROM events WHERE event_id = $1`
    const result = await client.query(query, [eventId])
    // console.log("event_item", result)
    if(result.rows.length === 0){
      return [false, "Data Not Found"]
    }
    else {
      return [true, result.rows[0]]
    }
  }
  catch(err) {
    console.log("error while event get item", err.message)
    return[false, error.message]
  }
}



async function updateEvent(event_id, updateData) {
  try {
    await client.query('BEGIN');

    const fields = Object.keys(updateData).filter(k => k !== 'genres');
    const values = fields.map(k => updateData[k]);

    const setClause = fields.map((key, idx) => `${key} = $${idx + 1}`).join(', ');

    let eventUpdateResult;
    if (fields.length > 0) {
      const query = `
        UPDATE events
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
      `;
      values.push(event_id);
      eventUpdateResult = await client.query(query, values);
    }

    // Handle genres
    if ('genres' in updateData && Array.isArray(updateData.genres)) {
      // Delete old mappings
      await client.query(`DELETE FROM event_genres WHERE event_id = $1`, [event_id]);

      // Fetch event's internal ID
      // const eventIdResult = await client.query(`SELECT id FROM events WHERE event_id = $1`, [event_id]);
      // if (eventIdResult.rows.length === 0) {
      //   await client.query('ROLLBACK');
      //   return [false, "Event not found"];
      // }
      // const eventDbId = eventIdResult.rows[0].id;

      // Insert new mappings
      for (const genreId of updateData.genres) {
        await client.query(`INSERT INTO event_genres (event_id, genre_id) VALUES ($1, $2)`, [event_id, genreId]);
      }
    }

    await client.query('COMMIT');

    if (eventUpdateResult?.rows?.length > 0) {
      return [true, eventUpdateResult.rows[0]];
    } else {
      return [true, {}]; // No DB update, but genres were updated
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.log("Error while updating event:", err.message);
    return [false, err.message];
  }
}

async function getGenreMappings(event_id) {
  try {
    const query = `SELECT genre_id FROM event_genres WHERE event_id = $1`;
    const result = await client.query(query, [event_id]);
    return result.rows; // [{ genre_id: 1 }, ...]
  } catch (err) {
    console.log("Error fetching genre mappings:", err.message);
    return [];
  }
}

async function pushEvent(status, id) {
  try {
    const query = `UPDATE events SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await client.query(query, [status, id])
    return [true, result.rows[0]]
  }
  catch (err) {
    console.log("Error while pushing the event", err.message)
    return [false, err.message]
  }
}


module.exports = {
  createEvent,
  getEvents,
  getItem,
  updateEvent,
  getGenreMappings,
  pushEvent
}
