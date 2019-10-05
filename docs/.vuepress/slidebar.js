/**
 * sidebar - 侧边栏配置
 * 2019/10/5
 */

/**
 * @description 侧边栏可以配置的参数
 * 参考： https://vuepress.vuejs.org/zh/theme/default-theme-config.html#%E4%BE%A7%E8%BE%B9%E6%A0%8F
 * @type {*[
 *  {
 *    title: 侧边栏的名称，必填， eg: test
 *    dirname： 在 /docs/ 中的路径名称， 如 test， test/foo， 必填
 *    collapsable: 是否可以折叠， 默认false（不能收起来）， 非必填
 *    sidebarDepth：使用的子项深度， 默认是1， 非必填
 *    items: [ // 子菜单， 如果当前侧边栏（路径）下有多个菜单， 如test/foo， test/bar都是输入test这个侧边栏， 非必填
 *        {
 *          title: 同上
 *          collapsable： 同上
 *          sidebarDepth： 同上
 *          dirname：相对于父（上级）路径的路径， 如上级路径是test， 当前文件名是foo， 则填写 foo 就可以了
 *        }
 *    ]
 *  }
 * ]}
 *
 * 侧边栏只支持2层， 也就是不要items中又套items
 * @example: [
 {title: 'test1-啊啊啊', dirname: 'test1'},
 {
   title: 'test2',
   dirname: 'test2',
   items: [
     {title: 'test2-1', dirname: '1'},
     {title: 'test2-2', dirname: '2'},
   ]
 },
 {title: 'test3', dirname: 'test3', collapsable: true, sidebarDepth: 2}
 ]
 */
const slideBarMap = [
  {title: 'test1-啊啊啊', dirname: 'test1'},
  {
    title: 'test2',
    dirname: 'test2',
    items: [
      {title: 'test2-1', dirname: '1'},
      {title: 'test2-2', dirname: '2'},
    ]
  },
  {title: 'test3', dirname: 'test3', collapsable: true, sidebarDepth: 2}
];

module.exports = slideBarMap;
