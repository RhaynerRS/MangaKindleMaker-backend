const mongoose = require("mongoose");
const userSchema = require("../schemes/user");
const User = mongoose.model('usuarios', userSchema);

module.exports = function apiKeyAuth(req, res, next) {
    if (!req.headers.apikey) {
        return res.status(403).json({ error: 'No credentials sent!' });
    }
    else if (User.findOne({ apikey: req.headers.apikey })) {
        next();
    } else {
        return res.status(401).json({ error: 'This Credencials are nor valid!' });
    }
}