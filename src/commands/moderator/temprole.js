const { Command } = require('discord-akairo');

class TemproleCommand extends Command {
    constructor() {
        super('temprole', {
            aliases: ['temp-role'],
            description: 'Ajoute un role temporaire',
            args: [
                {
                    id: 'Player',
                    type: 'member',
                    prompt: {
                        retry: 'Le membre est invalide.'
                    }
                },
                {
                    id: 'Role',
                    type: 'role',
                    prompt: {
                        retry: 'Le role est invalide.'
                    }
                },
                {
                    id: 'Time',
                    type: 'integer',
                    prompt: {
                        retry: 'Le temps est invalide.'
                    }
                }
            ]
        });
    }

    exec(message, args) {
        args.Player.roles.add(args.Role)
        message.channel.send(`Le role ${args.Role.name} a été ajouté pendant ${args.Time}s à ${args.Player}`)
        setTimeout(function() {
            args.Player.roles.remove(args.Role)
            message.channel.send(`Le role ${args.Role.name} a été retiré à ${args.Player}`)
        }, args.Time*1000);
    }
}

module.exports = TemproleCommand;