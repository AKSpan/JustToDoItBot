/**
 * Created by Span on 10.12.2015.
 */
/*************TELEGRAM**********/
var TelegramBot = require('node-telegram-bot-api');
var token = '';
var bot = new TelegramBot(token, {polling: true});
/*********MONGODB*************/
/*
 var MongoClient = require('mongodb').MongoClient, assert = require('assert');
 var url = 'mongodb://localhost:27017/akdb';
 var MONGODB;
 openMongoDB();
 */

bot.onText(/\/hello/, function (msg) {
    var chatId = msg.chat.id;
    var opts = {
        //reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            keyboard: [
                ['/hello'],
                ['/time', '/date'], ['/echo'],
                ['/getPhoto', '/getAudio', '/getSmth'],
                ['/help']]
        })
    };

    /** @namespace msg.from.first_name */
    bot.sendMessage(chatId, "Hi " + msg.from.first_name, opts);
});
bot.onText(/\/time/, function (msg) {
    var chatId = msg.chat.id;
    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var text = hours + ":" + minutes;

    bot.sendMessage(chatId, text);
});


bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;
    var text = 'Use command:\n' +
        '/hello /time /date /getPhoto /getAudio /getSmth /help';

    bot.sendMessage(chatId, text);
});

bot.onText(/\/getPhoto/, function (msg) {
    var chatId = msg.chat.id;
    var photo = __dirname + '/img/doge.jpg';
    bot.sendPhoto(chatId, photo, {caption: "Cool Doge Bro!"});
});
bot.onText(/\/echo (.+)/, function (msg, match) {
    var chatId = msg.chat.id;
    var resp = match[1];
    bot.sendMessage(chatId, resp);
});
bot.onText(/\/getAudio/, function (msg) {
    var chatId = msg.chat.id;
    var url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
    // From HTTP request!
    var audio = request(url);

    bot.sendAudio(chatId, audio)
        .then(function (resp) {
            console.log(resp)
            // Forward the msg
            var messageId = resp.message_id;
            bot.forwardMessage(chatId, chatId, messageId);
        });
});
//

/*****MONGO FUNCTIONS******/
/*
 function openMongoDB() {
 if (MONGODB == null) {
 MongoClient.connect(url, function (err, db) {
 assert.equal(null, err);
 console.log("Connected correctly to server");
 MONGODB = db;
 });
 }
 else {
 console.log("Already open");
 }
 }
 function closeMongoDB() {
 if (MONGODB != null) {
 MONGODB.close();
 console.log("close!")
 }
 else {
 console.log("Already close!");
 }
 }
 var insertDocuments = function (db, callback) {
 // Get the documents collection
 var collection = db.collection('documents');
 // Insert some documents
 collection.insertMany([
 {a: 1}, {a: 2}, {a: 3}
 ], function (err, result) {
 assert.equal(err, null);
 assert.equal(3, result.result.n);
 assert.equal(3, result.ops.length);
 console.log("Inserted 3 documents into the document collection");
 callback(result);
 });
 };
 var findDocuments = function (db, callback) {
 // Get the documents collection
 var collection = db.collection('dict');
 // Find some documents
 collection.find({}).toArray(function (err, docs) {
 //  console.dir(docs);
 callback(docs);
 });
 };*/
