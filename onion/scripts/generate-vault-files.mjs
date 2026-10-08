#!/usr/bin/env node
/** Generate vault-files.js + MASTER_LIST.md (260 files, half command-locked). */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CABINETS = [
  { id: 'ballot', name: '67 Ballot', topic: 'the Anti 67 overlay and Safehouse 3.01 footer poll' },
  { id: 'studio', name: 'Studio', topic: 'the retiring Game Studio tab and the “more exciting” replacement that is always next sprint' },
  { id: 'gym', name: 'Gym Pump', topic: 'Gym Pump’s missing engine zip and VIPPlatform.js doing curls off-repo' },
  { id: 'helios', name: 'Helios', topic: 'Helios Video Lab, Continue video, and sun-god recumbent-bike clips' },
  { id: 'mac', name: 'HistoriMac', topic: 'HistoriMac emulators, Balloon Help, System 7, Mac OS 9, and NeXTSTEP' },
  { id: 'coins', name: 'Pixel Coins', topic: 'Pixel Coins, Showdown’s max(local, server) merge, and the decorative mint' },
  { id: 'pyx', name: 'Pyx', topic: 'Pyx filters, publish checks, and autocomplete that apologizes mid-function' },
  { id: 'lava', name: 'Floor Is Lava', topic: 'Floor Is Lava, the legally lava footer, and drone-floor cowardice' },
  { id: 'ocean', name: 'Ocean', topic: 'Underwater Odyssey, OceanLife Pro, and fauna that file tickets' },
  { id: 'chess', name: 'Chess', topic: 'built-in Chess, tournaments, and pieces that appeal hardware bans' },
  { id: 'eco', name: 'Eco Hero', topic: 'Eco Hero AI citizens, gitignored HTML, and birds with Crashlytics' },
  { id: 'deploy', name: 'Web Deploy', topic: 'Web Deploy reserved names (admin, status, pay, historimac)' },
  { id: 'localhost', name: 'Localhost', topic: 'the FIX_LOCALHOST document pile and port 3000’s emotional support CNAME' },
  { id: 'onion', name: 'Onion', topic: 'this Tor v3 vault, debian-tor, and the visitor counter stuck at 1' },
  { id: 'avatar', name: 'Avatar', topic: 'avatar shop, drone accessory init, skins, and faces APIs' },
  { id: 'coaster', name: 'Coaster', topic: 'Coaster Control guests, shops, and compliments-as-currency' },
  { id: 'showdown', name: 'Showdown', topic: 'Showdown, Tag, Snake, and 3D Avatar Runner pretending they are one franchise' },
  { id: 'status', name: 'Status', topic: 'the status page EAS bar and Firebase “we are operational” posture' },
  { id: 'safehouse', name: 'Safehouse', topic: 'hardware bans, appeals, reports, and Safehouse policy posts' },
  { id: 'electron', name: 'Electron', topic: 'the empty electron-main.js, the empty More Games file, and PWA cope' },
];

const TROPES = [
  { id: 'memo', name: 'Internal memo', lead: 'Leaked as a memo nobody signed.' },
  { id: 'tape', name: 'Voicemail tape', lead: 'Recovered from a HistoriMac cassette labeled DO NOT PLAY.' },
  { id: 'zip', name: 'Orphan zip', lead: 'Found in a zip named final_final_REAL2.' },
  { id: 'ticket', name: 'Support ticket', lead: 'Closed as “working as designed,” which is a threat.' },
  { id: 'rumor', name: 'Cafeteria rumor', lead: 'Heard near the Pixel Coin vending machine.' },
  { id: 'leak', name: 'Pastebin leak', lead: 'Posted, deleted, posted again, gitignored.' },
  { id: 'postmortem', name: 'Postmortem', lead: 'The action items are “thanks for your patience.”' },
  { id: 'doodle', name: 'Whiteboard doodle', lead: 'Photographed at 2am; the arrows mean nothing and everything.' },
  { id: 'changelog', name: 'Secret changelog', lead: 'Never shipped. Still true.' },
  { id: 'sticky', name: 'Sticky note', lead: 'On a monitor that only runs localhost.' },
  { id: 'shot', name: 'Screenshot', lead: 'Cropped so the username is a redacted fish.' },
  { id: 'prophecy', name: 'Prophecy', lead: 'Balloon Help spoke first.' },
  { id: 'pr', name: 'Abandoned PR', lead: 'Reviewers requested changes from the heat death of port 3000.' },
];

