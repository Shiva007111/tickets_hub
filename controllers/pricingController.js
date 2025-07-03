const organiser = require('../models/organisers')
const events = require('../models/events')
const ticketPricing  = require('../models/pricing')


const createTier = async (req, res) => {
  try {
    const org_id = req.params.orgId
    const eventId = req.params.eventId
    const {status, data} = await organiser.getItem(org_id);
    const {event_status, event_data} = await events.getItem(eventId)
    const allowedKeys = ["label", "tier", "tier_description", "price", "original_price", "currency", "total_capacity", "available_quantity", "booked_quantity"]
 
    const PricingPayload = Object.fromEntries(
      allowedKeys.map(key => [key, req.body[key]])  
    );

    const [tic_status, tic_item] = await ticketPricing.create(princingPayload);
    if (tic_status) {
      return res.status(200).json({data: tic_item}) 
    }
    else {
      return res.status(422).json({data: tic_item})
    }
    


  }

  catch (err){
    console.log("Error While creating Ticket Tiers for events ", err.message)
  }
}

module.exports = {
  createTier
}
