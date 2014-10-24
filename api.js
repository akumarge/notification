
exports.login=function(params,callback){
	
	var	users = [
				{
					"id": 1,
				    "name": "mohan",
				    "password": "mohan",
				    "email": "mohan@ge.com",
				    "country":"india",
				    "gender":"male"
				    
				},
				{
				    "id": 2,
				    "name": "bharath",
				    "password": "bharath",
				    "email": "bharath@ge.com",
				    "country":"india",
				    "gender":"male"
				},
				{
				    "id": 3,
				    "name": "Raja",
				    "password": "raja",
				    "email": "raja@ge.com",
				    "country":"india",
				    "gender":"male"
				},
				{
				    "id": 4,
				    "name": "ashok",
				    "password": "ashok",
				    "email": "ashok@ge.com",
				    "country":"india",
				    "gender":"male"
				},
				
			];
	for (var user in users) {
		
		if(users[user].email == params.name && users[user].password == params.password) {
			var res = users[user];
			delete res.password;
			callback(null,res);
			
		}
	}		
	callback(null,false);
}

