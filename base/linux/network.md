# linux 网络相关

### 命令总览

- 网络配置： ifconfig、 ip
- 连通性探测： ping、 traceroute、 telnet、 mtr
- 网络连接： netstat、 ss、 nc、 lsof
- 流量统计： ifstat、 sar、 iftop
- 交换与路由： arp、 arping、 vconfig、 route
- 防火墙： iptables、 ipset
- 域名： host、 nslookup、 dig、 whois
- 抓包： tcpdump
- 虚拟设备： tunctl、 brctl、 ovs

#### ifconfig

```bash
ifconfig eth0 # 查看网卡信息
ifconfig eth0 192.168.1.10 # 给网卡配置 ip
ifconfig eth0 192.168.1.10 netmask 255.255.255.0
ifconfig eth0 down/up # 关闭/开启网卡
```

#### ip

```bash
ip route # 查看路由
```

#### ping / telnet

- ping用来查看网络连通性，如 `ping www.baidu.com`
- telnet 确定远程服务是否能访问，如 `telent localhost 22`

### curl

```bash
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

#### 利用 curl 测试

```bash
curl -o /dev/null -s -w time_namelookup:"\t"%{time_namelookup}"\n"time_connect:"\t\t"%{time_connect}"\n"time_pretransfer:"\t"%{time_pretransfer}"\n"time_starttransfer:"\t"%{time_starttransfer}"\n"time_total:"\t\t"%{time_total}"\n"time_redirect:"\t\t"%{time_redirect}"\n" URL

# or
curl -o /dev/null -s -w "@curl-time"  URL

# @curl-time 为一个文件，格式
\n  
http: \t\t%{http_code}\n  
dns: \t\t\t%{time_namelookup}s\n  
redirect: \t\t%{time_redirect}s\n  
time_connect: \t%{time_connect}s\n  
time_appconnect: \t%{time_appconnect}s\n  
time_pretransfer: \t%{time_pretransfer}s\n  
time_starttransfer: \t%{time_starttransfer}s\n  
size_download: \t%{size_download}bytes\n  
speed_download: \t%{speed_download}B/s\n  
----------\n  
time_total: %{time_total}s\n  
\n 
```
