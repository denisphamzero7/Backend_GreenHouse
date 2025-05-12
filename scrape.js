const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://rau-cu-qua.com/categories/rau-cu');

  // Scrape all article data
  const products = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('article'));
    return articles.map((article, index) => {
      const titleElement = article.querySelector('.entry-title a');
      const imageElement = article.querySelector('.entry-thumb img');

      const title = titleElement ? titleElement.innerText : null;
      const link = titleElement ? titleElement.href : null;
      const image = imageElement ? imageElement.src : null;

      return { index: index + 1, title, link, image }; // Add index to each product
    }).slice(0, 30); // Limit to 30 products
  });

  // Save the result into a JSON file
  fs.writeFileSync('products_with_index.json', JSON.stringify(products, null, 2));

  console.log("Scraping complete, data with index saved to products_with_index.json.");
  await browser.close();
})();
