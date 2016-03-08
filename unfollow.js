//Really bad unfollow script for github in phantomjs
//Use at own risk
var system = require('system');
var fs = require('fs');
var loading = false;
var page = new WebPage();
var script_name = 'unfollow.js';
//url to login into github
var loginurl = 'https://github.com/login';
//git hub url
var mainurl = 'https://github.com/';
//username
var username = '';
//password
var password = '';
var file_path = '';
var currenturl = '';
var nexturl = '';
var usertarget='';
var pgc = 1;
var temparr = [];
var newarr = [];
var c = 0;

//Load a url
function load(url)
{
	loading = true;
	console.log(script_name+' |loading| '+url);
	page.open(url);
}

//Parse to get username
function getusername(url)
{
	return url.substring(url.lastIndexOf('/')+1,url.length);
}

//Check input arguments
function check_args()
{
	if (system.args.length < 3)
	{
		console.log(script_name+' <username> <password>');
		phantom.exit();
	}
	//Store
	username = system.args[1];
	password = system.args[2];
	//file_path = system.args[3] 
}

//Go to next user
function setupnext(max)
{
	if ((pgc > 100) || (max === 0))
	{
				//Save database
				fs.write('tmp'+file_path, JSON.stringify(newarr), 'w');
				if (c >= temparr.length)
				{
					phantom.exit();
				}
				c++;
				//usertarget = temparr[c];
				pgc = 1;
				nexturl = mainurl+username+'/followers?page='+pgc.toString();
				setTimeout(function(){ load(nexturl) }, 3000);
				return 1;
	}
	return 0;
}


page.onLoadFinished = function() {
	if (loading)
	{
		console.log(currenturl);
		switch (currenturl) {
			case loginurl :
			//login to github
			var title = page.evaluate(function(username,password) {
				$("input#login_field")[0].value = username;
				$("input#password")[0].value = password;
				$("input.btn ").click();
				return document.title;
			},username,password);
			console.log(title);
			nexturl = mainurl;
			
			page.render('1.png');
			setTimeout(function(){ load(nexturl) }, 3000);
			break;
			case mainurl:
			//check if logged in
			page.render('2.png');
			nexturl = mainurl+username+'/following';
			setTimeout(function(){ load(nexturl) }, 3000);
			break;
			default:
			//get number of followers
			var max = page.evaluate(function() {
				return $("li.follow-list-item").length;
			});
			
			if (setupnext(max) === 1)
			{
				break;
			}
				
			var count = 0;

				
			while (count < max)
			{
				//start following
				var newname = page.evaluate(function(count) {
					var ret = "";
					var currentuser = $("li.follow-list-item")[count];
					if (currentuser.children[1].children[2] === undefined)
					{
						return ret;
					}
					var isfollow = currentuser.children[1].children[2].className.split(' ').indexOf("on");
					if (isfollow !== -1)
					{
						ret = currentuser.children[0].href;
						currentuser.children[1].children[2].children[0].children[0].children[1].click()
					}
					return ret;
				},count);
				if (newname.length !== 0)
				{
					//Save user
					newarr.push(getusername(newname));
				}
				count++;
			}
			
			
			page.render('3.png');
			
			
			if (max === 51)
			{
				//pgc++;
				nexturl = mainurl+usertarget+'/followers?page='+pgc.toString();
				setTimeout(function(){ load(nexturl) }, 2000);
			}
			else
			{
				setupnext(0);
			}
			break;
	
		}
		loading = false;
	}
	console.log('exit page');
};

page.onUrlChanged = function(targetUrl) {
	console.log('New page: '+targetUrl);
	currenturl = targetUrl; 
};

function main_thread() 
{
	//Main
	check_args();
	//temparr = JSON.parse(fs.read(file_path));
	//usertarget = temparr[c];
	load(loginurl);	
}

main_thread();
