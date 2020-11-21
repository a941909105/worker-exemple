self.addEventListener("message", (event) => {
    let { frist, second, id } = event.data;
    self.postMessage({ id, value: frist + second });
})