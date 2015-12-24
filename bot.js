/**
 * Created by Alexey on 18.12.2015.
 */

//<editor-fold desc="Requires">
var TeleBot = require('telebot');
var MongoClient = require('mongodb').MongoClient;
var props = require('./props');
var MongoOp = require('./mongo/mongoOperations');
require('./utils/dateformat');
require('./utils/format');
var Localization = require('./utils/translate-js');
var validator = require('validator');
//</editor-fold>
// <editor-fold desc="Variables">
var USER_ADD_TASK_ARRAY = {};
var URL = props.url;
var DATE_FORMAT = 'dd.mm.yyyy HH:MM:ss';
var locales = require('./utils/locale-server-messages');
var LOCALIZATION = new Localization.Localizer();
LOCALIZATION.messages.en_US = locales.en_US;
var USER_LANG = 'en_US';
// </editor-fold>
//<editor-fold desc="Bot setup">
var bot = new TeleBot({
    token: props.token,
    sleep: 1000, // How often check updates (in ms)
    timeout: 0, // Update pulling timeout (0 - short polling)
    limit: 10 // Limits the number of updates to be retrieved
});
bot.use(require('./node_modules/telebot/modules/ask'));
//</editor-fold>
//<editor-fold desc="KEYBOARDS">
var MAIN_KEYBOARD = {
    markup: bot.keyboard([
        ["/list " + String.fromCharCode(0xD83D, 0xDCD2), '/search ' + String.fromCharCode(0xD83D, 0xDCDD)],
        ['/add \u2795', '/doit \u2705'],
        ['/expired \u231b', '/delete \u274c'],
        ['/help \u2753']
    ], {resize: true, once: false})
};
var SECOND_KEYBOARD = {
    markup: bot.keyboard([
        ['/id ' + String.fromCharCode(0xD83C, 0xDD94), '/date ' + String.fromCharCode(0xD83D, 0xDCC6)],
        ['/cancel \u26D4']
    ], {resize: true, once: false})
};
var CANCEL_KEYBOARD = {
    markup: bot.keyboard([
        ['/cancel \u26D4']
    ], {resize: true, once: false})
};
var LANGUAGE_KEYBOARD = {
    markup: bot.keyboard([
        ['/ru ' + String.fromCharCode(0xD83C, 0xDDF7, 0xD83C, 0xDDFA), '/en ' + String.fromCharCode(0xD83C, 0xDDFA, 0xD83C, 0xDDF8)]
    ], {resize: true, once: false})
};
//</editor-fold>
bot.on('/test', function (msg) {
    //try {
    //    MongoClient.connect(URL, function (err, db) {
    //        console.log(err);
    //        console.log(db);
    //    });
    //}
    //catch (ex) {
    //    console.log('ex = ', ex)
    //}
});
//<editor-fold desc="/start">
bot.on('/start', function (msg) {
    /** @namespace msg.from.first_name */
    bot.sendMessage(msg.from.id, String.format("Hello {0}, please choose language:", msg.from.first_name), LANGUAGE_KEYBOARD);
});
//</editor-fold>
//<editor-fold desc="/ru">
bot.on('/ru', function (msg) {
    LOCALIZATION.messages.ru_RU = locales.ru_RU;
    USER_LANG = 'ru_RU';
    bot.sendMessage(msg.from.id, LOCALIZATION.tr('change_lang', USER_LANG), MAIN_KEYBOARD);
});
//</editor-fold>
//<editor-fold desc="/en">
bot.on('/en', function (msg) {
    USER_LANG = 'en_US';
    bot.sendMessage(msg.from.id, LOCALIZATION.tr('change_lang', USER_LANG), MAIN_KEYBOARD);
});
//</editor-fold>
//<editor-fold desc="/language">
bot.on('/language', function (msg) {
    bot.sendMessage(msg.from.id, LOCALIZATION.tr('choose_lang', USER_LANG), LANGUAGE_KEYBOARD);
});
//</editor-fold>
//<editor-fold desc="/help">
bot.on('/help', function (msg) {
    var text = LOCALIZATION.tr('help', USER_LANG);
    bot.sendMessage(msg.from.id, text, MAIN_KEYBOARD);
});
//</editor-fold>
//<editor-fold desc="/list">
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
//</editor-fold>
//<editor-fold desc="/add">
bot.on('/add', function (msg) {
    var chatId = msg.from.id;
    var text = LOCALIZATION.tr('add:task_text', USER_LANG);
    var msg_opts = CANCEL_KEYBOARD;
    msg_opts['ask'] = 'task_text';
    msg_opts['parse_mode'] = "markdown";
    bot.sendMessage(chatId, text, msg_opts);
});
//</editor-fold>
//<editor-fold desc="/add->task_text">
bot.on('ask.task_text', function (msg) {
    var cancel = msg.text.indexOf('/cancel') > -1;
    var msg_opt = CANCEL_KEYBOARD;
    msg_opt['parse_mode'] = 'markdown';
    var text;
    if (!cancel) {
        var valid = validateText(msg.text);
        if (valid.length == 0) {
            USER_ADD_TASK_ARRAY['task_text'] = msg.text;
            text = LOCALIZATION.tr('add:task_date', USER_LANG);
            msg_opt['ask'] = 'task_do_date';
        }
        else {
            msg_opt['ask'] = 'task_text';
            text = valid;
        }
        bot.sendMessage(msg.from.id, text, msg_opt);
    }
});
//</editor-fold>
//<editor-fold desc="/add->task_do_date">
bot.on('ask.task_do_date', function (msg) {
    var cancel = msg.text.indexOf('/cancel') > -1;
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
                bot.sendMessage(msg.from.id, text, MAIN_KEYBOARD);
            });
        });
    }
});
//</editor-fold>
//<editor-fold desc="/cancel">
bot.on('/cancel', function (msg) {
    USER_ADD_TASK_ARRAY = {};
    var text = LOCALIZATION.tr('cancel', USER_LANG);
    bot.sendMessage(msg.from.id, text, MAIN_KEYBOARD);
});
//</editor-fold>
//<editor-fold desc="/doit">
bot.on('/doit', function (msg) {
    var chatId = msg.from.id;
    var text = LOCALIZATION.tr('doit:id_text', USER_LANG);
    var opts = CANCEL_KEYBOARD;
    opts['ask'] = 'task_number';
    opts['parse_mode'] = 'markdown';
    bot.sendMessage(chatId, text, opts);
});
//</editor-fold>
//<editor-fold desc="/doit->task_number">
bot.on('ask.task_number', function (msg) {
    var cancel = msg.text.indexOf('/cancel') > -1;
    var opts = CANCEL_KEYBOARD;
    var userId = msg.from.id;

    if (!cancel) {
        var valid = validateText(msg.text);
        if (valid.length == 0) {
            var number = Number(msg.text);
            if (!number) {
                var text = LOCALIZATION.tr('doit:incorrect_num', USER_LANG);
                opts['ask'] = 'task_number';
                return bot.sendMessage(userId, text, opts);
            }
            else {
                MongoClient.connect(URL, function (err, db) {
                    opts = {owner_id: userId, task_number: number};
                    MongoOp.updateDocument(db, opts, function (data) {
                        var text = '';
                        if (data.result.nModified == 1)
                            text = String.format(LOCALIZATION.tr('doit:complete', USER_LANG), number);
                        else
                            text = String.format(LOCALIZATION.tr('doit:upd_err', USER_LANG), number);
                        opts = MAIN_KEYBOARD;
                        opts['parse_mode'] = 'markdown';
                        return bot.sendMessage(userId, text, opts);
                    });
                });
            }
        }
        else {
            text = valid;
            opts['ask'] = 'task_number';
            return bot.sendMessage(userId, text, opts);
        }
    }
});
//</editor-fold>
//<editor-fold desc="/search">
bot.on('/search', function (msg) {
    var text = LOCALIZATION.tr('search:task_text', USER_LANG);
    var opts = SECOND_KEYBOARD;
    opts['ask'] = 'search_type';
    opts['parse_mode'] = 'markdown';
    bot.sendMessage(msg.chat.id, text, opts);
});
//</editor-fold>
//<editor-fold desc="/search->search_type">
bot.on('ask.search_type', function (msg) {
    var text = '', opts;
    var cancel = msg.text.indexOf('/cancel') > -1;
    opts = CANCEL_KEYBOARD;
    if (!cancel) {
        var currCommand = msg.text.split(' ')[0];
        switch (currCommand) {
            case '/id':
                text = LOCALIZATION.tr('search:search_type:id', USER_LANG);
                opts['ask'] = "task_param_id";
                opts['parse_mode'] = "markdown";
                break;
            case '/date':
                text = LOCALIZATION.tr('search:search_type:date', USER_LANG);
                opts['ask'] = "task_param_date";
                opts['parse_mode'] = "markdown";
                break;
            default :
                text = LOCALIZATION.tr('search:search_type:invalid', USER_LANG);
                opts = SECOND_KEYBOARD;
                opts['ask'] = "search_type";
                break;
        }
        bot.sendMessage(msg.from.id, text, opts);
    }
});
//</editor-fold>
//<editor-fold desc="/search->task_param_id">
bot.on('ask.task_param_id', function (msg) {
    var cancel = msg.text.indexOf('/cancel') > -1;
    var opts;
    var text = '';
    if (!cancel) {
        var idsArr;
        var startId, endId;
        /************Check seq*********/
        if (msg.text.indexOf(',') > -1)
            idsArr = msg.text.split(',');
        else {
            if (msg.text.indexOf('..') > -1) {
                idsArr = msg.text.split('..');
                startId = idsArr[0].replace('.', '');
                endId = idsArr[1].replace('.', '');
            }
            else
                idsArr = [msg.text];
        }
        /*****************************/
        if (validationIDs(idsArr)) {
            idsArr = stingArrayToNumber(idsArr);
            if (typeof startId !== 'undefined' && typeof endId !== 'undefined')
                opts = {owner_id: msg.from.id, task_number: {$gte: parseInt(startId), $lte: parseInt(endId)}};
            else
                opts = {owner_id: msg.from.id, task_number: {$in: idsArr}};
            MongoClient.connect(URL, function (err, db) {
                MongoOp.findDocuments(db, opts, function (data) {
                    if (data.length > 0)
                        for (var i = 0; i < data.length; i++)
                            text += printTaskText(data[i], USER_LANG);
                    else
                        text = LOCALIZATION.tr('search:task_param:not_found', USER_LANG);
                    db.close();
                    opts = MAIN_KEYBOARD;
                    opts["parse_mode"] = "markdown";
                    bot.sendMessage(msg.from.id, text, opts);
                });
            });
        }
        else {
            text = LOCALIZATION.tr('search:invalid_id', USER_LANG);
            opts = SECOND_KEYBOARD;
            opts['ask'] = 'task_param_id';
            bot.sendMessage(msg.from.id, text, SECOND_KEYBOARD);
        }

    }
});
//</editor-fold>
//<editor-fold desc="/search->task_param_date">
bot.on('ask.task_param_date', function (msg) {
    var cancel = msg.text.indexOf('/cancel') > -1;
    var opts;
    if (!cancel) {
        opts = {owner_id: msg.from.id, do_date: new RegExp(msg.text)};

        MongoClient.connect(URL, function (err, db) {
            MongoOp.findDocuments(db, opts, function (data) {
                var text = '';
                if (data.length > 0)
                    for (var i = 0; i < data.length; i++)
                        text += printTaskText(data[i], USER_LANG);
                else
                    text = LOCALIZATION.tr('search:task_param:not_found', USER_LANG);
                db.close();
                var op = MAIN_KEYBOARD;
                op["parse_mode"] = "markdown";
                bot.sendMessage(msg.from.id, text, op);
            });
        });

    }
});
//</editor-fold>
//<editor-fold desc="/delete">
bot.on('/delete', function (msg) {
    var text = LOCALIZATION.tr('del:id_text', USER_LANG);
    var opts = CANCEL_KEYBOARD;
    opts["ask"] = "task_delete";
    opts["parse_mode"] = "markdown";
    bot.sendMessage(msg.from.id, text, opts);
});
//</editor-fold>
//<editor-fold desc="/delete->task_delete">
bot.on('ask.task_delete', function (msg) {
    var cancel = msg.text.indexOf('/cancel') > -1;
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
//</editor-fold>
//<editor-fold desc="/expired">
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
//</editor-fold>

var printTaskText = function (data, lang) {
    /** @namespace data.task_text */
    /** @namespace data.do_date */
    /** @namespace data.is_done */
    /** @namespace data.done_date */
    /** @namespace data.created_date */
    return String.format(LOCALIZATION.tr('print_task_text', lang), data.task_number, data.task_text, data.do_date,
        ( (data.is_done == true) ? "\u2705" : "\u274c"), data.done_date, data.created_date);
};
var getSysdate = function () {
    var today = new Date();
    return today.format(DATE_FORMAT);
};
var validateText = function (text) {
    if (text.startsWith('/')) {
        return LOCALIZATION.tr('text_invalid', USER_LANG);
    }
    return "";
};
var validationIDs = function (ids) {
    var tmp = true;
    if (Array.isArray(ids)) {
        ids.forEach(function (id) {
            if (isNaN(id))
                tmp = false;
        });
    }
    else
        tmp = !isNaN(ids);
    return tmp;
};
var stingArrayToNumber = function (arr) {
    return arr.map(function (a) {
        return parseInt(a);
    });
};
module.exports.getSysdate = getSysdate;
bot.connect();