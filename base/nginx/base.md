# Nginx

### 基本概念

- 正向代理：代理客户端的
- 反向代理：代理服务端，客户无感知
- 负载均衡：

### 常用命令

```js
nginx -s stop // 停止
nginx -s quit // 安全退出
nginx -s reload // 重新加载配置文件
ps aux | grep nginx // 查看nginx进程
nginx -c xxx/nginx.conf -t // 指定配置启动，-t检查配置是否合法
```

### 负载均衡

```json
http {
    # 设置负载均衡，nginx 会自动检测是否挂了
    upstream www.balance.com {    
        server  127.0.0.1:2140 weight=3;   
        server  127.0.0.1:2142 weight=2;
        server  127.0.0.1:2145 down; # 表示当前的server暂时不参与负载
        server  127.0.0.1:2145 backup; # 其他非backup繁忙时才加入负载
    }

    server {
        # 这个路径要带 / ，不然就应该走上面的部分
        # https://www.jianshu.com/p/b010c9302cd0
        location /balance/ {
         proxy_pass  http://www.balance.com/;
        }
    }
}
```

#### 负载均衡策略

##### 轮询（默认）

交替轮询的访问每个服务器，如果后端服务器down掉，能自动剔除。

场景：用于后端服务器性能均衡的情况，否则会造成轮询堆积

##### 指定权重

指定轮询几率，weight和访问比率成正比

场景：用于后端服务器性能不均的情况。

##### IP绑定 ip_hash

每个请求按访问ip的hash结果分配，这样每个访客固定访问一个后端服务器，可以解决session的问题。

##### fair（第三方）

按后端服务器的响应时间来分配请求，响应时间短的优先分配。

##### url_hash（第三方）

按访问url的hash结果来分配请求，使每个url定向到同一个后端服务器，后端服务器为缓存时比较有效。
