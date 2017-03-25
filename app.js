var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid=require('node-uuid');
var paypal=require('paypal-rest-sdk');
var port=2200;
var connection = require('./database/a').connection;

var router=express.Router();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

router.get('/userpay',function(req,res){
  res.render('pay');
});

router.post('/users/payment',function(req,res){
        var value;
    connection.query('select amount from vendor where billid="'+req.body.n11+'"',function(err,rows,fields){
      if(err)
        console.log(err);
      value=rows[0].amount;
      value=parseInt(value);


console.log(value);

        if(value){
                var config = {
                  "port" : 2200,
                  "api" : {
                    "host" : "api.sandbox.paypal.com",
                    "port" : "",            
                    "client_id" : "Aep2kIRx0yi5RX3kJhvwwEJSZuTdd_75m-TYSpUzp8fCoJ3FofOuz4SYgNmGIdI6mYLvcToWrQzi4jkY",  // your paypal application client id
                    "client_secret" : "EGXNa3cUY5GR9xZ1isEgsUHz6D5fdEXm9B2Shrq-47R4KnCdHYRDm4BoF3n8n61FTvsbk3O3Kkfn_P59" // your paypal application secret id
                  }
                }
                paypal.configure(config.api);
                var payment = {
                  "intent": "sale",
                  "payer": {
                    "payment_method": "paypal"
                  },
                  "redirect_urls": {
                    "return_url": app.locals.baseurl+"/success",
                    "cancel_url": app.locals.baseurl+"/cancel"
                  },
                  "transactions": [{
                    "amount": {
                      "total":value,
                      "currency":  "USD"
                    },
                    "description": 'keep touch with getswadesh.com'
                  }]
                };
                 
                  paypal.payment.create(payment, function (error, payment) {
                  if (error) {
                    console.log(error);
                  } else {
                    if(payment.payer.payment_method === 'paypal') {
                      req.paymentId = payment.id;
                      var redirectUrl;
                      console.log(payment);
                      for(var i=0; i < payment.links.length; i++) {
                        var link = payment.links[i];
                        if (link.method === 'REDIRECT') {
                          redirectUrl = link.href;
                        }
                      }
                      res.redirect(redirectUrl);
                    }
                  }
                });
                }
                    
    });
              
                  });         





                // Page will display after payment has beed transfered successfully
                router.get('/success', function(req, res) {
                  res.send("Payment transfered successfully.");
                  var x={
                    status:"paid"
                  }
                connection.query('update vendor set ?',x,function(err,data){
              if(err){
                res.send('paid status not updated');
              }else{
                res.send('paid status updated');
              }

                });
              });
                 


                // Page will display when you canceled the transaction 
                router.get('/cancel', function(req, res) {
                  res.send("Payment canceled successfully.");
                });
 

app.use('/', router);
app.listen(port);

module.exports=app;