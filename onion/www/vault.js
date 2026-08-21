(function () {
  var addr = document.getElementById('addr');
  addr.textContent = location.hostname || '2nnrmifdnwtijyd7pr26c6kuuqzlon25tt2dimxv2h6hnrmbkdniwbid.onion';

  var leaks = [
    'CONFIRMED: Studio tab writing a goodbye letter in Comic Sans (denied).',
    'CONFIRMED: Gym Pump engine last seen in a zip named final_final_REAL.',
    'CONFIRMED: HistoriMac Balloon Help knows what you did in Game Studio.',
    'CONFIRMED: Helios once continued a video of a sun until it became a coin.',
    'CONFIRMED: CNAME still answers to pixelgame.com when nobody is looking.',
    'CONFIRMED: electron-main.js contains the sound of one hand clapping.',
    'CONFIRMED: Pyx autocompleted “function ban()” and then apologized.',
    'CONFIRMED: Floor Is Lava considers the footer legally lava.',
    'CONFIRMED: visitor counter cannot exceed 1 because secrets.',
    'CONFIRMED: we are not affiliated with the other Pixel Place. We checked twice.',
    'CONFIRMED: Anti 67 skip detection has a 3.5 second grace period. Use it for snacks.',
    'CONFIRMED: Coaster Control guests pay in Pixel Coins and compliments.',
    'UNCONFIRMED: debian-tor has a drone accessory.',
  ];
  document.getElementById('ticker').textContent = leaks.join('   ·   ') + '   ·   ';

  var xp = 0;
  var ranks = ['intern', 'mod intern', 'Safehouse volunteer', 'head_admin’s cousin', 'onion overseer'];
  function bump(n) {
    xp += n || 1;
    var rank = ranks[Math.min(ranks.length - 1, Math.floor(xp / 4))];
    document.getElementById('clearance').textContent = rank;
  }

  document.querySelectorAll('.file').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.classList.contains('open')) return;
      el.classList.add('open');
      bump(1);
    });
  });

  var yes = 67;
  var no = 67;
  function pollText(extra) {
    document.getElementById('poll').textContent =
      (extra ? extra + ' ' : '') + 'Community totals (completely scientific): YES ' + yes + ' / NO ' + no + '.';
  }
  document.getElementById('vote-no').addEventListener('click', function () {
    no += 67;
    bump(1);
    pollText('You voted NO. Based. Early dismiss unlocked in spirit.');
  });

  var need = 3;
  var done = 0;
  var lockEl = document.getElementById('lock');
  var closeBtn = document.getElementById('fake-close');
  function setLockOpen(open) {
    lockEl.classList.toggle('is-open', open);
    lockEl.style.display = open ? 'grid' : 'none';
    if (open) lockEl.removeAttribute('hidden');
    else lockEl.setAttribute('hidden', '');
    lockEl.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (!open) {
      closeBtn.classList.remove('is-ready');
    }
  }
  function renderLock() {
    var remaining = Math.max(0, need - done);
    document.getElementById('need').textContent = String(remaining);
    document.getElementById('bar').style.width = Math.min(100, (done / need) * 100) + '%';
    var finished = done >= need;
    closeBtn.classList.toggle('is-ready', finished);
    document.getElementById('lock-msg').textContent = finished
      ? 'Done. Click “I’m a changed onion” — or it will close itself.'
      : done + ' / ' + need + ' pretend-plays.';
    if (finished) {
      setTimeout(function () {
        setLockOpen(false);
      }, 400);
    }
  }
  document.getElementById('vote-yes').addEventListener('click', function () {
    yes += 67;
    bump(2);
    pollText('You voted YES. The lock overlay has entered the chat.');
    need = 3;
    done = 0;
    setLockOpen(true);
    renderLock();
  });
  document.getElementById('fake-play').addEventListener('click', function () {
    if (done < need) done += 1;
    renderLock();
  });
  document.getElementById('fake-skip').addEventListener('click', function () {
    need += 3;
    renderLock();
    document.getElementById('lock-msg').textContent = 'Skip detected. +3 required plays. This is canon.';
  });
  closeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    setLockOpen(false);
  });
  setLockOpen(false);

  var mintLines = [
    'Pyx: “this mint looks like a scam.” Mint cancelled.',
    'Showdown merged max(local, server) and you still have 150.',
    'Gym Pump ate the coins as protein.',
    'Helios rendered your coins as a sunset. Beautiful. Worthless.',
    'Web Deploy reserved the hostname coins.pixelplaceofficial.com. You cannot have it.',
    '404 Coins Not Found — try Jungle Journey fruit instead.',
  ];
  document.getElementById('mint').addEventListener('click', function () {
    document.getElementById('mint-out').textContent = mintLines[Math.floor(Math.random() * mintLines.length)];
    bump(1);
    for (var i = 0; i < 12; i++) {
      var c = document.createElement('div');
      c.className = 'coin';
      c.textContent = '⬤';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      document.getElementById('coins-layer').appendChild(c);
      setTimeout(function (n) { n.remove(); }, 2600, c);
    }
  });

  document.querySelectorAll('.redact').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.textContent = btn.getAttribute('data-clear');
      btn.classList.add('cleared');
      bump(1);
    });
  });

  var term = document.getElementById('term');
  function println(s) {
    term.textContent += s + '\n';
    term.scrollTop = term.scrollHeight;
  }
  var cmds = {
    help: 'help, 67, coins, studio, konami, onion, helios, gym, historimac, lava, pyx, about',
    '67': 'Safehouse 3.01 footer ballot. YES streams anti-67.mp3. NO gets early dismiss. Skipping is a lifestyle tax.',
    coins: 'Not legal tender. Also not Roblox Robux. We have a whole FAQ about that.',
    studio: 'Current Studio tab is retiring. New Studio is “more exciting.” ETA: after localhost is fixed (see docs).',
    onion: addr.textContent,
    helios: 'Video lab disguised as a built-in game. Continue video. Become sun.',
    gym: 'Engine files not in git. Gains not in git. Spirit: very much in git.',
    historimac: 'From original Macintosh to NeXTSTEP. Invite links. Balloon Help has opinions.',
    lava: 'If you can read the footer, you are already dead. Respawn at /games.',
    pyx: 'Filters Studio publishes so park guests don’t learn forbidden words. “hunter2” is still *******.',
    about: 'Pixel Place by Mainline Studios. Free browser games, avatars, Studio, friends, coins. Not the other Pixel Place.',
  };
  document.getElementById('term-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('term-in');
    var raw = (input.value || '').trim();
    var key = raw.toLowerCase();
    input.value = '';
    println('vault> ' + raw);
    if (key === 'konami') {
      unlockKonami();
      println('Konami accepted. File 030 opened.');
      return;
    }
    println(cmds[key] || 'Unknown. The empty file named More Games also does not know.');
    bump(1);
  });

  function unlockKonami() {
    document.getElementById('konami-box').hidden = false;
    bump(5);
  }
  var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var idx = 0;
  window.addEventListener('keydown', function (e) {
    if (e.keyCode === seq[idx]) {
      idx += 1;
      if (idx === seq.length) {
        unlockKonami();
        println('↑↑↓↓←→←→BA — Studio Balloon Help sings.');
        idx = 0;
      }
    } else {
      idx = 0;
    }
  });

  document.querySelector('.lava').addEventListener('mouseenter', function () {
    this.textContent = '≈≈≈ YOU TOUCHED THE FOOTER ≈≈≈ that’s an out. Gym Pump is laughing. ≈≈≈';
    bump(1);
  });
})();
