const WebSocketServer = require('ws').Server;
const config = require('../Config.json');

const CONSTANTS = {
    DEBUG: 'debug',
    WARN: 'warn',
    ERROR: 'error',
    LOG: 'log'
};
const COLOR_REFERENCE = {
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
const SOCKET_EVENTS = [
    'message',
    'error',
    'close'
];

const LOG_PREFIX = '[SOCKET SERVER]:: ';

const getUniqueID = function () {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);

        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
};

class ServerUtilities {
    static clients: Array<any> = [];
    static games: object;

    static message(message) {
        socketMessageFactory.processClientRequest(this, message);
    }
    static error(error) {
        Logger.Log('Client connection error ' + this["id"] + '!!' + '\nError message: ' + error, CONSTANTS.LOG);
    }
    static close() {
        delete ServerUtilities.clients[this["id"]];
        Logger.Log('Client terminated ' + this["id"] + ' port!!', CONSTANTS.LOG);
    }

    static subscribe(context, eventName) {

    }
    static socketMessageListenerInit(socket) {
        socket.on('connection', function(clientSocket) {
            clientSocket["id"] = getUniqueID();
            ServerUtilities.clients[clientSocket["id"]] = clientSocket;
            SOCKET_EVENTS.forEach((event) => {
                clientSocket.on(event, ServerUtilities[event].bind(clientSocket));
            });
        });
    }
}

class socketMessageFactory {
    static processClientRequest(socketConnection, data) {
        data = JSON.parse(data);
        switch(data.event) {
            case 'clientInit' :
                Logger.Log('Client connected ' + data.name + ' !!', CONSTANTS.LOG);
                ServerUtilities.clients[socketConnection["id"]].name = data.name;
                break;
            case 'refreshConnections':
                let availableConnections = [];
                ServerUtilities.clients.forEach((item) => {
                    if(item.id !== socketConnection.id) {
                        availableConnections.push({
                            name: item.name,
                            id: item.id
                        });
                    }
                });
                socketConnection.send(JSON.stringify(availableConnections))
                break;
            case 'requestGame':
                let opponent = ServerUtilities.clients[data.requestOpponent.id];
                opponent.send(JSON.stringify({
                    'event': 'requestGame',
                    'requestOpponent': {
                        'name': socketConnection.name,
                        'id': socketConnection.id
                    }
                }));
                break;
            case 'acceptGame':
                let requestedOpponent = ServerUtilities.clients[data.requestOpponent.id];
                let gameDetails = {
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
                    'data': [[null, null, null],[null, null, null],[null, null, null]]
                };
                ServerUtilities.games[getUniqueID()] = gameDetails;
                socketConnection.send(JSON.stringify({
                    'event': 'gameInit',
                    ...gameDetails
                }));
                requestedOpponent.send(JSON.stringify({
                    'event': 'gameInit',
                    ...gameDetails
                }));

                break;
            case 'gameEvent':
                let cellData = data.playerdata.cellData;
                let game = ServerUtilities.games[data.playerdata.gameid];
                game.data[cellData.row][cellData.column] = cellData.symbol;
                let enabledClient = game.players.player1.id;
                if(game.players.player1.id === socketConnection.id) {
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
}

class Logger {
    static Log(message, type) {
        MessengerFactory.writeConsoleMessage(message, type)
    }
}

class MessengerFactory {
    static writeConsoleMessage(message, type) {
        switch(type) {
            case CONSTANTS.DEBUG:
                if(config.logLevel === CONSTANTS.DEBUG) {
                    console.log( COLOR_REFERENCE.fg.Crimson + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                }
                break;
            case CONSTANTS.ERROR:
                console.log( COLOR_REFERENCE.fg.Red + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
            case CONSTANTS.WARN:
                console.log( COLOR_REFERENCE.fg.Yellow + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
            case CONSTANTS.LOG:
                console.log( COLOR_REFERENCE.fg.Blue + LOG_PREFIX + message + COLOR_REFERENCE.Reset);
                break;
        }
    }
}

export class Server {
    portNumber: number;
    private _connection: any;
    private _listenTo: any;

    constructor(port) {
        this.portNumber = port;
    }
    on() {
        this._connection = new WebSocketServer({port: this.portNumber});
        ServerUtilities.socketMessageListenerInit(this._connection);
        Logger.Log('Socket started at ' + this.portNumber + ' port!!', CONSTANTS.LOG);
    }
    off() {
        this._connection.close();
    }
    listenTo(eventName) {
        ServerUtilities.subscribe(this, eventName);
    }
}

