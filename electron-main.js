const electron = require('electron');
const path = require('path');
const openAboutWindow = require('about-window').default;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

function createWindow() {
  const sizes = electron.screen.getPrimaryDisplay().workAreaSize;
  let menu = [{
    label: 'Main',
    submenu: [{
        label: 'About',
        accelerator: 'Command+A',
        click: () => openAboutWindow({
          icon_path: path.join(__dirname, 'assets/icons/png/64x64.png'),
        })
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => app.quit()
      },
    ]
  }];

  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: Math.floor(sizes.height / 1.5),
    width: Math.floor(sizes.width / 1.5),
    frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
  });

  if (process.env.NODE_ENV === 'development') {
    menu[0].submenu.push({
      label: 'Dev Tools',
      accelerator: 'Command+D',
      click: () => mainWindow.webContents.openDevTools()
    });
  }

  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu));

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/dist/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

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