/**
 * Created by Span on 10.12.2015.
 */
/*************TELEGRAM**********/
var TelegramBot = require('node-telegram-bot-api');
var token = '';
var bot = new TelegramBot(token, {polling: true});
/*********MONGODB*************/
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var url = 'mongodb://localhost:27017/akdb';
var DB_NAME = 'list_task';
var keyboard_btns = [
    ['/list', '/add'],
    ['/commands', '/help']
];
var OPTS = {
    reply_markup: JSON.stringify({
        keyboard: keyboard_btns
    })
};

bot.onText(/\/start/, function (msg) {
    console.log("msg", msg)
    var chatId = msg.chat.id;
    var opts = OPTS;
    /** @namespace msg.from.first_name */
    bot.sendMessage(chatId, "Hi " + msg.from.first_name, opts);
});
/**
 * Список команд
 */
bot.onText(/\/commands/, function (msg) {
    var chatId = msg.chat.id;
    var text = "/commands - Show bot commands list\n" +
        "/list - Show your tasks list\n" +
        "/task %dd.mm.yyyy% - Show your tasks at selected date\n" +
        "/task %number% - Show task with selected number\n" +
        "/doit %number% - Set task with %number% as completed\n" +
        "/expired - Your expired tasks";
    bot.sendMessage(chatId, text, OPTS);
});
/**
 * Получение списка задач
 */
bot.onText(/\/list/, function (msg) {
    console.log(msg)
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var chatId = msg.chat.id;
        var userId = msg.from.id;
        try {
            var opts = {owner_id: userId};
            findDocuments(db, opts, function (data) {
                var text = '';
                for (var i = 0; i < data.length; i++) {
                    text += printTaskText(data[i]);
                }
                db.close();
                bot.sendMessage(chatId, text, OPTS);

            });
        }
        catch (ex) {
            console.log(ex)
            bot.sendMessage(chatId, ex);
        }
    });
});
bot.onText(/\/test/, function (msg) {
    var chatId = msg.chat.id;
    console.log()
    bot.sendMessage(chatId, 'test');
    bot.getUpdates();
});


/**
 * Получение списка задач по параметру.
 * Если параметр цифра (Ех. '12') ищется задача с номером 12,
 * если параметр дата формата dd.yy.yyyy ищятся все задачи с указанной датой окончания.
 * Работает как like start with (Ex. '12.12%')
 */
bot.onText(/\/task (.+)/, function (msg, match) {
    var task_query = match[1];
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var chatId = msg.chat.id;
        var userId = msg.from.id;
        var text = '';
        var opts;
        try {
            if (task_query.indexOf('.') < 0)
                opts = {owner_id: userId, task_number: parseInt(task_query)};
            else
                opts = {owner_id: userId, do_date: new RegExp('^' + task_query)};
            findDocuments(db, opts, function (data) {

                if (data.length > 0)
                    for (var i = 0; i < data.length; i++)
                        text += printTaskText(data[i]);
                else
                    text = 'Sorry, but nothing found.';
                db.close();
                bot.sendMessage(chatId, text, OPTS);
            });
        }
        catch (ex) {
            console.log("ex---->", ex)
            bot.sendMessage(chatId, "Something gonna wrong ;(");
        }
    });
});
var printTaskText = function (data) {
    /** @namespace data.task_text */
    /** @namespace data.do_date */
    /** @namespace data.is_done */
    /** @namespace data.done_date */
    /** @namespace data.created_date */
    return "============" + data.task_number + "============\n" +
        "Text: " + data.task_text + "\n" +
        "Do date: " + data.do_date + "\n" +
        "Is done: " + data.is_done + "\n" +
        "Done date: " + data.done_date + "\n" +
        "Created date: " + data.created_date + "\n";
}
/*****MONGO FUNCTIONS******/

var findDocuments = function (db, opts, callback) {
    // Get the documents collection
    var collection = db.collection(DB_NAME);
    // Find some documents
    collection.find(opts).toArray(function (err, docs) {
        callback(docs);
    });
};
var insertDocuments = function (db, callback) {
    var collection = db.collection('documents');
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
var updateDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({a: 2}
        , {$set: {b: 1}}, function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });
};
var deleteDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.deleteOne({a: 3}, function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Removed the document with the field a equal to 3");
        callback(result);
    });
};