const GotoClient = require('./structures/GotoClient');
const fs = require('fs');
require('dotenv').config()


fs.writeFile('monitor', '',(err) => {
    if (err) throw err;
});

let client = new GotoClient({
    prefix: '?',
});

client.login(process.env.TOKEN)