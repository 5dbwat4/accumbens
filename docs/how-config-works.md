# accumbens.config.js 配置说明

本文档描述 `noting/**/accumbens.config.js` 的推荐写法，以及编译器如何处理配置。

## 1. 配置目标

每个 category 用一个 `accumbens.config.js` 描述：

- `subcategories`: 子目录（子 category）
- `entries`: 当前目录下的文档条目

配置是 **JavaScript**，因此你可以用函数、条件、文件扫描等方式动态生成条目。

---

## 2. 字段定义

```js
export default {
  name: "展示名",
  show: true,
  path: "可选，默认=当前文件夹相对路径",
  subcategories: ["./A", "./B"],
  entries: "auto",
  index: "index.md"
}
```

### `name`

- 类型：`string`
- 作用：前端展示名称

### `show`

- 类型：`boolean`
- 默认：`true`
- 作用：是否在 `dirList` / 目录导航中可访问

### `path`

- 类型：`string`（可选）
- 默认：当前 category 在 `noting` 下的真实相对路径
- 说明：不再使用 `aliases/default` 等扩展结构；默认即文件结构路径

### `subcategories`

- 类型：`string[]` 或返回 `string[]` 的函数
- 含义：当前 category 的子目录列表（相对当前目录）
- 例子：

```js
subcategories: ["./CTF", "./Quant"]
```

也可动态生成：

```js
subcategories: ({ fs, categoryDirAbs }) => {
  return fs
    .readdirSync(categoryDirAbs)
    .filter((name) => fs.existsSync(`${categoryDirAbs}/${name}/accumbens.config.js`))
    .map((name) => `./${name}`)
}
```

### `entries`

- 类型：
  - `"auto"`
  - `string[]`
  - `Object[]`
  - 或返回上述类型的函数
- 含义：当前 category 的文件条目

`"auto"`：自动收集当前目录下 `.md/.mdx`

`string[]`：

```js
entries: ["index.md", "intro.mdx"]
```

`Object[]`（常用字段）：

```js
entries: [
  { file: "index.md", path: "index", pathonly: true },
  { file: "lec4.mdx", title: "Lecture 4" }
]
```

对象字段说明：

- `file`: 文件名（必填）
- `title`: 覆盖 frontmatter 标题
- `updatedAt`: 覆盖更新时间
- `path`: URL 末段（默认=文件名去扩展名）
- `pathonly`: 是否只作为路径入口（不显示在列表）

### `index`

- 类型：`string` 或返回 `string` 的函数
- 含义：目录页索引项，可用 `index.md` / `index.mdx` / 条目 path / unikey

---

## 3. 函数式配置上下文

当 `subcategories`、`entries`、`index` 是函数时，会收到上下文：

- `mode`: `development` / `production`
- `includeContentHash`: 当前是否写入内容 SHA256
- `categoryDirAbs`: 当前 category 绝对路径
- `categoryDir`: 当前 category 相对 `noting` 路径
- `projectRoot`, `notingRootAbs`
- `fs`, `path`

这使你可以做：

- 按环境筛选条目
- 从外部表生成条目
- 批量过滤草稿文件

---

## 4. unikey 与 SHA256 策略

- `unikey`：基于 **真实相对路径** 的 SHA256（稳定，不随内容改动）
- `sha256`：仅在 `production` 默认写入（内容哈希）

这样做的好处：

- 开发期改内容不会让 key 频繁变化，HMR 更稳定
- 生产产物保留内容哈希用于更新判断

---

## 5. entry bucket 分块策略

编译器会把 entry import map 拆成多个 bucket：

- 每个 bucket 最多 `256` 个 entries（可通过编译选项改）
- 优先按 category 聚合，尽量把同一 category 放在同一个 bucket
- 若某个 category 超过上限，再对该 category 顺序切分

---

## 6. 迁移建议

建议把旧的 `path: { default, aliases }` 迁移为简单字符串或省略：

- 旧：

```js
path: { default: true, aliases: ["CTF"] }
```

- 新：

```js
// 默认路径即可，通常可省略 path
path: "CS/CTF"
```

如果没有特殊需求，直接省略 `path`，使用默认真实目录路径即可。
