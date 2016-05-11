var operatorStatus = {
    _isOnline: true,
    isOnline: function () {
        return this._isOnline;
    },
    setOnline: function (appIcon, mainWindow) {
        if (mainWindow && typeof (mainWindow) != 'undefined') {
            mainWindow.webContents.executeJavaScript("document.getElementById('webView').executeJavaScript(\"$('.chat-my-status-btn-online').click();\")");
        }
        appIcon.setImage(__dirname + '/resources/icons/message.ico');
        this._isOnline = true;
    },
    setOffline: function (appIcon, mainWindow) {
        if (mainWindow && typeof (mainWindow) != 'undefined') {
            mainWindow.webContents.executeJavaScript("document.getElementById('webView').executeJavaScript(\"$('.chat-my-status-btn-offline').click();\")");
        }
        appIcon.setImage(__dirname + '/resources/icons_bw/message.ico');
        this._isOnline = false;
    },
    setOnlineNm: function (appIcon, mainWindow) {
        if (mainWindow && typeof (mainWindow) != 'undefined') {
            mainWindow.webContents.executeJavaScript("document.getElementById('webView').executeJavaScript(\"$('.chat-my-status-btn-online').click();\")");
        }
        appIcon.setImage(__dirname + '/resources/icons/message_n.ico');
        this._isOnline = true;
    },
    setOfflineNm: function (appIcon, mainWindow) {
        if (mainWindow && typeof (mainWindow) != 'undefined') {
            mainWindow.webContents.executeJavaScript("document.getElementById('webView').executeJavaScript(\"$('.chat-my-status-btn-offline').click();\")");
        }
        appIcon.setImage(__dirname + '/resources/icons_bw/message_n.ico');
        this._isOnline = false;
    }
};

module.exports = operatorStatus;
