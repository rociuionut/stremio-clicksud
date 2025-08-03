
const fetch = require("node-fetch");
const xml2js = require("xml2js");
const cheerio = require("cheerio");

const RSS_URL = "https://clicksud.biz/feed";

async function fetchCatalog() {
  const res = await fetch(RSS_URL);
  const xml = await res.text();
  const data = await xml2js.parseStringPromise(xml);
  const items = data.rss.channel[0].item || [];
  return items.map((item, idx) => ({
    id: `cs-${idx}`,
    type: /episod/i.test(item.category?.[0] || "") ? "series" : "movie",
    name: item.title[0],
    poster: item.enclosure?.[0]?.$.url || null,
    description: item.description[0],
  }));
}

async function fetchStream(id) {
  const index = parseInt(id.split("-")[1], 10);
  const res = await fetch(RSS_URL);
  const xml = await res.text();
  const data = await xml2js.parseStringPromise(xml);
  const item = data.rss.channel[0].item[index];
  if (!item) return null;
  const link = item.link[0];
  const page = await fetch(link);
  const html = await page.text();
  const $ = cheerio.load(html);
  const iframe = $("iframe").attr("src");
  if (!iframe) return null;
  return {
    url: iframe.startsWith("/") ? new URL(iframe, link).href : iframe,
    title: item.title[0],
    subtitles: [],
  };
}

module.exports = { fetchCatalog, fetchStream };
