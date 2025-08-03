
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const parser = require("./parser");

const builder = new addonBuilder({
  id: "biz.clicksud.addon",
  version: "1.0.0",
  name: "ClickSud",
  description: "Catalog și stream pentru ClickSud.biz",
  resources: ["catalog", "stream"],
  types: ["movie", "series"],
  idPrefixes: ["cs"],
});

builder.defineCatalogHandler(async () => {
  const metas = await parser.fetchCatalog();
  return { metas };
});

builder.defineStreamHandler(async ({ id }) => {
  const stream = await parser.fetchStream(id);
  return { streams: stream ? [stream] : [] };
});

serveHTTP(builder.getInterface(), {
  port: process.env.PORT || 7000,
});
