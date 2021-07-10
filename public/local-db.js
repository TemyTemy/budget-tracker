let localdb;
const request = indexedDB.open("budget");

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("transactions", { autoIncrement: true });
};

function saveTransaction(record) {
    const transaction = localdb.transaction(["transactions"], "readwrite");
    const store = transaction.objectStore("transactions");
    store.add(record);
}

request.onsuccess = function (event) {
  localdb = event.target.result;

  if (navigator.onLine) {
    checkLocalDb();
  }
};

function checkLocalDb() {
  const transaction = localdb.transaction(["transactions"], "readwrite");
  const store = transaction.objectStore("transactions");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = localdb.transaction(["transactions"], "readwrite");

          const store = transaction.objectStore("transactions");

          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkLocalDb);