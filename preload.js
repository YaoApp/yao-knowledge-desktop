const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  let pending = false;
  const dropzone = document.getElementById("dropzone");
  const text = document.getElementById("dropzone-text");

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (pending) {
      return;
    }

    dropzone.classList.add("dragging-over");
  });

  dropzone.addEventListener("dragleave", (event) => {
    if (pending) {
      return;
    }
    dropzone.classList.remove("dragging-over");
  });

  dropzone.addEventListener("drop", (event) => {
    if (pending) {
      return;
    }

    event.preventDefault();
    dropzone.classList.remove("dragging-over");
    dropzone.classList.add("dragging-pending");
    text.innerHTML = `<img class="loading" src="./assets/images/loader.svg" alt="" />`;
    pending = true;

    // 发送文件路径到主进程
    if (event.dataTransfer.items) {
      // 获取文件路径
      const file = event.dataTransfer.items[0].getAsFile();
      const filePath = file.path;

      // 发送文件路径到主进程
      ipcRenderer.on("drop-file-message", (event, data) => {
        dropzone.classList.remove("dragging-pending");
        pending = false;
        console.log(
          `Received response from main process: ${data.code}  ${data.message}`
        );

        const reset = () =>
          setTimeout(
            () =>
              (text.innerHTML = `<img src="./assets/images/upload.svg" alt="" />`),
            5000
          );

        if (data && data.code == 400) {
          text.innerHTML = "不支持的文件类型";
          reset();
          return;
        }

        if (data && data.code == 409) {
          text.innerHTML = "文件已存在";
          reset();
          return;
        }

        if (data && data.code == 500) {
          text.innerHTML = `<img src="./assets/images/error.svg" alt="" />`;
          reset();
          return;
        }

        if (data && data.code == 200) {
          text.innerHTML = `<img src="./assets/images/upload.svg" alt="" />`;
          reset();
          return;
        }
      });

      ipcRenderer.send("drop-file", filePath);
    }
  });
});
