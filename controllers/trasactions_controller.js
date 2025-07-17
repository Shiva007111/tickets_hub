const plans = require('../models/pricing.js')
const commonCode = require('../helpers/common_code.js')
const transaction = require('../models/transactions.js')
const payulib = require('../helpers/payments_helpers.js')
const tickets = require('../models/tickets.js')
require('dotenv').config();



const create  = async(req, res) => {
  try {
    // user_id, email_id, mobile_number, tier_id, hash
    txnPaylaod = req.body
    const [pln_status, pln_data] = await plans.getItem(txnPaylaod.tier_id)
    if (!pln_status) {
      return res.status(422).json({error: "Couldn't find Plan" })
    }
    if (pln_data.available_quantity == 0) {
      return res.status(422).json({error: "Tickets not availble for this tier"})
    }
    txnPaylaod.txn_id = await commonCode.getuniq_txnid();
    txnPaylaod.order_id = await commonCode.getOrderId();
    txnPaylaod.txn_status = "init";
    txnPaylaod.event_id = pln_data.event_id;
    txnPaylaod.tier_id = pln_data.id
    txnPaylaod.price = pln_data.price;
    txnPaylaod.original_price = pln_data.original_price;
    txnPaylaod.currency = pln_data.currency;
    let [txnstatus, txn_obj] = await transaction.create(txnPaylaod);
    if (!txnstatus) {
      return res.status(422).json({error: "Error While Creating Transaction Object"})
    }
    payu_url = process.env.PAYMENT_URL  //await payments.getPayuKeys(txnPaylaod.payu_hash)
    console.log('Payu payments url', payu_url)
    obj = await payulib.get_payu_keys(txn_obj, txnPaylaod)
    return res.status(200).json({data: obj})
  }
  catch (err) {
    console.log("error ----->", err.message)
  }


}


const paymentCallback = async (req, res) => {
  try {
    const response = req.body;
    const isValid = payulib.verifyPayUResponseHash(response, process.env.PAYU_SALT);

    if (!isValid) {
      console.log('❌ Invalid hash. Possible tampering.');
      return res.status(400).json({ success: false, message: 'Invalid hash.' });
    }

    console.log('✅ Valid hash. Processing payment...');

    const existingTxn = await transaction.getByOrderIdAndStatus(response.txnid, 'init');
    if (!existingTxn) {
      return res.status(404).json({ success: false, message: 'Original transaction not found.' });
    }

    // Step 1: Create a success transaction record
    const successTxnPayload = {
      user_id: existingTxn.user_id,
      email_id: existingTxn.email_id,
      mobile_number: existingTxn.mobile_number,
      tier_id: existingTxn.tier_id,
      event_id: existingTxn.event_id,
      txn_id: response.txnid,
      order_id: response.txnid,
      txn_status: 'success',
      price: existingTxn.price,
      original_price: existingTxn.original_price,
      currency: existingTxn.currency,
      miscellaneous: response
    };

    const [txnStatus, txnRecord] = await transaction.create_callback_trans(successTxnPayload);
    if (!txnStatus) {
      return res.status(500).json({ success: false, message: 'Failed to store successful transaction' });
    }

    // Step 2: Create a ticket
    const ticketPayload = {
      ticket_id: await crypto.randomUUID(),
      tier_id: existingTxn.tier_id,
      event_id: existingTxn.event_id,
      txn_id: txnRecord.id,
      ticket_no: Math.floor(100000 + Math.random() * 900000),
      user_id: existingTxn.user_id,
      email_id: existingTxn.email_id,
      mobile_number: existingTxn.mobile_number
    };

    const [ticketStatus, ticket] = await tickets.create(ticketPayload);
    if (!ticketStatus) {
      return res.status(500).json({ success: false, message: 'Ticket creation failed' });
    }

    // Step 3: Update ticket_pricing counts
    await plans.updateCounts(ticketPayload.tier_id);

    return res.status(200).json({ success: true, message: 'Payment successful, ticket created.', ticket });
  } catch (err) {
    console.error('❌ Error in payment callback:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  create,
  paymentCallback
}
