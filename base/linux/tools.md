# 一些工具命令

### curl

```shell
curl url # 发出 get 请求
curl -[ilvK] url # -i打印响应头和内容；-l响应头；-v打印全部；-K跳过 ssl 检查
curl -A "xx" url # 设置 户代理标头（User-Agent）
curl -b "a=b" url # 设置 cookie
curl -b a.txt url # 读取文件 a.txt 作为 cookie
curl -c a.txt url # 将服务器设置的 Cookie 写入一个文件，文件格式见 ./shell/cookes.txt
curl -d "login=emma＆password=123" -X POST url # 发送 post 请求 和 数据，请求会自动加上: application/x-www-form-urlencoded
curl -d '@data.txt' https://google.com/login # 读取文件
curl --data-urlencode "login=emma＆password=123" -X POST url # 与 -d 一样，但会对参数进行 url 编码
curl -D filename url # 将响应头写入文件里
curl -e 'https://google.com?q=example' url # 设置 referer
curl -F "file=@a.png" url # 上传 二进制 文件 
curl -H "a: 1" -H "b: 2" url # 设置请求头
curl -o example.html url # 等于 wget，保存为 example.html
```
