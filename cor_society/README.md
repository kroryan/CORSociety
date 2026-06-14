# Roman Society

Roman Society adds a living social layer to Citizen of Rome.

## Design Rule

Roman Society prioritizes performance, stability, and visual quality over compatibility with older internal versions of the mod. When an older Society save format conflicts with Android stability or clean integration, the mod repairs or discards the old Society-only data instead of preserving risky behavior.

## Performance

`1.1.291` fixes the issues reviewed in `ANALISIS COMPLETO2.MD`: NPC Society traits now sync from `characterSocial`, generated family members inherit correct dynasty features, fertility-blocking flags are respected, freedman rescue attempts no longer depend on one brittle flag, monthly care events no longer stop the rest of the monthly event pipeline, wardrobe repair is schema-gated instead of version-gated, and the base game's mod-used achievement flag is no longer cleared by Society.

## Features

- Adds `Roman Society`, `House Shield`, `Family Wardrobe`, `Bank of Rome`, `Household Slaves`, and `Player Dynasty Tree` as actions on the current player character instead of cluttering the global action bar.
- Adds a `Close Society` button to Society modal pages so the menu can be closed directly without walking back through every screen.
- Prepares the current player dynasty tree during mod startup/monthly sync, so missing dead parents, grandparents, and limited extra kin exist before the tree is opened.
- Groups houses into social orders using existing game data: dynasty prestige, heritage, jobs, inheritance, Senate links, and living members.
- Separates dynasties from houses: every dynasty has at least one origin house, can gain secondary cadet houses, and tracks a current head house independently from the origin house name.
- Lets strong cadet houses challenge and replace the current dynasty head house without renaming any house or breaking the wider dynasty tree.
- Generates missing houses so every social level has families to interact with.
- Seeds generated houses with real game characters at startup, preferring young adult founders so they have time to marry, have children, rise, or fall.
- Generated houses now enforce a connected dynasty tree: every generated house gets a shared ancestor line up to grandparents and at least one pair of siblings, while keeping extra living kin tightly limited.
- Uses vanilla Citizen of Rome portrait assets through a local `icons/characters/...` to `img/*.svg` resolver, and keeps vanilla look data as the base identity.
- Uses stable vanilla-based looks for Society-generated characters, with age progression and inherited look colors.
- Gives generated characters vanilla Citizen of Rome traits through `daapi.addTrait`.
- Adds Society social traits as real game trait definitions with original Roman Society SVG icons, such as Adulterer, Faithful, Liar, Honorable, Manipulator, Charitable, Cruel, Gossip, Ambitious, Resentful, Mentor, and Student; these appear alongside game traits where Citizen of Rome shows character traits and affect relationships, courtship, trade, scandals, and family events.
- Generates persistent Roman-style house shields for the player and every known NPC house.
- Adds a separate current-character `House Shield` action for editing the player's shield without cluttering the Society menus.
- Adds a current-character `Family Wardrobe` action with its own wardrobe icon for changing safe vanilla-SVG clothing tint, with outfit availability tied to the player's Society order.
- Bundles compatible standalone actions inside Society so they do not need separate installation: Play As, Attempt Murder, animal stealing events, Disinherit, Restore Inheritance, Bank of Rome, Coemptio matchmaking, Household Slaves, and optional desktop DevTools access. Society can also surface the bundled character actions from its `Vanilla / other mods actions` menu even if the base game has not injected them into that character yet.
- Adds contextual Society stealing against a selected character's household, with cooldowns, target-house context, success/failure outcomes, and caught consequences against both personal and house relations.
- Replaces the old Society poor order presentation with a slave order: slave kin groups, market candidates, captured dependants, household slaves, and manumitted freedmen are all represented by real characters where possible.
- Gives slaves cultural origins, owner links, Society status icons, household work roles, sale/manumission flow, and access from Society menus while keeping their vanilla portraits unobstructed.
- Supports rare Roman slave origins from debt-bondage, condemnation, or renegade status. Those explanatory slavery notes are cleared when the character becomes free.
- Gives owned slaves assignable household tasks with cooldowns and capped owner benefits: accounts can produce cash, educators can improve selected children under 13, doctors can treat household conditions, entertainers can add prestige, warriors can add influence/security, and laborers can provide small cash.
- Expands the slave market with more purchasable profiles, including tutors, scribes, nurses, midwives, musicians, dancers, stewards, accountants, couriers, bodyguards, gladiators, hunters, cooks, artisans, and stable hands. These profiles map back to balanced household tasks and existing icon assets.
- Gives owned slaves slow personal savings and an explicit freedom objective. When savings reach the freedom price, the player can accept self-purchase and manumit them into their own Freedmen house.
- Allows marriages only between owned household slaves of different gender. Your family cannot arrange marriages with enslaved characters through Society or Coemptio.
- Allows married owned slave couples to have children through the game's pregnancy API; children born to household slaves are recorded as real household slave characters.
- Adds a private company action with prestige, relationship, and savings effects plus cooldown. It is adult-only. When executed with a female slave of childbearing age, it carries risk of illegitimate pregnancy; children born to household slaves through private company are recorded as real household slave bastards with hidden biological paternity. Eligible children can later be manumitted or legitimized into the free father's dynasty.
- Manumitted slaves become freed citizens/liberti in their own new Freedmen house, rather than being absorbed into the player's household or a shared reception house.
- Enslaved player characters reached through Play As get a current-character `Path to Freedom` action with extra work, patron-seeking, petitions, escape attempts, savings, and manumission into a free Freedmen house.
- Lets manumitted freedmen houses occasionally try to buy and free enslaved close relatives when they can afford it.
- Lets NPC houses use the integrated Bank of Rome, Coemptio, and Household Slaves systems as virtual players; they may borrow, buy slaves, pursue marriages, and suffer consequences from social or hostile actions.
- Lets NPC houses use vanilla Citizen of Rome property economics: the same property keys, values, revenue, stewardship limits, economy-of-scale factor, sale rate, and senatorial commercial-property restriction used by the base game.
- Injects a Bank of Rome loan option into negative-cash forced-sale/debt notices when possible, so debt can be covered by a balanced loan in the same flow instead of a separate follow-up prompt.
- Tracks persistent relationships, favors, rivalries, patronage, trade ties, allies, rivals, and past affairs.
- Shows visual relationship badges with score, color, and icon in Society character lists, and uses safe Citizen of Rome character status icons for meaningful family relations instead of fragile floating DOM overlays.
- Splits allies/patrons and rivals into separate paged menus with matching overview counts and contextual Back navigation.
- Shows past affairs as paged notification-style entries with their own event icons.
- Uses copied vanilla interface icons for social orders and Society actions where the mod API allows local assets.
- Lets the player inspect every known living dynasty member through Notables, Established members, and Common kin.
- Lets the player interact with houses and characters, including Society actions plus vanilla / other mod character actions when the game exposes them.
- Adds character family navigation through one `Full family tree` button, plus dynasty and house-branch graphical trees with portrait cards, spouse links, children branches, zoom, centering, stable Back navigation, and dark/light theme detection.
- Lets the player arrange marriages between unmarried adults from their household and NPC houses using the game's marriage API.
- Includes the current player character as a marriage candidate when they are unmarried, so starts without a spouse and sudden succession cases can still use Society marriages.
- Lets introduced characters become lovers through private courtship regardless of gender, with rapport, cooldowns, scandal risk, possible pregnancy when biologically possible, and divorce fallout when an exposed affair breaks a marriage.
- Courtship now opens a five-choice interaction where the best approach depends on traits, personality, status, and scandal risk. Characters younger than 13 cannot become lovers.
- Lover pregnancies track hidden biological paternity. If a scandal exposes the true father, Society corrects the family tree and transfers the child to the biological father's dynasty when the official father was wrong.
- Changes a used `Request introduction` into `Invite home to talk`, so introductions are a one-time social step and later visits become cooldown-limited relationship events.
- Shows short parenthesized reasons when marriage is unavailable, such as no adult, too high, too low, or required relation.
- Adds native button tooltips to Society menus and event popups so long-pressing/holding an option shows the expected consequences before confirming it.
- Restricts marriages by order: one order down, same order, one order up, or two orders up with very high relations.
- Derives the player's Society order from the base game's property class, senatorial flag, and vanilla heritage, then updates the visible main-screen citizen title without overwriting vanilla `heritage`.
- Applies real game effects through cash, prestige, influence, revenue modifiers, and monthly events.
- Adds family-care events for stressed, severely stressed, depressed, sick, ill, or wounded household members, with treatment, rest, or neglect options.
- Adds lightweight trade compact reviews, patronage account audits, and child tutorship offers so active social ties keep producing choices without heavy monthly processing.
- Trade compacts no longer stack infinitely: each house can maintain one active trade bonus, and the compact breaks automatically if relations collapse or rivalry starts.
- Lets houses play their own monthly social game through wealth, power, stability, agendas, family events, inter-house marriages, pregnancies, inter-house relationships, and rank movement.
- Gives each house a separate virtual-player state: AI cash, AI influence, AI prestige, property, focus, and controller marker.
- Lets large vanilla changes to the player's cash, influence, or prestige shift Society relations, so base-game events can affect the social map too.
- Can surface family events to the player: office campaigns, marriage alliances, inheritance disputes, trade ventures, scandals, feuds, petitions, and slander.
- Maintains a capped extended-kin window around the player's household through the game's own close-family retention path. This lets visible NPC relatives continue marriage and children across more Society generations, while the cap and monthly recalculation protect Android performance.

