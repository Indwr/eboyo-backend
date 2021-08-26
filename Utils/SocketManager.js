'use strict';
/**
 * Created by Anurag on 31/12/2020.
 */
var Config = require('../Config');
//var TokenManager = require('./TokenManager');


exports.connectSocket = function (server) {
    const io = require('socket.io')();
    io.on('connection', client => {   
        console.log("*********************socket connected*********************");
    });
    io.listen(3003);

    io.on('disconnect', function(){
        console.log('socket disconnected')
    });
};
