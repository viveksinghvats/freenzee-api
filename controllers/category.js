const { Category } = require("../models/");
const { validateCreateCategoryBodyRequest } = require("./helper/categoryHelper");
const httpConstants = require('../utils/httpConstants');

exports.getCategoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
      if (err || !category) {
        return res.status(400).json({
          error: "No category was found in DB"
        });
      }
      req.category = category;
      next();
    });
  };

exports.createNewCategory = (req, res) => {
    try {
        const { error } = validateCreateCategoryBodyRequest(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const category = Category(req.body);
        category.save((err, category) => {
            if (err) {
                return res.status(httpConstants.BAD_REQUEST_400).json({
                    error: 'Not able to save category details'
                });
            }
            res.status(httpConstants.OK_200).json({ category });
        });
    } catch (error) {
        console.log(err);
    }
}

exports.updateCategory = (req, res) => {
    try {
        const { error } = validateCreateCategoryBodyRequest(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const category = req.category;
        category.name = req.body.name;
        category.description = req.body.description;
        category.save((err, updateCategory) => {
            if (err) {
                return res.status(httpConstants.BAD_REQUEST_400).json({
                  error: "Failed to update category"
                });
              }
              res.status(httpConstants.OK_200).json({ updateCategory });
        });
    } catch (error) {
        console.log(err);
    }
}