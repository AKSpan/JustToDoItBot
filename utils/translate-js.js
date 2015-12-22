/**
 * Created by Span on 21.12.2015.
 */
var Localizer = function (alang) {
    this.settings = {lang: alang || 'en_US'};
    this.messages = {};
    this.tr = function (param, lang) {
        lang = lang || this.settings.lang;
        var translated = '', code;
        var params = param.toLowerCase().split(':');
        if (this.messages[lang] !== undefined && params.length) {
            for (var i = 0, msgcat = this.messages[lang]; i < params.length; i++) {
                code = params[i];
                if (typeof msgcat[code] === 'object') {
                    msgcat = msgcat[code];
                }
                if (typeof msgcat[code] === 'string') {
                    translated = msgcat[code];
                    break;
                }
            }
        }
        return translated;
    };
};
module.exports.Localizer = Localizer;
