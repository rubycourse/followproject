//Follow2 slightly better version of follow for Casperjs
var casper = require("casper").create({
    pageSettings: {
        loadImages:  false,       
        loadPlugins: false         
    },
    logLevel: "info",              
    verbose: false          
});
casper.options.waitTimeout = 4000;
var fs = require('fs');
var script_name = "follow2.js";
//Debug option
var debug = false;
//Current users
var userarray = [];
//New users collected
var newuserarray = [];
//stall time to get users
var stalltime = 2500;

//Print name
function printstart()
{
	casper.echo("=="+script_name+"==");
	casper.echo("Following script for github");
}

//Check arguments
function parse_args()
{
	if (casper.cli.args.length < 3)
	{
		//Error
		casper.echo(script_name+" <username> <password> <json file>").exit();
		return false;
	}
	return true;
}

//Load and parse json
function getjson(file_path)
{
	return JSON.parse(fs.read(file_path));
}

//save
function savejson(file_path)
{
	fs.write(file_path, JSON.stringify(newuserarray), 'w');
}

//Parse to get username
function getusername(url)
{
	return url.substring(url.lastIndexOf('/')+1,url.length);
}




//Go to login page
casper.start('https://github.com/login', function() {
	this.echo("logging in");
});

//Login
casper.waitFor(function check() {
	var username = casper.cli.get(0);
	var password = casper.cli.get(1);
	this.evaluate(function(username,password) {
		$("input#login_field")[0].value = username;
		$("input#password")[0].value = password;
		$("input.btn ").click();
        	return ;
	},username,password);
	return true;
}, function then() {
	if (debug)
	{
		this.capture('login.png');
	}
	this.echo("logged in");
	return true;
}, function timeout() { 
	this.echo("failed to login").exit();
});


var length = userarray.length;
var count = 0;
//Current user
var target = userarray[count];
//page number
var pagenum = 1;

//Start follow
casper.then(function() {
	casper.echo("following..");
	follow();
});

function evalfollow()
{
	this.waitFor(function check() {

		//Number of people in page
		var num = this.evaluate(function() {
			return $("li.follow-list-item").length;
		});

		var newarr = this.evaluate(function() {
			var arr = [];
			
			$("li.follow-list-item").each(function( index ) {
				
				if ( this.children[1].children[2] === undefined)
				{
					return;
				}
				var isfollow = this.children[1].children[2].className.split(' ').indexOf("on");
				if (isfollow === -1)
				{
					arr.push( this.children[0].href );
					this.children[1].children[2].children[0].children[0].children[1].click()
				}
			});

			return arr;	
		});

		newarr = newarr.map(getusername);
		//Add to array
		newuserarray = newuserarray.concat(newarr);
		if (debug)
		{
			casper.capture('view.png');
		}
		//No more users	
		if (num !== 51)
		{
			pagenum = 101;
		}
		casper.wait(stalltime);
		return true;
	}, function then() {
	
		pagenum++;
		innerloop();
		return true;
	});
}


//Each user
function innerloop()
{
	
	if (pagenum > 100)
	{
		savejson("tmp"+casper.cli.get(2));
		count++;
		follow();
		return;
	}
	
	if (target.indexOf("/") === -1)
	{
		casper.echo("https://github.com/"+target+"/followers?page="+pagenum.toString());
		casper.thenOpen(("https://github.com/"+target+"/followers?page="+pagenum.toString()) , evalfollow);
	}
	else
	{
		casper.echo("https://github.com/"+target+"/stargazers?page="+pagenum.toString());
		casper.thenOpen(("https://github.com/"+target+"/stargazers?page="+pagenum.toString()) , evalfollow);	
	}

	return;
}

//Loop through each username
function follow()
{
	
	if (count >= length)
	{
		return;
	}
	
	//reset
	target = userarray[count];
	pagenum = 1;
	
	innerloop();
	
	return;	
}



casper.run(function() {
	
	this.echo("finish").exit();
});

//main
function main()
{
	if (parse_args())
	{
		userarray = getjson(casper.cli.get(2));
		length = userarray.length;
		printstart();
		casper.run();
	}
}



main();
