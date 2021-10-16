const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addTodoWindow;

// listen to the app to be ready
app.on("ready", () => {
  // create the main window
  mainWindow = new BrowserWindow({
    // change nodeIntegration from false to true
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // load html file into mainWindow
  mainWindow.loadURL(`file://${__dirname}/html-files/main.html`);
  // when mainWindow is closed quit the entire app
  mainWindow.on("closed", () => app.quit());

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  // set application menu
  Menu.setApplicationMenu(mainMenu);
});

// create new add todo window
function createAddTodoWindow() {
  addTodoWindow = new BrowserWindow({
    // change nodeIntegration from false to true
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 300,
    height: 200,
    title: "Add todo",
  });
  addTodoWindow.loadURL(`file://${__dirname}/html-files/add-todo.html`);
  // clear garbage collection when window is closed
  addTodoWindow.on("closed", () => (addTodoWindow = null));
}

// emit an event to clear todos
function clearTodos() {
  mainWindow.webContents.send("clear:todos");
}

// listen to "add:todo" event
ipcMain.on("add:todo", (event, todo) => {
  mainWindow.webContents.send("append:todo", todo);
  addTodoWindow.close();
});

// create menu template
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add item",
        click() {
          createAddTodoWindow();
        },
      },
      {
        label: "Clear items",
        click() {
          clearTodos();
        },
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// unshift an empty object to the menuTemplate when we are on MAC
if (process.platform === "darwin") {
  menuTemplate.unshift({});
}

// push "Toggle Dev Tools" when we are not on production
if (process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "View",
    submenu: [
      { role: "reload" },
      {
        label: "Toggle Dev Tools",
        accelerator:
          process.platform === "darwin" ? "Command+Alt+I" : "Ctrl+Shift+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
    ],
  });
}
