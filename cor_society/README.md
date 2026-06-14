# Roman Society

Roman Society adds a living social layer to Citizen of Rome.

## Design Rule

Performance, stability, Android safety, and visual quality take priority over compatibility with old internal Society save formats. When old Society-only data conflicts with clean integration or causes loading risk, the mod may repair, migrate, or discard that Society-only data.

The achievement compatibility hook is intentional and must not be removed.

## Version 1.1.307

This build is based on the stable 1.1.290 gameplay layer and keeps the working action/button dispatch flow while splitting the former monolithic engine into module mixins.

## Highlights

- Living Roman dynasties and houses with marriages, children, relationships, social traits, trade, scandals, slavery, banking, property play, and family trees.
- Player spouse, children, and close kin are now repaired into one canonical player house tied to the vanilla dynasty, preventing stale cloned houses, wrong crests, missing member groups, and false slave-family labels.
- Dynasty and house trees now share the same underlying genealogy with strict scope rules: Dynasty tree shows only the selected dynasty and its houses, while House tree filters that graph to the selected connected house branch only.
- Dynasty membership is now repaired as one connected genealogy when possible; lateral branches such as siblings, uncles, great-uncles, nephews, and cousins must connect through explicit parents, children, spouses, siblings, or dead ancestor connectors created during migration/repair, never during tree rendering.
- Tree character cards now show each character's real Society house crest and origin/cadet house label, so branches stay visually distinct inside the dynasty tree.
- External spouses, slaves, captured dependants, and unrelated houses no longer seed or expand dynasty trees, reducing duplicate roots and expensive tree DOM on Android.
- Family-tree rendering now uses connected components, canonical couple roots, and shared duplicate suppression, so the selected character cannot appear repeatedly through parallel ancestor roots.
- House trees ignore stale `knownMemberIds` as authority and use explicit house assignment plus connected genealogy instead.
- House trees now suppress same-house people who are not attached to the selected/root branch by a real parent, child, or spouse edge.
- Tree building avoids per-open global generated-character scans and uses local allowed-ID components for faster Android menu/tree opening.
- Dynasty trees no longer create dead collateral ancestors during rendering or normal maintenance; disconnected legacy debris is filtered instead of being papered over with new ghost people.
- Dynasty tree rendering now avoids global character scans and suppresses floating disconnected components from old save data.
- Dynasty and house tree contexts now use a per-month runtime cache, so reopening the same tree from another Society menu route does not repeat the heavy genealogy work in the same turn.
- House trees render from explicit house assignment plus real genealogy and hide disconnected root debris if older save data still contains an isolated component.
- Dynasty, house, member-list, overlay, and tree code now share one canonical house-resolution rule: valid explicit house, inherited parental house, then dynasty origin house.
- Old contaminated house pointers and stale known-member lists are repaired conservatively without deleting real characters; free tree membership stays separate from slave/historical membership.
- House Tree builds from the selected house and then crops to the connected branch around the focused/root member, so random same-house records do not appear as loose branches.
- House Tree keeps real uncles, cousins, siblings, descendants, and collateral branches when they are actually connected to that branch.
- External spouses can appear visually, but they are not treated as house members, roots, or expandable tree seeds.
- Top-level living House Tree branches are labeled `House branch` instead of `Root`.
- `repairHouseMembership()` runs before House Tree rendering and repairs selected-house membership, cadet branches, invalid house pointers, and stale known-member lists without creating living or dead filler.
- `validateDynastyHouseSystem()` is available in debug snapshots and checks origin houses, cadet parent houses, founders, house/dynasty mismatches, and member-list contamination.
- Cadet house creation now records parent/founder/branch metadata and moves the founder's descendant branch instead of only the immediate nuclear family.
- Generated houses are seeded only at initial setup, and generated members are created through a real couple as spouses or children instead of unrelated filler.
- Player-created and NPC-created cadet houses refresh membership without fabricating retroactive ancestors during normal tree opening.
- Generated houses now enforce a minimum living gender mix where possible so houses do not begin as dead-end single-gender lines.
- Houses with no living known members are removed from active Society orders and moved to a dead-house archive under Past Affairs.
- Dead houses keep historical info and an archived graphical family tree when characters still exist in the save.
- Bank of Rome now includes private loans: the player can lend to houses, and NPC houses can extend credit to each other.
- Private loans now also support player borrowing: use Borrow to request credit from wealthy houses, with acceptance based on cash, relation, stability, and amount.
- Generated child records with one existing parent may be repaired with the missing spouse/parent; records with no parents are no longer given a fabricated dead parent pair during normal tree repair.
- Slave market pagination keeps Next/Previous known people below market offers instead of splitting the list.
- Same-family and spouse character pages use family visit options rather than Request Introduction.
- NPC family simulation now prioritizes marriage-focused and small houses in the monthly batch, reducing avoidable extinction without removing the Android performance cap.
- Native portrait, wardrobe, relationship badge, house shield, slave, Coemptio, Bank of Rome, Play As, murder, stealing, disinheritance, and restore-inheritance integrations remain bundled.

## Debug Console

Open the game's DAAPI/developer command console and run `corSocietyDebug()` to open the in-game Society debug window. Useful variants: `corSocietyDebug("log")`, `corSocietyDebug("houses")`, `corSocietyDebug("systems")`, and `corSocietyDebug("full")`.

If a platform command scope does not expose bare globals, use `daapi.corSocietyDebug()` or `daapi.invokeMethod({ event: "/cor_society/engine", method: "openDebugConsole" })`. The command stores the last snapshot in the `corSocietyLastDebugSnapshot` global flag.
