const puppeteer = require("puppeteer");
const { MessageEmbed, WebhookClient } = require('discord.js');
const useProxy = require('puppeteer-page-proxy');
const fs = require('fs');
const proxy_check = require('proxy-check');



class VintedMonitor{

    constructor(url,discordWebhook){
        this.url = url+"&order=newest_first";
        this.last_product_id = null;
        this.webhookClient = new WebhookClient({ url: discordWebhook});
        this.proxyList = []


        try {
            const data = fs.readFileSync('proxy.json', 'utf8')
            let proxyList = JSON.parse(data);
            proxyList.forEach(proxyJson =>{
                const proxy = {
                    host: proxyJson.ip,
                    port: proxyJson.port
                  };
                proxy_check(proxy).then(r => {
                    this.proxyList.push(proxy)
                }).catch(e => {
                });
            })
        } catch (err) {
            console.error(err)
        }
    }

    async start(time = 30){
        
        //Lance puppeteer sur vinted
        this.browser = await puppeteer.launch();
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        await page.setRequestInterception(true);
        let countReq = 0;
        page.on('request', async request => {
            countReq++;
            await useProxy(request, this.proxyList[countReq%this.proxyList.length]);
        });
        await page.goto(this.url);
        this.started = true;

        //Boucle pour refresh vinted
        while(true === this.started){
            //Reload vinted
            await page.reload(this.url);
            if(this.started === false) return
            //Reponse vinted en Json dans le tag script qui contient la propriété 'data-js-react-on-rails-store="MainStore"'
            let jsonText = await page.evaluate(() => document.querySelector('[data-js-react-on-rails-store="MainStore"]').innerHTML);
            let JSONResponse = JSON.parse(jsonText);

           /**
            * Si le dernier produit n'exsite pas alors on affiche tout les produits
            * sinon on affiche que les produits avec un id supérieur
            */
            let display_products = [];
            if(this.last_product_id === null){
                display_products = JSONResponse.items.catalogItems.ids;
            }else{
                JSONResponse.items.catalogItems.ids.every(itemId => {
                    if(itemId > this.last_product_id){
                        display_products.push(itemId)
                    }else{
                        return false;
                    }
                    return true;
                });
            }

            if(display_products.length){
                this.last_product_id = display_products[0];
                display_products = display_products.reverse();

                await display_products.forEach(async(id) =>{
                    let element = JSONResponse.items.catalogItems.byId[id];
                    let status = element.status;
                    let price = element.price;
                    let size = element.size ? element.size : "Aucune";
                    let img = element.photos[0].url;
                    let url = element.url;
                    let buyUrl = "https://www.vinted.fr/checkout?transaction_id="+id;
                    let offerUrl = "https://www.vinted.fr/items/"+id+"/want_it/new";
                    let title = element.title;
                    let created_at = new Date(element.created_at_ts).getTime();
                    let user_name = element.user.login;
                    let user_url = element.user.profile_url;
                    const embed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(title)
                        .setURL(url)
                        .setImage(img)
                        .setTimestamp(created_at)
                        .setAuthor(user_name,null, user_url)
                        .setDescription(`[Acheter](${buyUrl}) | [Faire une offre](${offerUrl})`)
                        .addFields(
                            { name: 'Taille', value: size, inline: true },
                            { name: 'Prix', value: price, inline: true },
                            { name: 'Condition', value: status, inline: true }
                        )
                    await this.webhookClient.send({
                        username: 'Vinted',
                        avatarURL: 'https://www.vinted.fr/assets/favicon/default/favicon-32x32-3b949fa03c84fd2869f0fd9344005d5f3ff80c48a295d4f72f44ce3279931c89.png',
                        embeds: [embed],
                    });
                });
            }
            await this.sleep(time);
        };
    }

    async stop(){
        await this.browser.close();
        this.started = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = VintedMonitor;