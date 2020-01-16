interface initRequest {
    'name': string,
    'event': 'clientInit'
};

interface refreshConnectionsRequest {
    'event': 'refreshConnections'
};

interface requestGameRequestFromClient {
    'event': 'requestGame',
    'requestOpponent': {
        'name': string,
        'id': string
    }
};

interface requestGameRequestFromServer {
    'event': 'requestGame',
    'requestOpponent': {
        'name': string,
        'id': string
    }
};

interface acceptGameRequestToServer {
    'event': 'requestGame',
    'requestOpponent': {
        'name': string,
        'id': string
    }
};

interface gameInit {
    'event': 'gameInit',
    'gameDetails': {
        'player1id': {
            'name': string,
            'symbol': string
        },
        'player2id': {
            'name': string,
            'id': string
        },
        'data': [[null, null, null],[null, null, null],[null, null, null]]
    }
};

interface gameEventToServer {
    'event': 'gameEvent',
    'playerdata': {
        'gameid': string,
        'cellData': {
            'row': number,
            'column': number,
            'symbol': string
        }
    }
};

interface gameEventToClient {
    'event': 'gameEvent',
    'data': [[null, null, null],[null, null, null],[null, null, null]]
};

interface gameOverFromServer {
    'event': 'gameOver',
    'winner': {
        'id': string,
        'name': string
    }
};