'use strict';
var LiqPay = require('../controllers/liqpay');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Order =  mongoose.model('Order')
const Booking =  mongoose.model('Booking')
const CartInOrder =  mongoose.model('CartInOrder')
const config = require('../config/config')
//console.log(config)
var request = require('request')
const ports = require('../../modules/ports')
var zlib = require('zlib');

var domain = require('domain');

exports.checkoutLiqpay=function(req,res,next){
    //console.log(req.body)
    let store = req.store;
    //console.log(store.link+'/cabinet')
    if(store && store.onlinePay && store.payData && store.payData.liqPay && store.payData.liqPay.is && store.payData.liqPay.public_key && store.payData.liqPay.private_key){
        let public_key=store.payData.liqPay.public_key;
        let private_key=store.payData.liqPay.private_key;
        let o = req.body;
        let liqpay = new LiqPay(public_key, private_key);
        let peyPerOrder=store.lang.pаyPerOrder||'оплата по ордеру'
        let html = liqpay.cnb_form({
            'action'         : 'pay',
            'amount'         : o.paySum,
            'currency'       : o.currency,
            'description'    : peyPerOrder+" N-"+o.num,
            'order_id'       : o.num,
            'version'        : '3',
            'language'         :store.lang,
            'result_url':store.link+'/api/orders/checkoutLiqpayComplite',
            'server_url':store.link+'/api/orders/checkoutLiqpayComplite/'+store._id,
            //'server_url':store.link+'/api/orders/checkoutLiqpayComplite',
            //'sandbox':1,

        });
        //html = html.replace(/method="POST"/g,'method="POST" target="_blank"');
        return res.json({html:html})
    }else{
        return res.json({})
    }
}
exports.checkoutLiqpayInvoice=function(req,res,next){
    //console.log(req.body)
    let store = req.store;
    if(store && store.onlinePay && store.payData && store.payData.liqPay && store.payData.liqPay.is && store.payData.liqPay.public_key && store.payData.liqPay.private_key){
        let public_key=store.payData.liqPay.public_key;
        let private_key=store.payData.liqPay.private_key;
        let o = req.body;
        //console.log(getStuffs(o.cart))
        let liqpay = new LiqPay(public_key, private_key);
        let peyPerOrder=store.lang.pаyPerOrder||'оплата по ордеру'
        let html = liqpay.cnb_form({
            'action'         : 'invoice_send',
            'version'        : '3',
            'amount'         : o.paySum,
            'currency'       : o.currency,
            'description'    : peyPerOrder+" N-"+o.num,
            'order_id'       : o.num,
            "email"          : o.user.email,
            'language'         :store.lang,
            "goods"    : getStuffs(o.cart),
            'result_url':store.link+'/api/orders/checkoutLiqpayComplite',
            'server_url':store.link+'/api/orders/checkoutLiqpayComplite/'+store._id,

            //'server_url':store.link+'/api/orders/checkoutLiqpayComplite',
            //'sandbox':1,

        });
        //html = html.replace(/method="POST"/g,'method="POST" target="_blank"');
        //console.log(html)
        return res.json({html:html})
    }else{
        return res.json({})
    }
    function getStuffs(cart) {
        if(cart && cart.stuffs){
            return cart.stuffs.map(s=>{return { name: s.name,count:s.quantity}})
        }else{return []}
    }
}
exports.checkoutLiqpayComplite=function(req,res,next){
    //https://www.liqpay.ua/documentation/api/callback
    try{
        res.json({})
        //console.log('checkoutLiqpayComplite',req.body)
        let store = req.store;
        if(store.onlinePay && store.payData && store.payData.liqPay && store.payData.liqPay.is && store.payData.liqPay.public_key && store.payData.liqPay.private_key){
            let data,signature;
            if(req.body.data){
                data=req.body.data
            }
            if(req.body.signature){
                signature=req.body.signature
            }
            if(signature){
                let public_key=store.payData.liqPay.public_key;
                let private_key=store.payData.liqPay.private_key;
                let liqpay = new LiqPay(public_key, private_key);
                let sign = liqpay.str_to_sign(private_key + data + private_key);
                //console.log("signature==sign",signature==sign)
                try{
                    let str = new Buffer(data, 'base64').toString('utf-8')
                    //console.log(str)
                    data = JSON.parse(str)
                    //console.log(data)
                }catch(err){console.log(err)}

                //if(signature==sign && data && data.num){
                if( data && data.order_id && data.status!='failure'){
                    // смена статуса платежа
                    Order.findOne({num:data.order_id,store:store._id},function (err,order) {
                        if(order){
                            order.status=3;
                            if(!order.pay){
                                order.pay=[]
                            };
                            let pay = {
                                date:data.create_date,
                                sum:data.amount,
                                currency:data.currency,
                                info:data.description,
                                transaction_id:data.transaction_id
                            }
                            let is=false;
                            if(order.pay.length){
                                for(let i=0;i<order.pay.length;i++){
                                    if(order.pay[i] && order.pay[i].transaction_id && data.transaction_id && order.pay[i].transaction_id == data.transaction_id){
                                        is=true;
                                    }
                                }
                            }
                            if(!is){
                                order.pay.push(pay)
                                order.save(function (err,result) {
                                    console.log('save order after liqpay ',err,result)
                                })
                            }

                        }
                    })

                }
            }
        }
    }catch(err){console.log(err)}

    //console.log(req.store.subDomain)





}
exports.checkoutLiqpayEntry=function(req,res,next){
    let store = req.store;
    if(store.onlinePayEntry && store.payData && store.payData.liqPay && store.payData.liqPay.is && store.payData.liqPay.public_key && store.payData.liqPay.private_key){
        let public_key=store.payData.liqPay.public_key;
        let private_key=store.payData.liqPay.private_key;
        let o = req.body;
        let liqpay = new LiqPay(public_key, private_key);
        let pаyPerService=store.lang.pаyPerService||'Оплата за услугу'
        let html = liqpay.cnb_form({
            'action'         : 'pay',
            'amount'         : o.paySum,
            'currency'       : o.currency||'UAH',
            'description'    : pаyPerService+" "+o.service.name+', '+req.store.name,
            'order_id'       : o.num,
            'version'        : '3',
            'language'         :store.lang,
            'result_url':store.link+'/api/orders/checkoutLiqpayCompliteEntry/'+o.user._id,
            'server_url':store.link+'/api/orders/checkoutLiqpayCompliteEntry/'+o.user._id+'/'+store._id,
            //'server_url':'http://'+config.orderHost+'/api/orders/checkoutLiqpayComplite/'+store._id,
            //'sandbox':1,

        });
        //console.log('http://'+config.orderHost+'/api/orders/checkoutLiqpayComplite/'+store._id)
        return res.json({html:html})
    }else{
        return res.json({})
    }
}

