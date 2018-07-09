var http = require("http");
var fs = require("fs");
var os = require('os');
var md5 = require("./code").hex_md5;
var express = require("express");

function getIP(){
    var interfaces = os.networkInterfaces();
    for(var i in interfaces){
        var iface = interfaces[i];
        for(var j=0;j<iface.length;j++){
            var alias = iface[j];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                return alias.address;
            }
        }
    }
}

function create(db,port) {
    if (!fs.existsSync(db + "/password.pw")){
        console.error("This db don't have password!");
        fs.writFileSync(db + "/password.pw",md5("123456"));
        console.error("We set the password of this db is `123456`");
        console.error("If you want change the password,please use command `$:berry -p xxxx -b xxxx`");
    }
    var password = fs.readFileSync(db + "/password.pw");
    var app = express();
    var bases = "[";
    fs.readdir(db,function (err,files) {
        if (err) throw err;
        for (var i in files){
            bases += files[i] + ",";
            app.get("/",function (req,res) {
                if (req.query.pw == password){
                    res.end(fs.readFileSync(files[i]).toString());
                } else {
                    res.end("You can't login.");
                }
            });
        }
        bases += "]";
    });
    app.get("/",function (req,res) {
        if (req.query.pw == password)
            res.end("{\"name\":" + db + ",\"host\":" + getIP() + ",\"port\":" + port + ",\"bases\":" + bases + "}");
        else
            res.end("You can't login.");
    });
    app.listen(port);
}
function connectDB(info,callback) {
    var host = info.host,port = info.port,pw = info.pw;
    if (port === undefined || host === undefined){
        var err = new Error("The host or port of db is undefined.");
        throw err;
    }
    var url = "http://" + host + ":" + port;
    var html = "";
    http.get(url, function (res) {
        res.on('data', function (data) {
            html += data;
        });
        res.on('end', function () {
            if (html == "You can't login"){
                callback({state: false});
            } else {
                var dbInfo = JSON.parse(html);
                callback({
                    state: true,
                    db: dbInfo.name,
                    host: dbInfo.host,
                    port: dbInfo.port,
                    bases: dbInfo.bases,
                });
            }
        });
    }).on('error', function (err) {
        throw err;
    });
}
function connect(info,callbase) {
    var host = info.host,port = info.port,pw = info.pw,base = info.base;
    if (port === undefined || host === undefined || base === undefined){
        var err = new Error("The host,port or pw of db is undefined.");
        throw err;
    }
    var url = "http://" + host + ":" + port;
    var html = "";
    http.get(url, function (res) {
        res.on('data', function (data) {
            html += data;
        });
        res.on('end', function () {
            if (html == "You can't login"){
                callback({state: false});
            } else {
                var dbInfo = JSON.parse(html);
                callback({
                    state: true,
                    host: host,
                    port: port,
                    value: html
                });
            }
        });
    }).on('error', function (err) {
        throw err;
    });
}
module.exports.create = create;
module.exports.connectDB = connectDB;
module.exports.connect = connect;