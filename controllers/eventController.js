const organiser = require('../models/organisers')
const platformModel = require('../models/platforms')
const events = require('../models/events') 
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
module.exports = {
  create,
  getAllEvents
}
