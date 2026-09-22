# 山野行｜目的地旅行规划平台

一个面向国内 3 天短途山野旅行的前端作品集项目。用户可以浏览目的地、收藏景点，并按旅行大区规划自己的三日行程。

项目使用 Vue 3、TypeScript、Vite、Tailwind CSS 和 vuedraggable 开发，数据完全由前端 Mock 和 localStorage 模拟，不依赖后端接口。

> 在线演示：[https://guolinghan.github.io/-/](https://guolinghan.github.io/-/)

无需下载代码，直接打开即可体验。项目支持桌面端和移动端，数据保存在浏览器本地。

## 功能概览

- 4 个旅行大区：川西小环线、桂北阳朔、郴州山野、浙西临安
- 景点搜索、大区筛选、类型标签筛选
- 景点详情、分级贴士、地理位置和简易地图
- 收藏、注册、登录和退出登录模拟
- Day1 / Day2 / Day3 行程规划
- 上午、下午、傍晚、夜间四时段拖拽
- 景点条目与自定义条目混排
- 行程条目支持完成、编辑、复制、备注和删除
- 支持覆盖推荐游玩时长
- 支持手动锁定开始与结束时间
- 自定义景点素材和固定快捷安排
- 每日景点贴士汇总和当日备注
- 多行程创建、删除、只读详情和文本导出
- 个人收藏、账号设置和装备 Todo 清单
- 高原、徒步、自驾和行李打包指南
- 基于经纬度的智能路线顺序推荐
- 优化前后路线距离对比和确认弹窗
- 应用推荐顺序后同步重排行程与地图路线
- 浅色 / 深色主题切换
- 桌面、平板和手机响应式布局

## 技术栈

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- Vue Router
- vuedraggable
- lucide-vue-next

## 页面路由

| 路由 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/regions` | 目的地浏览与大区筛选 |
| `/planner` | 三日行程规划 |
| `/login` | 登录与注册 |
| `/spot/:id` | 景点详情 |
| `/my-trip` | 我的行程 |
| `/my-trip/:tripId` | 行程只读详情 |
| `/profile` | 个人中心 |
| `/guide` | 旅行通用指南 |

项目使用 Hash 路由，部署到静态托管平台时不需要配置服务端回退规则。

## 本地运行

```bash
npm install
npm run dev
```

也可以使用 pnpm：

```bash
pnpm install
pnpm dev
```

构建生产版本：

```bash
npm run build
npm run preview
```

构建产物位于 `dist`。

## 演示账号

```text
用户名：traveller
密码：123456
```

也可以直接在注册页面创建本地演示账号。

## 数据与持久化

项目没有后端服务。用户信息、收藏、行程、主题、当前大区、当前行程和装备清单都保存在浏览器 `localStorage`。

主要存储键：

| 数据 | localStorage Key |
| --- | --- |
| 主题模式 | `shanyexing_theme` |
| 演示账号 | `shanyexing_users_demo` |
| 登录状态 | `shanyexing_session` |
| 收藏景点 | `shanyexing_favorites` |
| 行程列表 | `shanyexing_trips` |
| 当前行程 | `shanyexing_active_trip` |
| 当前大区 | `shanyexing_current_region` |

> 该项目仅用于前端演示。登录功能属于本地模拟，密码以明文形式保存在 localStorage，生产环境必须使用安全后端、密码哈希和正式鉴权方案。

## 图片资源

景点图片和大区封面存放在 `image/assets` 目录：

```text
image/
├─ favicon.svg
└─ assets/
   ├─ images/
   └─ region/
```

Vite 的 `publicDir` 指向 `image` 目录，构建时会自动把图片复制到静态产物中。

## 智能路线优化

智能优化顺序基于景点经纬度执行简化 TSP 路径规划：

1. 使用球面距离计算景点之间的空间距离。
2. 使用多起点最近邻算法生成基础路线。
3. 使用 2-opt 局部优化继续缩短路线。
4. 对比优化前后总距离，生成推荐顺序。
5. 用户确认后，将景点按游玩时长重新分配到 Day1-Day3。
6. 自定义条目保留在原 Day 和原时段，不会被删除。
7. 地图路线和行程卡片使用同一份数据，因此会同步更新。

## 静态部署

执行：

```bash
npm run build
```

然后将 `dist` 目录部署到任意静态托管服务，例如 GitHub Pages、Gitee Pages、Netlify 或 Vercel。

项目默认使用相对资源路径，可以部署在网站根目录或子目录。

如果使用 Gitee Pages 或 GitHub Pages 的 `docs` 目录部署，可以执行：

```bash
npm run build -- --outDir docs --emptyOutDir
```

随后在托管平台中选择：

```text
分支：master
目录：docs
```

## 目录结构

```text
├─ docs/                      # 可选的静态部署目录
├─ image/
│  ├─ favicon.svg
│  └─ assets/
│     ├─ images/              # 景点图片
│     └─ region/              # 大区封面
├─ src/
│  ├─ components/
│  │  ├─ HeroSection.vue
│  │  ├─ NavBar.vue
│  │  ├─ PlannerBoard.vue
│  │  ├─ RegionGrid.vue
│  │  ├─ RegionSwitchModal.vue
│  │  ├─ RouteOptimizeModal.vue
│  │  ├─ SimpleRegionMap.vue
│  │  ├─ SpotCard.vue
│  │  └─ ToastMessage.vue
│  ├─ composables/
│  │  └─ useTravelStore.ts
│  ├─ mock/
│  │  └─ destination.ts
│  ├─ router/
│  │  └─ index.ts
│  ├─ styles/
│  │  └─ main.css
│  ├─ types/
│  │  └─ travel.ts
│  ├─ utils/
│  │  ├─ asset.ts
│  │  └─ trip.ts
│  ├─ views/
│  │  ├─ GuideView.vue
│  │  ├─ HomeView.vue
│  │  ├─ LoginView.vue
│  │  ├─ MyTripView.vue
│  │  ├─ PlannerView.vue
│  │  ├─ ProfileView.vue
│  │  ├─ RegionView.vue
│  │  ├─ SpotDetailView.vue
│  │  └─ TripDetailView.vue
│  ├─ App.vue
│  ├─ env.d.ts
│  └─ main.ts
├─ index.html
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
└─ vite.config.js
```
