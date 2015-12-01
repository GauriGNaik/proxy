var express = require('express')
var app = express()
var http = require('http')
var httpProxy = require('http-proxy')
var sioc = require('socket.io-client');
var status = 'false';

var proxy = httpProxy.createProxyServer({});
var count = 1;

var prod = process.argv[2];
var canary = process.argv[3];

var socket = sioc('http://'+canary+':3001');

socket.on("heartbeat", function(client) {
    status = client.status;
    console.log("Status is "+status);
    if(status==='true') {
       console.log("Canary Server Failed.");
    }
});
  
//PROXY SERVER
var server = http.createServer(function(req, res) {
   
        if((count % 4 == 0) && (status == 'false')) { 
          var target = "http://" + canary + ":3000";   
          proxy.web(req, res, {target: target});
          console.log("Request forwarded to  server: http://" + canary + ":3000");
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