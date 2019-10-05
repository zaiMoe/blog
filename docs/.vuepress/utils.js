/**
 * utils - 公共方法
 * 2019/10/5
 */
const {fs, path} = require('@vuepress/shared-utils');
const sidebar = require('./slidebar');
const nav = require('./nav');

const getAllFile = (dirpath) => {
  return fs
    .readdirSync(dirpath)
    .filter(
      item =>
        item.endsWith('.md') && fs.statSync(path.join(dirpath, item)).isFile()
    )
    .sort((prev, next) => (next.includes('README.md') ? 1 : 0))
    .map(item => item.replace(/(README)?(.md)$/, ''));
};

const getItemsFile = (items, parentDir) => {
  return items.map(({ title, dirname, collapsable = false, sidebarDepth = 1 }) => {

    let filePath = `${parentDir}/${dirname}`;
    let dirpath = path.resolve(__dirname, `../${filePath}`);

    return {
      title,
      children: getAllFile(dirpath).map(value => `/${filePath}/${value}`),
      collapsable,
      sidebarDepth
    }
  })
};

const getSlider = (sidebarMap = []) => {
  const sidebar = {};
  sidebarMap.forEach(({ title, dirname, items, collapsable = false, sidebarDepth = 1 }) => {

    if (!title) {
      console.error('*** title is undefined!!!');
    }

    if (!dirname) {
      console.error('*** dirname is undefined!!!');
    }

    const parent = `/${dirname}/`;

    sidebar[parent] = Array.isArray(items) ?
      getItemsFile(items, dirname) :
      [{
        title,
        children: getAllFile(path.resolve(__dirname, `../${dirname}`)),
        collapsable,
        sidebarDepth
      }];
  });

  return sidebar
};

module.exports = {
  sidebar: getSlider(sidebar),
  nav
};