function pad(n) {
  return String(n).padStart(3, '0');
}

function bodyFor(cab, trope, id, locked) {
  const bits = [
    `${trope.lead} Subject: ${cab.topic}.`,
    locked
      ? `This copy was sealed in cabinet “${cab.name}.” Type \`open ${pad(id)}\` or \`${cab.id}-${trope.id}\`.`
      : `This copy was left on the public shelf because Pyx rated the jokes “annoying but allowed.”`,
    punchline(cab.id, trope.id, id),
  ];
  return bits.join(' ');
}

function punchline(cab, trope, id) {
  const table = {
    ballot: {
      memo: 'YES still costs three songs. NO still gets early dismiss. The overlay has a lawyer.',
      tape: 'The voicemail is just anti-67.mp3 played into a cup. Skip penalty: +3 plays, as canon.',
      zip: 'Contains a README that says “this is a community sentiment poll, not a ban.” The zip disagrees.',
      ticket: 'User reports “6-7 keeps chasing me.” Status: Safehouse says that’s the product.',
      rumor: 'Someone voted both ways by making two accounts. Hardware bans entered the chat.',
      leak: 'account_preferences.anti67 is not a personality test, but it is now.',
      postmortem: 'Grace period is 3.5 seconds. Use it for snacks. This is in the source comments.',
      doodle: 'A flowchart: vote → overlay → song → skip → more song → onion.',
      changelog: '3.01 Safehouse Patch: added footer ballot. Interns added lore. Lore added API.',
      sticky: '“Do not name the overlay Anti67LockOverlay” — it is already named that.',
      shot: 'Footer cropped so only ~~6-7~~ is visible. Discord called it modern art.',
      prophecy: 'Balloon Help: “You will listen three times or you will listen six.”',
      pr: 'Requested: make the overlay close. Merged: a joke that said it would close.',
    },
    studio: {
      memo: 'Current Studio tab will be retired soon. “Soon” is a timezone Pixel Place invented.',
      tape: 'A designer whispering “more exciting Studio” over hold music from localhost.',
      zip: 'Draft games from 2024. Opening them requires the old Studio, which is retiring, which is the joke.',
      ticket: '“My publish button ghosted me.” Pyx left a comment. The comment was a shrug.',
      rumor: 'The new Studio is just HistoriMac running HyperCard. Unconfirmed. Extremely plausible.',
      leak: 'Game Studio drafts persist in a drawer labeled hug me.',
      postmortem: 'We thanked users for their patience so many times it became a feature flag.',
      doodle: 'Boxes: Idea → Studio → Pyx → “later” → InternationalSportsHQ.',
      changelog: 'Removed nothing. Promised everything. Status: exciting.',
      sticky: 'Ship new Studio after FIX_LOCALHOST_NOW.bat succeeds. It has never succeeded.',
      shot: 'Empty canvas titled Untitled World (1) — the (1) is a cry for help.',
      prophecy: 'When Studio retires, MusicalMayhem will still be “later.”',
      pr: 'Title: “retire studio tab.” Body: “thanks for your patience.” CI: 180 build-error branches.',
    },
    gym: {
      memo: 'Integration is ready. Engine files are not in git. Gains are spiritual.',
      tape: 'Spotter audio: “VIPPlatform.js, you got this.” The file is not in the working tree.',
      zip: 'gym-pump/ is gitignored for being too large. The zip is named final_final_REAL.',
      ticket: 'Leaderboard syncs to an engine that is a polite comment in GYM_PUMP_INTEGRATION.md.',
      rumor: 'The weights are Pixel Coins. That is why the mint is decorative.',
      leak: 'PixelPlaceAPI.js wrapper exists. The game it wraps is on sabbatical.',
      postmortem: 'Script tags were going to load ten files. None of the files attended.',
      doodle: 'A bicep labeled “TODO: copy engine.” The bicep has been TODO since forever.',
      changelog: 'Added Gym Pump to Games tab. Added an integration guide. Added absences.',
      sticky: 'Do not commit Anthropic keys next to the dumbbells. Eco Hero already did a bit.',
      shot: 'Empty iframe where a squat should be. 404 Coins Not Found.',
      prophecy: 'When the engine is copied, Floor Is Lava will still count as leg day.',
      pr: '“Add gym-pump engine” — reviewers: “where are the files.” Author: “soon.”',
    },
    helios: {
      memo: 'Helios is a built-in game that is a video lab. The thumbnail is an SVG of a sun.',
      tape: 'Prompt: “continue video.” Result: the sun learns baseball. Nobody asked.',
      zip: 'Clips of recumbent bikes achieving apotheosis. Helios billed it as physics.',
      ticket: '“My coaster turned into a sunset.” Expected behavior. Close ticket. Become sun.',
      rumor: 'Continue video is just Studio retirement filmed from orbit.',
      leak: 'builtin_helios shipped twice in one object because merge conflicts are a sport.',
      postmortem: 'Helios Video Lab was added in a PR named add/helios. The branch is the eulogy.',
      doodle: 'Sun → prompt → clip → continue → more sun → Pixel Coin → Pyx says no.',
      changelog: 'Generate short clips. Extend them. Deny that this is a product trailer.',
      sticky: 'If the clip looks expensive, it is. If it looks like a sun, it is Helios.',
      shot: 'A 2-second video of a coin melting. Title: “economy.”',
      prophecy: 'Helios will continue the video until it is HistoriMac Balloon Help.',
      pr: 'Syntax error in builtinGames.ts. Helios still shipped. The sun does not lint.',
    },
    mac: {
      memo: 'Classic Mac OS in the browser. Invite links. Balloon Help has HR access.',
      tape: 'System 7 hold music is just a modem that believes in you.',
      zip: 'NeXTSTEP black hardware screenshots. The zip is platinum chrome at its peak.',
      ticket: '“Balloon Help won’t stop.” That is not a bug. That is a coworker.',
      rumor: 'Mac OS 9 platinum is the new Studio UI. The rumor has a Finder badge.',
      leak: 'HISTORIMAC_TAGLINE is longer than electron-main.js (which is one blank line).',
      postmortem: 'Time travel classified as a feature. Support tickets classified as nostalgia.',
      doodle: 'Original Macintosh → System 7 → OS 9 → NeXT → onion → Balloon Help.',
      changelog: 'Play instantly. Share invite. Free. No install. Yes, MultiFinder.',
      sticky: 'Do not run Safehouse policy through SimpleText. It will become 67.',
      shot: 'Happy Mac, except the smile is ~~6-7~~.',
      prophecy: 'Balloon Help: “This is not a game.” Studio retirement playlist: 47 minutes of that.',
      pr: 'historimac-copilot-turn exists. The copilot is a sad trombone in Chicago font.',
    },
    coins: {
      memo: 'Not Robux. We have an FAQ. Showdown still hands you 150 local coins.',
      tape: 'Mint sound effect is Gym Pump dropping a plate. Pyx cancelled the mint.',
      zip: 'A CSV of max(local, server) values. Everyone still has 150.',
      ticket: '“Print 1,000,000 coins.” Resolution: decorative. Legal tender: no.',
      rumor: 'Jungle Journey fruit is the real currency. Coins are a frontend.',
      leak: 'pay portal matches /(\\d+)pixelcoins/. Someone wanted 67pixelcoins. Of course they did.',
      postmortem: 'Helios rendered the treasury as a sunset. Beautiful. Worthless.',
      doodle: 'User → play → coins → shop → drone → Floor Is Lava → 0 coins.',
      changelog: 'Optional donations. Optional purchases. Mandatory jokes.',
      sticky: 'If Pyx says the mint looks like a scam, believe Pyx.',
      shot: 'Avatar shop with a price tag that is just the word “vibes.”',
      prophecy: 'When coins become real, Web Deploy will reserve coins.pixelplaceofficial.com.',
      pr: 'Add-coins route exists. The onion mint does not call it. This is called restraint.',
    },
    pyx: {
      memo: 'Filter, feedback, check, analyze, autocomplete. Park guests must not learn forbidden words.',
      tape: 'Autocomplete whispered function ban() and then apologized for 400 tokens.',
      zip: 'A model card that says groqModel: \'\' and cost: 0. Spiritually accurate.',
      ticket: '“Pyx blocked my roller coaster named HeadAdmin.” Working as designed.',
      rumor: 'Pyx is just Balloon Help with an API. HistoriMac will not confirm.',
      leak: 'PYX_DEFAULT_URL lives in two files so it can watch itself.',
      postmortem: 'Publish pipeline: code → Pyx → maybe → community → reports → Safehouse.',
      doodle: 'A stick figure labeled Pyx standing on Studio’s grave, politely.',
      changelog: 'AI Coder is optional. Pyx is inevitable.',
      sticky: 'hunter2 is still *******. Do not put real secrets in jokes.',
      shot: 'Filter response: “annoying but allowed.” That is this entire vault.',
      prophecy: 'Pyx will autocomplete the new Studio and then retire the old one by accident.',
      pr: 'generate-game.ts has a pyx branch. The branch is named after a cost of 0.',
    },
    lava: {
      memo: 'Jump from platform to platform. The footer is also lava. Do not hover it.',
      tape: 'A scream that is just the CSS animation lava 2.8s linear infinite.',
      zip: 'Platforms, lava, and a note: drones count as touching the floor if you are a coward.',
      ticket: '“I touched the footer and died.” Expected. Gym Pump is laughing.',
      rumor: 'Red Rover is Floor Is Lava but with friendship. The lava is still the footer.',
      leak: 'builtin_floorIsLava is 0.5 days old forever because Date.now() is a prank.',
      postmortem: 'Respawn at /games. The onion footer remains legally lava.',
      doodle: 'Player → hover footer → out → Anti 67 overlay for no reason.',
      changelog: 'Don’t touch the lava. We made the footer lava. We are not sorry.',
      sticky: 'If you can read the footer, you are already dead.',
      shot: 'A player mid-jump. Caption: “this is fine” in lava gradient.',
      prophecy: 'When the floor is not lava, Studio will still be retiring.',
      pr: 'Add hover listener on .lava. Ship it. Touch it. Die.',
    },
    ocean: {
      memo: 'Underwater Odyssey plus OceanLife Pro. Expanded fauna. Expanded tickets.',
      tape: 'A whale leaving a 1-star review on Firebase Hosting.',
      zip: 'Deep-sea adventures and a fish named after a reserved Web Deploy subdomain.',
      ticket: '“I caught admin.” Release it. That name is reserved.',
      rumor: 'Ocean fauna is the head-admin emergency snack. File 017 almost said so.',
      leak: 'Premium explorer means the same water with more adjectives.',
      postmortem: 'The depths were localhost:3000 the whole time.',
      doodle: 'Boat → Odyssey → Pro → fish → Pyx → “please do not name it 67.”',
      changelog: 'Fishing added. Appeals added. The fish filed the appeal.',
      sticky: 'Do not store API keys in the reef. Eco Hero’s birds already gossip.',
      shot: 'A blobfish wearing a drone accessory. Init route: 200.',
      prophecy: 'OceanLife Pro 2 will be Studio, underwater, retired on arrival.',
      pr: 'Add fauna. Reviewer: “is this Helios.” Author: “it is wet Helios.”',
    },
    chess: {
      memo: 'Classic chess. Challenge yourself or play online. Pieces have account_preferences.',
      tape: 'A knight reporting a hardware ban in algebraic notation.',
      zip: 'Openings named after Safehouse. The Sicilian is now the 67.',
      ticket: '“Opponent used a drone.” Illegal in FIDE. Legal in Avatar Shop.',
      rumor: 'Chess Elo is just Pixel Coins with extra steps and fewer sunsets.',
      leak: 'lib/chessFirestore.ts exists. The king knows about Firestore rules.',
      postmortem: 'Stalemate classified as operational on the status page.',
      doodle: 'e4 e5 Nf3 overlay? — the overlay is Anti 67. Resign.',
      changelog: 'Online play. Friends. Reports. The bishop filed a report.',
      sticky: 'Do not castle through lava. The footer is watching.',
      shot: 'Checkmate delivered by Balloon Help.',
      prophecy: 'When Chess gets 3D avatars, Floor Is Lava will demand a clock.',
      pr: 'Tournaments route exists. The trophy is an SVG sun from Helios.',
    },
    eco: {
      memo: 'AI townsfolk. HTML gitignored because someone left a key in a rainforest.',
      tape: 'A villager whispering “the birds have Crashlytics.”',
      zip: 'Citizens, trees, and a .env that must never return.',
      ticket: '“NPC quoted Safehouse policy.” Pyx is moonlighting as a mayor.',
      rumor: 'Eco Hero is Gym Pump for trees. The engine is also not in git.',
      leak: 'public/games/eco-hero.html is gitignored on purpose. The birds remember why.',
      postmortem: 'Key rotation succeeded. Lore rotation will never succeed.',
      doodle: 'Tree → chat API → bird → crashlytics → onion.',
      changelog: 'In-game AI citizens. Out-of-game shame.',
      sticky: 'Do not put Anthropic keys in games. We made a gitignore instead of a therapist.',
      shot: 'A parrot wearing a pixel drone. It is filing a status incident.',
      prophecy: 'The rainforest will outlive the Studio tab.',
      pr: 'eco-hero/chat route. Reviewer asked for the HTML. Git said no.',
    },
    deploy: {
      memo: 'Players publish little sites. Reserved: www, api, app, pay, status, historimac, admin.',
      tape: 'Someone trying to register admin.pixelplaceofficial.com. Joke page says no.',
      zip: 'A site named 67. Rejected. Reserved in spirit.',
      ticket: '“I wanted pay as my hostname.” Pay is for Stripe. You get /admin.html.',
      rumor: 'Web Deploy is the new Studio. The rumor is scared of Pyx.',
      leak: 'Placeholder generator blocks admin so you will click /admin.html on the onion.',
      postmortem: 'Reserved names saved us from a thousand head_admin homepages.',
      doodle: 'Publish → name check → no → onion vault → yes but jokes only.',
      changelog: 'Upload URL, check, auth, Firebase hosting. Still not admin.',
      sticky: 'If you wanted status, that is already on fire at status.pixelplaceofficial.com.',
      shot: 'Error: hostname reserved. Caption: “so is your dignity.”',
      prophecy: 'The first allowed hostname will be later.musicalmayhem.',
      pr: 'webDeploy.ts reserved list grows like FIX_LOCALHOST files.',
    },
    localhost: {
      memo: 'FIX_LOCALHOST.md, NOW.bat, .ps1, LOCALHOST_FIXED_COMPLETE.md. Port 3000 is a lifestyle.',
      tape: 'A developer saying “it works on my machine” into a paper cup on 127.0.0.1.',
      zip: 'Every localhost guide in the repo, zipped, still not fixing localhost.',
      ticket: 'Error 102. There is a dedicated markdown file. Of course there is.',
      rumor: 'CNAME pixelgame.com is the original localhost. Lawyers hate this sentence.',
      leak: 'QUICK_FIX.txt is neither quick nor a fix. It is a vibe.',
      postmortem: 'npm run dev. Open localhost:3000. Write another FIX doc. Repeat.',
      doodle: 'localhost → 3000 → Chrome → 102 → bat file → same 102 → onion.',
      changelog: 'LOCALHOST_FIXED.md shipped. LOCALHOST_FIXED_COMPLETE.md shipped. It was not.',
      sticky: 'If nginx is on 8080, you are in the vault, not the app. Do not panic. Panic.',
      shot: 'Browser tab titled localhost:3000 and a tear.',
      prophecy: 'The last FIX_LOCALHOST will be written after Studio retires, which is never.',
      pr: '180 cursor/build-error-resolution branches. Localhost remains a concept.',
    },
    onion: {
      memo: 'v3 address, 56 characters, standard random generation. Not a vanity. We could not spell pixel.',
      tape: 'debian-tor humming anti-67.mp3 in /var/lib/tor/pixelplace/.',
      zip: 'Private keys not in git. Public hostname is. This is called taste.',
      ticket: '“.onion does not resolve on Chrome.” RFC 7686. Install Tor Browser. Become free.',
      rumor: 'Visitor counter cannot exceed 1 because secrets. The rumor is the counter.',
      leak: 'HiddenServicePort 80 → 127.0.0.1:8080. The public internet gets nothing. Good.',
      postmortem: 'display:grid beat hidden. Overlay would not close. We wrote three patches. Lore.',
      doodle: 'Tor → hops → nginx loopback → jokes → footer lava → death.',
      changelog: 'Added vault. Added 67 overlay. Added 260 more files because you asked.',
      sticky: 'Never commit hs_ed25519_secret_key. Commit jokes. Commit more jokes.',
      shot: 'A 56-character hostname. Caption: “this is the domain.”',
      prophecy: 'Vanity onions are for people who can spell pixelplace in base32.',
      pr: 'cursor/onion-hidden-service-e71d. The suffix is the real easter egg.',
    },
    avatar: {
      memo: 'Skins, accessories, faces, drones. Your avatar appears in supported games. Define supported.',
      tape: 'Init-drone succeeded. Delivery of coins failed. The drone unionized.',
      zip: 'Force-init skins, premium skins, special skins. All of them want a status glow.',
      ticket: '“Drone touched lava.” Floor Is Lava: that’s on you, coward.',
      rumor: '3D Avatar Runner is just the shop but sweaty.',
      leak: '/api/faces and /api/skins. The face API has seen things.',
      postmortem: 'Customization shipped. Taste did not.',
      doodle: 'User → shop → drone → lava → appeal → drone again.',
      changelog: 'Equip skins. Show off. Get clipped by Helios as a sunset.',
      sticky: 'If the accessory is a drone, it will not deliver Pixel Coins. Ever.',
      shot: 'An avatar with every accessory at once. Pyx filed a noise complaint.',
      prophecy: 'The last accessory will be Balloon Help as a hat.',
      pr: 'init-drone route. Reviewer: “why.” Author: “yes.”',
    },
    coaster: {
      memo: 'Build a 2D theme park. Paths, shops, guests, custom coasters. Compliments accepted.',
      tape: 'A guest paying in compliments because coins were a sunset this week.',
      zip: 'Track pieces and a shop that sells Safehouse merch. The merch is a footer.',
      ticket: '“Guests quoted Pyx.” They went through Studio first. This is a pipeline.',
      rumor: 'Coaster Control is the intern’s favorite game. File 017 confirms on click.',
      leak: 'Thumbnail: /images/games/coaster-control.svg. The SVG screams in 2D.',
      postmortem: 'A guest found lava under the park. That was the onion footer leaking up.',
      doodle: 'Path → shop → guest → compliment → Helios trailer → sun coaster.',
      changelog: 'Custom coasters. Custom regrets. No height requirement for 67.',
      sticky: 'If the park is empty, Studio retired during onboarding.',
      shot: 'A loop-de-loop labeled TODO: physics. Helios offered to continue the video.',
      prophecy: 'When guests pay real coins, Gym Pump will claim the calories.',
      pr: 'builtin_coasterControl. Description longer than electron-main.js.',
    },
    showdown: {
      memo: 'Showdown, Tag, Snake, Memory, Tic-Tac-Toe. A franchise held together by max().',
      tape: 'Snake eating a Pixel Coin and becoming Helios.',
      zip: 'Powers, wins, 150 coins. Merge policy: take the max, ignore the feelings.',
      ticket: '“I lost my local coins.” Server had more. max() blessed you. Stop crying.',
      rumor: 'Tag is just Red Rover that went to therapy.',
      leak: 'showdownStorage keys are a tiny country.',
      postmortem: 'Remote and local disagreed. max() became a religion.',
      doodle: 'Snake → Tag → Showdown → Runner → lava → 0 wins → 150 coins anyway.',
      changelog: 'Challenge yourself. Or don’t. The coins will max() in your favor.',
      sticky: 'If Memory is too hard, Studio will remember for you, then retire.',
      shot: 'Tic-Tac-Toe board of 6 and 7. Safehouse issued a statement.',
      prophecy: '3D Avatar Runner will outrun the Studio tab and still not find the engine.',
      pr: 'showdown_pixelcoins. The name is longer than the economy.',
    },
    status: {
      memo: 'status.pixelplaceofficial.com. EAS strip. Admins can arm it. Please don’t, except do.',
      tape: 'Urgent alert: “Studio is retiring.” Loop for 47 years.',
      zip: 'status.json and a glow color picker. The glow is the product.',
      ticket: '“Site looks unchanged after release.” Hard refresh. Caches lag. We wrote a card about it.',
      rumor: 'Firebase outage is why Gym Pump has no engine. Convenient.',
      leak: 'Admin editor on the status page. Regular accounts get a lecture.',
      postmortem: 'Defaulting to operational when the API fails. Bold. Iconic. Suspicious.',
      doodle: 'Operational / Degraded / Maintenance / Outage / 67.',
      changelog: 'Custom status label. Custom glow. Custom panic.',
      sticky: 'If the red bar is on, something is on fire. If it is on the onion, it is aesthetic.',
      shot: 'EAS badge URGENT ALERT over a pixel sun.',
      prophecy: 'The status page will outlive pixelplaceofficial.com and still blame Firebase.',
      pr: 'pixelplace-status hosting site. Squarespace CNAME instructions. We contain multitudes.',
    },
    safehouse: {
      memo: 'Hardware bans, appeals, appeal messages, reports. Safehouse is not a metaphor.',
      tape: 'An appeal that is just the word “please” in Chicago font.',
      zip: 'Ban lists and a note: Tor will not dodge account_preferences.',
      ticket: '“I used Tor to dodge a ban.” Overlay still lives on the account. Pal.',
      rumor: 'Terminated-ban is a function name and a mood.',
      leak: 'Appeals have a message thread. The thread is mostly lava emojis.',
      postmortem: '3.0 Safehouse plus 3.01 ballot. Trust-and-community follow-up. Also 67.',
      doodle: 'Report → ban → appeal → hardware ban → onion → still banned.',
      changelog: 'Email login codes. Verify prompt. Sign out all. Grown-up stuff. Then a 67 poll.',
      sticky: 'Moderators: the ballot is not a moderation action. The overlay disagrees in spirit.',
      shot: 'A ban screen with Balloon Help offering a hug.',
      prophecy: 'The last appeal will be from a Coaster Control guest named admin.',
      pr: 'hardware-bans route. Title: Safehouse. Body: please be kind. Footer: 6-7.',
    },
    electron: {
      memo: 'electron-main.js is one blank line. More Games is an empty file. This is the stack.',
      tape: 'A desktop app that opens localhost and then writes FIX_LOCALHOST_NOW.bat.',
      zip: 'dist-electron.app with more frameworks than games. Gym Pump still missing.',
      ticket: '“Desktop app is empty.” Correct. See electron-main.js. See also: art.',
      rumor: 'PWA install is the real desktop app. Electron is a haunted house.',
      leak: 'HOW_TO_RUN_DESKTOP_APP.md is longer than the main process file.',
      postmortem: 'We shipped an .app that contains Mantle, Squirrel, and one newline.',
      doodle: 'Electron → blank → PWA → onion → jokes.',
      changelog: 'Mac build. Windows bat files. Zero JavaScript in main. Iconic.',
      sticky: 'If the desktop app does nothing, it is working as documented (it isn’t documented).',
      shot: 'Info.plist next to an empty main. Caption: “shipped.”',
      prophecy: 'The next Electron main will be Balloon Help. It will still be one line.',
      pr: 'electron-main.js added. Diff: +1 blank line. Reviewers approved with tears.',
    },
  };
  const line = table[cab]?.[trope];
  return line || `File ${pad(id)} exists because you asked for 250 more. Cabinet ${cab}, trope ${trope}.`;
}

