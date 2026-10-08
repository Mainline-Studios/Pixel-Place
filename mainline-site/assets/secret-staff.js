/* Password gate for /secretstaffonly/. The stamp is a unix time so each visitor renders it locally. */
(function () {
  var PASS = "wakeup2027!";
  var URL = "https://pixel-place-823b1-default-rtdb.firebaseio.com/mainlineHub/inBusinessAt.json";
  var KEY = "ml-secret-staff";
  var gate = document.getElementById("secretGate");
  var tools = document.getElementById("secretTools");
  var error = document.getElementById("secretError");
  var status = document.getElementById("secretStatus");
  var button = document.getElementById("inBusinessBtn");

  function openTools() {
    gate.hidden = true;
    tools.hidden = false;
  }

  try {
    if (sessionStorage.getItem(KEY) === "1") openTools();
  } catch (err) {}

  gate.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = document.getElementById("secretPass").value;
    if (value !== PASS) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
    openTools();
  });

  button.addEventListener("click", function () {
    var at = Date.now();
    button.disabled = true;
    fetch(URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(at)
    }).then(function (res) {
      if (!res.ok) throw new Error("save failed");
      status.hidden = false;
      status.textContent = "saved. the home page will show it in each visitor's time zone.";
    }).catch(function () {
      status.hidden = false;
      status.textContent = "could not save. try again.";
    }).then(function () {
      button.disabled = false;
    });
  });
})();
