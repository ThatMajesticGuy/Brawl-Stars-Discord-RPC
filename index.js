const rpc = require("discord-rpc");
const bot = new rpc.Client({transport:"ipc"});
const chalk = require('chalk')
const config = require('./config.json')

const key = {clientId: "719260341682438194"}
function capital_letter(str) {
    str = str.split(" ");

    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }

    return str.join(" ");
}

async function setActivity() {
	require('node-fetch')(`https://api.brawlstars.com/v1/players/%23${config.tag.replace("#", "")}`, {
	method: "GET",
	headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json'}
	}).then(async res => {
		if (!res.ok) { // If there is some error thats going on
			const e = await res.text()

			if (e.includes(`{"message": "API at maximum capacity, request throttled."}`)) { // If the Brawl Stars API is having some issues
				console.log(chalk.hex("#FFFF00")("Brawl Stars is having a bit of a hiccup right now... Retrying\nIf this issue happens more than once, then please do CTRL + C"))
				setTimeout(function () {
					setActivity()
				}, 4000)
				return;
			}

			else if (e.includes(`{"reason":"accessDenied","message":"Invalid authorization"}`)) { // If the key isnt correct
				console.error(chalk.hex("#FF6347")(`You provided an Invalid Key. Please check if it is correct in the config files.`))
				process.exit()
			}

			else if (e.includes(`{"reason":"accessDenied.invalidIp","message":"Invalid authorization: API key does not allow access from IP`)) { // If the IP isnt correct
				console.error(chalk.hex("#FF6347")(`The API Key does not allow access for your IP.\nPlease check if your IP is correct by going to https://www.whatismyip.com`))
				process.exit()
			}
			else if (e.includes(`{"reason":"notFound"}`)) { // If the tag is invalid
				console.error(chalk.hex("#FF6347")(`That is not a valid Tag! Please check if it is correct!`))
				process.exit()
			}
			else { // If it is an error inside the code
				console.error(chalk.hex("#FF6347")(`Uh oh! There was an error. Please report this in the Issues Page of the Github\n\n${e}`))
				process.exit()
			}
		}

		const body = await res.json()
	  const topBrawler = body.brawlers.sort((a, b) => b.trophies - a.trophies)[0].name.toLowerCase() // Checks who the top brawler is
		// There are some weird names, so I have to manually change them
		if (topBrawler === "mr. p") topBrawler = "mr_p"
		if (topBrawler === "el primo") topBrawler = "el_primo"
		let namedBrawler = capital_letter(topBrawler)

		if (namedBrawler === "El_primo") namedBrawler = "El Primo"
		if (namedBrawler === "8-bit") namedBrawler = "8-Bit"
		if (namedBrawler === "Mr_p") namedBrawler = "Mr. P"

		// Calculate XP
	let xpMax = 40 +10 * (body.expLevel - 1)
		let num = 0
		let i;
	for (i = 0; i < (body.expLevel - 1); i++) {
	num = num + i
	}
	let neededXP = Math.abs((40 * (body.expLevel - 1)) + (10 * num) - body.expPoints)

		bot.setActivity({ // Set the RPC
			details: `🏆 ${body.trophies.toLocaleString()} Trophies\n⭐ Level ${body.expLevel.toLocaleString()} (${neededXP}/${xpMax})`,
			state: `🥊 3v3 Wins - ${body['3vs3Victories'].toLocaleString()} 👤 Solo Wins - ${body.soloVictories.toLocaleString()} 👥 Duo Victories - ${body.duoVictories.toLocaleString()}`,
			largeImageKey: `${body.icon.id}`,
			largeImageText: `Club - ${body.club.name}`,
			smallImageKey: `${topBrawler}`,
			smallImageText: `Top Brawler - ${namedBrawler}`
		}).catch((err)=> {
			if (err.message === "RPC_CONNECTION_TIMEOUT") { // Sometimes it doesnt connect
				console.error(chalk.hex("#FF6347")(`The RPC could not connect to Discord. Please try again later!`))
				process.exit()
			}
		});

	}).catch(err => {
		console.log(err.message) // If theres some error
		process.exit()
	});
}
bot.on("ready",function(){
	if (config.tag === "Put your user tag here") {
		console.log(chalk.hex("#FF6347")("You did not change your tag! Go into the config.json file and provide your tag!\nConfused? Check the GitHub page!"))
		process.exit()
	}
	if (config.key === "Put your Brawl Stars API Key Here") {
		console.log(chalk.hex("#FF6347")("You did not change your API key! Go into the config.json file and provide your API Key!\nConfused? Check the GitHub page!"))
		process.exit()
	}
setActivity()
console.log(chalk.hex("#7CFC00")("Discord RPC is ready!")) // Notify that it si working
setInterval(() => {
    setActivity();
  }, 60000);
});

bot.login(key).catch((err)=> {
	if (err.message === "RPC_CONNECTION_TIMEOUT") {
		console.error(chalk.hex("#FF6347")(`The RPC could not connect to Discord. Please try again later!`)) // Sometimes it doesnt connect
		process.exit()
	}
});
