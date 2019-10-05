/**
 * config.js
 * 2019/10/5
 */

const {fs, path} = require('@vuepress/shared-utils');

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
    nav: [
      {text: '首页', link: '/'},
      {text: 'test 1', link: '/test1/'},
      {
        text: 'test 2',
        items: [
          {text: 'menu 1', link: '/test2/'},
          {text: 'menu 2', link: '/test3/'}
        ]
      }
    ],
    sidebar: {
      '/test1/': [{
        title: 'test1',   // 必要的
        path: '/test1/',      // 可选的, 应该是一个绝对路径
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          ''
        ]
      }],
      '/test2/': [
        {
          title: 'test2-1',
          path: '/test2/1/',
          collapsable: false,
          children: [
            '',
            '/test2/1/',
            '/test2/1/t1',
            '/test2/1/remarkpt.md',
          ]
        },
        {
          title: 'test2-2',
          path: '/test2/2/',
          collapsable: false,
          children: [
            '/test2/2/'
          ]
        }
      ],
      '/test3/': [
        {
          title: 'test3',
          path: '/test3/',
          children: [
            ''
          ]
        }
      ]
    }
  }
};
