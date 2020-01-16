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
var Logger_1 = require("./Logger");
var Constants_1 = require("./Constants");
var getUniqueID = function () {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};
var ServerUtilities;
(function (ServerUtilities) {
    ServerUtilities.clients = {};
    ServerUtilities.games = {};
    var events = {
        message: function (message) {
            SocketMessageFactory.processClientRequest(this, message);
        },
        error: function (error) {
            Logger_1.Logger.Log('Client connection error ' + this["id"] + '!!' + '\nError message: ' + error, Constants_1.LOG_TYPES.LOG);
        },
        close: function () {
            delete ServerUtilities.clients[this["id"]];
            Logger_1.Logger.Log('Client terminated ' + this["id"] + ' port!!', Constants_1.LOG_TYPES.LOG);
        },
        connection: function (clientSocket) {
            clientSocket["id"] = getUniqueID();
            ServerUtilities.clients[clientSocket["id"]] = clientSocket;
            Constants_1.SOCKET_EVENTS.forEach(function (event) {
                clientSocket.on(event, events[event].bind(clientSocket));
            });
        }
    };
    function subscribe(context, eventName) {
    }
    ServerUtilities.subscribe = subscribe;
    function socketMessageListenerInit(socket) {
        socket.on('connection', events.connection.bind(this));
    }
    ServerUtilities.socketMessageListenerInit = socketMessageListenerInit;
})(ServerUtilities || (ServerUtilities = {}));
var SocketMessageFactory;
(function (SocketMessageFactory) {
    function processClientRequest(socketConnection, data) {
        data = JSON.parse(data);
        switch (data.event) {
            case 'clientInit':
                Logger_1.Logger.Log('Client connected ' + data.name + ' !!', Constants_1.LOG_TYPES.LOG);
                ServerUtilities.clients[socketConnection["id"]].name = data.name;
                break;
            case 'refreshConnections':
                var availableConnections_1 = [];
                Object.values(ServerUtilities.clients).forEach(function (item) {
                    if (item["id"] !== socketConnection.id) {
                        availableConnections_1.push({
                            name: item["name"],
                            id: item["id"]
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
    }
    SocketMessageFactory.processClientRequest = processClientRequest;
})(SocketMessageFactory || (SocketMessageFactory = {}));
var Server = /** @class */ (function () {
    function Server(port) {
        this.portNumber = port;
    }
    Server.prototype.on = function () {
        this._connection = new WebSocketServer({ port: this.portNumber });
        ServerUtilities.socketMessageListenerInit(this._connection);
        Logger_1.Logger.Log('Socket started at ' + this.portNumber + ' port!!', Constants_1.LOG_TYPES.LOG);
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