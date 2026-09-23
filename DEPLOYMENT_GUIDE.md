# 手把手教您部署React项目到阿里云ECS服务器

本指南将**详细、一步步**地教您如何将此React项目部署到阿里云ECS（弹性计算服务）服务器上，适合初学者和需要详细指导的用户。

## 📋 前提条件

在开始之前，请确保您已准备好以下内容：

1. 一个阿里云账号（如果没有，请先[注册阿里云账号](https://account.aliyun.com/register/register.htm)）
2. 本地计算机已安装Node.js和pnpm（如果没有，请参考[Node.js官网](https://nodejs.org/)和[pnpm官网](https://pnpm.io/)进行安装）
3. 本地计算机已安装SSH客户端（Windows 10/11系统可直接使用PowerShell，Mac和Linux系统可直接使用终端）
4. （可选但推荐）已购买域名并完成备案（阿里云域名注册和备案流程可参考[阿里云文档](https://help.aliyun.com/)）

## 🚀 第一步：在阿里云上创建ECS实例

如果您已经有ECS实例，可以跳过此步骤，直接进入第二步。

### 1.1 登录阿里云控制台

- 访问[阿里云官网](https://www.aliyun.com/)
- 点击右上角"登录"，使用您的阿里云账号登录

### 1.2 进入ECS管理控制台

- 登录成功后，将鼠标悬停在顶部导航栏的"产品"上
- 在下拉菜单中选择"弹性计算" -> "云服务器ECS"

### 1.3 创建ECS实例

- 在ECS管理控制台页面，点击左侧菜单栏的"实例"
- 点击右上角的"创建实例"按钮
- 在创建实例页面，按照以下步骤配置：
  - **地域与可用区**：选择离您目标用户最近的地域（例如：华东1（杭州））
  - **实例规格**：对于小型React应用，入门级实例如`t6.small`或`t5.small`已足够
  - **镜像**：选择"公共镜像" -> "Ubuntu 22.04 64位"（推荐使用Ubuntu系统，本教程以此为例）
  - **存储**：系统盘选择"高效云盘"，大小20GB足够
  - **网络与安全组**：
    - 网络：选择默认VPC
    - 公网IP：选择"分配公网IP"
    - 带宽计费方式：选择"按固定带宽"，带宽1Mbps足够
    - 安全组：创建或选择一个安全组，确保已开放80(HTTP)、443(HTTPS)和22(SSH)端口
  - **登录凭证**：选择"自定义密码"，设置root用户密码
  - **实例名称**：输入一个易于识别的实例名称
  - **购买时长**：根据您的需求选择
- 完成上述配置后，点击"立即购买"按钮，按照提示完成支付

### 1.4 获取ECS实例的公网IP

- 购买成功后，返回ECS管理控制台的"实例"页面
- 在实例列表中找到您刚刚创建的实例，复制其"公网IP地址"（后续步骤将使用此IP地址）

## 🔧 第二步：在本地构建React项目

### 2.1 准备项目代码

- 将项目代码下载到本地
- 打开命令行工具（PowerShell、终端等）
- 使用`cd`命令进入项目根目录

### 2.2 安装依赖

在项目根目录运行以下命令安装项目依赖：

```bash
# 使用pnpm安装依赖
pnpm install
```

如果您的系统中没有安装pnpm，可以先安装：

```bash
# 安装pnpm
npm install -g pnpm
```

### 2.3 构建生产版本

安装依赖成功后，运行以下命令构建生产版本：

```bash
# 构建生产版本
pnpm build
```

构建成功后，项目根目录下会生成一个`dist`文件夹，其中包含所有优化后的静态资源文件。

## 🔌 第三步：连接到ECS实例

### 3.1 使用SSH连接到ECS实例

打开命令行工具，运行以下命令连接到您的ECS实例：

```bash
# 替换为您的ECS实例公网IP地址
ssh root@您的ECS实例公网IP地址
```

首次连接时，会提示您确认主机指纹，输入`yes`后按回车键。然后输入您在创建ECS实例时设置的root密码，即可成功连接到ECS实例。

## 🌐 第四步：在ECS实例上安装Nginx

Nginx是一个高性能的Web服务器，我们将使用它来托管React应用。

### 4.1 更新软件包列表

连接到ECS实例后，首先更新Ubuntu的软件包列表：

```bash
# 更新软件包列表
apt update
```

### 4.2 安装Nginx

运行以下命令安装Nginx：

```bash
# 安装Nginx
apt install nginx -y
```

### 4.3 启动Nginx并设置开机自启

安装完成后，启动Nginx服务并设置为开机自启：

```bash
# 启动Nginx服务
systemctl start nginx

# 设置Nginx开机自启
systemctl enable nginx
```

### 4.4 验证Nginx是否正常运行

运行以下命令检查Nginx服务状态：

```bash
# 检查Nginx服务状态
systemctl status nginx
```

如果Nginx正常运行，您将看到"active (running)"的状态。此时，您也可以在本地浏览器中访问ECS实例的公网IP地址，应该能看到Nginx的默认欢迎页面。

## 📤 第五步：将本地构建文件上传到ECS实例

### 5.1 创建网站根目录

在ECS实例上，创建用于存放React应用文件的目录：

```bash
# 创建目录
mkdir -p /var/www/react-app
```

### 5.2 从本地上传构建文件

打开另一个本地命令行窗口，不要关闭已连接到ECS实例的窗口，然后运行以下命令上传`dist`文件夹：

```bash
# 将本地dist文件夹上传到ECS实例
scp -r ./dist root@您的ECS实例公网IP地址:/var/www/react-app/
```

上传过程中，您可能需要输入ECS实例的root密码进行验证。

## ⚙️ 第六步：配置Nginx以托管React应用

### 6.1 创建Nginx配置文件

在ECS实例上，运行以下命令创建Nginx配置文件：

```bash
# 使用nano编辑器创建配置文件
nano /etc/nginx/conf.d/react-app.conf
```

### 6.2 编辑Nginx配置文件

在打开的编辑器中，粘贴以下配置内容（请根据您的实际情况修改`server_name`和`root`字段）：

```nginx
server {
    listen 80;
    # 替换为您的域名或ECS实例公网IP地址
    server_name 您的域名或公网IP地址;

    # 设置网站根目录为上传的dist文件夹路径。
    # ⚠️ 改成你自己的实际路径 —— 线上目前是 /var/www/Company_website/dist，
    #    下面这个只是示例值，照抄会让你指向一个不存在的目录（表现是整站 404）。
    root /var/www/Company_website/dist;
    index index.html;

    # 重要：确保React路由正常工作
    # $uri.html 这一项不能省 —— 预渲染产物是「扁平文件」（dist/product/a1.html、
    # dist/faq.html），而不是 dist/product/a1/index.html。少了 $uri.html 时
    # /product/a1 与 /faq 都会回退到 index.html，预渲染的 SEO 内容、og:image
    # 与 Product/FAQ 结构化数据全部不会被送出，等于白做。
    #
    # 这个坑真踩过：26 个预渲染页上线三周，title 全是首页那句，
    # 页面上看不出任何异常。改完务必用真实 URL 逐个核对 title。
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # ────────────────────────────────────────────────────────────
    # AI 助手反代：密钥在**服务端**注入，前端产物里不含任何 Key
    #
    # 背景：早期版本用 VITE_AI_API_KEY，带 VITE_ 前缀的变量会被 Vite
    # 编译进浏览器 JS，任何人按 F12 就能拿到并盗刷额度。
    # 现在前端只请求同源的 /api-ai/，Authorization 头由 nginx 补上。
    # ────────────────────────────────────────────────────────────
    location /api-ai/ {
        # 密钥放**独立文件**，便于单独设权限（见下方 6.2.1）。
        #
        # ⚠️ 文件后缀必须是 .inc，且**不要**放 /etc/nginx/conf.d/ ——
        #    因为 nginx.conf 里有 `include /etc/nginx/conf.d/*.conf;`，
        #    那是 http 层的 include。一旦叫 .conf 放在那里，它会被全局加载，
        #    等于给**所有** proxy_pass 都挂上这个 Authorization 头，
        #    将来谁加一个反代就把密钥送出去了。
        include /etc/nginx/siliconflow_key.inc;

        proxy_pass https://api.siliconflow.cn/;
        proxy_ssl_server_name on;
        proxy_set_header Host api.siliconflow.cn;
        proxy_set_header Origin https://api.siliconflow.cn;

        # 流式输出（SSE）必须关闭缓冲，否则回答会一次性吐出而不是逐字显示
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;

        # 限流：防止密钥被拿来刷量（需在 http 块定义 limit_req_zone，见 6.2.1）
        limit_req zone=ai_chat burst=5 nodelay;
        # 返回 429 而不是 nginx 默认的 503：前端对 429 有专门的文案
        # （「当前咨询人数较多，请稍等片刻再试」），503 会落进"服务不稳定"那一档，
        # 说的就不是实话了。
        limit_req_status 429;
    }

    # 静态文件缓存设置，提高网站性能
    # 注意包含 webp / mp4 / pdf —— 本站图片约 16MB、视频约 9MB、彩页约 9MB
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|webp|svg|mp4|pdf|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

### 6.2.1 配置 AI 密钥（不要写进前端）

创建密钥文件，并限制为仅 root 可读。

**注意路径：`/etc/nginx/siliconflow_key.inc`**，不是 `conf.d/` 下的 `.conf`——
原因见上面 6.2 里的说明（`conf.d/*.conf` 是 http 层 include，会全局生效）。

```bash
# 写入密钥（把 sk-xxxx 换成你的真实 Key）
printf 'proxy_set_header Authorization "Bearer sk-替换成你的真实Key";\n' \
  > /etc/nginx/siliconflow_key.inc
chmod 600 /etc/nginx/siliconflow_key.inc
```

在 `/etc/nginx/nginx.conf` 的 `http { ... }` 块内加入限流区定义（用于上面的 `limit_req`）。
放在 `conf.d/` 里那个 server 配置文件的**最前面**（server 块之外）也可以 —— 那个文件
本身就是在 http 上下文里被 include 的：

```nginx
# 每个 IP 每秒最多 1 次 AI 请求，突发允许 5 次
limit_req_zone $binary_remote_addr zone=ai_chat:10m rate=1r/s;
```

> **为什么必须这样做**：只要密钥出现在 `VITE_` 前缀的环境变量里，它就会被编译进
> `dist/assets/*.js`，访客打开开发者工具即可提取并盗用你的 API 额度。
> 项目里已提供 `pnpm run doctor` 命令，会自动扫描打包产物中的明文密钥，建议每次发版前执行。

> **已启用 HTTPS 的服务器不要照抄上面整段。** 用 certbot 签过证书的机器上
> 已经有 `listen 443 ssl` 的 server 块，正确做法是在**那个块**里改 `root` 与
> `location /`，并补上 `/api-ai/` 与限流，而不是新粘贴一个 `listen 80` 的块。
> 同时注意 certbot 通常还会有一个 80 端口做 HTTP→HTTPS 跳转的 server 块。
>
> 编辑完先 `nginx -t` 确认语法，再 `systemctl reload nginx`（不要用 restart，
> reload 不中断现有连接）。


编辑完成后，按`Ctrl+O`保存文件，然后按`Ctrl+X`退出编辑器。

### 6.3 检查Nginx配置是否正确

运行以下命令检查Nginx配置是否有语法错误：

```bash
# 检查Nginx配置
nginx -t
```

如果配置正确，您将看到类似以下的输出：

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6.4 重新加载Nginx配置

如果配置检查通过，运行以下命令重新加载Nginx配置：

```bash
# 重新加载Nginx配置
systemctl reload nginx
```

## ✅ 第七步：验证部署结果

现在，打开本地浏览器，访问您配置的域名或ECS实例的公网IP地址，您应该能够看到部署的React应用。

## 🔒 第八步：（推荐）配置HTTPS安全访问

为了提高网站的安全性，建议配置HTTPS。我们可以使用Certbot工具来免费获取和配置SSL证书。

### 8.1 安装Certbot

在ECS实例上，运行以下命令安装Certbot：

```bash
# 安装Certbot和Nginx插件
apt install certbot python3-certbot-nginx -y
```

### 8.2 获取并配置SSL证书

运行以下命令获取并自动配置SSL证书：

```bash
# 运行Certbot，按照提示操作
certbot --nginx
```

在执行过程中，您需要：

1. 输入您的电子邮箱地址（用于接收证书过期提醒）
2. 同意Certbot的服务条款
3. 选择是否共享您的电子邮箱地址（可选）
4. 选择要为其配置HTTPS的域名（如果您在Nginx配置中设置了域名）

完成后，Certbot将自动更新您的Nginx配置以支持HTTPS，并设置证书自动续期。

### 8.3 验证HTTPS配置

配置完成后，再次在浏览器中访问您的网站，现在URL应该以`https://`开头，并且浏览器地址栏会显示安全锁图标。

## 🔄 第九步：更新部署

当您的React项目代码有更新时，需要重新构建并部署到ECS实例：

### 9.1 在本地重新构建项目

```bash
# 在本地项目根目录运行
pnpm build
```

### 9.2 上传更新后的构建文件

```bash
# 将更新后的dist文件夹上传到ECS实例
scp -r ./dist root@您的ECS实例公网IP地址:/var/www/react-app/
```

### 9.3 重新加载Nginx配置

```bash
# 连接到ECS实例后运行
systemctl reload nginx
```

## ❓ 常见问题及解决方案

### 问题1：无法访问网站

**可能原因及解决方法**：

- **安全组未开放端口**：检查ECS实例的安全组规则，确保已开放80(HTTP)和443(HTTPS)端口
- **Nginx服务未运行**：运行`systemctl status nginx`检查Nginx服务状态，如果未运行，运行`systemctl start nginx`启动服务
- **Nginx配置错误**：检查Nginx配置文件是否正确，运行`nginx -t`验证配置
- **防火墙阻止访问**：检查ECS实例的防火墙设置，确保允许80和443端口的访问

### 问题2：网站可以访问，但页面路由不正常

**可能原因及解决方法**：

- **缺少try_files配置**：确保Nginx配置文件中的`location /`块包含`try_files $uri $uri.html $uri/ /index.html;`这一行，这对于React路由至关重要。**注意 `$uri.html` 不能漏**——预渲染产物是扁平文件（`dist/product/a1.html`、`dist/faq.html`），漏掉它会导致预渲染页面永远不被送出

### 问题3：上传文件时出现权限错误

**可能原因及解决方法**：

- **权限不足**：确保您使用的用户（通常是root）有权限访问目标目录，您可以使用`chown`和`chmod`命令修改目录权限

### 问题4：Nginx服务启动失败

**可能原因及解决方法**：

- **端口被占用**：检查80端口是否被其他服务占用，运行`lsof -i :80`查看占用情况
- **配置文件错误**：运行`nginx -t`检查配置文件语法是否正确

## 📝 注意事项

1. **定期备份数据**：建议定期备份您的网站文件和数据库（如果有）
2. **保持系统更新**：定期运行`apt update`和`apt upgrade`命令更新系统软件包
3. **监控服务器性能**：关注ECS实例的CPU、内存和带宽使用情况，根据需要升级实例规格
4. **设置强密码**：确保您的ECS实例使用强密码，并定期更换
5. **配置域名解析**：如果您有域名，请将域名解析到ECS实例的公网IP地址
6. **开启日志监控**：定期检查Nginx日志（`/var/log/nginx/access.log`和`/var/log/nginx/error.log`），以便及时发现和解决问题

恭喜您！您已经成功地将React项目部署到阿里云ECS服务器上。如果您在部署过程中遇到任何问题，请参考上面的常见问题及解决方案，或者查阅[阿里云官方文档](https://help.aliyun.com/)获取更多帮助。