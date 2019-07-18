'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;


var Chat = mongoose.model('Chat' ),
    Dialog = mongoose.model('Dialog' );
    var request = require('request');


function sendMessage(data,socket){
    console.log('data' ,data)
    //var host =data.host.split(':').splice(0,2);
    //host =host.join(':')+':8909/api/me';
    //console.log(host)
    /*request({
        url: host, //URL to hit
        method: 'GET', //Specify the method
        headers: { //We can define headers too
            'Authorization': 'Bearer '+data.token,
        }
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            //console.log(response.statusCode, body);
        }
    });*/
}

var orders={};

module.exports = function (sockets) {

    this.connect= function(socket){
        //console.log('!!')
        //console.log('connect sockets.length-',sockets.length)
        var facebook = /facebookexternalhit/.test(socket.handshake.headers['user-agent']);
        var google = /google\.com\/\+/.test(socket.handshake.headers['user-agent']);
        var fragment=/_escaped_fragment_/.test(socket.handshake.headers['referer'])
        var fragment2=/subDomain/.test(socket.handshake.headers['referer'])
        //console.log(fragment,fragment2)
        if(fragment || fragment2|| facebook ||google) {
            return;
        }

        socket.nickname=socket.id
        sockets.push(socket);


        socket.on('seller',function(data){
            //console.log(data)
            socket.seller=data;
        })
        socket.emit('getNewUserInOrder',{nickname:socket.nickname});
        socket.on('newUserInOrder',function(data){

            //console.log(data.id);
            if(data.id){
                socket.orderId=data.id;
                if(!orders[socket.orderId]){
                    orders[socket.orderId]=[];
                }
                if(!orders[socket.orderId].includes(socket.nickname)){
                    orders[socket.orderId].push(socket.nickname)
                }

                if(orders[socket.orderId].length===1){
                    //console.log('only once')
                    let o={
                        editAvaible:true
                    }
                    socket.emit('getStatusForOrder',o);
                }
            }
            //console.log('getStatusForOrder',orders)

            //socket.seller=data;
        })
        socket.on('UserExitOrder',function(data){
            socket.orderId=null;
            //console.log(data.id);
            if(data.id){
                let orderId=data.id;
                if(orders[orderId] && orders[orderId].length){
                    let i = orders[orderId].indexOf(socket.nickname);
                    if(i>-1){
                        orders[orderId].splice(i,1);
                        if(!orders[orderId].length){
                            delete orders[orderId]
                        }else{

                            let sName = orders[orderId][0];
                            console.log("sName",sName)
                            let ss = sockets.find(sss=>{
                                console.log(sss.id)
                                return sss.id===sName
                            })

                            if(ss){
                                console.log('send');
                                let o={
                                    editAvaible:true
                                }
                                ss.emit('getStatusForOrder',o);
                            }
                        }
                    }
                }
            }
            //console.log('UserExitOrder',orders)
        })



        socket.on('getSellerStatus',function(){
            //console.log('getSellerStatus')
            setStatus()
        })
        socket.on('getUserStatus',geUserStatus)
        socket.on('getUser:data',function(data){
            //if (socket.user) return;
            //console.log(data);
            if (data){
                //console.log('data-',data)
                if(data['user']){
                    socket['user']=data['user'];

                    if (data['seller']){
                        socket['seller']=data['seller'];
                        // ecли seller сообщаем об этом
                        if(socket['user']=='seller'){
                            // вошел seller сообщаем всем не selleram
                            if (!sockets.some(function(s){return s.user=='seller' && s.seller==socket.seller && s.id!=socket.id})){
                                sockets.forEach(function(socketUser){
                                    //console.log(socketUser.user,socketUser.seller);
                                    if(socketUser.user!='seller' && socketUser.seller==socket.seller){
                                        socketUser.emit('sellerStatus',{status:true})
                                    }
                                })
                            }
                        } else{
                            setStatus()

                        }
                    }
                    if (data['store']){
                        socket['store']=data['store'];
                    }
                    socket.dialog=null;
                    if(socket.user!='seller'){
                        //console.log("socket.user!='seller' ",socket.user!='seller')
                        sockets.forEach(function(s){
                            if(s.user=='seller'){
                                s.emit('userStatus',{status:true,user:socket.user})
                            }
                        })
                    }
                }else{
                    if(socket.user && socket.user!='seller'){
                        sockets.forEach(function(s){
                            if(s.user=='seller'){
                                s.emit('userStatus',{status:false,user:socket.user})
                            }
                        })
                    }
                    socket['user']=null;
                    socket['seller']=null;
                }
                //console.log(socket)

            }

        })
        socket.on('newMessage',function(body){
            if(!sockets || !sockets.length){return}
            var data=JSON.parse(JSON.stringify(body));
            data.dialog=body.dialog._id;
            var data2= new Chat(data);
            //console.log(data2)
            var o=data2.toObject();
            o.sellerName=body.sellerName;
            o.userName=body.userName;
            o.order=body.order;
            o.orderNum=body.orderNum;
            data2.save()
            for(var i=0,l=sockets.length;i<l;i++){
                var socket=sockets[i];
                //console.log('socket.user-',socket.user,'socket.seller-',socket.seller)
                //console.log('body.dialog.seller ',body.dialog.seller)
                if (socket.seller && socket.seller==body.dialog.seller){
                    //console.log(body.recipient=='seller')
                    //console.log(body.recipient=='user' && body.dialog.user==socket.user)
                    if (socket.user=='seller'){
                        socket.emit('newMessage',o);
                    }else if(body.dialog.user==socket.user){
                        socket.emit('newMessage',o);
                    }
                }
            }

        })
        socket.on('disconnect',function(data){
            // console.log('disconnected -',socket.nickname)
            if(orders[socket.orderId] && orders[socket.orderId].length){
                orders[socket.orderId].splice(orders[socket.orderId].indexOf(socket.nickname),1);
                if(orders[socket.orderId].length){
                    let nickname = orders[socket.orderId][0];
                    for(let s of sockets){
                        if(s.nickname===nickname){
                            let o={
                                editAvaible:true
                            }
                            s.emit('getStatusForOrder',o);
                            break;
                        }
                    }
                }else{
                    delete orders[socket.orderId];
                }
            }


            sockets.splice(sockets.indexOf(socket),1);
            //console.log('after disconnected sockets.length-',sockets.length,socket.seller)
            // выходит seller сообщаем всем не selleram если такого селлера больше нет в сети
            if(socket['user']=='seller' && !sockets.some(function(s){
                    return s.user=='seller'&& s.seller==socket.seller
                })){
                sockets.forEach(function(socketUser){
                    if(socketUser.user!='seller' && socketUser.seller==socket.seller){
                        socketUser.emit('sellerStatus',{status:false})
                    }
                })
            }
            if(socket.user!='seller'){
                sockets.forEach(function(s){
                    if(s.user=='seller'){
                        s.emit('userStatus',{status:false,user:socket.user})
                    }
                })
            }
        })

        function emitGetUser(){
            socket.emit('getUser')
        }
        function setStatus(){
            //console.log('socket.seller ',socket.seller)
            if (sockets.some(function(s){
                    //console.log(s.user,s.seller)
                    return s.user=='seller' && s.seller==socket.seller})){
                //console.log('getSellerStatus= tur')
                socket.emit('sellerStatus',{status:true});
            }else{
                socket.emit('sellerStatus',{status:false});
            }
        }
        function geUserStatus(data){
            //console.log('geUserStatus',data)
            var is=false;
            for(var i =0,l=sockets.length;i<l;i++){
                if(sockets[i].user!='seller' && sockets[i].user==data.user){
                    is=true;
                    break;
                }

            }
            socket.emit('userStatus',{status:is,user:data.user})
        }


        /* for dateTime*/
        socket.on('newRecordOnSite',function(data){
            //console.log('newRecordOnSite data',data)
            if(!sockets || !sockets.length){return}
            for(let i=0,l=sockets.length;i<l;i++){
                //console.log(sockets[i].user,sockets[i].seller,sockets[i].store)
                if (sockets[i].user=='seller' && sockets[i].store && sockets[i].store==data.store){
                    sockets[i].emit('newRecordOnSite');
                    console.log('newRecordOnSite')
                }
            }
        })
    }
};



