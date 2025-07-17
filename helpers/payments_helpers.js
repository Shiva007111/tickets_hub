require('dotenv').config();
const crypto = require('crypto');

async function get_payu_keys(txn_obj, payload) {
  var payu_obj = {} 
  payu_obj.key = process.env.PAYU_KEY
  payu_obj.txnid = txn_obj.order_id
  payu_obj.amount = txn_obj.price
  payu_obj.tier_id = txn_obj.tier_id
  payu_obj.productinfo = "DangalPlay Ticket Booking"
  payu_obj.firstname  = "Guest"//payload.firstname
  payu_obj.lastname = payload.lastname
  payu_obj.email = payload.email_id
  payu_obj.region = payload.region
  payu_obj.phone = payload.phone
  payu_obj.message = "Transaction Created Successfully"

  salt = process.env.PAYU_SALT
  payu_obj.hash = calculateInitSignature(payu_obj, salt)
  payu_obj.payment_url = process.env.PAYMENT_URL
  payu_obj.surl = "https://stagingapi.dangalplay.com/payment_complete/payu/ticket/secure_payment/jqeGWxRKK7FK5zEk3xCM"
  payu_obj.furl = "https://stagingapi.dangalplay.com/payment_complete/payu/ticket/secure_payment/jqeGWxRKK7FK5zEk3xCM"
  payu_obj.transaction_id = txn_obj.order_id
  return payu_obj
  
}




function calculateInitSignature(obj, salt) {
  const str = [
    obj.key,
    obj.txnid,
    obj.amount,
    obj.productinfo,
    obj.firstname,
    obj.email,
    '', '', '', '', '', '', '', '', '', '',// 10 empty fields
    salt
  ].join('|');
  console.log('hash_str---> ', str)
  const hash = crypto.createHash('sha512').update(str).digest('hex');
  return hash;
}


function verifyPayUResponseHash(postData, salt) {
  // Follow PayU response hash format (reverse of request)
  const {
    key, txnid, amount, productinfo, firstname, email, status,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
    udf6 = '', udf7 = '', udf8 = '', udf9 = '', udf10 = '',
    hash
  } = postData;

  const hashSequence = [
    salt,
    status,
    udf10, udf9, udf8, udf7, udf6, udf5, udf4, udf3, udf2, udf1,
    email, firstname, productinfo, amount, txnid, key
  ].join('|');

  const calculatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');

  return calculatedHash === hash;
}

module.exports = { 
  get_payu_keys,
  verifyPayUResponseHash
};

