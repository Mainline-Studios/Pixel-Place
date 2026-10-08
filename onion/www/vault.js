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
      if (el.classList.contains('open') || el.classList.contains('sealed')) return;
      el.classList.add('open');
      bump(1);
    });
  });

  var vaultFiles = Array.isArray(window.VAULT_FILES) ? window.VAULT_FILES : [];
  var vaultCabinets = Array.isArray(window.VAULT_CABINETS) ? window.VAULT_CABINETS : [];
  var revealed = {};
  var grid = document.getElementById('vault-grid');

  function pad3(n) {
    return String(n).padStart(3, '0');
  }
  function isRevealed(f) {
    return !f.locked || !!revealed[f.id];
  }
  function stats() {
    var openN = vaultFiles.filter(function (f) { return isRevealed(f); }).length;
    var lockN = vaultFiles.length - openN;
    var el = document.getElementById('file-stats');
    if (el) el.textContent = openN + ' declassified / ' + lockN + ' sealed (of ' + vaultFiles.length + ')';
  }
  function cardHtml(f) {
    if (!isRevealed(f)) {
      return (
        '<article class="file sealed" data-id="' + f.id + '">' +
          '<h2>File ' + pad3(f.id) + ' · LOCKED · ' + f.cabinet + '</h2>' +
          '<p>Sealed. Title withheld. You need a command.</p>' +
        '</article>'
      );
    }
    return (
      '<article class="file" data-id="' + f.id + '">' +
        '<h2>File ' + pad3(f.id) + ' · ' + f.title.replace(/</g, '') + '</h2>' +
        '<p>' + f.body.replace(/</g, '') + '</p>' +
      '</article>'
    );
  }
  function paintGrid(highlightId) {
    if (!grid) return;
    grid.innerHTML = vaultFiles.map(cardHtml).join('');
    stats();
    if (highlightId) {
      var node = grid.querySelector('[data-id="' + highlightId + '"]');
      if (node) {
        node.classList.add('just-opened', 'open');
        node.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }
  function unlockFile(f, quiet) {
    if (!f) return 0;
    if (!f.locked || revealed[f.id]) return 0;
    revealed[f.id] = true;
    bump(2);
    if (!quiet) paintGrid(f.id);
    return 1;
  }
  function findById(num) {
    return vaultFiles.find(function (f) { return f.id === num; });
  }
  function findByCmd(cmd) {
    return vaultFiles.find(function (f) { return f.cmd === cmd; });
  }
  paintGrid();

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
    help: 'help, catalog, locked, unlocked, open 020, cabinet gym, konami, 67, coins, studio, onion, helios, gym, historimac, lava, pyx, about. Sealed slugs are not listed here.',
    '67': 'Safehouse 3.01 footer ballot. YES streams anti-67.mp3. NO gets early dismiss. Skipping is a lifestyle tax.',
    coins: 'Not legal tender. Also not Roblox Robux. We have a whole FAQ about that.',
    studio: 'Current Studio tab is retiring. New Studio is “more exciting.” ETA: after localhost is fixed (see docs).',
    onion: addr.textContent,
    helios: 'Video lab disguised as a built-in game. Continue video. Become sun.',
    gym: 'Engine files not in git. Gains not in git. Spirit: very much in git. Try cabinet gym',
    historimac: 'From original Macintosh to NeXTSTEP. Invite links. Balloon Help has opinions.',
    lava: 'If you can read the footer, you are already dead. Respawn at /games.',
    pyx: 'Filters Studio publishes so park guests don’t learn forbidden words. “hunter2” is still *******.',
    about: 'Pixel Place by Mainline Studios. Free browser games, avatars, Studio, friends, coins. Not the other Pixel Place.',
  };
  function catalogText() {
    var openN = vaultFiles.filter(isRevealed).length;
    return (
      'Featured 001–018 on page. Cabinets 019–278 = ' +
      vaultFiles.length +
      ' files (' +
      openN +
      ' visible, ' +
      (vaultFiles.length - openN) +
      ' sealed). File 279 = konami. Cabinets: ' +
      vaultCabinets.join(', ') +
      '.'
    );
  }
  function lockedList() {
    return vaultFiles
      .filter(function (f) { return f.locked && !revealed[f.id]; })
      .map(function (f) { return pad3(f.id) + ' [' + f.cabinet + ']'; })
      .join('\n') || '(none sealed)';
  }
  function unlockedList() {
    return vaultFiles
      .filter(function (f) { return isRevealed(f); })
      .map(function (f) { return pad3(f.id) + ' ' + f.title; })
      .join('\n');
  }
  function masterDump() {
    return vaultFiles
      .filter(function (f) { return f.locked; })
      .map(function (f) { return pad3(f.id) + '  ' + f.cmd + '  |  open ' + pad3(f.id) + '  |  ' + f.title; })
      .join('\n');
  }
  document.getElementById('term-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('term-in');
    var raw = (input.value || '').trim();
    var key = raw.toLowerCase().replace(/\s+/g, ' ');
    input.value = '';
    println('vault> ' + raw);
    if (key === 'konami') {
      unlockKonami();
      println('Konami accepted. File 279 opened.');
      bump(1);
      return;
    }
    if (key === 'catalog') {
      println(catalogText());
      bump(1);
      return;
    }
    if (key === 'locked') {
      println(lockedList());
      bump(1);
      return;
    }
    if (key === 'unlocked') {
      println(unlockedList());
      bump(1);
      return;
    }
    if (key === 'master balloon-help') {
      println('OPERATOR DUMP — 130 sealed slugs\n' + masterDump());
      bump(5);
      return;
    }
    if (key === 'master') {
      println('Need the passphrase. Balloon Help already knows it.');
      return;
    }
    var openMatch = key.match(/^open\s+#?(\d{1,3})$/);
    if (openMatch) {
      var id = parseInt(openMatch[1], 10);
      var f = findById(id);
      if (!f) {
        println('No such file ' + pad3(id) + '. Range is 019–278.');
        return;
      }
      if (!f.locked) {
        println('File ' + pad3(f.id) + ' is already on the shelf: ' + f.title);
        paintGrid(f.id);
        return;
      }
      if (revealed[f.id]) {
        println('Already declassified: ' + f.title);
        paintGrid(f.id);
        return;
      }
      unlockFile(f);
      println('Declassified File ' + pad3(f.id) + ' · ' + f.title);
      return;
    }
    var cabMatch = key.match(/^cabinet\s+([a-z]+)$/);
    if (cabMatch) {
      var cab = cabMatch[1];
      if (vaultCabinets.indexOf(cab) === -1) {
        println('Unknown cabinet. Try: ' + vaultCabinets.join(', '));
        return;
      }
      var n = 0;
      var last = null;
      vaultFiles.forEach(function (file) {
        if (file.cabinet === cab && file.locked) {
          n += unlockFile(file, true);
          last = file;
        }
      });
      paintGrid(last && last.id);
      println('Cabinet ' + cab + ': declassified ' + n + ' file(s).');
      return;
    }
    var bySlug = findByCmd(key);
    if (bySlug && bySlug.locked) {
      if (revealed[bySlug.id]) {
        println('Already declassified: ' + bySlug.title);
        paintGrid(bySlug.id);
        return;
      }
      unlockFile(bySlug);
      println('Declassified File ' + pad3(bySlug.id) + ' · ' + bySlug.title + ' via ' + bySlug.cmd);
      return;
    }
    println(cmds[key] || 'Unknown. Try help, catalog, open 020, cabinet gym. The empty file named More Games also does not know.');
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
