const platformModel = require('../models/platforms');
const common_code = require('../helpers/common_code')

function createHandler(table) {
  return async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(422).json({ msg: "Name is required" });

    try {
      const { status, data, msg } = await platformModel.createIfNotExists(table, name);
      if (!status) return res.status(422).json({ msg: msg || "Already exists" });
       return res.status(200).json({ msg: "Created successfully", data });
    } 
    catch (err) {
       return res.status(422).json({ msg: err.message });
    }
  };
}

function getAllHandler(table) {
  return async (req, res) => {
    try {
      const {page_no, page_size} = req.query
      const offset = await common_code.pagination(page_no, page_size)
      const data = await platformModel.getAll(table, offset, page_size);
      return res.status(200).json({ data });
    } 
    catch (err) {
      return res.status(422).json({ msg: err.message });
    }
  };
}

function deleteHandler(table) {
  return async (req, res) => {
    try {
      const id = req.params.id;
      const result = await platformModel.deleteById(table, id);
      if (result.rowCount === 0) return res.status(422).json({ msg: "Item not found" });
      return res.status(200).json({ msg: "Deleted successfully" });
    } 
    catch (err) {
      return res.status(422).json({ msg: err.message });
    }
  };
}

module.exports = {
  genreCreate: createHandler('genres'),
  genreAll: getAllHandler('genres'),
  genreDelete: deleteHandler('genres'),

  locationCreate: createHandler('locations'),
  locationAll: getAllHandler('locations'),
  locationDelete: deleteHandler('locations'),

  languageCreate: createHandler('languages'),
  languageAll: getAllHandler('languages'),
  languageDelete: deleteHandler('languages')
};
