BeFoody App
============


# 開發環境設定(只需一次)

1. 安裝 Node.js (LTS)
  * https://nodejs.org/en/
2. 從github把原始碼下載回來: https://github.com/cooky-project/befoody-app
3. 打開命令提示字元/終端機，進行以下步驟: (windows 請用管理員權限打開)
        
  ```
  # 安裝ionic,bower...等相關套件 (mac)
  $ sudo npm install -g ionic cordova bower

  # 安裝ionic,bower...等相關套件 (windows)
  $ npm install -g ionic cordova bower

  # cd 到`befoody-app`所在資料夾 (mac)
  $ cd /Users/debbiechen/Documents/befoody

  # cd 到`befoody-app`所在資料夾 (windows)
  $ cd C:\Users\xxxxxxxxxxx\Documents\befoody\befoody-app

  # 初始化專案
  $ npm install
  $ bower install
  ```

# 開始開發並即時預覽成果(每次開發時都做)

1. 打開命令提示字元/終端機，進行以下步驟: (windows 請用管理員權限打開)

  ```
  # cd 到`befoody-app`所在資料夾 (mac)
  $ cd /Users/debbiechen/Documents/befoody

  # cd 到`befoody-app`所在資料夾 (windows)
  $ cd C:\Users\xxxxxxxxxxx\Documents\befoody\befoody-app

  # 初始化專案
  $ npm install
  $ bower install

  # 啟動即時預覽
  $ ionic serve
  ```

2. 想停止預覽: 命令提示字元/終端機按下 `ctrl+c`

> 建議安裝chrome 做為預設瀏覽器來預覽


# 把app放到實體手機上執行

...
