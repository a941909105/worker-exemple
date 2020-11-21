## 介绍
JavaScript 属于单线程环境,无论你运行多少脚本生成多少事件 亦或者使用setTimeout(),setInterval(),Promise()这类异步函数都在一个线程中去运行的.
但在HTML5的新规范中为我们引入了线程技术Web Worker在实现多线程的基础上并建立的线程消息来实现并行传递.
## 快速入门

```
// compute.js
self.addEventListener("message",(event)=>{
  let {frist,second} = event.data
  self.postMessage(frist+second)
  console.log(event.data)
})
```

```
// index.js
const worker = new Worker("compute.js")
worker.addEventListener("message",(event)=>{
  console.log("compute result:" + event.data)
})

worker.postMessage({frist:1,second:2})
```
在html中引入
```
// index.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="index.js"></script>
</head>
<body>
    
</body>
</html>


// 输出结果
{
  frist: 1,
  second: 2
}
compute result:3
```
简单的使用Web Worker后,可以改良下将它设置为同步
```
// index.js
const worker = new Worker("./compute.js")
const emit = {}; // 加入一个全局对象存放监听方法
let i = 0; // 加入一个全局i充当id

function compute(frist, second) {
    let id = ++i;
    // 因为postMessage不能传递函数所以可以将函数存储在一个全局变量中在接收时在调用
    return new Promise((resolve, reject) => {
        // 将resolve,reject 存储到全局变量中
        emit[id] = {
            resolve, reject
        };
        worker.postMessage({ id, frist, second });
    })
}

worker.addEventListener("message", (event) => {
    const { id, value } = event.data;
    emit[id].resolve(value);
    emit[id] = null;
})

```

```
// compute.js
self.addEventListener("message", (event) => {
    let { frist, second, id } = event.data;
    // 将拿到的id在回显
    self.postMessage({ id, value: frist + second });
})

```
```
// index.htm

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="index.js"></script>
    <script>
        compute(3,5).then(res=>{
            console.log(`3+5=${res}`);
        })
        compute(10,5).then(res=>{
            console.log(`10+5=${res}`);
        })
        compute(3,15).then(res=>{
            console.log(`3+15=${res}`);
        })
    </script>
</head>
<body>
    
</body>

</html>

最后输出的结果为:
3+5=8
10+5=15
3+15=18
```
[GitHub项目地址](https://github.com/a941909105/worker-exemple)

## 如何在Electron中使用 web worker
首先需要安装 worker-loader `yarn add worker-loader -D & npm install worker-loader -D`
再在webpack.config.js中装载loader
> vue 的话在vue.config.js 中装载
```
                {
                    test: /\.worker\.js$/,
                    use: [{
                        loader: 'worker-loader',
                        options: { inline: true, fallback: false }
                    }],
                }
```
具体worker-loader配置可以参考[webpack](https://www.webpackjs.com/loaders/worker-loader/)
再Electron的入门中设置`nodeIntegrationInWorker`:`true`
```
new BrowserWindow({
  webPreferences{
   nodeIntegrationInWorker:true
  }

})
```
### 使用方式
```
import Worker1 form 'worker-loader!./compute.js'
const worker = new Worker1()
...
```
在浏览器中会显示引入了一个 `compute.worker.js`的文件