exports.changeAbonement=function(req,res,next){
    console.log(req.body)
    var userHost = 'http://127.0.0.1:'+ports.userPort;

    var urll= userHost+'/api/changeAbomenet/'+req.body.user+'/';
    if(req.body.add){
        urll+='plus/'+req.body.a;
    }else{
        urll+='minus/'+req.body.a;
    }

    let options = {
        url:urll,
        method: 'GET',
        //headers: getHeaders(req),
        json: true,
        qs: {store:req.store._id},
    }

    try{
        let requestForServer = request(options);
        requestForServer.on('response', function(response) {
            var chunks = [];
            response.on('data', function(chunk) {
                chunks.push(chunk);
            });

            response.on('end',async function() {
                var buffer = Buffer.concat(chunks);
                try{
                    let orderStr = buffer.toString();
                    let order = JSON.parse(orderStr)
                    console.log(order)
                    return res.json({msg:'OK'})

                }catch(err){
                    return next(err)
                }

                return;


                /*if(response.statusCode!==200){
                    let error = (buffer.toString)? new Error(buffer.toString()):response.statusCode;
                    return next(error)
                }
                try{
                    zlib.unzip(buffer, function(err, unzipbuffer) {

                        if(err){
                            return next(err)
                        }
                        try{
                            let results =JSON.parse(unzipbuffer.toString('utf8'));

                            return res.json({msg:'OK'})
                        }catch(err){

                            return next(err)
                        }
                    });
                }catch(err){return next(err)}*/




            });
            response.on('error', function(err) {

                next(err)
            })
        });
    }catch(err){
        next(err)
    }
}
exports.checkStuffInOldOrders= async function(req,res,next){
    //console.log(req.body)
    let orders = await  Order.find({store:req.store._id,user:req.body.user,status : {$lt: 3}}).populate('cart').exec()
    //console.log(orders)
    if(orders && orders.length){

        for(let i=0;i<orders.length;i++){
            for(let j=0;j<orders[i].cart.stuffs.length;j++){
                //console.log(orders[i].cart.stuffs[j])
                if(orders[i].cart.stuffs[j]._id===req.body.stuff._id && orders[i].cart.stuffs[j].sort===req.body.stuff.sort){
                    return res.json({status:true})
                }
            }
        }
        res.json({status:false})
    }else{
        res.json({status:false})
    }

}

