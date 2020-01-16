"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("./Constants");
var config = require('../Config.json');
var Logger;
(function (Logger) {
    function Log(message, type) {
        MessengerFactory.writeConsoleMessage(message, type);
    }
    Logger.Log = Log;
})(Logger = exports.Logger || (exports.Logger = {}));
var MessengerFactory;
(function (MessengerFactory) {
    function writeConsoleMessage(message, type) {
        switch (type) {
            case Constants_1.LOG_TYPES.DEBUG:
                if (config.logLevel === Constants_1.LOG_TYPES.DEBUG) {
                    console.log(Constants_1.COLOR_REFERENCE.fg.Crimson + Constants_1.LOG_PREFIX + message + Constants_1.COLOR_REFERENCE.Reset);
                }
                break;
            case Constants_1.LOG_TYPES.ERROR:
                console.log(Constants_1.COLOR_REFERENCE.fg.Red + Constants_1.LOG_PREFIX + message + Constants_1.COLOR_REFERENCE.Reset);
                break;
            case Constants_1.LOG_TYPES.WARN:
                console.log(Constants_1.COLOR_REFERENCE.fg.Yellow + Constants_1.LOG_PREFIX + message + Constants_1.COLOR_REFERENCE.Reset);
                break;
            case Constants_1.LOG_TYPES.LOG:
                console.log(Constants_1.COLOR_REFERENCE.fg.Blue + Constants_1.LOG_PREFIX + message + Constants_1.COLOR_REFERENCE.Reset);
                break;
        }
    }
    MessengerFactory.writeConsoleMessage = writeConsoleMessage;
})(MessengerFactory || (MessengerFactory = {}));
//# sourceMappingURL=Logger.js.map