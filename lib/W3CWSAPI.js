var log = console.log.bind(console);
var u = require('./utils')
  , extend = u.extend
  , nop = u.nop;
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
    log("makeClient");
    function W3CClient (url,protocols) {
        log("constructor");
        var WSClient = new WebSocketClient(config);    
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
                (self.onmessage || nop)(msg);
            })
            conn.on('close', function(closeEvt) {
                (self.onclose || nop)(closeEvt);
            })
            conn.on('error', function(err) {
                (self.onerror || nop)(err);
            })
        });

        WSClient.on('connectFailed', function(err){
                (self.onerror || nop)(err);
        })
        process.nextTick(function(){WSClient.connect(url,protocols);});
    };
    extend(W3CClient.prototype, SoClProto);
    util.inherits(W3CClient, EventEmitter);
    return W3CClient;
};

W3CJSAPI = module.exports = function (config) {
    config = config || {};
    return {client: makeClient(config.client)}
}

W3CJSAPI.client = makeClient();;