/*console.log('http://'+config.orderHost+'/api/orders/checkoutLiqpayComplite/'+store._id)
//html = html.replace(/method="POST"/g,'method="POST" target="_blank"');*/


exports.checkoutLiqpayCompliteEntry=function(req,res,next){
    //https://www.liqpay.ua/documentation/api/callback
    console.log('checkoutLiqpayCompliteEntry')
    try{
        res.json({})
        let store = req.store;
        if(store.onlinePayEntry && store.payData && store.payData.liqPay && store.payData.liqPay.is && store.payData.liqPay.public_key && store.payData.liqPay.private_key){
            let data,signature;
            if(req.body.data){
                data=req.body.data
            }
            if(req.body.signature){
                signature=req.body.signature
            }
            if(signature){
                let public_key=store.payData.liqPay.public_key;
                let private_key=store.payData.liqPay.private_key;
                let liqpay = new LiqPay(public_key, private_key);
                let sign = liqpay.str_to_sign(private_key + data + private_key);
                //console.log("signature==sign",signature==sign)
                try{
                    let str = new Buffer(data, 'base64').toString('utf-8')
                    //console.log(str)
                    data = JSON.parse(str)
                    //console.log(data)
                }catch(err){console.log(err)}
                //if(signature==sign && data && data.num){
                if( data && data.order_id && data.status!='failure'){
                    // смена статуса платежа
                    Booking.findOne({num:data.order_id,store:store._id},function (err,order) {
                        if(order){
                            order.status=1;
                            let is=false;
                            if(order.user && order.user._id!='schedule'){
                                if(order.pay && order.pay.transaction_id && order.pay.transaction_id==data.transaction_id){
                                    is=true;
                                }
                                if(!is){
                                    order.pay={};
                                    if(data.create_date){
                                        order.pay.date=data.create_date;
                                    }
                                    if(data.amount){
                                        order.pay.sum=data.amount;
                                    }
                                    if(data.currency){
                                        order.currency=data.currency;
                                    }
                                    if(data.description){
                                        order.pay.info=data.description;
                                    }
                                    if(data.transaction_id){
                                        order.pay.transaction_id=data.transaction_id;
                                    }
                                    order.save(function (err,result) {
                                        //console.log(err,result)
                                    })
                                }
                            }else if(order.users  && order.users.length){
                                let user = order.users.filter(u=>u._id=req.params.user)
                                if(user && user.length){
                                    user=user[0]
                                    if(!user.pay){
                                        user.pay={};
                                    }
                                    if(data.create_date){
                                        order.pay.date=data.create_date;
                                    }
                                    if(data.amount){
                                        user.pay.sum=data.amount;
                                    }
                                    if(data.currency){
                                        user.pay.currency=data.currency;
                                    }
                                    if(data.description){
                                        user.pay.info=data.description;
                                    }
                                    if(data.transaction_id){
                                        user.pay.transaction_id=data.transaction_id;
                                    }
                                    order.save(function (err,result) {
                                        //console.log(err,result)
                                    })
                                }
                            }

                        }
                    })

                }
            }
        }
    }catch(err){console.log(err)}

    //console.log(req.store.subDomain)





}

exports.deleteStore=function(req,res,next) {
    /*if(!req.store || !req.store._id || !req.store.wantToDelete ){
        return next("can't delete" )
    }*/
    if(!req.store || !req.store._id ){
        return next("can't delete" )
    }
    let store=req.store._id;
    deleteModels()
        .then(function () {
            res.json({msg:'ok'})
        })
        .catch(function (err) {
            next(err)
        })
    async function deleteModels () {
        const cursor = Order.find({store:store}).cursor();
        await cursor.eachAsync(async function(order) {
            await new Promise(function (rs,rj) {
                if(order.cart){
                    CartInOrder.findOneAndRemove({_id: order.cart}, function (err) {
                        if (err) {
                            return rj(err)
                        }
                        return rs()
                    })
                }else{
                    return rs()
                }
            })
        });
        if(store){
            await new Promise(function (rs,rj) {
                Order.remove({store:store}, function (err) {
                    if (err) {
                        return rj(err)
                    }
                    return rs()
                })
            })
        }

    }
}










