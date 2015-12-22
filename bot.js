/**
 * Created by Alexey on 18.12.2015.
 */
var TeleBot = require('telebot');
var MongoClient = require('mongodb').MongoClient;
var props = require('./props');
var MongoOp = require('./mongo/mongoOperations');
require('./utils/dateformat');
require('./utils/format');
var Localization = require('./utils/translate-js');
var validator = require('validator');
/*************VARS************/
var USER_ADD_TASK_ARRAY = {};
var URL = props.url;
var DATE_FORMAT = 'dd.mm.yyyy HH:MM:ss';
/***********LOCALES**********/
var locales = require('./utils/locale-server-messages');
var LOCALIZATION = new Localization.Localizer();
LOCALIZATION.messages.en_US = locales.en_US;
var USER_LANG = 'en_US';
/****************************/
var bot = new TeleBot({
    token: props.token,
    sleep: 1000, // How often check updates (in ms)
    timeout: 0, // Update pulling timeout (0 - short polling)
    limit: 10 // Limits the number of updates to be retrieved
});
// Include ask module
bot.use(require('./node_modules/telebot/modules/ask'));
/*********KEYBOARDЫ**********/
var MAIN_KEYBOARD = {
    markup: bot.keyboard([
        ['/list', '/task'],
        ['/add', '/doit'],
        ['/expired', '/delete'],
        ['/help']
    ], {resize: true, once: false})
};
var SECOND_KEYBOARD = {
    markup: bot.keyboard([
        ['/id', '/date'],
        ['/cancel']
    ], {resize: true, once: false})
};
var CANCEL_KEYBOARD = {
    markup: bot.keyboard([
        ['/cancel']
    ], {resize: true, once: false})
};
var LANGUAGE_KEYBOARD = {
    markup: bot.keyboard([
        ['/ru', '/en']
    ], {resize: true, once: false})
};
/****************************/
/***********LOGIC************/
bot.on('/test', function () {
    console.log(String.format(LOCALIZATION.tr('print_task_text', 'ru_RU'), 1, 2, 3, 4, 5, 6));
});
bot.on('/start', function (msg) {
    /** @namespace msg.from.first_name */
    bot.sendMessage(msg.from.id, String.format("Hello {0}, please choose language:", msg.from.first_name), LANGUAGE_KEYBOARD);
});
bot.on('/ru', function (msg) {
    LOCALIZATION.messages.ru_RU = locales.ru_RU;
    USER_LANG = 'ru_RU';
    bot.sendMessage(msg.from.id, LOCALIZATION.tr('change_lang', USER_LANG), MAIN_KEYBOARD);
});
bot.on('/en', function (msg) {
    USER_LANG = 'en_US';
    bot.sendMessage(msg.from.id, LOCALIZATION.tr('change_lang', USER_LANG), MAIN_KEYBOARD);
});
bot.on('/language', function (msg) {
    bot.sendMessage(msg.from.id, LOCALIZATION.tr('choose_lang', USER_LANG), LANGUAGE_KEYBOARD);
});
bot.on('/help', function (msg) {
    var text = LOCALIZATION.tr('help', USER_LANG);
    bot.sendMessage(msg.from.id, text, MAIN_KEYBOARD);
});
bot.on('/list', function (msg) {
    MongoClient.connect(URL, function (err, db) {
        var userId = msg.from.id;
        var opts = {owner_id: userId};
        MongoOp.findDocuments(db, opts, function (data) {
            var text = '';
            if (data.length > 0)
                for (var i = 0; i < data.length; i++) {
                    text += printTaskText(data[i], USER_LANG);
                }
            else
                text = LOCALIZATION.tr('list:no_tasks_text', USER_LANG);
            db.close();
            bot.sendMessage(userId, text, {parse_mode: "markdown"});
        });
    });
});
bot.on('/add', function (msg) {
    var chatId = msg.from.id;
    var text = LOCALIZATION.tr('add:task_text', USER_LANG);
    bot.sendMessage(chatId, text, {ask: 'task_text', parse_mode: "markdown"});
});
bot.on('ask.task_text', function (msg) {
    var cancel = msg.text === '/cancel';
    if (!cancel) {
        USER_ADD_TASK_ARRAY['task_text'] = msg.text;
        var text = LOCALIZATION.tr('add:task_date', USER_LANG);
        bot.sendMessage(msg.from.id, text, {ask: 'task_do_date', parse_mode: "markdown"});
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
                var text = LOCALIZATION.tr('add:added', USER_LANG);
                bot.sendMessage(msg.from.id, text);
            });

        });
    }
});
bot.on('/cancel', function (msg) {
    USER_ADD_TASK_ARRAY = {};
    var text = LOCALIZATION.tr('cancel', USER_LANG);
    bot.sendMessage(msg.from.id, text, MAIN_KEYBOARD);
});
bot.on('/doit', function (msg) {
    var chatId = msg.from.id;
    var text = LOCALIZATION.tr('doit:id_text', USER_LANG);
    var opts = CANCEL_KEYBOARD;
    opts['ask'] = 'task_number';
    opts['parse_mode'] = 'markdown';
    bot.sendMessage(chatId, text, opts);
});
bot.on('ask.task_number', function (msg) {
    var cancel = msg.text === '/cancel';
    var opts = CANCEL_KEYBOARD;
    if (!cancel) {
        var userId = msg.from.id;
        var number = Number(msg.text);
        if (!number) {
            var text = LOCALIZATION.tr('doit:incorrect_num', USER_LANG);
            opts['ask'] = 'task_number';
            return bot.sendMessage(userId, text, opts);
        }
        else {
            MongoClient.connect(URL, function (err, db) {
                var opts = {owner_id: userId, task_number: number};
                MongoOp.updateDocument(db, opts, function (data) {
                    var text = '';
                    if (data.result.nModified == 1)
                        text = String.format(LOCALIZATION.tr('doit:complete', USER_LANG), number);
                    else
                        text = String.format(LOCALIZATION.tr('doit:upd_err', USER_LANG), number);
                    var opt = MAIN_KEYBOARD;
                    opt['parse_mode'] = 'markdown';
                    return bot.sendMessage(userId, text, opt);
                });
            });
        }
    }
});
bot.on('/task', function (msg) {
    var text = LOCALIZATION.tr('task:task_text', USER_LANG);
    var opts = SECOND_KEYBOARD;
    opts['ask'] = 'task_type';
    opts['parse_mode'] = 'markdown';
    bot.sendMessage(msg.chat.id, text, opts);
});
bot.on('ask.task_type', function (msg) {
    var text = '', opts;
    var cancel = msg.text === '/cancel';
    opts = CANCEL_KEYBOARD;
    if (!cancel) {
        switch (msg.text) {
            case '/id':
                text = LOCALIZATION.tr('task:task_type:id', USER_LANG);
                opts['ask'] = "task_param";
                opts['parse_mode'] = "markdown";
                break;
            case '/date':
                text = LOCALIZATION.tr('task:task_type:date', USER_LANG);
                opts['ask'] = "task_param";
                opts['parse_mode'] = "markdown";
                break;
            default :
                text = LOCALIZATION.tr('task:task_type:invalid', USER_LANG);
                opts['ask'] = "task_type";
                break;
        }
        bot.sendMessage(msg.from.id, text, opts);
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
                        text += printTaskText(data[i], USER_LANG);
                else
                    text = LOCALIZATION.tr('task:task_param:not_found', USER_LANG);
                db.close();
                var op = MAIN_KEYBOARD;
                op["parse_mode"] = "markdown";
                bot.sendMessage(msg.from.id, text, op);
            });
        });
    }
});
bot.on('/delete', function (msg) {
    var text = LOCALIZATION.tr('del:id_text', USER_LANG);
    bot.sendMessage(msg.from.id, text, {ask: "task_delete", parse_mode: "markdown"}, CANCEL_KEYBOARD);
});
bot.on('ask.task_delete', function (msg) {
    var cancel = msg.text === '/cancel';
    var opts = {owner_id: msg.from.id, task_number: -1};
    var msg_opts = CANCEL_KEYBOARD;
    msg_opts['parse_mode'] = 'markdown';
    if (!cancel) {
        var number = Number(msg.text);
        if (!number) {
            var text = LOCALIZATION.tr('del:task_delete:incorrect', USER_LANG);
            msg_opts['ask'] = 'task_delete';
            return bot.sendMessage(msg.from.id, text, msg_opts);
        }
        opts = {owner_id: msg.from.id, task_number: number};
        MongoClient.connect(URL, function (err, db) {
            MongoOp.deleteDocument(db, opts, function (data) {
                var text = '3213';
                if (data.result.n)
                    text = String.format(LOCALIZATION.tr('del:task_delete:removed', USER_LANG), number);
                else
                    text = LOCALIZATION.tr('del:task_delete:not_removed', USER_LANG);
                db.close();
                msg_opts = MAIN_KEYBOARD;
                msg_opts['parse_mode'] = 'markdown';
                return bot.sendMessage(msg.from.id, text, msg_opts);
            });
        });
    }
});
bot.on('/expired', function (msg) {
    var text = LOCALIZATION.tr('expired:not_found');
    MongoClient.connect(URL, function (err, db) {
        var opts = {owner_id: msg.from.id, do_date: {'$lte': getSysdate()}, is_done: false};
        MongoOp.findDocuments(db, opts, function (data) {
            if (data.length > 0) {
                text = '';
                for (var i = 0; i < data.length; i++) {
                    text += printTaskText(data[i], USER_LANG);
                }
            }
            else
                text = LOCALIZATION.tr('expired:no_expired', USER_LANG);
            db.close();
            return bot.sendMessage(msg.from.id, text, {parse_mode: "markdown"});
        });
    });
});

var printTaskText = function (data, lang) {
    /** @namespace data.task_text */
    /** @namespace data.do_date */
    /** @namespace data.is_done */
    /** @namespace data.done_date */
    /** @namespace data.created_date */
    return String.format(LOCALIZATION.tr('print_task_text', lang), data.task_number, data.task_text, data.do_date,
        ( (data.is_done == true) ? "✅" : "❌"), data.done_date, data.created_date);
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