const GotoClient = require('./structures/GotoClient');
require('dotenv').config()


let client = new GotoClient({
    prefix: '?',
});

client.login(process.env.TOKEN)