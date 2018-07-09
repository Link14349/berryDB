var fs = require("fs");
function find(info) {
    var db = info.db,base = info.base,type = info.type,rtnType = info.rtnType,indexs = [],reg = info.reg,err;
    if (db === undefined || base === undefined){
        err = new Error("db or base is undefined!");
        throw err;
    }
    if (type === undefined){
        type = "tab";
    }
    switch (type){
        case "tab":
            var fileValue = JSON.parse(fs.readFileSync(db + "/" + base + ".tab"));
            var have = true;
            /*
            * {
            *   "xx": xx,
            *   "xx": xx,
            *   "xx": xx,
            *   ......
            * }
            */
            for (var i in fileValue["datas"]){
                have = true;
                for (var j in reg){
                    if (fileValue["datas"][i][j].search(reg[j]) === -1)
                        have = false;
                }
                if (have)
                    indexs.push(i)
            }
            break;
        case "arr":
            var arr = fs.readFileSync(db + "/" + base + ".arr").split("\n");
            for (var i = 0 ; i < arr.length ; i++){
                if (arr[i].search(reg) !== -1){
                    indexs.push(i);
                }
            }
            break;
        case "nt":
            err = new Error("Can't use find in .nt file!");
            throw err;
            break;
        default:
            err = new Error("Not have this type!");
            throw err;
            break;
    }
    switch (rtnType){
        case "bool":
            return indexs.length > 0;
            break;
        case "value":
            var values = [];
            switch (type){
                case "tab":
                    var fileValue = JSON.parse(fs.readFileSync(db + "/" + base + ".tab"));
                    for (var i in indexs){
                        values.push(fileValue["datas"][indexs[i]]);
                    }
                    break;
                case "arr":
                    var arr = fs.readFileSync(db + "/" + base + ".arr").split("\n");
                    for (var i in indexs){
                        values.push(arr[indexs[i]]);
                    }
                    break;
            }
            return values;
            break;
        case "index":
            return indexs;
            break;
        default:
            err = new Error("Not have this type!");
            throw err;
            break;
    }
}
function help(info) {
    var db = info.db,base = info.base,err;
    if (db === undefined || base === undefined){
        err = new Error("db or base is undefined!");
        throw err;
    }
    return fs.readFileSync(db + "/" + base + ".nt");
}
function stringify(info) {
    var db = info.db,base = info.base,type = info.type,rtnType = info.rtnType,command = info.command,err;
    var rtnCommand = "";
    if (db === undefined || base === undefined || command === undefined){
        err = new Error("db or base or command is undefined!");
        throw err;
    }

    if (type === undefined){
        type = "tab";
    }
    rtnCommand += "USE-";
    rtnCommand += db + " ";
    rtnCommand += "AT-";
    rtnCommand += base + " ";
    rtnCommand += "TYPE-";
    rtnCommand += type + " ";
    rtnCommand += "RETURN-";
    rtnCommand += rtnType + " ";
    rtnCommand += "COMMANDS-";
    for (var i in command){
        rtnCommand += i + ":" + command[i] + ",";
    }
    return rtnCommand;
}
function parse(str) {
    var arr = str.split(" ");
    var reg = JSON.parse("{" + arr[4].split("-")[1] + "}");
    for (var i in reg){
        reg[i] = new RegExp(reg[i]);
    }
    return {
        db: arr[0].split("-")[1],
        base: arr[1].split("-")[1],
        type: arr[2].split("-")[1],
        rtnType: arr[3].split("-")[1],
        reg: reg,
    };
}
function check(info) {
    var security = true;
    switch (typeof info){
        case "string":
            if (info.search(/USE-/g) != -1){
                security = false;
            }
            break;
        case "object":
            for (var i in info){
                if (info[i].search(/USE-/g) != -1){
                    security = false;
                    break;
                }
            }
            break;
    }
    return security;
}
module.exports.find = find;
module.exports.help = help;
module.exports.stringify = stringify;
module.exports.parse = parse;
module.exports.check = check;