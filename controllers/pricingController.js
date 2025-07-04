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


const updateTier = async (req, res) => {
  try {
    const tier_id = req.params.tier_id;
    const allowedKeys = [
      "label",
      "tier",
      "tier_description",
      "price",
      "original_price",
      "currency",
      "total_capacity",
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

    const [update_status, updated_row] = await ticketPricing.updateTierById(tier_id, updateData);

    if (update_status) {
      return res.status(200).json({ data: updated_row });
    } else {
      return res.status(422).json({ data: "Failed to update tier" });
    }
  } catch (err) {
    console.log("Error while updating ticket tier:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};


const getTierById = async (req, res) => {
  try {
    const tier_id = req.params.tier_id;

    const [status, tier_data] = await ticketPricing.getItem(tier_id);

    if (status) {
      return res.status(200).json({ data: tier_data });
    } else {
      return res.status(404).json({ data: "Ticket tier not found" });
    }
  } catch (err) {
    console.log("Error while fetching ticket tier:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};


const deleteTier = async (req, res) => {
  try {
    const tier_id = req.params.tier_id;

    const [status, result] = await ticketPricing.deleteItem(tier_id);

    if (status) {
      return res.status(200).json({ data: "Tier deleted successfully" });
    } else {
      return res.status(404).json({ data: "Tier not found or already deleted" });
    }
  } catch (err) {
    console.log("Error while deleting ticket tier:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};


const getAllTiersByEvent = async (req, res) => {
  try {
    const params_event_id = req.params.event_id;
    const [event_status, event_data] = await events.getItem(params_event_id)
    const event_id = event_data.id
    console.log("Event id ---> ", event_id)
    const [status, tiers] = await ticketPricing.getAllByEvent(event_id);

    if (status) {
      return res.status(200).json({ data: tiers });
    } else {
      return res.status(404).json({ data: "No ticket tiers found for this event" });
    }
  } catch (err) {
    console.log("Error while fetching ticket tiers for event:", err.message);
    return res.status(500).json({ data: "Server error" });
  }
};





module.exports = {
  createTier,
  updateTier,
  getTierById,
  deleteTier,
  getAllTiersByEvent
}
