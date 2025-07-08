const organiser = require('../models/organisers')
const platformModel = require('../models/platforms')
const events = require('../models/events') 
const ticketPricing =  require('../models/pricing') 
const common_code = require('../helpers/common_code')






const create = async (req, res) => {
  try {
    const org_id = req.params.orgId;

    const {status, data} = await organiser.getItem(org_id);
    console.log("organiser_data --->", data)
    const organiser_id = data["id"]
    if (!status) {
      return res.status(422).json({data: data})
    }
    const allowedKeys = ["title", "description", "start_time", "end_time", "duration","event_status", "is_free", "venue_type", "location_id", "language_id", "thumbnails", "genres"
    ];
    // const {title, 
    // description, 
    // start_time, 
    // end_time, 
    // duration, 
    // event_status, 
    // is_free, 
    // venue_type,
    // location_id,
    // language_id, 
    // thumbnails,
    // genres} = req.body;
    const eventPayload = Object.fromEntries(
      allowedKeys.map(key => [key, req.body[key]])
    );
    eventPayload.organiser_id = organiser_id;

    console.log("Event Payload ---> ", eventPayload)

    const [loc_status, loc_item] = await platformModel.getItem("locations" ,eventPayload.location_id)
    if (!loc_status) {
      return res.status(422).json({data: item})
    }

    const [lan_status, lan_item] = await platformModel.getItem("languages", eventPayload.language_id)
    if (!lan_status) {
      return res.status(422).json({data: item})
    }

    // const [evt_status, evt_item] = await events.createEvent({title, 
    //   organiser_id,
    //   description, 
    //   start_time, 
    //   end_time,
    //   duration,
    //   event_status,
    //   is_free,
    //   venue_type,
    //   location_id,
    //   language_id,
    //   thumbnails,
    //   genres
    // })
    const [evt_status, evt_item] = await events.createEvent(eventPayload);
    if (evt_status) {
      return res.status(200).json({data: evt_item}) 
    }
    else {
      return res.status(422).json({data: evt_item})
    }
  }
  catch (err) {
    console.log ("error --> ", err.message)
    return res.status(422).json({error: err.message })
  }

}

const getAllEvents = async (req, res) => {
  try{
    const {page_no, page_size} = req.query
    const orgId = req.params.orgId
    const {status, data} = await organiser.getItem(orgId)
    const org_id = data.id
    const offset = await common_code.pagination(page_no, page_size)
    const [evt_status, evt_data]= await events.getEvents(org_id, offset, page_size)
    if (evt_status) {
      return res.status(200).json({data: evt_data})
    }
    else {
      return res.status(422).json({data:evt_data})
    }
  }
  catch(err) {
    console.log("err ->", err.message )
    return res.status(422).json({data:err.message})
  }

}

const updateEvent = async (req, res) => {
  try {
    const event_uid = req.params.eventId;

     const [evt_status, event_data] = await events.getItem(event_uid);
    if (!evt_status) {
      return res.status(404).json({ data: "Event not found" });
    }

    const eventDb_id = event_data.id;

    const allowedKeys = [
      "title", "description", "start_time", "end_time", "duration",
      "event_status", "is_free", "venue_type", "location_id",
      "language_id", "thumbnails", "genres"
    ];

    const updateData = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ data: "No valid fields to update" });
    }

    const [status, updatedEvent] = await events.updateEvent(eventDb_id, updateData);

    if (status) {
      return res.status(200).json({ data: updatedEvent });
    } else {
      return res.status(404).json({ data: "Event not found or failed to update" });
    }
  } catch (err) {
    console.log("Error while updating event:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};


const getEventDetails = async (req, res) => {
  try {
    const event_uid = req.params.event_id;

    const [status, event] = await events.getItem(event_uid);
    if (!status) {
      return res.status(404).json({ data: "Event not found" });
    }

    const response = { ...event };

    // Get genres for this event
    const genreMapResult = await events.getGenreMappings(event.id);
    const genreIds = genreMapResult.map(g => g.genre_id);
    const genres = await platformModel.getNamesByIds("genres", genreIds);
    response.genres = genres.map(g => g.name);

    // Get location name
    const [loc_status, loc] = await platformModel.getItem("locations", event.location_id);
    response.location = loc_status ? loc.name : null;

    // Get language name
    const [lang_status, lang] = await platformModel.getItem("languages", event.language_id);
    response.language = lang_status ? lang.name : null;

    return res.status(200).json({ data: response });
  } catch (err) {
    console.log("Error while fetching full event details:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};

const eventPublish = async (req, res) => {
  try {
    const event_uid = req.params.event_id;
    const [status, event] = await events.getItem(event_uid)
    if (!status) {
      return res.status(422).json({"msg": "Event Not Found"})
    }
    const event_id = event.id
    const event_status =  req.query.status;
    const [publish_status, publish_data] = await events.pushEvent(event_status, event_id)
    
    if (!publish_status) {
      return res.status(422).json({msg: publish_data})
    }
    return res.status(200).json({msg: publish_data})
  }
  catch(err) {
    console.log("Error While publishing an event")
    return res.status(500).json({data: err.message})
  }
}


const getEventDetailsv2 = async (req, res) => {
  try {
    const event_uid = req.params.event_id;

    // 1. Get event details by event_uid (UUID)
    const [status, event] = await events.getItem(event_uid);
    if (!status) {
      return res.status(404).json({ data: "Event not found" });
    }

    const response = { ...event };

    // 2. Add genres
    const genreMapResult = await events.getGenreMappings(event.id);
    const genreIds = genreMapResult.map(g => g.genre_id);
    const genres = await platformModel.getNamesByIds("genres", genreIds);
    response.genres = genres.map(g => g.name);

    // 3. Add location
    const [loc_status, loc] = await platformModel.getItem("locations", event.location_id);
    response.location = loc_status ? loc.name : null;

    // 4. Add language
    const [lang_status, lang] = await platformModel.getItem("languages", event.language_id);
    response.language = lang_status ? lang.name : null;

    // 5. Add ticket pricing tiers
    const [tiers_status, tiers] = await ticketPricing.getAllByEvent(event.id);
    response.ticket_pricing = tiers_status ? tiers : [];

    return res.status(200).json({ data: response });
  } catch (err) {
    console.log("Error while fetching full event details:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};




module.exports = {
  create,
  getAllEvents,
  updateEvent,
  getEventDetails,
  eventPublish,
  getEventDetailsv2 
}
