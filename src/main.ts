import "./style.css";

function registerSW() {
  // Register Service Worker (generated automatically by plugin)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
}

registerSW();

let db: IDBDatabase;

const request = indexedDB.open("todo-list", 1);

request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (event) => {
  db = (event.target as IDBOpenDBRequest).result;
  loadTodos();
};

request.onerror = (event) => {
  console.error("Error opening database", event);
};

function loadTodos() {
  const transaction = db.transaction("todos", "readonly");
  const store = transaction.objectStore("todos");
  const request = store.openCursor();

  request.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
    if (cursor) {
      const li = document.createElement("li");
      li.textContent = cursor.value.text;
      todoList.appendChild(li);
      cursor.continue();
    }
  };
}

window.addEventListener("offline", () => alert("You're offline!"));

const todoInput = document.getElementById("todo-input") as HTMLInputElement;
const addTodoButton = document.getElementById(
  "add-todo-button"
) as HTMLButtonElement;
const todoList = document.getElementById("todo-list") as HTMLUListElement;

addTodoButton.addEventListener("click", () => {
  const todo = todoInput.value;
  if (todo) {
    const li = document.createElement("li");
    li.textContent = todo;
    todoList.appendChild(li);
    todoInput.value = "";

    // save to database
    const transaction = db.transaction("todos", "readwrite");
    const store = transaction.objectStore("todos");
    store.add({ text: todo });
  }
});
