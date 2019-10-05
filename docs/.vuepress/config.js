/**
 * config.js
 * 2019/10/5
 */

const {sidebar, nav} = require('./utils');

module.exports = {
  evergreen: true,
  base: '/', // 根路径
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'my blog', // 标题
      description: 'c/c++ 嵌入式 linux' // 描述
    }
  },
  plugins: [
    ['@vuepress/back-to-top', true],
    ['@vuepress/medium-zoom', true],
    '@vuepress/nprogress'],
  head: [
    ['link', {rel: 'icon', href: '/logo.png'}] // logo
  ],
  themeConfig: {
    lastUpdated: '上次更新时间', // 显示更新时间
    editLinks: true, // 显示编辑提示
    repo: 'https://github.com/Mulander-J/Wiki1001Pro.git', // blog地址
    repoLabel: 'GitHub', // 提示名称
    nav,
    sidebar
  }
};
