const Discord = require('discord.js');
var auth = require('./auth.json');
var conf = require('./conf.json');
var roles = require('./roles.json');
const bot = new Discord.Client();
var fs = require('fs');
var match={};
var autorace=false;
var update=false;
var PBtosend=[];
var pbupdated = false;
const WebHookListener  = require('twitch-webhooks');
const ApiClient =require('twitch');
const twitchauth =require('twitch-auth');
var LIVE=false;
const clientId = '8ebli10ths5tzs7oyeh6wje0riip09';
const clientSecret = 'xmb8i2cqb8t77rvneoq96wdn1lk9g4';
const authProvider = new twitchauth.ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });
const discordname=""//ZigouiStream

//beurre.
//rweed.
//vlad.

async function isStreamLive(userName) {
	const user = await apiClient.helix.users.getUserByName(userName);
	if (!user) {
		return false;
	}
	return await user.getStream()!== null;
}

function isZiglive(){
	isStreamLive("Zigouigoui_cv").then(function(result){
		if(result&&!LIVE){
			guildZig=bot.guilds.cache.find(guild => guild.name === discordname);
			guildZig.setIcon('./Zigon.png').then(updated => console.log('Updated the guild icon')).catch(console.error);
			LIVE=true;
		}
		if(!result&&LIVE){
			guildZig=bot.guilds.cache.find(guild => guild.name === discordname);
			guildZig.setIcon('./Zigoff.png').then(updated => console.log('Updated the guild icon')).catch(console.error);
			LIVE=false;
		}
	}
	);
}

setInterval(isZiglive,90000);

bot.on('message', msg => {
	var args=msg.content.split(' ');
	if(args[0]=="!addrole"){
		if(!msg.member.roles.cache.some(r=>[conf.adminRoleName].includes(r.name)) ){
			return;
		}
		//mod
		addrole(args[1]);
	}
	if (args[0]=="!roles"){
		rolelist(msg);
	}
	if (args[0]=="!role"){
		role(msg,args[1]);
	}
	if (args[0]=="!supprimerole"){
		if(!msg.member.roles.cache.some(r=>[conf.adminRoleName].includes(r.name)) ){
			return;
		}
		deleterole(msg,args[1]);
	}
	if (args[0]=="!live"){
		live(msg);
	}
});

function addrole(role){
	roles.roles.push(role);
	fs.writeFile('./roles.json', JSON.stringify(roles), function (err) {
		if (err) return console.log(err);
	});
	
}

function deleterole(msg,role){
	const index=roles.roles.indexOf(role);
	if (index > -1) {
		roles.roles.splice(index, 1);
	fs.writeFile('./roles.json', JSON.stringify(roles), function (err) {
		if (err) return console.log(err);
	});
	}
}

function rolelist(msg){
	var rolesformat = "Roles disponibles :\n"
	roles.roles.forEach(function(role){
		rolesformat=rolesformat+role+"\n"
	});
	msg.channel.send(rolesformat,{code:true});
}

function role(msg,nouveaurole){
	if(roles.roles.includes(nouveaurole)){
	if(msg.member.roles.cache.some(r=>[nouveaurole].includes(r.name))){
		msg.member.roles.remove(msg.guild.roles.cache.find(r=>r.name==nouveaurole));
		return ;
	}
	 else if(msg.guild.roles.cache.find(r=>r.name==nouveaurole)!=undefined){
		 msg.member.roles.add(msg.guild.roles.cache.find(r=>r.name==nouveaurole));
	}
	}else{
		msg.reply("pas un role");
	}
	
}
	
function newmatch(){
	var new_match=JSON.parse(fs.readFileSync('./new_match.json'));
	return new_match;
}

function newplayer(id, name, ready){
	var player=JSON.parse(fs.readFileSync('./new_player.json'));
	player.id=id;
	player.name=name;
	player.ready=ready;
	return player;
	
}

