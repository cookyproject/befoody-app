BeFoody App
============


# 開發環境設定(只需一次)

1. 安裝 Node.js (LTS)
  * https://nodejs.org/en/
2. 安裝Android SDK: https://developer.android.com/studio/index.html
3. 從github把原始碼 Clone 或者下載回來: https://github.com/cookyproject/befoody-app
4. 打開命令提示字元/終端機，進行以下步驟: (windows 請用管理員權限打開)
        
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

1. 準備一隻android 手機, 並確定已經開啟USB 偵錯功能 ![教學連結](https://www.fonepaw.hk/tutorials/enable-usb-debugging-on-android.html)
2. 打開命令提示字元/終端機，進行以下步驟: (windows 請用管理員權限打開)

  ```
  # cd 到`befoody-app`所在資料夾 (mac)
  $ cd /Users/debbiechen/Documents/befoody

  # cd 到`befoody-app`所在資料夾 (windows)
  $ cd C:\Users\xxxxxxxxxxx\Documents\befoody\befoody-app

  # 初始化專案
  $ npm install
  $ bower install

  # 啟動即時預覽
  $ ionic cordova run android
  
  # 如果要啟用liverelead 模式(須保持連接)
  $ ionic cordova run android --livereload
  ```
3. 如果想透過Debugger及時偵錯, 在電腦端 Chrome 輸入網址:  `chrome://inspect`
4. 想停止預覽: 命令提示字元/終端機按下 `ctrl+c`


