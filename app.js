/**
 * Created by Span on 10.12.2015.
 */
/*************TELEGRAM**********/
var TelegramBot = require('node-telegram-bot-api');
var token = '';
var bot = new TelegramBot(token, {polling: true});
/*********MONGODB*************/
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var URL =  'mongodb://localhost:27017/akdb';
var DB_NAME = 'list_task';

var USER_LAST_COMMAND = null;
var USER_LAST_ADD_COMMAND = null;
var USER_ADD_TASK_ARRAY = {};
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
    USER_LAST_COMMAND = 'start';
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
    USER_LAST_COMMAND = 'commands';
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
    USER_LAST_COMMAND = 'list';
    console.log(msg)
    MongoClient.connect(URL, function (err, db) {
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
bot.onText(/\/add/, function (msg) {
    USER_LAST_COMMAND = 'add';
    USER_LAST_ADD_COMMAND = "text";
    var chatId = msg.chat.id;
    var text = 'Write and send TASK TEXT (send /cancel to abort operation):';
    bot.sendMessage(chatId, text);
});
bot.onText(/\/РУ/, function (msg) {
   console.log('русский текст')
});
bot.onText(/\/cancel/, function (msg) {
    var chatId = msg.chat.id
    if (USER_LAST_COMMAND != null) {
        USER_LAST_COMMAND = null;
        USER_LAST_ADD_COMMAND = null;
        USER_ADD_TASK_ARRAY = {};
        console.log(msg.text);
        var text = 'Operation canceled!';
        bot.sendMessage(chatId, text);
    }
    else {
        var text = 'Nothing to cancel!';
        bot.sendMessage(chatId, text);
    }
});
bot.onText(/^[a-z0-9а-я\.\\:\s]*$/i, function (msg) {
    console.log(msg);
    console.log("USER_LAST_COMMAND", USER_LAST_COMMAND);
    console.log("USER_LAST_ADD_COMMAND", USER_LAST_ADD_COMMAND);
    getSysdate();
    var chatId = msg.chat.id;
    switch (USER_LAST_COMMAND) {
        default:

            break;
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
                    insertDocument(db, opts);
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
});

/**
 * Получение списка задач по параметру.
 * Если параметр цифра (Ех. '12') ищется задача с номером 12,
 * если параметр дата формата dd.yy.yyyy ищятся все задачи с указанной датой окончания.
 * Работает как like start with (Ex. '12.12%')
 */
bot.onText(/\/task (.+)/, function (msg, match) {

    var task_query = match[1];
    USER_LAST_COMMAND = 'task ' + task_query;
    MongoClient.connect(URL, function (err, db) {
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
/**
 * Get current sysdate
 * @returns {Date}
 */
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
    today = mm + '.' + dd + '.' + yyyy + ' ' + hh + ':' + mins + ':' + ss;
    console.log(today);
    return today;
};
/**
 * Insert new task.
 * @param db MongoClient connect db
 * @param opts object, containing fields: owner_id, do_date, task_text
 */
var insertDocument = function (db, opts) {
    console.log('insert doc');
    console.log(opts);
    var collection = db.collection(DB_NAME);

    collection.find({owner_id: opts.owner_id}).sort({_id: -1}).limit(1).toArray(function (err, docs) {
        console.log('find docs',docs,'docs[0]',docs[0])
        var last_task_number =  docs[0].task_number;
        last_task_number = last_task_number>0?last_task_number:0;

        var newTask = {
            owner_id: opts.owner_id,
            created_date: getSysdate(),
            do_date: opts.do_date,
            done_date: '',
            is_done: false,
            task_text: opts.task_text,
            task_number:last_task_number + 1
        };
        console.log(newTask)
        collection.insertOne(newTask, function (xqr) {
            console.log('answer insert', xqr)
        });

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