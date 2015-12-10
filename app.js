/**
 * Created by Span on 10.12.2015.
 */
var TelegramBot = require('node-telegram-bot-api');
var token = '157812184:AAHFgYms2o5NWp-Z-Vgfyt_dQvOR8pFh3Dw';
var bot = new TelegramBot(token, {polling: true});

/*bot.on('message', function (msg) {
 var chatId = msg.chat.id;
 console.log(msg);
 bot.sendMessage(chatId, "Hello!", {caption: "I'm a bot!"});
 });*/
bot.onText(/\/hello/, function (msg) {
    var chatId = msg.chat.id;
    var opts = {
       // reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            keyboard: [
                ['/hello'],
                ['/time', '/date'],
                ['/getPhoto', '/getAudio', '/getSmth'],
                ['/help']]
        })
    };
    bot.sendMessage(chatId, "Hi " + msg.from.first_name, opts);

});

bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;
    var text ='Use command:\n'+
            '/hello /time /date /getPhoto /getAudio /getSmth /help';
    bot.sendMessage(chatId, text);
});

/*bot.getMe().then(function (me) {
 console.log('Hi my name is %s!', me.username);
 });*/