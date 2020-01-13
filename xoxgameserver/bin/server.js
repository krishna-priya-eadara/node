"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocketServer = require('ws').Server;
var config = require('../Config.json');
var CONSTANTS = {
    DEBUG: 'debug',
    WARN: 'warn',
    ERROR: 'error',
    LOG: 'log'
};
var COLOR_REFERENCE = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    fg: {
        Black: "\x1b[30m",
        Red: "\x1b[31m",
        Green: "\x1b[32m",
        Yellow: "\x1b[33m",
        Blue: "\x1b[34m",
        Magenta: "\x1b[35m",
        Cyan: "\x1b[36m",
        White: "\x1b[37m",
        Crimson: "\x1b[38m"
    },
    bg: {
        Black: "\x1b[40m",
        Red: "\x1b[41m",
        Green: "\x1b[42m",
        Yellow: "\x1b[43m",
        Blue: "\x1b[44m",
        Magenta: "\x1b[45m",
        Cyan: "\x1b[46m",
        White: "\x1b[47m",
        Crimson: "\x1b[48m"
    }
};
var SOCKET_EVENTS = [
    'message',
    'error',
    'close'
];
var LOG_PREFIX = '[SOCKET SERVER]:: ';
var getUniqueID = function () {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};
var ServerUtilities = /** @class */ (function () {
    function ServerUtilities() {
    }
    ServerUtilities.message = function (message) {
        socketMessageFactory.processClientRequest(this, message);
    };
    ServerUtilities.error = function (error) {
        Logger.Log('Client connection error ' + this["id"] + '!!' + '\nError message: ' + error, CONSTANTS.LOG);
    };
    ServerUtilities.close = function () {
        delete ServerUtilities.clients[this["id"]];
        Logger.Log('Client terminated ' + this["id"] + ' port!!', CONSTANTS.LOG);
    };
    ServerUtilities.subscribe = function (context, eventName) {
    };
    ServerUtilities.socketMessageListenerInit = function (socket) {
        socket.on('connection', function (clientSocket) {
            clientSocket["id"] = getUniqueID();
            ServerUtilities.clients[clientSocket["id"]] = clientSocket;
            SOCKET_EVENTS.forEach(function (event) {
                clientSocket.on(event, ServerUtilities[event].bind(clientSocket));
            });
        });
    };
    ServerUtilities.clients = [];
    return ServerUtilities;
}());
var socketMessageFactory = /** @class */ (function () {
    function socketMessageFactory() {
    }
    socketMessageFactory.processClientRequest = function (socketConnection, data) {
        data = JSON.parse(data);
        switch (data.event) {
            case 'clientInit':
                Logger.Log('Client connected ' + data.name + ' !!', CONSTANTS.LOG);
                ServerUtilities.clients[socketConnection["id"]].name = data.name;
                break;
            case 'refreshConnections':
                var availableConnections_1 = [];
                ServerUtilities.clients.forEach(function (item) {
                    if (item.id !== socketConnection.id) {
                        availableConnections_1.push({
                            name: item.name,
                            id: item.id
                        });
                    }
                });
                socketConnection.send(JSON.stringify(availableConnections_1));
                break;
            case 'requestGame':
                var opponent = ServerUtilities.clients[data.requestOpponent.id];
                opponent.send(JSON.stringify({
                    'event': 'requestGame',
                    'requestOpponent': {
                        'name': socketConnection.name,
                        'id': socketConnection.id
                    }
                }));
                break;
            case 'acceptGame':
                var requestedOpponent = ServerUtilities.clients[data.requestOpponent.id];
                var gameDetails = {
                    'player1': {
                        'name': socketConnection.name,
                        'id': socketConnection.id,
                        'symbol': 'X',
                        'shallStart': true
                    },
                    'player2': {
                        'name': requestedOpponent.name,
                        'id': requestedOpponent.id,
                        'symbol': 'O',
                        'shallStart': false
                    },
                    'data': [[null, null, null], [null, null, null], [null, null, null]]
                };
                ServerUtilities.games[getUniqueID()] = gameDetails;
                socketConnection.send(JSON.stringify(__assign({ 'event': 'gameInit' }, gameDetails)));
                requestedOpponent.send(JSON.stringify(__assign({ 'event': 'gameInit' }, gameDetails)));
                break;
            case 'gameEvent':
                var cellData = data.playerdata.cellData;
                var game = ServerUtilities.games[data.playerdata.gameid];
                game.data[cellData.row][cellData.column] = cellData.symbol;
                var enabledClient = game.players.player1.id;
                if (game.players.player1.id === socketConnection.id) {
                    enabledClient = game.players.player2.id;
                }
                ServerUtilities.clients[game.players.player1].send(JSON.stringify({
                    'event': 'gameInit',
                    'data': game.data,
                    'enabledClientId': enabledClient
                }));
                ServerUtilities.clients[game.players.player2].send(JSON.stringify({
                    'event': 'gameInit',
                    'data': game.data,
                    'enabledClientId': enabledClient
                }));
                break;
        }
    };
    return socketMessageFactory;
}());
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.Log = function (message, type) {
        MessengerFactory.writeConsoleMessage(message, type);
    };
    return Logger;
}());
var MessengerFactory = /** @class */ (function () {
    function MessengerFactory() {
    }
    MessengerFactory.writeConsoleMessage = function (message, type) {
        switch (type) {
            case CONSTANTS.DEBUG:
                if (config.logLevel === CONSTANTS.DEBUG) {
                    console.log(COLOR_REFERENCE.fg.Crimson + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                }
                break;
            case CONSTANTS.ERROR:
                console.log(COLOR_REFERENCE.fg.Red + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
            case CONSTANTS.WARN:
                console.log(COLOR_REFERENCE.fg.Yellow + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
            case CONSTANTS.LOG:
                console.log(COLOR_REFERENCE.fg.Blue + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
        }
    };
    return MessengerFactory;
}());
var Server = /** @class */ (function () {
    function Server(port) {
        this.portNumber = port;
    }
    Server.prototype.on = function () {
        this._connection = new WebSocketServer({ port: this.portNumber });
        ServerUtilities.socketMessageListenerInit(this._connection);
        Logger.Log('Socket started at ' + this.portNumber + ' port!!', CONSTANTS.LOG);
    };
    Server.prototype.off = function () {
        this._connection.close();
    };
    Server.prototype.listenTo = function (eventName) {
        ServerUtilities.subscribe(this, eventName);
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map