## Social Orders

- Senatorial houses
- Equestrian houses
- Civic citizens
- Plebeian citizens
- Freedmen
- Slaves

## Notes

The mod uses the game's existing characters and dynasties first. Generated houses are only added when a social order has too few living non-household characters.

Generated people are created with the game's own `daapi.generateCharacter` flow. Society gives them real character IDs, vanilla Roman looks, vanilla traits, `flagDoNotCull`, and family links such as `spouseId`, `fatherId`, `motherId`, and `childrenIds` where appropriate. Every Society-generated living person is marked internally and receives dead generated parents if the game did not already give them parents, so trees have a basic root without adding dead people to living member lists.

Generated characters are given a real game character ID and a vanilla Roman base `look`, so the game can recognize them as normal characters. Children inherit the base look type from parents with small variation, and portraits age by stage without losing that inherited visual base.

Citizen of Rome portraits are complete bundled SVG illustrations selected from `character.look.group`, `character.look.type`, gender, and age stage. They are not assembled from separate clothing layers at runtime. The old Society-only portrait generator has been removed; Society characters, dynasties, trees, vanilla windows, and wardrobe previews now resolve from vanilla portrait assets. For Android stability, the wardrobe does not persist a custom DAAPI `look` on characters. It stores only a lightweight `corSocietyOutfit` choice and applies a post-load vanilla-SVG clothing recolor where possible. The recolor scans portrait geometry, classifies visible lower-body clothing paint regions, protects vanilla skin, face-detail, jewelry, gold, metal adornments, and upper portrait identity colors such as long hair that extends below the ears. Choosing `Automatic` clears that Society outfit choice. If an older Society build left a risky `cor_society` or `cor_society_wardrobe` look on a character, the current mod repairs it back to a vanilla Roman look during startup.

