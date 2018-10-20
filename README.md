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

  # 啟動
  $ ionic cordova run android
  
  # 如果要啟用liverelead 模式(須保持連接)
  $ ionic cordova run android --livereload
  ```
3. 如果想透過Debugger及時偵錯, 在電腦端 Chrome 輸入網址:  `chrome://inspect`
4. 想停止預覽: 命令提示字元/終端機按下 `ctrl+c`

# JavaScript 抓取 Firebase  資料範例

* 假設某用戶的編號是`USER_ID`, 則以下方式可以抓到其正在追蹤的用戶:
  * `ref`放的是資料路徑
  * `once('value')` 指的是監聽抓取資料的事件
  * 事件一但抓取成功，`then(...)` 裡面的function就會被觸發，而 `allFriendSnap` 就是抓回的資料
```javascript
firebase.database().ref('users/' + USER_ID + '/friends').once('value').then(function (allFriendSnap) {

  // allFriendSnap 變數就是被追蹤用戶的集合

});
```
* 假設某用戶的編號是`USER_ID`, 則以下方式可以抓到其寫過的文章:
```javascript
firebase.database().ref("posts").orderByChild('authorUid').equalTo(USER_ID).once("value").then(function(postsSnap){

  // postsSnap 變數就是文章集合

});
```

* 新增一篇文章，假設作者編號是 `USER_ID`:

```javascript
var post = {
  authorUid: USER_ID,
  placeName: '餐廳名稱',
  photos: {
    0: { 
      url: '第1張照片URL',
      description: '第1張照片描述'
    },
    1: { 
      url: '第 2 張照片URL',
      description: '第 2 張照片描述'
    }
  },
  placeId: '餐廳的 Google 位置代號',
  items: {
    0: {
      name: '第 1 道菜名',
      price: 100,
    },
    1: {
      name: '第 2 道菜名',
      price: 200,
    },
  }
};
firebase.database().ref('posts').push(post).then(function (result) {
  // 處理儲存成功後的事情... ex. 返回文章列表
});
```