function live(msg){
	msg.guild.setIcon('./Zigon.png').then(updated => console.log('Updated the guild icon')).catch(console.error);
	LIVE=true;
}

function nolive(msg){
	msg.guild.setIcon('./Zigoff.png').then(updated => console.log('Updated the guild icon')).catch(console.error);
	LIVE=false;
}


function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  if(mins<10)mins="0"+mins;
  if(secs<10)secs="0"+secs;
  return hrs + ':' + mins + ':' + secs;
}

function getGameName(name){
	return gamelist[name.toLowerCase().replace(/\s/g, '')+""];
}

function channelGenerateName(jeu){
	yourNumber=Math.random()*1000000000;
	hexString = yourNumber.toString(16);
	if(jeu!=undefined){
		return jeu+"-"+hexString.substring(0,2);
	}
	return "race-"+hexString.substring(0,4);
}

function result(msg){
	var currentMatch = match[msg.channel.id];
	if (currentMatch!=null){
		var race_results=printResult(msg,currentMatch);
		if(race_results!=null&&race_results!=""){
			msg.channel.send(""+race_results);
		}
	}
}


function printResult(msg,match){
	if(match.jeu!=undefined){
	var toReturn=match.jeu+"\n```";
	}
	else{
		var toReturn="```"
	}
	//POS - temps - joueur
	toSort = match.players;
	toSort.sort(function (joueura, joueurb){
		return (joueura.result-joueurb.result);
	});
	var i=0;
	toSort.forEach(function(joueur){
		if(joueur.result!=0){
		i++;
		toReturn=toReturn+""+i+". "+msToTime(joueur.result)+" --- "+joueur.name+"\n";
		}
	});
	if(i==0){
		toReturn="";
	}
	else{
		toReturn=toReturn+"```"
	}
	return toReturn;
}

function help(msg){
	msg.reply("!newrace       : starts a race - démarrer une race\n"+
			  "!enter         : join the race - rejoindre la race\n"+
			  "!ready         : you're ready to start ! - vous êtes prêt à partir\n"+
			  "!entrants      : player list - liste des joueurs\n"+
			  "!go            : starts the race (if everybody's ready)\n"+
			  "!done <time>   : you're done - Vous avez fini\n"+
			  "!undone        : if you've done/forfeit by accident\n"+
			  "!forfeit       : you quit the race - vous abandonnez la race\n"+
			  "!result        : display the current results - affiche les résultats du match\n"+
			  "!role <game>   : gives you the game role\n"+
			  "---- race_mods only ----\n"+
			  "!forcego\n"+
			  "!restart\n"+
			  "!notify  : notify all entrants - ping tous les runners\n"+
			  "!forceclose"
	,{code:true});
}

function gamenametostring(id){
	switch(id){
				case 215 : 
		return "Hollow Knight";
		break;
				case 216 : 
		return "Steamworld Dig 2";
		break;
				case 217 : 
		return "Mintroid";
		break;
				case 218 : 
		return "Ghouls'n Ghosts";
		break;
				case 219 : 
		return "Unworthy";
		break;
				case 220 : 
		return "Hamsterball";
		break;
				case 221 : 
		return "Kururin Squash!";
		break;
				case 222 : 
		return "Super Monkey Ball Adventures";
		break;
				case 223 : 
		return "Trials Fusion";
		break;
		case 224 : 
		return "Vectronom";
		break;
	}
}
//cas 1; null
function toupdate(id,ChampionshipGameResults0){
	let currentMatch = JSON.parse(fs.readFileSync('./'+id+'.json'));
	if(ChampionshipGameResults0.submittedTime.stringTime!=currentMatch.submittedTime.stringTime){
	 return true;
	}
	return false;
}

function writegame(id,ChampionshipGameResults0){
	fs.writeFile('./'+id+'.json', JSON.stringify(ChampionshipGameResults0), function (err) {
		if (err) return console.log(err);
	});
}

bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
bot.on("debug", (e) => console.info(e));
  
bot.login(auth.token);