Generated traits use vanilla trait keys from the official example mod documentation, such as `senator`, `educated`, `literate`, `honorable`, `ambitious`, `gregarious`, `strong`, and `sly`.

Arranged marriages and AI house marriages call `daapi.performMarriage`, so the resulting spouse relationship should appear in the vanilla family UI after the game refreshes. If the vanilla marriage API rejects a wedding, Society does not fake the spouse link by writing `spouseId` manually; it shows an error and applies no Society effects. Marrying upward improves prestige and influence but costs more; marrying downward can improve practical support and local ties while costing some elite standing.

AI house marriages have a higher monthly pregnancy chance than older Society builds, and pregnancies are attempted through `daapi.impregnate` so the base game can resolve the birth normally. Society also keeps more related NPC parents close enough to the player's household for the base game to preserve their children, bounded by `extendedKinDepth` and `extendedKinLimit` settings. Lover relationships are stored in Society state instead of vanilla `spouseId`; exposed affairs can damage relations, lower stability, cost player prestige/influence, and may clear vanilla spouse links as a divorce when the scandal is severe.

The player's Society order is calculated from the same economic ladder used by the base game: Proletarii, Class V, Class IV, Class III, Class II, Class I, Equites, and Senatores. Novus Homo remains a vanilla heritage value, but Society treats it as a civic-status marker once the household has enough property class to support that rank. The main-screen citizen title is patched visually so it can evolve with Society status while leaving the vanilla data intact for elections and other base-game systems.

