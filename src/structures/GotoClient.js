const { AkairoClient, CommandHandler, InhibitorHandler } = require("discord-akairo");

module.exports = class GotoClient extends AkairoClient {
    constructor(config = {}) {
        super(
            { ownerID: '261170601140420618' },
            {
                allowedMentions: {
                    parse: ['roles','everyone','users'],
                    repliedUser: false
                },
                partials: ['CHANNEL','GUILD_MEMBER','MESSAGE','REACTION','USER'],
                presence: {
                    status: 'online',
                    activities: [
                        {
                            name: 'Pornhub',
                            type: 'STREAMING',
                            url: 'https://www.youtube.com/watch?v=OU0q9frz9zg&t'
                        }
                    ]
                },
                intents: 32767
            }
        );

        this.commandHandler = new CommandHandler(this,{
            allowMention: true,
            prefix: config.prefix,
            defaultCooldown: 2000,
            directory: './src/commands/',
            autoRegisterSlashCommands: true,
            execSlash: true
        })
        this.commandHandler.loadAll();

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './src/inhibitors/'
        });
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.inhibitorHandler.loadAll();
    }
}