var ipcRenderer = require('electron').ipcRenderer;
document.getElementById('webView').addEventListener('new-window', function (e) {
    ipcRenderer.send('newWindow', e.url);
});