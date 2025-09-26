# ICS Calendar Generator (Web版)

一个现代化的Web应用，用于创建和管理日历事件，支持生日提醒和普通事件，可导出标准的ICS文件。

## ✨ 功能特点

- 📅 **可视化界面** - 友好的Web界面，无需编程知识
- 🎂 **生日管理** - 支持阳历和农历生日，自动计算年龄
- 📌 **事件管理** - 创建一次性或重复事件
- ⏰ **灵活提醒** - 支持多个提醒时间（周/天/小时/分钟）
- 🌏 **农历支持** - 准确的农历转换算法（1900-2100年）
- 📱 **跨平台** - 生成的ICS文件兼容所有主流日历应用
- 🧪 **测试覆盖** - 包含完整的单元测试

## 🚀 快速开始

### 前置要求

- [Bun](https://bun.sh/) - 现代化的JavaScript运行时和包管理器

### 安装和运行

```bash
# 进入项目目录
cd ics-calendar-app

# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 访问 http://localhost:5173
```

### 构建生产版本

```bash
bun run build
bun run preview
```

## 📖 使用指南

### 1. 创建日历

打开应用后，首先创建一个新日历：
- 输入日历名称（如"家庭活动日历"）
- 添加描述（可选）
- 选择时区

### 2. 添加生日

点击"🎂 添加生日"标签：
- **姓名**：输入人员姓名
- **日历类型**：选择阳历或农历
  - 阳历：直接选择日期
  - 农历：选择农历月份和日期
- **出生年份**：用于计算年龄
- **提醒设置**：可添加多个提醒时间

### 3. 添加事件

点击"📌 添加事件"标签：
- **事件名称**：如"团队会议"、"健身"等
- **地点**：事件发生地点（可选）
- **时间设置**：
  - 全天事件：不需要具体时间
  - 定时事件：设置开始和结束时间
- **重复设置**：每天/每周/每月/每年

### 4. 生成ICS文件

添加完所有事件后：
1. 设置年份范围（包含过去X年和未来Y年）
2. 点击"生成并下载ICS文件"
3. 文件会自动下载到本地

### 5. 导入到日历应用

- **iPhone/iPad**: 通过邮件发送ICS文件，点击附件导入
- **Android**: 使用Google日历的导入功能
- **Outlook**: 文件 → 打开和导出 → 导入/导出
- **macOS日历**: 文件 → 导入
- **Google Calendar**: 设置 → 导入和导出

## 🧪 运行测试

```bash
# 运行所有测试
bun test

# 监听模式
bun test --watch

# 生成覆盖率报告
bun test --coverage
```

## 🏗️ 项目结构

```
ics-calendar-app/
├── src/
│   ├── components/     # React组件
│   │   ├── CalendarForm.tsx
│   │   ├── BirthdayForm.tsx
│   │   ├── EventForm.tsx
│   │   └── EventList.tsx
│   ├── utils/          # 工具函数
│   │   ├── icsGenerator.ts    # ICS生成器
│   │   ├── lunarConverter.ts  # 农历转换
│   │   └── helpers.ts         # 辅助函数
│   ├── types/          # TypeScript类型定义
│   ├── tests/          # 测试文件
│   └── App.tsx         # 主应用组件
├── public/
├── package.json
└── README.md
```

## 🔧 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **包管理器**: Bun
- **样式**: CSS3
- **测试**: Bun Test

## 📝 ICS文件格式

生成的ICS文件符合RFC5545标准，包含以下信息：

```icalendar
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ICS Calendar Generator//EN
X-WR-CALNAME:家庭活动日历
BEGIN:VEVENT
UID:unique-id
SUMMARY:妈妈生日 (55岁)
DTSTART;VALUE=DATE:20240822
RRULE:FREQ=YEARLY
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT10080M
END:VALARM
END:VEVENT
END:VCALENDAR
```

## 🌟 特色功能

### 农历支持
- 支持1900-2100年的农历日期
- 自动处理闰月
- 准确的农历转阳历算法

### 提醒设置
支持多种提醒时间格式：
- `1w` - 提前1周
- `3d` - 提前3天
- `2h` - 提前2小时
- `30m` - 提前30分钟
- `0` - 事件发生时

### 重复规则
- 每日重复
- 每周重复（可选择星期几）
- 每月重复（可选择日期）
- 每年重复

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可

MIT License

## 🙏 致谢

- 农历算法参考了中国传统历法
- ICS格式遵循RFC5545标准
- UI设计灵感来自现代日历应用