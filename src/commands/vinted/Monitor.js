const { Command } = require('discord-akairo');
const puppeteer = require('puppeteer');
const VintedMonitor = require('../../util/VintedMonitor');

class MonitorCommand extends Command {
    constructor() {
        super('monitor', {
           aliases: ['monitor'],
           args: [
                {
                    id: 'VintedUrl',
                    type: 'url'
                },
                {
                    id: 'WebhookUrl',
                    type: 'url'
                }
            ]
        });
    }

    async exec(message, args) {
        const monitor = new VintedMonitor(args.VintedUrl,args.WebhookUrl.href);
        let monitorMessage = await message.channel.send(`Monitor :\n${args.VintedUrl}`);
        await monitorMessage.react('🟢');
        let started = false;
        const filter = (reaction, user) => reaction.emoji.name === "🔴" || reaction.emoji.name === "🟢";
        let collector = await monitorMessage.createReactionCollector(filter);
        await collector.on('collect', async(reaction, user) => {
            if(user.id != monitorMessage.author.id){
                if(reaction.emoji.name === "🟢"){
                    if(started == false){
                        started = true;
                        await reaction.remove();
                        await monitorMessage.react('🔴');
                        await monitor.start(30000);
                    }else{
                        await reaction.users.remove(user.id)
                    }
                }

                if(reaction.emoji.name === "🔴"){
                    if(started == true){
                        started = false;
                        await reaction.remove();
                        await monitorMessage.react('🟢');
                        await monitor.stop()
                    }else{
                        await reaction.users.remove(user.id)
                    }
                }
            }
        });
            
    }
}

module.exports = MonitorCommand;