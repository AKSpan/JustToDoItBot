/**
 * Created by Span on 10.12.2015.
 */
/*************TELEGRAM**********/
var TelegramBot = require('node-telegram-bot-api');
var token = require('./token').token;
var bot = new TelegramBot(token, {polling: true});
/*********MONGODB*************/
var MongoClient = require('mongodb').MongoClient;
var URL = 'mongodb://localhost:27017/akdb';
var MongoOp = require('./mongoOperations');
/*************VARS************/
var USER_LAST_COMMAND = null;
var USER_LAST_ADD_COMMAND = null;
var USER_LAST_TASK_COMMAND = null;
var USER_ADD_TASK_ARRAY = {};
/**********KEYBOARDS**********/
var keyboard_btns = [
    ['/list', '/add'],
    ['/expired'],
    ['/help']
];
/********SOME OPTIONS********/
var OPTS = {
    reply_markup: JSON.stringify({
        keyboard: keyboard_btns
    })
};
/******Handling messages*****/
bot.onText(/\/help/, function (msg) {
    var text =
        "With this bot you can create your own TODO list and keep track of your tasks.\n" +
        "1⃣ Use /list command to get your list.\n" +
        "2⃣ To add new task use /add command and then follow the instructions. \n" +
        "3⃣ To complete specific task use /doit <number>.\n" +
        "4⃣ If you want get specific task, find it by ID. Use /task <number>.\n" +
        "5⃣ If want get task(s) to certain date use /task <dd.mm.yyyy>. \n" +
        "6⃣ To show expired tasks use /expired.";
    bot.sendMessage(msg.chat.id, text)
});

/**
 * Get a list of tasks
 */
bot.onText(/\/list/, function (msg) {
    console.log("/list", msg);
    USER_LAST_COMMAND = 'list';
    MongoClient.connect(URL, function (err, db) {
        var chatId = msg.chat.id;
        var userId = msg.from.id;
        try {
            var opts = {owner_id: userId};
            MongoOp.findDocuments(db, opts, function (data) {
                var text = '';
                if (data.length > 0)
                    for (var i = 0; i < data.length; i++) {
                        text += printTaskText(data[i]);
                    }
                else
                    text = 'Sorry, but nothing found.';
                db.close();
                bot.sendMessage(chatId, text);

            });
        }
        catch (ex) {
            console.log(ex);
            var text = "Error. Cannot find tasks. Try again or later!";
            bot.sendMessage(chatId, text);
        }
    });
});
/**
 * Step-by adding tasks
 */
bot.onText(/\/add/, function (msg) {
    console.log("/add");
    USER_LAST_COMMAND = 'add';
    USER_LAST_ADD_COMMAND = "text";
    var chatId = msg.chat.id;
    var text = 'Write and send TASK TEXT (send /cancel to abort operation):';
    bot.sendMessage(chatId, text);
});
/**
 * Handling any messages.
 * Need for adding task
 */
bot.on('message', function (msg) {
    console.log("message");
    if (!msg.text.startsWith('/'))
        addNewTaskWorker(msg);
});
bot.onText(/\/cancel/, function (msg) {
    var chatId = msg.chat.id;
    var text = '';
    if (USER_LAST_COMMAND != null) {
        USER_LAST_COMMAND = null;
        USER_LAST_ADD_COMMAND = null;
        USER_LAST_TASK_COMMAND = null;
        USER_ADD_TASK_ARRAY = {};
        console.log(msg.text);
        text = 'Operation canceled!';
        bot.sendMessage(chatId, text);
    }
    else {
        text = 'Nothing to cancel!';
        bot.sendMessage(chatId, text);
    }
});
bot.onText(/\/start/, function (msg) {
    console.log("/start");
    USER_LAST_COMMAND = 'start';
    var chatId = msg.chat.id;
    /** @namespace msg.from.first_name */
    bot.sendMessage(chatId, "Hi " + msg.from.first_name, OPTS);
});
/**
 * Get tasks list by parameter
 * If param is number (Ех. '12') find task with specified id <number>,
 * if date (dd.yy.yyyy) find all tasks with the specified end date.
 * Works as 'like starts with' (Ex. '12.12%')
 */
bot.onText(/\/task (.+)/, function (msg, match) {
    getTaskWorker(msg, match[1]);
});
bot.onText(/\/(task)$/, function (msg) {
    var text = 'Use \'/task <number>/<date>\' to get task with id.';
    bot.sendMessage(msg.chat.id, text);
});
/**
 * Set task with specified id as completed
 */
