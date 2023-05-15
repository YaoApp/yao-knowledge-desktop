const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging-over");
  });

  dropzone.addEventListener("dragleave", (event) => {
    dropzone.classList.remove("dragging-over");
  });

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging-over");
    dropzone.classList.add("dragging-pending");

    // 发送文件路径到主进程
    if (event.dataTransfer.items) {
      // 获取文件路径
      const file = event.dataTransfer.items[0].getAsFile();
      const filePath = file.path;
      console.log(filePath);

      // 发送文件路径到主进程
      ipcRenderer.on("drop-file-message", (event, data) => {
        dropzone.classList.remove("dragging-pending");
        console.log(`Received response from main process: ${data}`);
      });

      ipcRenderer.send("drop-file", filePath);
    }
  });
});
