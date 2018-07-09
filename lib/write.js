var fs = require("fs");
function add(info) {
  var db,base,type,value,err;
  db = info.db;
  base = info.base;
  type = info.type;
  value = info.value;
  if (db === undefined || base === undefined || value === undefined){
    err = new Error("db or base or value is undefined!");
    throw err;
  }
  if (type === undefined){
    type = "tab";
  }
  switch (type){
    case "tab":
      var fileValue = JSON.parse(fs.readFileSync(db + "/" + base + ".tab"));
      // save fun:
      /*
      * {
      *   "info": {
      *     "xx": null,
      *     "xx": null,
      *     "xx": null,
      *     "xx": null,
      *     "xx": null,
      *     ......
      *   }
      *   "datas": {
      *     "xx": {
      *       "xx": xx,
      *       "xx": xx,
      *       "xx": xx,
      *       "xx": xx,
      *       "xx": xx,
      *       ......
      *     }
      *   }
      * }
      */
      fileValue["datas"][value.key] = value.value;
      fileValue = JSON.stringify(fileValue);
      fs.writeFile(db + "/" + base + ".tab",fileValue,function (error){
        if (error)
          throw error;
      });
      break;
    case "arr":
      var fileValue = fs.readFileSync(db + "/" + base + ".arr");
      if (fileValue == "")
        fileValue = value;
      else
        fileValue += "\n" + value;
      fs.writeFile(db + "/" + base + ".arr",fileValue,function (error){
        if (error)
          throw error;
      });
      break;
    case "nt":
      fs.writeFile(db + "/" + base + "." + type,value,function (error){
        if (error)
          throw error;
      });
      break;
    default:
      err = new Error("Not have this type!");
      throw err;
      break;
  }
}
function del(info) {
  var db,base,type,kw,err;
  db = info.db;
  base = info.base;
  type = info.type;
  kw = info.kw;
  if (db === undefined || base === undefined || kw === undefined){
    err = new Error("db or base or kw is undefined!");
    throw err;
  }
  if (type === undefined){
    type = "tab";
  }
  switch (type){
      case "tab":
          var fileValue = JSON.parse(fs.readFileSync(db + "/" + base + ".tab"));
          delete fileValue["datas"][kw];
          fileValue = JSON.stringify(fileValue);
          fs.writeFile(db + "/" + base + ".tab",fileValue,function (error){
              if (error)
                  throw error;
          });
        break;
      case "arr":
        var fileValue = fs.readFileSync(db + "/" + base + ".arr");
        var arr = fileValue.split("\n");
        fileValue = "";
        for (var i in arr){
          if (arr[i] != kw){
            fileValue += arr[i];
          }
        }
        fs.writeFile(db + "/" + base + ".arr",fileValue,function (error){
            if (error)
                throw error;
        });
        break;
      case "nt":
        fs.writeFile(db + "/" + base + "." + type,"Last change:" + new Date().toUTCString() + "\n",function (error){
        if (error)
          throw error;
        });
        break;
      default:
        err = new Error("Not have this type!");
        throw err;
        break;
  }
}
function createDB(name) {
    fs.mkdirSync(name);
}
function createTab(db,name,info) {
    fs.writeFileSync(db + "/" + name + ".tab","");
    init(db,name,info);
}
function createArr(db,name) {
    fs.writeFileSync(db + "/" + name + ".arr","");
}
function init(db,base,info) {
    var table = {
        "info": info,
        "datas": {}
    };
    fs.writeFileSync(db + "/" + base + ".tab",JSON.stringify(table));
}
module.exports.createDB = createDB;
module.exports.createTab = createTab;
module.exports.createArr = createArr;
module.exports.init = init;
module.exports.add = add;
module.exports.del = del;