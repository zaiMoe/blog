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

```shell
ifconfig eth0 # 查看网卡信息
ifconfig eth0 192.168.1.10 # 给网卡配置 ip
ifconfig eth0 192.168.1.10 netmask 255.255.255.0
ifconfig eth0 down/up # 关闭/开启网卡
```

#### ip

```shell
ip route # 查看路由
```

#### ping / telnet

- ping用来查看网络连通性，如 `ping www.baidu.com`
- telnet 确定远程服务是否能访问，如 `telent localhost 22`
