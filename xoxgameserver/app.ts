import {Server} from './bin/server';
const config = require('./Config.json');


let server = new Server(config.portNumber);
server.on();