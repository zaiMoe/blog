/**
 * nav 顶部导航栏配置
 * 2019/10/5
 */

/**
 *  @description 导航栏可以配置的参数
 *  参考： https://vuepress.vuejs.org/zh/theme/default-theme-config.html#%E5%AF%BC%E8%88%AA%E6%A0%8F
 * @type {*[
 *  text: 文案 必填
 *  link：路径， 如 /test/foo， 必填； 注意， 这个也可以直接填连接， 如 https://www.baidu.com
 *  items: [] // 配置了就变成下拉菜单式的导航栏
 * ]}
 * eg: [
 {text: '首页', link: '/'},
 {text: 'test 1', link: '/test1/'},
 {
   text: 'test 2',
   items: [
     {text: 'menu 1', link: '/test2/'},
     {text: 'menu 2', link: '/test3/'},
     {text: 'menu 3', link: 'www.baidu.com'}
   ]
 }
 ]
 */
const nav = [
  {text: '首页', link: '/'},
  {text: 'test 1', link: '/test1/'},
  {
    text: 'test 2',
    items: [
      {text: 'menu 1', link: '/test2/'},
      {text: 'menu 2', link: '/test3/'},
      {text: 'menu 3', link: 'https://www.baidu.com'}
    ]
  }
];

module.exports = nav;