AI houses can also attempt pregnancies through `daapi.impregnate`. The base game remains responsible for resolving the birth; Society records the pregnancy and later detects new child IDs when the dynasty updates.

House shields are generated locally as SVG images and saved in the mod state. NPC house shields appear beside family portraits in Society lists. The player shield is configured from the current-character `House Shield` action and is shown as a small portrait badge when the mod can identify the current player portrait in the UI.

Each month, houses pursue their own agenda. Some affairs only change the social map and appear in `Past Affairs`; others become decisions for the player and can affect influence, prestige, cash, relationships, favors, rivalries, or revenue. Trade ventures are now investments with a one or two month settlement notice instead of instant monthly income.

Roman Society does not use `setCurrentCharacter` and does not take control away from the human player. Vanilla family screens are opened by setting the game's `selectedCharacterId`, which selects the tree being viewed without changing the current playable character. NPC houses are simulated by the mod as separate virtual players, marked internally as `cor_society_ai`; they can rise or fall between social orders as their simulated wealth, power, and stability change.

The base game blocks external platform achievements when `current.flagUsedMods` is true. Society no longer clears that vanilla mod-used flag, because doing so every tick can leave irreversible achievement-state side effects in a save. If Citizen of Rome exposes an official achievement-safe mod API later, Society should use that instead.

The Society slave order uses the internal `poor` key for save compatibility, but the visible order is now `Slaves`. Members of slave houses are treated as enslaved dependants with origins such as Gallic, Egyptian, Numidian, Greek, Thracian, Syrian, Iberian, Illyrian, Judean, Punic, Dacian, Germanic, Anatolian, Roman debt-bond, Roman condemned, or Roman renegade. When they are bought by the player or an NPC house, they move as real characters into that household's slave list. When freed by the player, they leave slavery, clear slavery-specific origin notes, become `roman_freedman` Society characters, and enter a new Freedmen house of their own. Freed slaves may later spend house resources to rescue close relatives who are still enslaved.

Household slave tasks are intentionally modest for balance and have task-change cooldowns. They create useful owner benefits without infinite stacking: cash from accounts/labor, prestige from entertainment/private company, influence from guards, directed child skill improvement from educators, and possible treatment from doctors. Owned slaves also accumulate small savings toward self-purchase. Private company is adult-only; possible bastard children enter the household as slaves, can be manumitted, and can be legitimized into the free father's dynasty when the father belongs to the player's dynasty. Romance and extended bastard mechanics remain for free adult relationship systems and lovers.

The integrated legacy animal-stealing event keeps the original event idea, but Society loads its large icon assets lazily to reduce Android startup pressure.

## Bundled Mod Credits

The bundled Play As, Murder, Stealing From, and Open DevTools snippets in `bundled/` are from `CitizenOfRomeDynastyAscendant` / the Citizen of Rome example mod ecosystem and are included here with route and asset paths adapted so Roman Society can ship as one installable package.

The Disinheritance and Restore Inheritance actions are bundled from the local `CORmods` versions and adapted to run from inside Roman Society.

Bank of Rome, Coemptio, and Household Slaves are based on the older open `peritiSumus/CoR-Mods` mods, with their mechanics and assets updated for the current Citizen of Rome codebase and integrated into Society's house, character, slave, banking, and matchmaking simulation.
