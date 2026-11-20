import type { ExtensionCopy } from "./en";

/** Chinese (Simplified). */
export const zhHans = {
  seo: {
    title: "Gallery Wall Layout Generator Chrome 扩展程序",
    h1: "如何使用 Gallery Wall Layout Generator",
    description:
      "如何使用 Chrome 扩展程序 Gallery Wall Layout Generator：在侧边栏中规划照片墙，或右键点击商店里的海报，按实际尺寸挂到你的墙上看看。",
  },
  crumbs: { home: "首页", hub: "照片墙", page: "Chrome 扩展程序" },
  answer:
    "点击 Chrome 工具栏中的扩展程序按钮，即可打开侧边栏并规划照片墙。在任意商店中，右键点击一张海报并选择“Try on my wall”，就能按实际尺寸把它挂到你的墙上。",
  store: "前往 Chrome 应用商店获取",
  noButton: "看不到按钮？",
  showPin: "查看如何固定",
  pin: {
    title: "将它固定到工具栏",
    text: "Chrome 会把新扩展程序放在拼图按钮后面。点击 Chrome 右上角的拼图图标（1），再点击 Gallery Wall Layout Generator 旁边的图钉（2）。之后它的按钮就会一直显示在工具栏中。",
    picture:
      "Chrome 工具栏：标有 1 的拼图按钮会打开扩展程序菜单，Gallery Wall Layout Generator 旁边的图钉标有 2",
    pinned: "已经固定了？",
    showUsage: "查看使用方法",
  },
  usage: "在侧边栏中可以做什么",
  steps: [
    {
      title: "规划照片墙",
      figure: "示例房间里沙发上方的五个相框",
      text: "从五个模板中选择一个，设置间距并移动相框。示例房间可以直接使用；用自己的墙面照片只需一分钟。",
    },
    {
      title: "试挂商店里的海报",
      figure: "商店海报上的右键菜单，已选择 Try on my wall",
      text: "右键点击一张海报，选择“Try on my wall”，再选择商店标注的尺寸。它会按实际尺寸挂到你的墙上。",
    },
    {
      title: "获取钉子位置",
      figure: "五个相框，每个都有一颗带编号的钉子",
      text: "输入挂钩距离相框上边缘有多远。每颗钉子都会得到一个编号和位置，从同一个角开始测量。",
    },
  ],
  wall: {
    title: "使用你自己的墙",
    text: "正对墙面拍一张照片，然后标出一件你知道尺寸的物品。侧边栏会以它为基准缩放所有内容：",
    items: [
      "墙的宽度",
      "一扇门（在美国高 {door}）",
      "你量过的沙发或床",
      "贴在墙上的 Letter 或 A4 纸",
      "一张信用卡",
    ],
  },
  perm: {
    title: "扩展程序能看到什么",
    rows: [
      {
        dt: "右键菜单",
        dd: "在你右键点击图片时添加“Try on my wall”。",
      },
      {
        dt: "你点击的标签页",
        dd: "在你选择“Try on my wall”时读取该页面一次：图片以及页面文字中的尺寸。不读取该网站上的其他任何内容。",
      },
      {
        dt: "framesizes.app",
        dd: "可以询问扩展程序是否已安装并已固定。不会共享其他任何信息。",
      },
    ],
    tip: "你的墙面照片只保存在这台电脑上。",
  },
  faq: {
    title: "常见问题",
    items: [
      {
        q: "它适用于所有商店吗？",
        a: "适用于任何带有可右键点击图片的页面。如果页面没有标注尺寸，请自行输入宽度和高度。",
      },
      {
        q: "为什么工具栏里没有这个按钮？",
        a: "Chrome 会把新扩展程序放在拼图按钮后面。固定一次后，它就会一直留在工具栏中。",
      },
      {
        q: "它支持哪些浏览器？",
        a: "电脑上的 Chrome 116 或更高版本。它会在 Chrome 的侧边栏中打开。",
      },
    ],
  },
  chrome: {
    extensions: "扩展程序",
    noAccess: "不需要任何访问权限",
    noAccessLines: ["这些扩展程序不需要查看和更改", "此网站上的信息。"],
    manage: "管理扩展程序",
    copyImage: "复制图片",
    inspect: "检查",
  },
} satisfies ExtensionCopy;
