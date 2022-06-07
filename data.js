const axios = require("axios");
const cheerio = require("cheerio");



async function scrapeData(url) {
  try {
    const unsortedArray = [];
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const list = $(
      "#post-253 > div > figure:nth-child(21) > table > tbody > tr > td"
    );
    //console.log(list);
    list.each((idx, el) => {
      unsortedArray.push($(el).text());
    });
    const objectKey = unsortedArray.filter(function (value, index, arr) {
      return index < 4;
    });
    objectKey[2] = "Selling";
    objectKey[3] = "Buying";
    for (let index = 0; index < 4; index++) {
      unsortedArray.shift();
    }
    groupedArray = [];
    while (unsortedArray.length) {
      groupedArray.push(unsortedArray.splice(0, 4));
    }
    const currencyConversion = [];
    for (let index = 0; index < groupedArray.length; index++) {
      const objects = {};
      objectKey.forEach((key, i) => (objects[key] = groupedArray[index][i]));
      currencyConversion.push(objects);
    }
    const arrayAsString = [];
    for (let index = 0; index < currencyConversion.length; index++) {
      const objectAsString = `${objectKey[0]}: ${currencyConversion[index].Date} \n ${objectKey[1]} : ${currencyConversion[index].Currency} \n ${objectKey[2]}: ${currencyConversion[index].Selling} \n ${objectKey[3]}: ${currencyConversion[index].Buying} \n`;
      arrayAsString.push(objectAsString);
    }
    const answer = arrayAsString.join("\n");
    return answer;
  } catch (error) {
    console.log(error);
  }
}

exports.scrapeData = scrapeData;



