/**
 * Created by Alexey on 18.12.2015.
 */
var TeleBot = require('telebot');
var MongoClient = require('mongodb').MongoClient;
var props = require('./props');
var MongoOp = require('./mongo/mongoOperations');
require('./utils/dateformat');
/*************VARS************/
var USER_ADD_TASK_ARRAY = {};
var URL = props.url;
var DATE_FORMAT = 'dd.mm.yyyy HH:MM:ss';
/****************************/
var bot = new TeleBot({
    token: props.token,
    sleep: 1000, // How often check updates (in ms)
    timeout: 0, // Update pulling timeout (0 - short polling)
    limit: 100 // Limits the number of updates to be retrieved
});
var keyboard_btns = bot.keyboard([
    ['/list', '/task'],
    ['/add', '/doit'],
    ['/expired', '/delete'],
    ['/help']
], {resize: true, once: false});
var KEYBOARD = {
    markup: keyboard_btns
};
// Include ask module
bot.use(require('./node_modules/telebot/modules/ask'));
/**************LOGIC*************/
bot.on('/start', function (msg) {
    /** @namespace msg.from.first_name */
    bot.sendMessage(msg.from.id, "Hello " + msg.from.first_name + "", KEYBOARD);
});
bot.on('/help', function (msg) {
    var text =
        "With this bot you can create your own TODO list and keep track of your tasks.\n" +
        "1⃣ Use /list to get your task list.\n" +
        "2⃣ To add new task, use /add. \n" +
        "3⃣ To complete task, use /doit.\n" +
        "4⃣ To show expired tasks, use /expired.\n" +
        "5⃣ If you want get task(s) by ID or certain date, use /task.";
    bot.sendMessage(msg.from.id, text, KEYBOARD);
});
bot.on('/list', function (msg) {
    MongoClient.connect(URL, function (err, db) {
        var userId = msg.from.id;
        var opts = {owner_id: userId};
        MongoOp.findDocuments(db, opts, function (data) {
            var text = '';
            if (data.length > 0)
                for (var i = 0; i < data.length; i++) {
                    text += printTaskText(data[i]);
                }
            else
                text = 'You do not have tasks. Use /add to add new task.';
            db.close();
            bot.sendMessage(userId, text);

        });

    });
});
bot.on('/add', function (msg) {
    var chatId = msg.from.id;
    var text = 'Write and send TASK TEXT (send /cancel to abort operation):';
    bot.sendMessage(chatId, text, {ask: 'task_text'});
});
bot.on('ask.task_text', function (msg) {
    var cancel = msg.text === '/cancel';
    if (!cancel) {
        USER_ADD_TASK_ARRAY['task_text'] = msg.text;
        var text = 'Write date of completion (send /cancel to abort operation):';
        bot.sendMessage(msg.from.id, text, {ask: 'task_do_date'});
    }
});
bot.on('ask.task_do_date', function (msg) {
    var cancel = msg.text === '/cancel';
    if (!cancel) {
        USER_ADD_TASK_ARRAY['do_date'] = msg.text;
        var opts = {
            owner_id: msg.from.id,
            do_date: USER_ADD_TASK_ARRAY.do_date,
            task_text: USER_ADD_TASK_ARRAY.task_text
        };
        MongoClient.connect(URL, function (err, db) {
            MongoOp.insertDocument(db, opts, function () {
                USER_ADD_TASK_ARRAY = {};
                var text = '⭐Task is added⭐';
                bot.sendMessage(msg.from.id, text);
            });

        });
    }
});
bot.on('/cancel', function (msg) {
    USER_ADD_TASK_ARRAY = {};
    var text = 'Operation canceled.';
    bot.sendMessage(msg.from.id, text);
});
bot.on('/doit', function (msg) {
    var chatId = msg.from.id;
    var text = 'Write task ID to complete it, or /cancel to abort operation.';
    bot.sendMessage(chatId, text, {ask: 'task_number'});
});
bot.on('ask.task_number', function (msg) {
    var cancel = msg.text === '/cancel';
    if (!cancel) {
        var userId = msg.from.id;
        var number = Number(msg.text);
        if (!number) {
            var text = 'Incorrect number. Please, try again, or abort operation (/cancel).';
            return bot.sendMessage(userId, text, {ask: 'task_number'});
        }
        else {
            MongoClient.connect(URL, function (err, db) {
                var opts = {owner_id: userId, task_number: number};
                MongoOp.updateDocument(db, opts, function (data) {
                    var text = '';
                    if (data.result.nModified == 1)
                        text = '⭐Task #' + number + ' is complete⭐';
                    else
                        text = 'Task #' + number + ' isn\'t updated.';
                    return bot.sendMessage(userId, text);
                });


            });
        }
    }
});
bot.on('/task', function (msg) {
    var text = 'Send /id or /date to find task(s) or /cancel to abort operation.';
    bot.sendMessage(msg.chat.id, text, {ask: 'task_type'});
});
bot.on('ask.task_type', function (msg) {
    var text = '';
    var cancel = msg.text === '/cancel';
    if (!cancel) {
        if (msg.text === '/id')
            text = 'Send task ID or /cancel to abort operation.';
        if (msg.text === '/date')
            text = 'Send date in format dd.mm.yyyy or /cancel to abort operation.';
        bot.sendMessage(msg.from.id, text, {ask: "task_param"});
    }
});
bot.on('ask.task_param', function (msg) {
    var cancel = msg.text === '/cancel';
    var opts = {owner_id: msg.from.id, task_number: -1};
    if (!cancel) {
        var number = Number(msg.text);
        if (number)
            opts = {owner_id: msg.from.id, task_number: number};
        else {
            if (msg.text.indexOf('.') > -1)
                opts = {owner_id: msg.from.id, do_date: new RegExp('^' + msg.text)};
        }
        MongoClient.connect(URL, function (err, db) {
            MongoOp.findDocuments(db, opts, function (data) {
                var text = '';
                if (data.length > 0)
                    for (var i = 0; i < data.length; i++)
                        text += printTaskText(data[i]);
                else
                    text = 'Sorry, but nothing found.';
                db.close();
                bot.sendMessage(msg.from.id, text);
            });
        });
    }
});
bot.on('/delete', function (msg) {
    var text = 'Send task ID or /cancel to abort operation.';
    bot.sendMessage(msg.from.id, text, {ask: "task_delete"});
});
bot.on('ask.task_delete', function (msg) {
    var cancel = msg.text === '/cancel';
    var opts = {owner_id: msg.from.id, task_number: -1};
    if (!cancel) {

        var number = Number(msg.text);
        if (!number) {
            var text = 'Incorrect number. Please, try again, or abort operation (/cancel).';
            return bot.sendMessage(msg.from.id, text, {ask: "task_delete"});
        }
        opts = {owner_id: msg.from.id, task_number: number};
        MongoClient.connect(URL, function (err, db) {
            MongoOp.deleteDocument(db, opts, function (data) {
                var text = '3213';
                if (data.result.n)
                    text = '⭐Task with #' + number + ' was successfully removed⭐';
                else
                    text = 'Task was not removed :(';
                db.close();
                return bot.sendMessage(msg.from.id, text);
            });
        });
    }
});
bot.on('/expired', function (msg) {
    var text = 'Sorry, but nothing found.';
    MongoClient.connect(URL, function (err, db) {
        var opts = {owner_id: msg.from.id, do_date: {'$lte': getSysdate()}, is_done: false};
        MongoOp.findDocuments(db, opts, function (data) {
            if (data.length > 0) {
                text = '';
                for (var i = 0; i < data.length; i++) {
                    text += printTaskText(data[i]);
                }
            }
            else
                text = 'You do not have expired tasks.';
            db.close();
            return bot.sendMessage(msg.from.id, text);
        });
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
        "Is done: " + ( (data.is_done == true) ? "✅" : "❌") + "\n" +
        "Done date: " + data.done_date + "\n" +
        "Created date: " + data.created_date + "\n";
};
/**
 * Return today date in DATE_FORMAT
 */
var getSysdate = function () {
    var today = new Date();
    return today.format(DATE_FORMAT);
};
module.exports.getSysdate = getSysdate;
bot.connect();