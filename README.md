# The Crawler
1. `npm run crawler-live` if it's the first time you're crawling the page. It's also a good idea to run it when you think their page has been updated, for example, with new products. This will fetch their HTMLs and save them locally.
2. `npm run crawler-offline` and this will use the locally saved files in order to save bandwidth and process the files faster. It's very useful when debugging (: