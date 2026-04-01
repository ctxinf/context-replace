## NOTES
- 使用 `npm run tsc`验证代码是否正确编译
- 然后才能使用 `npm run build:dev`验证代码是否正确运行


要求:
- 追求极致的代码质量,代码整洁程度,  单一职责原则
- 生成的代码应该有清晰适当的注释

## 任务
### 暗黑模式
当前背景色和其他色都是写死的, 但是需要适配背景色
- 使用"dark" class控制, 使用vueuse获取浏览器设置的外观模式, 决定dark
- 对于自定义的颜色, 抽出为tailwind 颜色配置项

## TODO

- [x]  快捷键:  Next/Previous, 复制 
- [x] 规则配置页面, 悬浮式下拉, 而不是扩展元素高度
- [x] 设计: 顶部Icon(text)右下方小字站点名(import.meta.VITE_POWERED_BY_SITE)
- [x] 设计: 顶部Icon右侧留出github link, offline(no internet)说明, download按钮
- [ ] pwa详细配置
- [x] 本地化
- [] ~~支持single html, 添加流程:打包至静态资源目录, 作为下载连接~~
- [x] "?"使用说明, 动态视频
- [x] 配置 剪切板导出 以context-replace:// 开头
- [x] 导入功能, 与兼容版本号
- [ ] ~~实现restore功能, 交互逻辑: replace后, 在任务创建后且有效(左侧input栏目没有变动编辑)时出现restore按钮(在左侧栏), 点击restore按钮,  右侧(是的,复用了)显示restore内容~~
- [ ] ~~重新设计restore功能~~
## current stages
当前是正式实现阶段

遵循 smalls build whole 原则:
1. 极致的单一职责原则
2. 实现的代码都带有详略得当和准确描述的注释
3. 像java/rust一样, 使用合理的目录的文件名,  存放不同职责分工的逻辑

## old stages
### 0
当前是技术验证阶段
遵循指令生成框架和易读易测试的实例

易读:
1. 文件名, 目录结构合理
2. 过程或者关键数据通过log/alert/toast/页面显示出来


易测试:
1. 有一个统一的DEBUG页入口, 里面包含不同测试项的跳转连接
2. 通过环境变量控制DEBUG页, 在正式打包时可以隐藏
3.



## 任务
### 任务12
1. []自动复制 改为localStorage存储
2. debug: 所有tables列表+内容查询
3. 当前规则, 第一次打开较慢, 增加日志供人工排查
### 任务11
> 可以参考Replace.vue(试验版本)
实现主页, 以及功能入口:
1. 左右两列, input框和展示框, 充满整个屏幕(像是markdown编辑器一样)
2. 粘贴内容时自动触发 do replace
3. 主区域自上到下包含 (1)规则配置区, details展开  (2)功能区:两个框 

(1)规则配置区补充细节
- 单独的组件, pinia管理状态和CRUD
- 样式更加正式好用一点, 编辑框是在原本item上展开, 而不是在最上方同时和创建共用一个
- 显示item 不再 Type:xxx Match:xxx Replace:yyy.  而是:  \[type as tag\](markdown code样式, 也是一个单独的组件)  \[match value\]  -> \[target value\]
- 创建的组件 Match type和value应该在一列,在最左边, replace with 在右边
- 初始条件下, 如果没有任何规则,  则生成几条默认实例
- 增加字段"note", 作为规则的名字(可选字段), 在item最左上方
(2)功能区 补充细节
左侧input框上方放置 Replace按钮, (flex父元素 fit width靠左, 留出空间给后续的其他按钮 )
右侧结果框上方左放置复制(复制到剪切板)按钮, 右侧放置"自动复制"勾选框(对应生成后自动复制到剪切板功能)


数据存储
- 数据统一使用opfs sqlite drizzle orm
- 建立新表(注意不能使用'-', 可以使用'_')
- (程序初始化时)页面打开时校验是否已经生成表,  如果没有, 则创建表


其他
- restore功能区暂时不用实现

## 已完成任务
### 任务5
实现replace页面,  左右两栏和若干按钮
左侧: input框 
右侧: 按规则replace后的内容
按钮: do replace的按钮, tests 1~6的按钮点击后输入预设的input内容

规则类型: {match:{type:'regex'|'fixed',value:string}, target:{type:'fixed',value:string}}[]

规则类型定义和替换函数放在单独的.ts文件中
替换函数需要有详细的测试

替换逻辑:
遍历规则,  对输入内容按照match全局匹配, 匹配到的替换为target(高亮)

高亮逻辑:
加上半透明背景色, 背景色取决于规则id的hash

### 任务6
#### 实现restore功能, 在replace的页面内
增加一行左右两栏, 
左侧: input框, 输入大模型响应的内容
右侧: 按历史restore后的内容

#### pre functions:
为replace功能加料, 将匹配的记录保存下来, 如 "世界"(fixed) -> "world"(fixed) 或 "123-45-6789"(^\d{3}-\d{2}-\d{4}$) -> "555-55-5555" 实际出发了替换, 那么记录倒插key-value键值对

#### restore逻辑:
将大模型输出内容中, 将内容替换会原来的内容 ,比如 "555-55-5555"->"123-45-6789"

#### 匹配历史记录 存储和查询:
使用sqlite-drizzle数据库进行CRUD, 表名需要有debug-开头
每次"DO Replace"会创建一个任务(仅在内存中持久存储id,刷新即消失), 替换历史属于该任务

#### 初始化表:
给出单独的"初始化表"按钮执行具体初始化过程

#### mock大模型输出内容功能:
> 单独一个框
根据当前任务的替换历史, 随机生成测试的大模型输出内容, 用以用户复制然后粘贴进入input框进行restore测试
两个按钮, 一个生成中文, 一个生成英文, 
中文模拟生成连续的句子,仅使用 "一"至"四"作为基础字, 比如 replace records: word->世界, 我的->你的.  mock: 一二四世界一二, 三三你的一三
英文也是, 仅使用基础词 "my" "you" "this" "what" "can" "do", 如 replace records: const->let, opencode->claude. mock: what let claude can do. you you my let this.
句子长度随机 len of replace records * (1~5), 保证每个替换记录至少存在一个
