import Product from './interfaces';
const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./tools/replaceTemplate');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((product: Product) =>
  slugify(product.productName, { lower: true })
);

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const server = http.createServer((req: any, res: any) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const cardsHTML = dataObj
      .map((product: Product) => replaceTemplate(tempCard, product))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHTML);
    res.end(output);
  }

  // Product page
  else if (pathname === '/product') {
    const productData = dataObj.find(
      (p: Product) => p.id === parseInt(query.id)
    );
    if (!productData) return '<h1>Product not found</h1>';
    const output = replaceTemplate(tempProduct, productData);
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    res.end(output);
  }

  // API
  else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);
  }

  // Not found
  else {
    res.writeHead('404', {
      'Content-type': 'text/html',
      'my-own-header': 'just trying',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000!');
});
