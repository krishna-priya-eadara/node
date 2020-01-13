var initRequest = {
    'name': '<string>',
    'event': 'clientInit'
};

var refreshConnectionsRequest = {
    'event': 'refreshConnections'
};

var requestGameRequestFromClient = {
    'event': 'requestGame',
    'requestOpponent': {
        'name': '<string>',
        'id': '<id>'
    }
};

var requestGameRequestFromServer = {
    'event': 'requestGame',
    'requestOpponent': {
        'name': '<string>',
        'id': '<id>'
    }
};

var acceptGameRequestToServer = {
    'event': 'requestGame',
    'requestOpponent': {
        'name': '<string>',
        'id': '<id>'
    }
};

var gameInit = {
    'event': 'gameInit',
    'gameDetails': {
        'player1id': {
            'name': '<string>',
            'symbol': '<string>'
        },
        'player2id': {
            'name': '<string>',
            'id': '<string>'
        },
        'data': [[null, null, null],[null, null, null],[null, null, null]]
    }
};

var gameEventToServer = {
    'event': 'gameEvent',
    'playerdata': {
        'gameid': '<id>',
        'cellData': {
            'row': '<number>',
            'column': '<number>',
            'symbol': '<string>'
        }
    }
};

var gameEventToClient = {
    'event': 'gameEvent',
    'data': [[null, null, null],[null, null, null],[null, null, null]]
};

var gameOverFromServer = {
    'event': 'gameOver',
    'winner': {
        'id': '<id>',
        'name': '<string>'
    }
};