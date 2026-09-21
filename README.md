# 山野行｜目的地旅行规划平台

一个以国内 3 天短途山野旅行为主题的前端作品集。项目使用 Vue 3、TypeScript、Vite、Tailwind CSS 和 vuedraggable，实现大区选择、景点详情、收藏、多行程管理、三日拖拽规划、预算统计和本地模拟登录。

## 技术栈

- Vue 3 + Composition API + `<script setup lang="ts">`
- TypeScript
- Vite 4
- Tailwind CSS 3
- Vue Router 4
- vuedraggable 4
- lucide-vue-next

## 路由页面

| 路由 | 页面 |
| --- | --- |
| `/` | 首页，沉浸式 Hero 与 4 个大区入口 |
| `/regions` | 目的地浏览页，支持大区、关键词、标签叠加筛选与地图视图 |
| `/planner` | 三日时段拖拽规划页，支持预算、车程、地图和自定义安排 |
| `/login` | 左右分栏登录注册页 |
| `/spot/:id` | 景点详情动态路由 |
| `/my-trip` | 我的行程列表 |
| `/my-trip/:tripId` | 行程只读时间轴与复制导出 |
| `/profile` | 个人中心、收藏管理与账号设置 |
| `/guide` | 高原、徒步、自驾和行李打包指南 |

项目使用 Hash 路由，本地地址示例：

```text
http://localhost:5173/#/regions
http://localhost:5173/#/spot/spot1
http://localhost:5173/#/my-trip
```

## 核心功能

- 4 个旅行大区：川西小环线、桂北阳朔、郴州山野、浙西临安
- 23 个景点 Mock 数据，包含所属大区、经纬度、景点间车程、门票、标签、最佳季节、海拔和游玩时长
- 未登录时限制收藏、创建行程和拖拽保存
- 登录成功后跳回原页面
- 同一大区行程，每天最多安排 4 个景点
- 按上午、下午、傍晚、夜间四个时段拖拽
- 支持跨 Day、同时段和不同时段拖拽排序
- 景点条目与自定义条目完全平等、自由混排
- 自定义条目支持固定模板，也可手动填写名称和时长
- 支持完成勾选、编辑、复制、删除、备注和展开景点贴士
- 支持覆盖推荐时长、手动锁定开始和结束时间
- 每人每天自动汇总景点贴士，并可追加当日备注
- 自动统计门票、食宿费用、每日车程和总车程
- 自动推算到达与结束时间，并提供当日拥挤提醒
- 根据景点间车程提供简易智能排序
- 景点详情和行程规划页提供坐标归一化的简易路线地图
- 多行程新建、删除、只读时间轴和复制文本导出
- 行程导出包含实际时长、车程、备注、景点贴士和当日补充
- 个人中心增加高原、徒步两类装备 Todo 模板
- 收藏景点、修改昵称、退出登录、清除本地数据
- 全站浅色 / 深色主题切换

## 演示账号

```text
用户名：traveller
密码：123456
```

也可以直接在注册页创建新账号。

## 启动项目

依赖目录位于：

```text
D:\software\shan-ye-xing-deps
```

项目根目录的 `.npmrc` 已配置 npm/pnpm 使用该目录，且已加入 `.gitignore`。

```powershell
cd F:\前端项目\山野行
npm run dev
```

使用 pnpm：

```powershell
cd F:\前端项目\山野行
pnpm dev
```

## 构建

```powershell
npm run build
npm run preview
```

构建产物位于 `dist`。

## GitHub Pages

如果部署到仓库子目录：

```powershell
$env:VITE_BASE_PATH="/shan-ye-xing/"; npm run build
```

项目使用 Hash 路由，部署到 GitHub Pages 时不需要额外配置服务端回退规则。

## 图片资源

```text
image/
├─ assets/images/   # 本地景点图片
└─ assets/region/   # 4 张大区封面
```

Vite 的 `publicDir` 指向项目根目录的 `image`，因此页面和 Mock 数据使用以下绝对路径：

```text
/assets/images/*.jpg
/assets/region/*.jpg
```

## localStorage

| 数据 | Key |
| --- | --- |
| 主题模式 | `shanyexing_theme` |
| 演示账号 | `shanyexing_users_demo` |
| 登录状态 | `shanyexing_session` |
| 收藏景点 | `shanyexing_favorites` |
| 行程列表 | `shanyexing_trips` |
| 当前行程 | `shanyexing_active_trip` |
| 当前大区 | `shanyexing_current_region` |

> 该项目仅用于前端演示，密码以明文保存在浏览器 localStorage，生产环境必须使用安全后端、密码哈希与正式鉴权方案。

## 目录结构

```text
山野行/
├─ image/
│  └─ assets/
│     ├─ images/
│     └─ region/
├─ src/
│  ├─ components/
│  │  ├─ HeroSection.vue
│  │  ├─ NavBar.vue
│  │  ├─ PlannerBoard.vue
│  │  ├─ RegionGrid.vue
│  │  ├─ RegionSwitchModal.vue
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
│  │  └─ asset.ts
│  ├─ views/
│  │  ├─ HomeView.vue
│  │  ├─ RegionView.vue
│  │  ├─ PlannerView.vue
│  │  ├─ LoginView.vue
│  │  ├─ SpotDetailView.vue
│  │  ├─ MyTripView.vue
│  │  ├─ TripDetailView.vue
│  │  └─ ProfileView.vue
│  ├─ App.vue
│  └─ main.ts
├─ index.html
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
└─ vite.config.js
```
