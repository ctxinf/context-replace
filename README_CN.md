<!--# Context Protector ![Context Protector](/public/favicon.ico)-->
<h1 align="center">
  <img src="/public/icon-192.png" alt="icon" width="24" height="24">   Context Protector
</h1>

[English Documentation](./README.md) 


<div align="center" style="display: flex; justify-content: center; align-items: center; gap: 4rem; flex-wrap: nowrap;">
<a href="https://context-replace.ctxinf.com" target="_blank">🌐在线使用</a>
<br/>
<a href="https://vercel.com/new/clone?repository-url=https://github.com/ctxinf/context-replace"><img src="https://vercel.com/button" alt="Deploy with Vercel" style="height: 24px;"></a>
<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/ctxinf/context-replace"><img src="https://camo.githubusercontent.com/aa3de9a0130879a84691a2286f5302105d5f3554c5d0af4e3f2f24174eeeea25/68747470733a2f2f6465706c6f792e776f726b6572732e636c6f7564666c6172652e636f6d2f627574746f6e" alt="Deploy to Cloudflare Workers" style="height: 24px;"></a>
</div>

**一个保护您在使用AI模型时隐私的工具**

**在将内容粘贴到ChatGPT、Claude、Gemini或任何其他AI网站之前，替换您的敏感数据**


## ✨ 为什么选择 Context Protector？

当使用像ChatGPT、Claude或Gemini这样的AI网站时，您经常需要分享可能包含敏感信息的代码片段、日志或文档。Context Protector帮助您替换这些信息。

- 🎯 **精确控制** - 使用正则表达式或精确文本匹配进行完美替换
- 🚀 **提高效率** - 粘贴、替换和复制，只需几秒钟
- 💾 **离线工作** - 一切都是纯页面功能, 无隐私问题

## 🚀 安装和使用

### 🌐 在线使用（推荐）
直接访问 [https://context-replace.ctxinf.com](https://context-replace.ctxinf.com) 即可开始使用 - 无需安装。

### 📱 PWA安装
1. 访问网页应用
2. 点击浏览器地址栏中的"安装"按钮
3. 像原生应用一样使用它，支持离线功能

### 📦 本地部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ctxinf/context-replace)

[![Deploy to Cloudflare Workers](https://camo.githubusercontent.com/aa3de9a0130879a84691a2286f5302105d5f3554c5d0af4e3f2f24174eeeea25/68747470733a2f2f6465706c6f792e776f726b6572732e636c6f7564666c6172652e636f6d2f627574746f6e)](https://deploy.workers.cloudflare.com/?url=https://github.com/ctxinf/context-replace)

**🐳 Docker**
```sh
docker run -d \
  --name context-replace \
  -p 8080:80 \
  --restart unless-stopped \
  ghcr.io/ctxinf/context-replace:latest
```

compose.yml
```yml
services:
  context-replace:
    image: ghcr.io/ctxinf/context-replace:latest
    container_name: context-replace
    ports:
      - "8080:80"
    restart: unless-stopped
```

## 📊 数据存储

Context Protector使用**Origin Private File System (OPFS)**在您的浏览器中本地存储所有数据。

## 🎥 使用演示



## 🛠️ 开发环境设置
```bash
# 克隆仓库
git clone https://github.com/ctxinf/context-replace-web.git
cd context-replace-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```