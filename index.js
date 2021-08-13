const DiscordJS = require("discord.js");
const puppeteer = require("puppeteer");
const delay = require('delay');
const client = new DiscordJS.Client({ intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.GUILD_MESSAGES] });

require("dotenv").config();
client.on('ready', async () =>{
    console.log("The bot is ready")
})



client.on('message', message => {
    SplitMsg = message.content.split(' ');
    channelId = message.channelId;
    if(SplitMsg[0] === "/vinted"){
        if(SplitMsg[1]){
            pageUrl = SplitMsg[1]+"&order=newest_first";
            (async () => {
                let last_product_id = null;
              
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
                await page.goto(pageUrl);
              
                
                while(true != false){
                    
                    
                    let display_products = [];
              
              
                    await page.reload(pageUrl);
              
                    let jsonText = await page.evaluate(() => document.querySelector('[data-js-react-on-rails-store="MainStore"]').innerHTML);
                    JSONResponse = await JSON.parse(jsonText);
              
              
                    if(last_product_id === null){
                        display_products = JSONResponse.items.catalogItems.ids;
                     }else{
                        JSONResponse.items.catalogItems.ids.every(itemId => {
                            if(itemId > last_product_id){
                                display_products.push(itemId)
                            }else{
                                return false;
                            }
                            return true;
                        });
                    }
                    if(display_products[0]!= undefined){
                        last_product_id = display_products[0];
                    }
                    
                    last_element = 0;
                    display_products.reverse().forEach(id =>{
                        element = JSONResponse.items.byId[id];
                        let status = element.status;
                        let price = element.price;
                        let size = element.size;
                        let img = element.photos[0].url;
                        let url = element.url;
                        let buyUrl = "https://www.vinted.fr/checkout?transaction_id="+id;
                        let offerUrl = "https://www.vinted.fr/items/"+id+"/want_it/new";
                        let title = element.title;
                        let created_at = new Date(element.created_at_ts).getTime();
                        let user_name = element.user.login;
                        let user_url = element.user.profile_url;

                        const embed = new DiscordJS.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(title)
                            .setURL(url)
                            .setImage(img)
                            .setTimestamp(created_at)
                            .setAuthor(user_name,null, user_url)
                            .setDescription(`[Acheter](${buyUrl}) | [Faire une offre](${offerUrl})`)
                            .addFields(
                                { name: 'Taille', value: size, inline: true },
                                { name: 'Prix', value: price +" €", inline: true },
                                { name: 'Condition', value: status, inline: true },
                            )
                        client.channels.cache.get(channelId).send({ embeds: [embed] });
                    })
              
                    await delay(1000)
                }
            })();
        }
    }
});

client.login(process.env.TOKEN)