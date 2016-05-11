'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        var spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (error) {
        }

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
};

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

var os = require('os');
var autoUpdater = require('auto-updater');
var platform = os.platform() + '_' + os.arch();
var version = app.getVersion();

//autoUpdater.setFeedURL('http://localhost:3000/update/win32/RELEASES');
//autoUpdater.setFeedURL('http://hz-igor.sharing.lv:5014/update/' + platform + '/' + version);
autoUpdater.setFeedURL('http://download.saas-support.com/update/' + platform + '/' + version);
//autoUpdater.setFeedURL('http://hz-igor.sharing.lv:5014/update/win32_ia32/0.1.0/RELEASES');
autoUpdater.on('update-downloaded', function(){
    autoUpdater.quitAndInstall();
});
autoUpdater.on('error', function (err) {
    console.log(err)
});
autoUpdater.checkForUpdates();

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
//события от браузерного окна
const ipcMain = electron.ipcMain;

const Menu = electron.Menu;
const Tray = electron.Tray;

var appIcon = null;

var languages = require('./languages.js');
var currentLanguages = languages['ru_RU']

const osLocale = require('os-locale');
osLocale(function (err, locale) {
    if (languages[locale]) {
        currentLanguages = languages[locale];
    }
});

var AutoLaunch = require('auto-launch');
var appLauncher = new AutoLaunch({
    name: 'WSChat'
});

var globalSettings = require('./global_settings.js');
if (globalSettings.get('auto_lunch')) {
    appLauncher.enable();
}
var operatorStatus = require('./operator_status.js');

//var serverDomain = "https://whitesaas.com";
//var serverDomain = "http://whitesaas.dev";
var serverDomain = "http://ru.callbackkiller";

var force_quit = false;

// Initialization.
var SpellChecker = require('simple-spellchecker');
var myDictionary = null;

// Load dictionary.
SpellChecker.getDictionary("ru-RU", __dirname + "/dict", function (err, result) {
    if (!err) {
        myDictionary = result;
    }
    else {
        console.log(err)
    }
});

// Define function for consult the dictionary.
ipcMain.on('checkspell', function (event, word) {
    var res = {
        isMisspelled: false,
        suggestions: false
    };
    if (myDictionary != null && word != null) {
        res.isMisspelled = !myDictionary.spellCheck(word);
        if (res.isMisspelled) {
            res.suggestions = myDictionary.getSuggestions(word, 5, 3);
        }
    }
    event.returnValue = res;
});

var mainMenuItems = [
    {
        label: currentLanguages['app_online'],
        click: function () {
            operatorStatus.setOnline(appIcon, mainWindow);
        },
        icon: __dirname + '/resources/online.png'
    },
    {
        label: currentLanguages['app_offline'],
        click: function () {
            operatorStatus.setOffline(appIcon, mainWindow);
        },
        icon: __dirname + '/resources/offline.png'
    },
    {
        type: 'separator'
    },
    {
        type: 'checkbox',
        checked: parseInt(globalSettings.get('auto_lunch')) ? true : false,
        label: currentLanguages['app_auto_lunch'],
        click: function (item) {
            if (item.checked) {
                appLauncher.enable();
                globalSettings.set('auto_lunch', 1);
            }
            else {
                appLauncher.disable();
                globalSettings.set('auto_lunch', 0);
            }
            globalSettings.save();
        }
    },
    {
        type: 'checkbox',
        checked: parseInt(globalSettings.get('always_on_top')) ? true : false,
        label: currentLanguages['app_always_on_top'],
        click: function (item) {
            if (item.checked) {
                globalSettings.set('always_on_top', 1);
                if (mainWindow) {
                    mainWindow.setAlwaysOnTop(true);
                }
            }
            else {
                globalSettings.set('always_on_top', 0);
                mainWindow.setAlwaysOnTop(false);
            }
            globalSettings.save();
        }
    },
    {
        type: 'checkbox',
        checked: parseInt(globalSettings.get('show_notification_on_message')) ? true : false,
        label: currentLanguages['app_show_notification_on_message'],
        click: function (item) {
            if (item.checked) {
                globalSettings.set('show_notification_on_message', 1);
                if (mainWindow) {
                }
            }
            else {
                globalSettings.set('show_notification_on_message', 0);
            }
            globalSettings.save();
        }
    },
    {
        type: 'checkbox',
        checked: parseInt(globalSettings.get('show_window_on_message')) ? true : false,
        label: currentLanguages['app_show_window_on_message'],
        click: function (item) {
            if (item.checked) {
                globalSettings.set('show_window_on_message', 1);
                if (mainWindow) {
                }
            }
            else {
                globalSettings.set('show_window_on_message', 0);
            }
            globalSettings.save();
        }
    },
    {
        type: 'separator'
    },
    {
        label: currentLanguages['app_signout'],
        accelerator: 'CmdOrCtrl+E',
        click: function () {
            if (mainWindow) {
                mainWindow.loadURL(serverDomain + '/signout/');
            }
        }
    },
    {
        label: currentLanguages['app_close'],
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
            force_quit = true;
            app.quit();
        }
    }
];

