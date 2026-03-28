# GitHub的Release包下载需求

## 技术基本要求
1. 使用前端技术栈。
2. 本包支持通过 `bunx` 或 `npx` 直接作为命令行工具使用，无需安装。
3. 也支持通过package.json依赖，调用本包中的类、函数等接口。
4. 允许发布到npm仓库，供公共使用。

## 需求
制定GitHub仓库的链接，下载GitHub Release中的文件，**注意：**指定的是仓库链接而非Release链接，本包需要自动根据仓库链接推导出Release相关链接。

### 参数
1. github url: 必传，github仓库链接。
2. 要下载的版本号: 可选，如果没有传默认下载最新文件。
3. 指定要下载的文件列表：必传，支持glob模糊匹配。例如：
    a. 指定完整文件名：`frida-gadget-17.9.1-android-arm.so.xz`。
    b. 指定模糊匹配的文件名：`frida-gadget-*-android-arm*.so.xz`。
4. github token：可选，如果github仓库是私有的，是不是要指定github token才能下载？如果是的话要支持这个参数。
5. 下载目录: 
    a. 对于命令行直接运行，这个参数可选，不指定的话就是运行命令的目录。
    b. 如果是通过pakcage.json依赖的，这个参数必传。


## 发布相关

```bash
# 模拟发布（检查打包内容、文件大小等）
bun run release:dry

# 正式发布（会自动执行 prepublishOnly 钩子）
npm publish
# 或使用封装命令
bun run release
```

## 测试
使用`https://github.com/frida/frida`这个仓库做测试。测试的中间产物都放到`test/intermediate`目录下，这是为了让项目清爽，这些中间不要提交。