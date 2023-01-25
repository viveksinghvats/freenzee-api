const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1 } = require("uuid");
// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true
  },
  lastName: {
    type: String,
    required: false,
    maxlength: 32,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  encry_password: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  salt: String,
  role: {
    type: String,
    enum : ['user','admin', 'shop-owner', 'shop-operator'],
    default: 'user'
  }
}, { timestamps: true });

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = v1();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  }
};

module.exports = mongoose.model('User', userSchema);
