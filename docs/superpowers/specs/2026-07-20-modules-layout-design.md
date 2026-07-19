# Design Spec: 首页三模块布局重构

**Date**: 2026-07-20
**Topic**: 随笔、一言、随机图三个模块的排版设计

## 概述

重构首页上三个模块（随笔、一言、随机图）的布局，采用分层悬浮设计：随机图作为背景层，随笔和一言作为前景悬浮层。

## 目标

1. 统一三个模块的视觉呈现
2. 创造更具层次感和设计感的布局
3. 保持各模块的原有功能不变
4. 不影响页面其他区域

## 布局结构

```
┌─────────────────────────────────────────────────────┐
│  Background: 随机图 (full container)              │
│  (blur 12px + gradient for contrast)               │
│                                                     │
│                                     ┌──────────────┐│
│                                     │   随笔        ││
│                                     │  (panel)     ││
│                                     │              ││
│                                     │  [scroll]    ││
│                                     │              ││
│                                     │              ││
│                                     │              ││
│                                     └──────────────┘│
│                                                     │
│  ┌─────────────────┐                                │
│  │   一言          │                                │
│  │   小卡片        │                                │
│  │   刷新按钮      │                                │
│  └─────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

## 组件规格

### 容器 (ModulesContainer)

新建一个统一容器组件，包裹三个模块。

| 属性 | 值 |
|------|-----|
| 高度 | 400px |
| 宽度 | 100% |
| 边框圆角 | 16px |
| 溢出 | hidden |
| 相对定位 | 是 |

### 背景层 (随机图)

| 属性 | 值 |
|------|-----|
| 定位 | absolute, inset: 0 |
| 图片来源 | `https://api.elaina.cat/random/` |
| 图片尺寸 | object-fit: cover |
| 模糊 | filter: blur(12px) |
| 渐变叠加 | linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6)) |
| 刷新按钮 | top-right, 透明玻璃风格 |

### 随笔面板

| 属性 | 值 |
|------|-----|
| 宽度 | 70% |
| 高度 | 150px |
| 定位 | absolute, top: 80px, right: 40px |
| 玻璃态 | rgba(255,255,255,0.1) + backdrop-blur(20px) |
| 边框 | 1px solid rgba(255,255,255,0.3) |
| 显示条目数 | 3 条 |
| 自动滚动 | 向上循环，每条停留 3s |
| 悬停行为 | 暂停滚动 |

### 一言卡片

| 属性 | 值 |
|------|-----|
| 宽度 | 120px |
| 高度 | 100px |
| 定位 | absolute, bottom: 40px, left: 40px |
| 玻璃态 | 同随笔面板 |
| 字体大小 | 12-14px |
| 文本对齐 | center |
| 刷新按钮 | 居中，保持原交互 |

## 视觉风格

### 玻璃态效果

所有前景组件使用一致的玻璃态风格：

```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 12px;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
```

### 颜色

- 文本：`var(--color-foreground)` 或白色（深色背景区域）
- 悬停高亮：`var(--color-primary)`
- 标签渐变：`linear-gradient(135deg, var(--color-primary), var(--color-accent))`

### 动画

- 随笔滚动：平滑动画，淡入淡出过渡
- 一言刷新：文本淡出 → 替换 → 淡入
- 随机图刷新：图片淡出 → 新图片淡入

## 响应式

### 桌面 (≥1024px)

- 按上述规格呈现完整布局

### 平板 (768px - 1023px)

- 随笔面板宽度：80%
- 一言卡片移至右上角，尺寸略缩小 (100px × 80px)

### 移动 (<768px)

- 容器高度：350px
- 随笔面板：宽度 100%，高度 120px，top: 40px
- 一言卡片：移至底部中央，宽度 80%，高度 80px
- 随机图刷新按钮：右上角，缩小尺寸

## 技术实现

### 新组件结构

```
src/components/astro/
├── ModulesContainer.astro    # 新增：统一容器
├── EssayPanel.astro          # 从 EssayMarquee 改造
├── HitokotoCard.astro        # 从 HitokotoModule 改造
└── RandomImageBackground.astro  # 从 RandomImageModule 改造
```

### 数据来源

- 随笔：`src/content/data/essay.yml`
- 一言：`src/content/data/hitokoto.yml`
- 随机图：API `https://api.elaina.cat/random/`

### 交互保留

- 随笔条目点击跳转 `/essay/`
- 一言刷新按钮
- 随机图刷新按钮

## 国际化

保持现有 i18n 支持，使用 `useTranslations` 获取翻译文本。

## 成功标准

1. 三个模块视觉统一在一个容器内
2. 随笔、一言悬浮在模糊的随机图背景上
3. 所有原有功能正常工作
4. 响应式布局在各断点表现良好
5. 无样式冲突或性能问题