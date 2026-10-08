/* Shows the in-business stamp in the visitor's local time zone. */
(function () {
  var root = document.getElementById("inBusiness");
  var slot = document.getElementById("inBusinessAt");
  if (!root || !slot) return;

  fetch("https://pixel-place-823b1-default-rtdb.firebaseio.com/mainlineHub/inBusinessAt.json")
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (ms) {
      if (typeof ms !== "number" || !isFinite(ms)) return;
      var when = new Date(ms);
      slot.dateTime = when.toISOString();
      slot.textContent = when.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
      });
      root.hidden = false;
    })
    .catch(function () {});
})();
