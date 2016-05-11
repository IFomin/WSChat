var eNotify = require('electron-notify');
eNotify.setConfig({
    defaultStyleImage: {
        overflow: 'hidden',
        float: 'left',
        height: 40,
        width: 40,
        marginLeft: 10,
        marginRight: 10
    },
    defaultStyleClose: {
        cursor: 'pointer',
        position: 'absolute',
        top: 1,
        right: 3,
        fontSize: 11,
        color: '#CCC'
    }
});

var ipcController = {
    _ipcMain: false,
    _mainWindow: false,
    _appIcon: false,
    _operatorStatus: false,
    _globalSettings: false,
    _newMessagesCount: 0,
    _timeouts: [],
    init: function (ipcMain, mainWindow, appIcon, operatorStatus, globalSettings) {
        this._ipcMain = ipcMain;
        this._mainWindow = mainWindow;
        this._appIcon = appIcon;
        this._operatorStatus = operatorStatus;
        this._globalSettings = globalSettings;
        if (this._ipcMain && this._mainWindow && this._appIcon && this._operatorStatus) {
            var that = this;
            that._ipcMain.on('setUnreadMessagesInTitle', function (event, newMessages) {
                var count = newMessages.all;
                if (that._mainWindow) {
                    if (count) {
                        var timeout = 1;
                        //если это не мои и не новые сообщения
                        if (!parseInt(newMessages.my) && !parseInt(newMessages.new)) {
                            //то ставим таймер на 5 секунд
                            timeout = 5 * 1000;
                        }
                        that.setTimeout('unread_messages',
                            function(){
                                that._newMessagesCount = count;
                                that._mainWindow.setOverlayIcon(__dirname + '/resources/offline.png', 'changes');
                                if (that._operatorStatus.isOnline()) {
                                    that._operatorStatus.setOnlineNm(that._appIcon);
                                }
                                else {
                                    that._operatorStatus.setOfflineNm(that._appIcon);
                                }
                            },
                            timeout
                        );
                    }
                    else {
                        that.deleteTimeout('unread_messages');
                        that._newMessagesCount = 0;
                        that._mainWindow.setOverlayIcon(null, 'changes');
                        if (that._operatorStatus.isOnline()) {
                            that._operatorStatus.setOnline(that._appIcon);
                        }
                        else {
                            that._operatorStatus.setOffline(that._appIcon);
                        }
                    }
                }
            });

            that._ipcMain.on('resetUnreadMessagesInTitle', function (event) {
                that.deleteTimeout('unread_messages');
                that._newMessagesCount = 0;
                if (that._mainWindow) {
                    that._mainWindow.setOverlayIcon(null, 'changes');
                }
                if (that._operatorStatus && that._appIcon) {
                    if (that._operatorStatus.isOnline()) {
                        that._operatorStatus.setOnline(that._appIcon);
                    }
                    else {
                        that._operatorStatus.setOffline(that._appIcon);
                    }
                }
            });

            that._ipcMain.on('setOperatorStatusOnline', function (event) {
                if (that._mainWindow && that._appIcon && that._operatorStatus) {
                    if (that._newMessagesCount) {
                        that._operatorStatus.setOnlineNm(that._appIcon);
                    }
                    else {
                        that._operatorStatus.setOnline(that._appIcon);
                    }
                }
            });

            that._ipcMain.on('setOperatorStatusOffline', function (event) {
                if (that._mainWindow && that._appIcon && that._operatorStatus) {
                    if (that._newMessagesCount) {
                        that._operatorStatus.setOfflineNm(that._appIcon);
                    }
                    else {
                        that._operatorStatus.setOffline(that._appIcon);
                    }
                }
            });

            //открытие ссылки в новом окне
            that._ipcMain.on('newWindow', function (event, url) {
                require('electron').shell.openExternal(url);
            });

            //оповещение
            that._ipcMain.on('notification', function (event, title, text, icon, id) {
                if (parseInt(that._globalSettings.get('show_notification_on_message'))) {
                    eNotify.notify({
                        title: title,
                        text: text,
                        image: icon,
                        onClickFunc: function(event) {
                            if (that._mainWindow) {
                                if (that._mainWindow.isMinimized()) that._mainWindow.restore();
                                if (!that._mainWindow.isVisible()) that._mainWindow.show();
                                that._mainWindow.focus();
                                if (id && typeof id != 'undefined') {
                                    that._mainWindow.webContents.executeJavaScript("document.getElementById('webView').executeJavaScript(\"viewController.openChat(" + id + ");\")");
                                }
                                else {
                                    that._mainWindow.webContents.executeJavaScript("document.getElementById('webView').executeJavaScript(\"window.location = '/chat/';\")");
                                }
                            }
                            event.closeNotification();
                        }
                    });
                }
                if (parseInt(that._globalSettings.get('show_window_on_message'))) {
                    if (that._mainWindow.isMinimized()) that._mainWindow.restore();
                    if (!that._mainWindow.isVisible()) that._mainWindow.show();
                    that._mainWindow.focus();
                }
            });
        }
    },

    /*Работа с таймерами*/
    initTimeouts: function () {
        if (this.hasOwnProperty('_timeouts') && this._timeouts.length > 0) {
            this.deleteAllTimeouts();
        }
        this._timeouts = [];
    },

    setTimeout: function (name, callback, timeout) {
        if (this._timeouts.hasOwnProperty(name)) {
            this.deleteTimeout(name);
        }
        this._timeouts[name] = setTimeout(callback, timeout);
    },

    getTimeout: function (name) {
        return this._timeouts[name];
    },

    deleteTimeout: function (name) {
        if (typeof this._timeouts[name] !== 'undefined') {
            clearTimeout(this._timeouts[name]);
            delete this._timeouts[name];
        }
    },

    deleteAllTimeouts: function () {
        for (var name in this._timeouts) {
            if (this._timeouts.hasOwnProperty(name)) {
                this.deleteTimeout(name);
            }
        }
    }
}

module.exports = ipcController;
