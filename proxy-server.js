var express = require('express')
var app = express()
var http = require('http')
var httpProxy = require('http-proxy')
var sioc = require('socket.io-client');
var indicator = false;

var proxy = httpProxy.createProxyServer({});
var count = 1;

var prod = process.argv[2];
var canary = process.argv[3];

var socket = sioc('http://'+canary+':3003');

socket.on("heartbeat", function(client) {
    indicator = client.status;
    console.log("Status is "+indicator);
    if(indicator==true) {
       console.log("Canary Server Failed.");
    }
});
  
//PROXY SERVER
var server = http.createServer(function(req, res) {
   
        if((count % 4 == 0) && (!indicator)) { 
          var target = "http://" + canary + ":3002";   
          proxy.web(req, res, {target: target});
          console.log("Request forwarded to  server: http://" + canary + ":3002");
          count = 1; 
		}
		else {
            target = "http://" + prod + ":3000"; 
		    proxy.web(req, res, {target: target});
            console.log("Request forwarded to prod server: http://" + prod + ":3000");
            count ++; 
		}
});
console.log("Proxy server listening on port 4000");
server.listen(4000);