const organiser = require('../models/organisers')
const common_code = require('../helpers/common_code')

const create = async (req, res) => {
  console.log("HERE AT REQUEST")
  try {
    const {name, email_id, mobile_number,verification_status} = req.body;
    console.log("create organiser parameters", {name, email_id, mobile_number, verification_status})
    const organiser_id = await common_code.getUniqid("org")
    console.log("--->", organiser_id)
    const {status, msg} = 
      await organiser.createOrganiser ({
        name,
        email_id,
        mobile_number,verification_status,organiser_id
      })
    if (status){
      return res.status(200).json({"msg": msg})
    }
    else {
      return res.status(422).json({"msg": msg})
    }
  }
  catch (error){
    return res.status(400).json({"msg": error.message})
  }
}


const getAllOrgs = async (req, res) => {
  try {
    console.log("query_params", req.query)//query_params [Object: null prototype] { page_no: '1', page_size: '10' }
    const {page_no, page_size} = req.query
    const offset = await common_code.pagination(page_no, page_size)
    console.log("offset", {offset, page_size})
    const {status,data} = await organiser.getAll({offset, page_size})
    if (status) {
      return res.status(200).json({"data": data})
    }
    else {
      return res.status(422).json({"data": data})
    }
  }
  catch (err) {
    console.log("crashing in getallOrgs --> ", err.message)
    return res.status(422).json({"msg": err.message})
  }
}

const ItemDetails = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Received Params ID", id);
    const { status, data } = await organiser.getItem(id);
    if (status) {
      return res.status(200).json({ data: data });
    }
    else {
      return res.status(422).json({ data: data });
    }
  }
  catch (err) {
    console.log("crashing in getItem--->", err.message);
    return res.status(422).json({ msg: err.message });
  }
};

const UpdateItem = async (req, res) => {
  try{
    const id = req.params.id;
    const { status, data } = await organiser.getItem(id);
    console.log("here--->",status)
    if (!status) {
      return res.status(422).json({ data: data });
    }
    const {name, mobile_number,verification_status} = req.body;
    const {new_status, new_data} = await organiser.update({name, mobile_number, verification_status, id});
    if (new_status){
      res.status(200).json({data: new_data});
    }
    else {
      res.status(422).json({data: new_data})
    }
  }
  catch (err) {
    console.log("crashing in update item --->", err.message);
    return res.status(422).json({ msg: err.message });
  }
}






module.exports = {
  create,
  getAllOrgs,
  ItemDetails,
  UpdateItem
}
