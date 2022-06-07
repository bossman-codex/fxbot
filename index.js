const { Telegraf } = require("telegraf")
const { scrapeData } = require("./data");
const cron = require('node-cron');
const redis = require('redis');
const axios = require('axios');
const express = require('express');
const app = express();
require("dotenv").config()

const client = redis.createClient({
  url: process.env.REDIS_TLS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
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
cron.schedule('* * *',
      async function () {
           const result = await client.lRange('id', 0, -1)
           const text = await scrapeData(data);
          result.forEach(async(element) => {
               await axios.post(`${url}${Token}/sendMessage`,
                    {
                        chat_id: element,
                        text: text
                    })
            })
    })


bot.start(async (ctx) => {
    const result = await client.lRange('id', 0, -1)
    const chatId = ctx.message.chat.id
    if ((result.includes(chatId.toString()) ) == false) {
           client.lPush('id', `${chatId}`)
        }
})
// bot.command('quit', (ctx) => {
//     const chatId = ctx.message.chat.id
//          client.lRem('id', `${chatId}`)
//          ctx.leaveChat()
// })

bot.launch()

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});