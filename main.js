// adapted from electronjs.org docs
const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  // creates browser window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
    transparent: true,
    frame: false,
  });

  win.loadFile('index.html');

  win.webContents.openDevTools();

  win.on('closed', () => {
    // dereference window obj
    win = null;
  });
}

app.on('ready', () => {
  createWindow();

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