const featured = [
  { id: 1, title: 'The 67 Community Ballot', access: 'OPEN', cmd: '— (on page)', cabinet: 'ballot' },
  { id: 2, title: 'Studio’s last will', access: 'OPEN', cmd: '— (on page)', cabinet: 'studio' },
  { id: 3, title: 'Gym Pump’s ghost engine', access: 'OPEN', cmd: '— (on page)', cabinet: 'gym' },
  { id: 4, title: 'HistoriMac', access: 'OPEN', cmd: '— (on page)', cabinet: 'mac' },
  { id: 5, title: 'Helios Video Lab', access: 'OPEN', cmd: '— (on page)', cabinet: 'helios' },
  { id: 6, title: 'The Localhost Incident', access: 'OPEN', cmd: '— (on page)', cabinet: 'localhost' },
  { id: 7, title: 'We are not the other Pixel Place', access: 'OPEN', cmd: '— (on page)', cabinet: 'deploy' },
  { id: 8, title: 'Empty files of power', access: 'OPEN', cmd: '— (on page)', cabinet: 'electron' },
  { id: 9, title: 'Pixel Coins', access: 'OPEN', cmd: '— (on page)', cabinet: 'coins' },
  { id: 10, title: 'Pyx is watching Studio', access: 'OPEN', cmd: '— (on page)', cabinet: 'pyx' },
  { id: 11, title: 'Status page EAS bar', access: 'OPEN', cmd: '— (on page)', cabinet: 'status' },
  { id: 12, title: 'Games they won’t convert', access: 'OPEN', cmd: '— (on page)', cabinet: 'studio' },
  { id: 13, title: 'Eco Hero citizens', access: 'OPEN', cmd: '— (on page)', cabinet: 'eco' },
  { id: 14, title: 'Hardware bans & appeals', access: 'OPEN', cmd: '— (on page)', cabinet: 'safehouse' },
  { id: 15, title: 'Drone accessory', access: 'OPEN', cmd: '— (on page)', cabinet: 'avatar' },
  { id: 16, title: 'Web Deploy', access: 'OPEN', cmd: '— (on page)', cabinet: 'deploy' },
  { id: 17, title: 'Redacted, on purpose', access: 'OPEN', cmd: '— (on page)', cabinet: 'pyx' },
  { id: 18, title: 'Operator terminal (fake)', access: 'OPEN', cmd: 'help', cabinet: 'onion' },
  { id: 279, title: 'Konami vault', access: 'LOCKED', cmd: '`konami` (or ↑↑↓↓←→←→BA)', cabinet: 'mac' },
];

