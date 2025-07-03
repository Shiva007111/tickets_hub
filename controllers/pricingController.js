const organiser = require('../models/organisers')
const events = require('../models/events')
const ticketPricing  = require('../models/pricing')
const common_code = require('../helpers/common_code')


const createTier = async (req, res) => {
  try {
    const org_id = req.params.orgId
    const eventId = req.params.eventId
    console.log("org_id, event_id", org_id, eventId)
    const {status, data} = await organiser.getItem(org_id);
    if (!status) {
      return res.status(422).json({data: "Organiser not found"})
    }
    const [event_status, event_data] = await events.getItem(eventId)
    if (!event_status) {
      return res.status(422).json({data: "Event not found"})
    }

    const tiers_data = req.body["data"]
    const allowedKeys = ["label", "tier", "tier_description", "price", "original_price", "currency", "total_capacity"]
    const createdTiers = [];
    for (const tier_obj of tiers_data) {
      const pricingPayload = Object.fromEntries(
        allowedKeys.map((key) => [key, tier_obj[key]])
      );

      pricingPayload.event_id = event_data.id;
      pricingPayload.tier_id = await common_code.getUniqid("plans");

      const [tic_status, tic_item] = await ticketPricing.create(pricingPayload);
      if (tic_status) {
        createdTiers.push(tic_item);
      } else {
        return res.status(422).json({ data: `Failed to create tier: ${tier_obj.label || tier_obj.tier}` });
      }
    }

    return res.status(200).json({ data: createdTiers });
  }

  catch (err){
    console.log("Error While creating Ticket Tiers for events ", err.message)
  }
}

module.exports = {
  createTier
}
