# mc-sdk-insight #

mc-sdk source code project.

## mc-build 简介

本项目为 [mc-sdk-insight-public](https://gitee.com/lantu/mc-sdk-insight-public) 源代码工程, 负责为 public 工程输出.

请使用 PULL-Request 方式贡献我们的脑洞.


### S. 安装工程 ###

本工程使用 nvm 方式锁定了构建所需node的版本, 尽可能使用 .nvmrc 中的版本号进行构建.  
推荐使用 [nvm](https://github.com/creationix/nvm) .

__安装 yarn__:

https://yarnpkg.com/zh-Hans/      


__安装依赖__:  

请使用 `yarn install`


### L. 常用构建命令 ###

- `npm run dev`

- `npm run prod`

- `npm run deploy` ( 权限控制 )
