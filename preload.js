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
    text.innerHTML = "处理中...";
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
          setTimeout(() => (text.innerHTML = "拖入文件"), 5000);

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
          text.innerHTML = "处理失败";
          reset();
          return;
        }

        if (data && data.code == 200) {
          text.innerHTML = "处理完成";
          reset();
          return;
        }
      });

      ipcRenderer.send("drop-file", filePath);
    }
  });
});
