# Roman Society

Roman Society adds a living social layer to Citizen of Rome.

## Design Rule

Performance, stability, Android safety, and visual quality take priority over compatibility with old internal Society save formats. When old Society-only data conflicts with clean integration or causes loading risk, the mod may repair, migrate, or discard that Society-only data.

The achievement compatibility hook is intentional and must not be removed.

## Version 1.1.294

This build is based on the stable 1.1.290 gameplay layer and keeps the working action/button dispatch flow while splitting the former monolithic engine into module mixins.

## Highlights

- Living Roman dynasties and houses with marriages, children, relationships, social traits, trade, scandals, slavery, banking, property play, and family trees.
- Generated houses now enforce a minimum living gender mix where possible so houses do not begin as dead-end single-gender lines.
- Houses with no living known members are removed from active Society orders and moved to a dead-house archive under Past Affairs.
- Dead houses keep historical info and an archived graphical family tree when characters still exist in the save.
- Bank of Rome now includes private loans: the player can lend to houses, and NPC houses can extend credit to each other.
- Private loans now also support player borrowing: use Borrow to request credit from wealthy houses, with acceptance based on cash, relation, stability, and amount.
- Generated child records with one missing parent are repaired with a matching ghost parent so Society trees stay coherent.
- Slave market pagination keeps Next/Previous known people below market offers instead of splitting the list.
- Same-family and spouse character pages use family visit options rather than Request Introduction.
- Native portrait, wardrobe, relationship badge, house shield, slave, Coemptio, Bank of Rome, Play As, murder, stealing, disinheritance, and restore-inheritance integrations remain bundled.

## Debug Console

Open the game's DAAPI/developer command console and run `corSocietyDebug()` to open the in-game Society debug window. Useful variants: `corSocietyDebug("log")`, `corSocietyDebug("houses")`, `corSocietyDebug("systems")`, and `corSocietyDebug("full")`.

If a platform command scope does not expose bare globals, use `daapi.corSocietyDebug()` or `daapi.invokeMethod({ event: "/cor_society/engine", method: "openDebugConsole" })`. The command stores the last snapshot in the `corSocietyLastDebugSnapshot` global flag.
