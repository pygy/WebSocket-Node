var extend = require('./utils').extend;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var WebSocketClient = require('./WebSocketClient');


var SoClProto = {
    close: function(closeEvt){
        this.conn.close(closeEvt);
        // this.readyState = 2
    },
     send: function(msg){
        if (1 !== this.readyState) return false;
        this.conn.send(msg);
        return true
    }
}

function makeClient (config) {
    function W3CClient (url,protocols) {
        var WSClient = new WebSocket(config);    
        var self = this;

        if (typeof protocols === 'string' &&
            protocols.length > 0) {
            protocols = [protocols];
        } else if (!util.isArray(protocols)) {
            protocols = null;
        }

        WSClient.on('connect',function(conn){
            self.conn = conn;
            (self.onconnect || utils.nop)()
            conn.on('message', function(msg) {
                (self.onmessage || util.nop)(msg);
            })
            conn.on('close', function(closeEvt) {
                (self.onclose || util.nop)(closeEvt);
            })
            conn.on('error', function(err) {
                (self.onerror || util.nop)(err);
            })
        });

        WSClient.on('connectFailed', function(err){
                (self.onerror || util.nop)(err);
        })
        process.nextTick(function(){WSClient.connect(url,protocols);});
    };
    extend(W3CClient.prototype, SoClProto);
    util.inherit(W3CClient, EventEmitter);
    return W3CClient;
};

W3CJSAPI = module.exports = function (config) {
    config = config || {};
    return {client: makeClient(config.client)}
}

W3CJSAPI.client = makeClient();