const files = [];
let n = 19;
for (const cab of CABINETS) {
  for (const trope of TROPES) {
    const locked = n % 2 === 0;
    const cmd = `${cab.id}-${trope.id}`;
    files.push({
      id: n,
      title: `${cab.name}: ${trope.name}`,
      body: bodyFor(cab, trope, n, locked),
      locked,
      cmd,
      cabinet: cab.id,
    });
    n += 1;
  }
}

if (files.length !== 260) {
  throw new Error(`expected 260 files, got ${files.length}`);
}

const locked = files.filter((f) => f.locked);
const open = files.filter((f) => !f.locked);
if (locked.length !== 130 || open.length !== 130) {
  throw new Error(`lock split ${locked.length}/${open.length}`);
}

const js = `/* generated by onion/scripts/generate-vault-files.mjs — do not hand-edit */
window.VAULT_FILES = ${JSON.stringify(files)};
window.VAULT_CABINETS = ${JSON.stringify(CABINETS.map((c) => c.id))};
`;

writeFileSync(join(root, 'www/vault-files.js'), js);

const lines = [
  '# PP//VAULT master list',
  '',
  'Operator cheat sheet for the onion site. Locked files are **not** shown until you type a command in the on-page terminal (`File 018`).',
  '',
  '**Totals:** 18 featured on the page + 260 cabinet files (130 open / 130 locked) + Konami File 279 = **279 files**.',
  '',
  '## Global commands',
  '',
  '| Command | What it does |',
  '|---|---|',
  '| `help` | Lists public commands |',
  '| `open 020` | Unlocks that file number (zero-padded ok: `020` or `20`) |',
  '| `cabinet gym` | Unlocks every locked file in that cabinet |',
  '| `unlocked` | Lists files you have opened this session |',
  '| `locked` | Lists locked titles still sealed (no bodies) |',
  '| `catalog` | Counts open vs locked |',
  '| `konami` | Unlocks File 279 |',
  '| `master balloon-help` | Dumps this entire cheat sheet in the terminal |',
  '',
  'Cabinets: `' + CABINETS.map((c) => c.id).join('`, `') + '`.',
  '',
  '## Featured (always on the page)',
  '',
  '| File | Title | Access | Command |',
  '|---|---|---|---|',
  ...featured.map(
    (f) =>
      `| ${pad(f.id)} | ${f.title} | ${f.access} | ${f.cmd} |`,
  ),
  '',
  '## Cabinet files 019–278',
  '',
  '| File | Title | Access | Command | Cabinet |',
  '|---|---|---|---|---|',
  ...files.map((f) => {
    const access = f.locked ? 'LOCKED' : 'OPEN';
    const cmd = f.locked ? `\`${f.cmd}\` or \`open ${pad(f.id)}\`` : '—';
    return `| ${pad(f.id)} | ${f.title} | ${access} | ${cmd} | ${f.cabinet} |`;
  }),
  '',
  '## Locked commands only (copy/paste)',
  '',
  '```',
  ...locked.map((f) => `${f.cmd}     # File ${pad(f.id)} ${f.title}`),
  '```',
  '',
];

writeFileSync(join(root, 'MASTER_LIST.md'), lines.join('\n'));
console.log(`wrote ${files.length} files (${open.length} open, ${locked.length} locked)`);
