const WebSocketServer = require('ws').Server;
import { Logger } from "./logger";
import { SOCKET_EVENTS, LOG_TYPES } from "./constants";


const getUniqueID = function () {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);

        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
};

module ServerUtilities {
    export let clients = {};
    export let games = {};

    let events = {
        message: function(message) {
            SocketMessageFactory.processClientRequest(this, message);
        },
        error: function(error) {
            Logger.Log('Client connection error ' + this["id"] + '!!' + '\nError message: ' + error, LOG_TYPES.LOG);
        },
        close: function() {
            delete ServerUtilities.clients[this["id"]];
            Logger.Log('Client terminated ' + this["id"] + ' port!!', LOG_TYPES.LOG);
        },
        connection: function(clientSocket) {
            clientSocket["id"] = getUniqueID();
            clients[clientSocket["id"]] = clientSocket;
            SOCKET_EVENTS.forEach((event) => {
                clientSocket.on(event, events[event].bind(clientSocket));
            });
        }
    }

    export function subscribe(context, eventName) {
    }

    export function socketMessageListenerInit(socket) {
        socket.on('connection', events.connection.bind(this));
    }
}

module SocketMessageFactory {
     export function processClientRequest(socketConnection, data) {
        data = JSON.parse(data);
        switch(data.event) {
            case 'clientInit' :
                Logger.Log('Client connected ' + data.name + ' !!', LOG_TYPES.LOG);
                ServerUtilities.clients[socketConnection["id"]].name = data.name;
                break;
            case 'refreshConnections':
                let availableConnections = [];
                Object.values(ServerUtilities.clients).forEach((item) => {
                    if(item["id"] !== socketConnection.id) {
                        availableConnections.push({
                            name: item["name"],
                            id: item["id"]
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
        Logger.Log('Socket started at ' + this.portNumber + ' port!!', LOG_TYPES.LOG);
    }
    off() {
        this._connection.close();
    }
    listenTo(eventName) {
        ServerUtilities.subscribe(this, eventName);
    }
}

