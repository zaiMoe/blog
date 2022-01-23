# web安全
- xss
- csrf
- 外链跳转
- 流量劫持
- 不被iframe嵌入：window.top != self

#### XSS
> 跨站脚本攻击，为了不和css重复所以叫xss。

##### 类型
- 存储型：放在数据库中，等页面请求时拼接html返回，在模板引擎中容易发生
- 反射型：后台从请求的URL中获取数据，然后拼接HTML返回
- DOM型：js获取URL中的数据然后导致代码被执行，完全在前端

##### 防御
1. 特殊字符过滤、校验，恶意代码不会进行数据库，也不会执行
2. 使用csp（内容安全策略）它的本质是建立一个白名单，告诉浏览器哪些外部资源可以加载和执行。可以设置`Content-Security-Policy`来开启和设置响应的规则。
3. cookie使用`http-only`

#### CSRF
> 跨站请求伪造攻击，攻击者诱导用户进入一个第三方网站，然后该网站向被攻击网站发送跨站请求。

本质是利用了 cookie 会在同源请求中携带发送给服务器的特点（用户的登录状态来实施攻击）

注意：
1. ajax请求是不能跨域的，所以无法获取存储在页面中token
##### 类型
- GET 类型的 CSRF 攻击，比如在网站中的一个 img 标签里构建一个请求，当用户打开这个网站的时候就会自动发起提交。
- POST 类型的 CSRF 攻击，比如说构建一个表单，然后隐藏它，当用户进入页面时，自动提交这个表单。
- 链接类型的 CSRF 攻击，比如说在 a 标签的 href 属性里构建一个请求，然后诱导用户去点击。

##### 防御
###### 1. 同源检测
通过请求头中 origin 或者 referer 来判断站点来源。
- 缺点是 referer 可以被伪造
- Origin 有时候不一定会带上

###### 2. CSRF Token
服务器向用户返回一个随机的token，每次请求都带上这个token。

###### 3. 双重cookie认证
1. 向服务器发送请求的时候，将cookie中的随机token带上
2. 在发起请求时，顺便在请求中其他位置带上`CSRF Token`（header、url等）

###### 4. 设置Samesite
该方式能让cookie不允许被第三方使用，
chrome从80开始，默认屏蔽了第三方的cookie

#### 外链跳转
通过`window.open`或者`a`标签打开的第三方页面，可能会造成攻击，如钓鱼网站。

所以：
1. `a`标签需要加上`rel="noopener noreferrer"`
2. `window.open`则要`newWnd.opener = null;newWnd.location = url;`

#### 流量劫持
1. 上https、包括http
2. 子资源完整性(SRI) - Subresource Integrity
```
<script src="https://example.com/example-framework.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```