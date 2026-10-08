/* Half of visitors hear Wakeup once. The other half stay silent. */
(function () {
  var KEY = "ml-wakeup-ab";
  var variant;
  try {
    variant = localStorage.getItem(KEY);
  } catch (err) {
    variant = null;
  }
  if (variant !== "music" && variant !== "silent") {
    variant = Math.random() < 0.5 ? "music" : "silent";
    try {
      localStorage.setItem(KEY, variant);
    } catch (err) {}
  }
  if (variant !== "music") return;

  var audio = new Audio("/assets/wakeup.mp3");
  audio.preload = "auto";
  audio.loop = false;

  function showControl() {
    if (document.getElementById("wakeup-play")) return;
    var btn = document.createElement("button");
    btn.id = "wakeup-play";
    btn.type = "button";
    btn.className = "wakeup-play";
    btn.textContent = "play Wakeup";
    btn.addEventListener("click", function () {
      audio.play().then(function () {
        btn.remove();
      }).catch(function () {});
    });
    document.body.appendChild(btn);
  }

  function start() {
    var pending = audio.play();
    if (pending && pending.catch) pending.catch(showControl);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
