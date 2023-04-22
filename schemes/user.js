const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    apikey: String,
    passwordChangeCode: String
});

module.exports = userSchema;