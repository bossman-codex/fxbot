const { Telegraf } = require("telegraf")
const { scrapeData } = require("./data");
const cron = require('node-cron');
const redis = require('redis');
const axios = require('axios');
const express = require('express');
const app = express();
require("dotenv").config()

const client = redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});
const url = process.env.SITE
const Token = process.env.TOKENS
const data = process.env.DATA
client.connect()

client.on('error', function (error) {  
console.log('Error!', error);
})


client.on('connect', function () {  
    console.log('Connected to redis');
})
 

const bot = new Telegraf(Token)

// * 8 * * *
cron.schedule('* 9 * * *',
      async function () {
        const result = await client.lRange('id', 0, -1)
        const text = await scrapeData(data);
        result.forEach(async (element) => {
          try {
             await axios.post(`${url}${Token}/sendMessage`,
          {
              chat_id: element,
              text: text
          })
          }
          catch (error) {
            console.log("blocked user");
          }
           
            })
    })


bot.start(async (ctx) => {
    const result = await client.lRange('id', 0, -1)
    const chatId = ctx.message.chat.id
    if ((result.includes(chatId.toString()) ) == false) {
           client.lPush('id', `${chatId}`)
        }
})

bot.hears(/\/stop/, async (ctx) => {
     const result = await client.lRange('id', 0, -1)
    const chatId = ctx.message.chat.id
    if ((result.includes(chatId.toString()) )) {
           client.lRem('id', 0,  `${chatId}`)
        }
     ctx.reply("Bot stopped, to continue recieving updates, type /start")
})

bot.launch()

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});