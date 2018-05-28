var express = require('express');
var https = require('https');
var qs=require('querystring');
var builder = require('xmlbuilder');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var parser = require('xml2json');

var wxMap = require('./wxMap');
require('./wxConfig');

/var app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Code start--------------

//function sign(uid, pid, appcode, ip){
function sign(map){
    var root = builder.create('xml');
    for(var item of map.entries()){
        var item = root.ele(item[0], item[1]);
    }
    var req_xml = root;
// flattern xml
    var req_flat = "";
    var isFirst = true;
    for(var item of map.entries()){
        if(isFirst){
	    isFirst = false;
	    req_flat += item[0]+"="+item[1];
	}else{
	    req_flat += "&"+item[0]+"="+item[1];
	}
    }
    req_flat += "&key="+global.key;
// use MD5
    var sign = crypto.createHash('md5').update(req_flat).digest('hex').toUpperCase();
// add sign to xml
    var item = req_xml.ele("sign", sign);
    return req_xml;
}

function up(x,y){
    return x.key-y.key;
}

function requestWX(reqData, user_res){
    reqData = ""+reqData;
    var options = {
        host: 'api.mch.weixin.qq.com',
	path: '/pay/unifiedorder',
	method: 'POST',
	headers:{
	    'Content-Length':reqData.length
	}
    };
    var req = https.request(options, function(res){
	var _data='';
	res.on('data', function(chunk){
	    _data += chunk;
	});
	
	res.on('end', function(){
	    var json = parser.toJson(_data, {object: true});
	    if(json.xml.return_code == "SUCCESS" &&
	       json.xml.return_msg == "OK"){
	        var myMap = new Map();
	        myMap.set("appid", json.xml.appid);
	        myMap.set("partnerid", json.xml.mch_id);
	        myMap.set("prepayid", json.xml.prepay_id);
	        myMap.set("package", "Sign=WXPay");
	        myMap.set("noncestr", json.xml.nonce_str);
	        myMap.set("timestamp", Date.now());

	        var req = sign(myMap);
		console.log("%s", req);
	        var json = parser.toJson(req+"", {object: true});
	        json = json.xml;
	        json = JSON.stringify(json);

	        user_res.end(json);
	    }else{
	        user_res.end("FAILED");
	    }
        });

    });

    req.write(reqData);
    req.end();
}

app.post('/wxorder', function (req, res) {
    if(req.body){
	var userid = JSON.stringify(req.body.uid);
	var pid = JSON.stringify(req.body.pid);
	var appcode = JSON.stringify(req.body.app_code);
	var ip = req.connection.remoteAddress;

	// build up the XML...
	var map = wxMap(userid, pid, appcode, ip);
	var req = sign(map);
	// send request to wx
	requestWX(req, res);

    }else{
        console.log("/wxorder Error");
        res.send('wxorder Error');
    }

});

app.post('/wxpay', function (req, res) {
    if(req.body){
        console.log("-------\n>")
        console.log(req.body);
    
    }else{
        console.log("/wxpay Error");
	res.send("wxpay Error");
    }
});

module.exports = router;


var server = app.listen(443, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server start...");
});

