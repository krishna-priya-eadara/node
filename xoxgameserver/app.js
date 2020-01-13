"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./bin/server");
var config = require('./Config.json');
var server = new server_1.Server(config.portNumber);
server.on();
//# sourceMappingURL=app.js.map