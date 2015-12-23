var token = '<TOKEN>';
module.exports.token = token;
var DB_USERNAME = '<USER>',
    DB_PASSWORD = '<PASS>';
var url = 'mongodb://' + DB_USERNAME + ':' + DB_PASSWORD + '@' + 'localhost:27017/akdb';
module.exports.url = url;