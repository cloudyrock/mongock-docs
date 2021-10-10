const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItTOC = require('markdown-it-table-of-contents')
const syntaxHighlightPlugin = require('@11ty/eleventy-plugin-syntaxhighlight')
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const headerSlugify = (text) => {
  const cleaned = text.replace(/<\/?code>/g, '').replace(/(&lt;|&gt;|[<>])/g, '')
  return markdownItAnchor.defaults.slugify(cleaned)
}

const sortArray = (a, b) => {
  return (a.order || 0) - (b.order || 0);
};

function makeTittle(title) {
  let newTitle = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  let formattedTitle = newTitle.replace("-", " ")
  return formattedTitle;
}

function processPage(menuItems, menuIndexes, item) {

      const navData = item.data.eleventyNavigation;
      if(navData) {
        const data = item.data;
        const folder = item.url.split("/")[1];
        if(!( typeof menuIndexes[folder] == 'number')) {
          const index = menuItems.length;
          menuIndexes[folder] = index;
          menuItems.push({
            title: makeTittle(folder),
            pages: []
          });
        }

        const index = menuIndexes[folder] ;
        if(navData.root) {
          menuItems[index].url = data.permalink || item.url;
          menuItems[index].description = data.description;
          menuItems[index].order = navData.order;
        } else {
          menuItems[index].pages.push(
            {
              url: data.permalink || item.url,
              title: data.title,
              description: data.description,
              order: navData.order
            }
          )
        }
      }
   }

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlightPlugin)
  eleventyConfig.addPassthroughCopy('site/favicon')
  eleventyConfig.addPassthroughCopy('site/images')
  eleventyConfig.addPassthroughCopy('site/styles')
  eleventyConfig.addPlugin(eleventyNavigationPlugin);


  const markdownEngine = markdownIt({ html: true })

  markdownEngine.use(markdownItAnchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '#',
    slugify: headerSlugify
  })
  markdownEngine.use(markdownItTOC, {
    includeLevel: [2],
    containerHeaderHtml: '<h2>Table of Contents</h2>',
    slugify: headerSlugify
  })

// Added by Dieppa
   eleventyConfig.addCollection("menuItems", collection =>{
   let menuIndexes = {};
   let menuItems = [];
   collection.getAll().forEach(item => processPage(menuItems, menuIndexes, item));
   menuItems.sort(sortArray)
   menuItems.forEach(root => root.pages.sort(sortArray))
   
   console.debug(menuItems[9])
   return menuItems;
 });
     
// End addition


  eleventyConfig.setLibrary('md', markdownEngine)

  return {
    dir: {
      input: 'site',
      output: 'dist'
    }
  }
}
