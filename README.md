# CORSociety

CORSociety is the standalone repository for the Roman Society mod for Citizen of Rome.

The source mod lives in `cor_society/`. The installable release archive contains that whole folder and is published with the mod version in the file name, for example `Releases/CORSociety-v1.1.27.zip`.

## Install

1. Download the latest versioned archive from `Releases/`, for example `CORSociety-v1.1.27.zip`.
2. Install it as a Citizen of Rome mod.
3. Enable `Roman Society` in-game.

The archive is intentionally built with a top-level `cor_society/` folder. After extraction, the path must look like `mods/cor_society/main.js`; if `main.js` is extracted directly into `mods/`, the game will not detect the mod.

## Key Features

- Living Roman houses with their own wealth, influence, prestige, stability, social order, alliances, rivalries, patronage, marriages, scandals, and internal history.
- Society orders tied to the base game's social and property systems, so status, marriage eligibility, and political standing evolve together instead of living in separate layers.
- Simulated dynasty play for NPC houses, including marriages, children, inheritance pressure, courtship, affairs, trade, relationship changes, and social mobility.
- Visual family trees for Society dynasties and the player's dynasty, designed to avoid taking control away from the human player's current character.
- Player Dynasty Tree as a current-character action, with missing player ancestors prepared when the mod starts rather than only when the tree is opened.
- Visual relationship badges inside Society character views, plus safe game status icons for meaningful family relations where Citizen of Rome displays character statuses.
- Interactive courtship, marriage, business, diplomacy, family-support, and scandal events with visible consequences.
- Persistent relationship systems for friendship, rivalry, patronage, mentorship, admiration, resentment, betrayal, and house-level diplomacy.
- Social traits with icons and gameplay effects, including traits that influence courtship, marriage, trade, scandals, opinions, and family events.
- Native-style portrait integration for Society characters, wardrobe changes, family trees, and vanilla/Society mixed marriages.
- Family Wardrobe global action using native portrait SVG recoloring, with skin, hair, eyes, and jewelry protected from outfit tinting.
- Custom Roman house shields for the player and NPC houses, including a configurable player shield.
- Bundled vanilla-style and other-mod actions so Roman Society can be installed as one package instead of requiring several separate mods.
- Integrated Bank of Rome, Coemptio matchmaking, and Household Slaves systems adapted into Society instead of requiring separate legacy installs.
- Real slave characters in the Society slave order, with origins, owners, portraits, household tasks, market purchases, capture opportunities, NPC house ownership, self-purchase savings, family rescue attempts, slave-to-slave marriages, children, and manumission into their own Freedmen house.
- NPC houses can borrow from the bank, buy and manage slaves, seek marriages, and suffer consequences from hostile social actions; cheat-style systems are not used for NPC simulation.
- Android-focused safety rules: old unstable Society-only data can be repaired, migrated, or discarded when needed to protect loading performance and save stability.

## Project Rule

Performance, stability, Android safety, and visual quality take priority over compatibility with old internal Society save formats. When old Society-only data conflicts with clean integration or causes loading risk, the mod should repair, migrate, or discard that data instead of preserving unstable behavior.

## Development

Build the release zip from the repository root:

```powershell
tar.exe -a -c -f 'Releases\CORSociety-v1.1.27.zip' 'cor_society'
```

Use `tar.exe -a` on Windows instead of `Compress-Archive`: it preserves zip paths as `cor_society/main.js`, which is safer for Android extraction.

Validate the DAAPI object-literal scripts:

```powershell
node -e "const fs=require('fs'); for (const f of ['cor_society/engine.js','cor_society/main.js']) { const s=fs.readFileSync(f,'utf8'); new Function('return ('+s+'\n)'); console.log(f+' ok'); }"
```


## Credits

- Citizen of Rome belongs to its creator. Roman Society is an unofficial fan mod.
- `CitizenOfRomeDynastyAscendant` / the Citizen of Rome example mod ecosystem: bundled Play As, Murder, Stealing From, and Open DevTools snippets in `cor_society/bundled/`, adapted here so Roman Society can ship as one installable package.
- Local COR mod versions: Disinheritance and Restore Inheritance actions, adapted and bundled into Roman Society for easier installation.
- `peritiSumus/CoR-Mods`: Bank of Rome, Coemptio, and Household Slaves legacy mod concepts/assets, modernized and integrated into Roman Society with current Citizen of Rome compatibility.
- Citizen of Rome vanilla systems and assets: Roman Society is designed around the game's existing DAAPI, event, portrait, genealogy, property, and character systems.
- Roman Society development direction: built around performance, Android stability, visual integration, and making NPC dynasties feel like active Roman families rather than static menu entries.
