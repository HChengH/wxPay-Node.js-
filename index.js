const express = require('express');
const app = express()
const payRouter = require('./routes/pay/pay');
 
app.use('/wxpay', payRouter);
//app.post('/*pay', payRouter);

console.log("Server start...");
app.listen(443);
