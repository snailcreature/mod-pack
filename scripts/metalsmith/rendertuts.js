const cwd = process.cwd();

const writeTuts = (mpOutputDir) => {
  const Handlebars = require('handlebars');

  Handlebars.registerPartial('footer', require('./partials/footer.hbs'));
  Handlebars.registerPartial('header', require('./partials/header.hbs'));
  Handlebars.registerPartial('meta', require('./partials/meta.hbs'));
  Handlebars.registerPartial('navmain', require('./partials/navmain.hbs'));
  Handlebars.registerPartial('navsub', require('./partials/navsub.hbs'));
  Handlebars.registerPartial('pagelist', require('./partials/pagelist.hbs'));

  const Metalsmith = require('metalsmith');
  const layouts = require('@metalsmith/layouts');
  const markdown = require('@metalsmith/markdown');
  const collections = require('@metalsmith/collections');
  const permalinks = require('@metalsmith/permalinks');
  const sitemap = require('metalsmith-mapsite');
  const moremeta = require('./lib/moremeta');
  const sass = require('@metalsmith/sass');

  Metalsmith(__dirname)
  .source(cwd+'/tutorials')
  .destination(`${cwd}/out/${mpOutputDir}/tutorials`)
  .clean(true)
  .use(collections({
    page: {
      pattern: '**/index.*',
      reverse: true,
      refer: false,
      metadata: {
        layout: 'default.hbs'
      }
    },
    tutorial: {
      pattern: 'tutorials/**/*',
      metadata: {
        reverse: true,
        refer: true,
        layout: 'default.hbs'
      }
    }
  }))
  .use(markdown())
  .use(permalinks())
  .use(moremeta())
  .use(sass({
    entries: {
      'lib/styles.scss': 'css/styles.css'
    }
  }))
  .use(layouts())
  .use(sitemap({
    hostname: 'localhost:8080'
  }))
  .build((err) => {
    if (err) throw err;
  });
}

module.exports = {
  writeTuts
}