bot.onText(/\/doit (.+)/, function (msg, match) {
    console.log('doit');
    var id = match[1];
    MongoClient.connect(URL, function (err, db) {
        var chatId = msg.chat.id;
        var userId = msg.from.id;
        try {
            var opts = {owner_id: userId, task_number: parseInt(id)};
            console.log("opts", opts);
            MongoOp.updateDocument(db, opts, function (data) {
                // console.log(data);
                console.log(data.result.nModified);
                var text = '';
                if (data.result.nModified == 1)
                    text = '⭐Task #' + id + ' is complete!⭐';
                else
                    text = 'Task #' + id + ' isn\'t updated!';
                bot.sendMessage(chatId, text);
            });
        }
        catch (ex) {
            console.log(ex);
            var text = "Error. Cannot find tasks. Try again or later!";
            bot.sendMessage(chatId, text);
        }
    });

});
bot.onText(/\/(doit)$/, function (msg) {
    var text = 'Use \'/doit <number>\' to complete task.';
    bot.sendMessage(msg.chat.id, text);
});

//var deleteDocument = function (db, callback) {
//    // Get the documents collection
//    var collection = db.collection('documents');
//    // Insert some documents
//    collection.deleteOne({a: 3}, function (err, result) {
//        assert.equal(err, null);
//        assert.equal(1, result.result.n);
//        console.log("Removed the document with the field a equal to 3");
//        callback(result);
//    });
//};

/*******Additional functions*****/
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
var getSysdate = function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var mins = today.getMinutes();
    var ss = today.getSeconds();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (mins < 10) mins = '0' + mins;
    if (ss < 10) ss = '0' + ss;
    today = dd + '.' + mm + '.' + yyyy + ' ' + hh + ':' + mins + ':' + ss;
    console.log(today);
    return today;
};
module.exports.getSysdate = getSysdate;
var addNewTaskWorker = function (msg) {
    console.log("addNewTaskWorker", msg);
    console.log("USER_LAST_COMMAND", USER_LAST_COMMAND);
    console.log("USER_LAST_ADD_COMMAND", USER_LAST_ADD_COMMAND);
    console.log("USER_LAST_TASK_COMMAND", USER_LAST_TASK_COMMAND);
    getSysdate();
    var chatId = msg.chat.id;
    switch (USER_LAST_COMMAND) {
        case 'add':
            if (USER_LAST_ADD_COMMAND === 'text') {
                USER_ADD_TASK_ARRAY["task_text"] = msg.text;
                USER_LAST_ADD_COMMAND = "do_date";
                var text = 'Write date of completion (send /cancel to abort operation):';
                bot.sendMessage(chatId, text);
                break;
            }
            if (USER_LAST_ADD_COMMAND === 'do_date') {
                USER_LAST_COMMAND = null;
                USER_LAST_ADD_COMMAND = null;
                USER_ADD_TASK_ARRAY["do_date"] = msg.text;
                /******Write in DB******/
                var opts = {
                    owner_id: msg.from.id,
                    do_date: USER_ADD_TASK_ARRAY.do_date,
                    task_text: USER_ADD_TASK_ARRAY.task_text
                };
                MongoClient.connect(URL, function (err, db) {
                    MongoOp.insertDocument(db, opts);
                    var text = 'Task is added!';
                    bot.sendMessage(chatId, text);
                });
                console.log("opts", opts);
                /**********END**********/
                USER_ADD_TASK_ARRAY = {};
                break;
            }
            break;
    }
};
var getTaskWorker = function (msg, task_query) {
    console.log("getTaskWorker");
    task_query = (task_query != null && !task_query.startsWith('/')) ? task_query : null;
    USER_LAST_COMMAND = 'task';
    var chatId = msg.chat.id;
    if (task_query != null) {
        MongoClient.connect(URL, function (err, db) {
            var userId = msg.from.id;
            var text = '';
            var opts;
            try {
                if (task_query.indexOf('.') < 0)
                    opts = {owner_id: userId, task_number: parseInt(task_query)};
                else
                    opts = {owner_id: userId, do_date: new RegExp('^' + task_query)};
                MongoOp.findDocuments(db, opts, function (data) {

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
                console.log("ex---->", ex);
                bot.sendMessage(chatId, "Something gonna wrong ;(");
            }
        });
    }
    else {
        if (!msg.text.startsWith('/')) {
            var text = 'Send a number of task or date of completion task';
            USER_LAST_TASK_COMMAND = 'next_param';
            USER_LAST_COMMAND = 'task';
            bot.sendMessage(chatId, text);
        }
    }
};