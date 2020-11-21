const worker = new Worker("./compute.js")
const emit = {};
let i = 0;
worker.addEventListener("message", (event) => {
    const { id, value } = event.data;
    emit[id].resolve(value);
    emit[id] = null;
})

function compute(frist, second) {
    let id = ++i;
    // 因为postMessage不能传递函数所以可以将函数存储在一个全局变量中在接收时在调用
    return new Promise((resolve, reject) => {
        emit[id] = {
            resolve, reject
        };
        worker.postMessage({ id, frist, second });
    })
}