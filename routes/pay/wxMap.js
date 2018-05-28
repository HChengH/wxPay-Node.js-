var seedrandom = require('seedrandom');
var rng = seedrandom('added entropy.', { entropy: true });

function randomSequence(){
    var source = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var x ='';
    var n = 16;
    for (var i = 0; i<n; ++i)
    {
        var x = rng();
	x = parseInt(x*source.length);
	x+=source[x];
    }
    return x;
}

function price(pid){
    return 1;
}


function wxMap(uid, pid, appcode, ip){
    var map = new Map();
    map.set("appid", global.MXWechatAPPID);
    map.set("attach", "mytestvalue");
    map.set("body", "pay");
    map.set("mch_id", global.MXWechatMCHID);
    map.set("nonce_str", randomSequence());
    //map.set("nonce_str", "IU531GVYX99BWDEK");
    map.set("notify_url", global.NotifyURL);
    map.set("out_trade_no", randomSequence());
    //map.set("out_trade_no", "1525832410");
    //map.set("spbill_create_ip", ip);
    map.set("spbill_create_ip", "210.12.48.50");
    map.set("total_fee", price(pid));
    map.set("trade_type", "APP");

    return map;
}
module.exports = wxMap;
