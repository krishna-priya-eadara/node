import { LOG_TYPES, LOG_PREFIX, COLOR_REFERENCE } from "./constants";
const config = require('../Config.json');

export module Logger {
    export function Log(message, type): void {
        MessengerFactory.writeConsoleMessage(message, type)
    }
}

module MessengerFactory {
    export function writeConsoleMessage(message, type): void {
        switch(type) {
            case LOG_TYPES.DEBUG:
                if(config.logLevel === LOG_TYPES.DEBUG) {
                    console.log( COLOR_REFERENCE.fg.Crimson + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                }
                break;
            case LOG_TYPES.ERROR:
                console.log( COLOR_REFERENCE.fg.Red + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
            case LOG_TYPES.WARN:
                console.log( COLOR_REFERENCE.fg.Yellow + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
            case LOG_TYPES.LOG:
                console.log( COLOR_REFERENCE.fg.Blue + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
        }
    }
}