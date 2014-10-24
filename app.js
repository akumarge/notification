/*
* File Name : app.js
* Description : Your application start here.
*/
var express=require('express'),
	consolidate=require('consolidate'),
	path=require('path'),
	http=require('http'),
	bodyParser=require('body-parser'),
	swig=require('swig'),
	passport=require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs'),
    serveStatic = require('serve-static'),
    bcrypt = require('bcrypt-nodejs'),
    expressSession = require('express-session');
    api=require('./api.js'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;
	
var app=express(),
	server=http.createServer(app),
	io=require('socket.io')(server);

//Mongodb connection
mongoclient = new MongoClient(new Server('127.0.0.1', 27017, {'native_parser':true})); //10.98.6.51
db = mongoclient.db('blog');	

//satic files provider
app.use(serveStatic('public'));
//template settings
app.engine('html',consolidate.swig);	
app.set('view engine','html');
app.set('views',__dirname+'/views');

//including express body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  	extended: true
}));
app.use(expressSession({secret:'somesecrettokenhere'}));
//initilizing port
app.set('port',process.env.PORT || 8000);

//routing 
app.get('/',function(req,res){
	res.render('index');
});

app.post('/login',function(req,res){
	var user_details={
		name:req.body.username,
		password:req.body.password
	}
	api.login(user_details,function(err,result){
		if(result){
			req.session.email=result.email
			req.session.name=user_details.name
			//result = JSON.stringify(result);
			res.redirect('/success');
		}
	});	
});

app.get('/success',function(req,res){
	var i=0, arr=[];

	db.collection('content').find({'status':1}).toArray(function(err,result){
		 result.forEach(function(user) {
			db.collection('user').find({'_id':user.uid}).toArray(function(err,ans){
				user.name = ans[0].name;
				user.email=ans[0].email;
				/*user.country=ans[0].country;
				user.gender=ans[0].gender;*/
				arr[i++]=user;
			});
	    });	
		 console.log(req.session.name);
		res.render('home',{"name":req.session.name,"email":req.session.email,"content":arr});
	});
});

app.get('/fail',function(req,res){
	res.render('index',{"err":"Invalid username/password"});
});

app.post('/success',function(req,res){
	res.redirect('/success');
});
io.on('connection',function(socket){
	var msg_det=[],i=0;
	socket.on('send', function(data) {
		db.collection('user').find({ $or: [ { 'email':data.to_user }, { 'email':data.from_user }]}).toArray(function(err,result){
				result.forEach(function(msg) {
					msg_det[i++]=msg._id;
					if(msg.email==data.from_user){
						data.name=msg.name;
						//console.log(data.name);
					}
				});
		socket.broadcast.emit('msg',{send_message:data.message,to_user:data.to_user,name:data.name});
		db.collection('message').insert({"from_uid":msg_det[0],"to_uid":msg_det[1],"body":data.message,"created":new Date().getTime(),"status":1},function(err,ans){
			//console.log(ans);
		});
	});
		
	});
});

/*io.on('connection',function(socket){
	var msg_det=[],i=0;
	socket.on('profile', function(data) {
		db.collection('user').find({ $or: [ { 'email':data.to_user }, { 'email':data.from_user }]}).toArray(function(err,result){
			console.log(result);
				result.forEach(function(msg) {
					if(msg.email==data.from_user){
						data.f = {};
						data.f.name=msg.name;	
						
					}
					else if(msg.email==data.to_user){
						data.t = {};
						data.t.viewname=msg.name;
						data.t.gender=msg.gender;
						data.t.country=msg.country;
						data.t.email=msg.email;
					}
				});
		socket.emit('userProfile',{send_message:'viewing your profile',to_user:data.to_user,name:data.f.name,pro_name:data.t.viewname,pro_email:data.t.email,pro_gender:data.t.gender,pro_country:data.t.country});
	});
		
	});
});*/

io.on('connection',function(socket){
	socket.on('profile',function(data){
		db.collection('user').find({'email':data.to_user}).toArray(function(err,result){
			socket.emit('userProfile',{pro_name:result[0].name,pro_email:result[0].email,pro_gender:result[0].gender,pro_country:result[0].country});
		});
		socket.broadcast.emit('noti_user',{send_message:'viewing your profile',to_user:data.to_user});
	});
});

/*io.on('connection',function(socket){
	socket.on('notification', function(data) {
		db.collection('user').find({ $or: [ { 'email':data.to_user }, { 'email':data.from_user }]}).toArray(function(err,result){
				result.forEach(function(msg) {
					if(msg.email==data.from_user){
						data.name=msg.name;
					}
				});
		socket.broadcast.emit('viewDetails',{notification:'viewing your profile',viewer_name:data.name,to_user:data.to_user});
	});
		
	});
});*/
app.get('/logout',function(req, res){
	res.redirect('/');
});

mongoclient.open(function(err,mongoclient){
	server.listen(app.get('port'),function(){
			console.log("server is listening in port 8000");
	});
});