var menu = Menu.buildFromTemplate([
    {
        label: 'Настройки',
        submenu: mainMenuItems
    }
]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

//делаем так, чтобы можно было открыть только одно окно
var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
    }
});

if (shouldQuit) {
    app.quit();
    return;
}

function createWindow() {
    //Настройка трея
    appIcon = new Tray(__dirname + '/resources/icons/message.ico');
    var contextMenu = Menu.buildFromTemplate(mainMenuItems);
    appIcon.setContextMenu(contextMenu);
    appIcon.setToolTip(currentLanguages['tray_toolTip']);
    appIcon.setTitle(currentLanguages['tray_title']);
    appIcon.on('click', function () {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            if (!mainWindow.isVisible()) mainWindow.show();
            mainWindow.focus();
        }
    });
    appIcon.on('double-click', function () {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            if (!mainWindow.isVisible()) mainWindow.show();
            mainWindow.focus();
        }
    });

    //Установка меню
    Menu.setApplicationMenu(menu);

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: parseInt(globalSettings.get('width')) ? parseInt(globalSettings.get('width')) : 1280,
        height: parseInt(globalSettings.get('height')) ? parseInt(globalSettings.get('height')) : 768,
        title: 'Онлайн чат',
        icon: __dirname + '/resources/icons/64x64.png',
        alwaysOnTop: parseInt(globalSettings.get('always_on_top')) ? true : false,
        autoHideMenuBar: true
    });

    if (parseInt(globalSettings.get('maximize'))) {
        if (mainWindow) {
            mainWindow.maximize();
        }
    }

    // and load the index.html of the app.
    //mainWindow.loadURL('file://' + __dirname + '/resources/index.html');
    //mainWindow.loadURL(serverDomain + '/app/signin/?program=1');
    //mainWindow.loadURL(serverDomain + '/app/signin/?program=1');
    mainWindow.loadURL(serverDomain + '/chat/?program=1&loginhash=a3a300125f0f11f08227be8df6b5bd62');

    //события от браузерного окна
    var ipcController = require('./ipc_controller.js');

    //настройка приема сообщений от рендерера
    ipcController.init(ipcMain, mainWindow, appIcon, operatorStatus, globalSettings);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    //обработка открытия ссылки в новом окне (открываем в браузере)
    var handleRedirect = function (e, url) {
        if (url != mainWindow.webContents.getURL()) {
            e.preventDefault()
            require('electron').shell.openExternal(url);
        }
    }
    //mainWindow.webContents.on('will-navigate', handleRedirect);
    mainWindow.webContents.on('new-window', handleRedirect);

    mainWindow.on('maximize', function (e) {
        globalSettings.set('maximize', 1);
        globalSettings.save();
    });

    mainWindow.on('unmaximize', function (e) {
        globalSettings.set('maximize', 0);
        globalSettings.save();
    });

    mainWindow.on('resize', function (e) {
        var bounds = mainWindow.getBounds();
        globalSettings.set('height', bounds.height);
        globalSettings.set('width', bounds.width);
        globalSettings.save();
    });

    mainWindow.on('close', function (e) {
        if (!force_quit) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should devare the corresponding element.
        mainWindow = null;
        app.quit();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
