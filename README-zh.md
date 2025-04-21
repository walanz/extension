<p align="center">
  <img src="./public/icons/icon-128.png" width="128" height="128" alt="Walanz Logo">
</p>

<h1 align="center">Walanz Extension</h1>

<p align="center">多链以太坊余额查询浏览器扩展</p>

<div align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="#构建与安装">构建与安装</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#许可证">许可证</a>
</div>

---

## 功能特性

- ✅ 多链余额查询：支持查询大量以太坊兼容链上的 ETH 余额
- ✅ 单地址与批量查询：支持单个地址查询或批量地址查询
- ✅ 实时价格转换：自动将 ETH 余额转换为 USD 和 CNY
- ✅ 链选择器：灵活选择需要查询的区块链
- ✅ 直观界面：清晰展示余额和价值总计
- ✅ 区块浏览器链接：方便跳转到区块浏览器查看详情

## 技术栈

- **React**: 用户界面构建
- **TypeScript**: 类型安全的代码库
- **TailwindCSS**: 样式设计
- **React Query**: 数据获取与缓存
- **Vite**: 开发与构建
- **Recharts**: 数据可视化图表

## 开发指南

### 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 开发环境运行

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 环境变量配置

创建 `.env` 文件并设置 API 端点：

```
VITE_API_ENDPOINT=https://walanz.vercel.app
```

## 构建与安装

### 构建扩展

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 安装到 Chrome

1. 打开 Chrome 扩展页面 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录

## 使用指南

1. 点击浏览器工具栏中的 Walanz 图标
2. 输入以太坊地址或批量地址（切换模式按钮）
3. 选择需要查询的区块链
4. 查看余额结果及价值换算

## 许可证

[MIT 许可证](LICENSE) 