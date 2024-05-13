const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const axios = require('axios');
const cheerio = require('cheerio');

const urls = [
   'https://www.google.com/finance/quote/META:NASDAQ',
   'https://www.google.com/finance/quote/COIN:NASDAQ',
   'https://www.google.com/finance/quote/GOOGL:NASDAQ',
   'https://www.google.com/finance/quote/INFY:NYSE',
   'https://www.google.com/finance/quote/INDIANB:NSE',
   'https://www.google.com/finance/quote/INDIACEM:NSE',
   'https://www.google.com/finance/quote/ZOMATO:NSE'
];

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return null;
  }
}

function scrapeData(html) {
  const $ = cheerio.load(html);
  const elementsWithData = [];
  $('.YMlKec.fxKbKc').each((index, element) => {
    elementsWithData.push($(element).text());
  });
  return elementsWithData;
}

async function scrapeAllData() {
  const scrapedData = [];
  for (const url of urls) {
    const html = await fetchData(url);
    if (html) {
      const data = scrapeData(html);
      scrapedData.push({ url, data });
    }
  }
  return scrapedData;
}

app.get('/api/data', async (req, res) => {
  try {
    const data = await scrapeAllData();
    res.json(data);
    console.log('Data sent to /api/data route');
  } catch (error) {
    console.error('Error sending data to /api/data route:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
