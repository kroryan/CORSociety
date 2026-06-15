# Roman Society — "More like Crusader Kings" roadmap

Investigation + phased plan. Phase 1 (Roman place names) shipped in 1.1.321. The
rest are designed here and will be implemented in confirmed, testable phases.

## Investigation summary (what already exists)

The mod is already a strong base for CK-style play. Confirmed from the code:

- **Houses & dynasties:** full model (`dynasty_model.js`): origin/cadet houses,
  headship, membership resolved by `resolveCharacterHouseId`, dynasty = union of its
  houses (`houseBelongsToDynasty`).
- **House economy / PROPERTY (key for the user's idea):** `monthly_economy.js` already
  models vanilla property types (`vanillaPropertyTypes`/`vanillaPropertyGroups`:
  land, animals, boats, estates) with value, revenue, stewardship caps, economy of
  scale, and per-house modifiers. **Families can already accumulate land/estates** —
  this is exactly the currency to compete over instead of titles.
- **NPC houses as virtual players:** `simulateHouseTurns` gives houses cash,
  influence, prestige, power, stability, agendas (office/wealth/honour/marriage/
  security/revenge), and rivalries.
- **Inter-house actions today:** trade deals/compacts, gifts, dinners, ask support,
  rivalry (`startRivalry`/`reconcile`), scandals, petitions, slander, rumours,
  marriage, patronage, ventures, debt bonds (already a form of coercion).
- **Senate / class:** the base game exposes `state.current.senate` (offices ->
  character ids), `flagIsSenetorialClass`/`flagIsSenatorialClass`,
  `flagCanHoldImperium`. The mod reads these for the senatorial stratum. **No
  dictator/emperor system yet — that is new.**
- **Crusader Kings III** (reference, in `Crusader Kings III/game/...`, Paradox script,
  not portable): relevant systems to emulate conceptually are Schemes (hostile:
  murder, **abduct/kidnap for ransom**), Casus Belli & wars, **Factions** (claimant /
  lower-crown-authority — the analogue of "change the succession law"), Council
  positions & appointments, Hooks/Stress.

## Design rules

- Build on the EXISTING property/economy + relations + senate data. Do not invent a
  parallel economy.
- Everything must degrade safely if a base-game field is missing (guarded reads).
- Player real marriages / living real characters are never corrupted (same rule as
  the family-tree work).
- Each phase is shippable and testable on its own.

## Phase 1 — Roman place-name flavour ✅ (1.1.321)

Real roads/districts/hills/landmarks/regions/estates in property & commerce
notifications. Data in `config.js`, helpers in `log_utils.js`.

## Phase 2 — Land feuds & seizure (families compete over property)

New inter-house actions, mirroring the existing rivalry/trade action shape:

- **Press a land claim / property dispute:** target a rival house's property
  (land/estate). Cost: influence (+cash bribe option). Success chance from relative
  `power`, household `stewardship`, `relation`, Senate standing, and whether you hold
  a magistracy. On success: transfer a slice of property value
  (adjust target `propertyDetails` down / yours up, or cash), +heat/+rivalry, a
  flavour log naming a real place ("seized the horrea on the Aventine from House X").
  On failure: prestige/relation loss, possible counter-feud.
- **Raid / blockade:** temporary revenue debuff modifier on a rival's property group
  (reuse `house.ai.modifiers`) instead of a permanent transfer — lower escalation.
- **AI:** rival houses run the same actions against each other and the player
  (extend `simulateInterHouseAffairs`), producing "House X seized ... from House Y"
  notifications and occasional offers/threats to the player.
- **Defence:** spend cash/influence to fortify property (a protective modifier),
  call in allies/patrons.

## Phase 3 — Abduction for extortion (CK "abduct" scheme)

- **Abduct a rival's relative:** start a plot (reuse the bundled murder-plot
  scaffolding pattern). Risk of exposure -> scandal/heat. On success the target
  relative is held; you can **ransom** them (cash/property/favour), demand a one-off
  **hook** (a future free action: support in Senate, a marriage, dropping a feud), or
  release for relation. Captive tracked in society state with a deadline; the rival
  house may attempt a **rescue** (chance based on their power) or pay.
- Ties into the existing debt-bond enslavement code as the precedent for "holding a
  person for leverage".

## Phase 4 — Senate -> Dictator -> Emperor (government change)

Progression and ranks (new society state, e.g. `society.rome.government` =
`republic | dictatorship | empire`, `society.rome.rulerHouseId`,
`society.rome.successionLaw`):

1. **Senatorial path:** once the player is senatorial / holds offices
   (`state.current.senate`, `flagCanHoldImperium`), unlock political ambitions:
   build a faction of supporting houses (favours, marriages, bribes, patronage),
   accrue "auctoritas".
2. **Dictator (required first step to empire):** with enough support + a crisis
   pretext, the player can have the Senate appoint them **Dictator** (temporary
   extraordinary magistracy). This grants emergency powers (appointments, force a
   Senate vote, levy support) for a limited term and raises opposition from rival
   houses. The FIRST person to become Emperor **must** have been Dictator first.
3. **Emperor (rare, hard, not guaranteed):** **Most dictators never become Emperor**
   — historically the dictatorship was temporary and usually ended in stepping down
   (Cincinnatus) or assassination (Caesar). So becoming Emperor is gated behind a
   demanding event chain that many runs will fail:
   - The dictatorship is **time-limited**: a term clock ticks down. If it expires
     before you have built enough, the Senate forces you to **lay down the office**
     (back to senatorial), with prestige changes either way.
   - Hard prerequisites accumulated DURING the dictatorship: high auctoritas, a large
     loyal faction, control of key Senate offices, military/clientela backing, treasury
     (donatives), and low active opposition. Missing any gate blocks the attempt.
   - A multi-step **acclamation/coup event chain** with real failure branches at each
     step: a failed Senate vote, an exposed plot, an `optimates` backlash, or a rival
     dictator-claimant can end the bid — outcomes include forced abdication,
     **prosecution/proscription**, exile, **assassination**, or **civil war**. Failure
     is common and costly; success is the exception.
   - Only on full success does `government` switch to `empire`. This then changes the
     whole world state: war-time / unrest notifications to NPC houses, factions for and
     against, and consequences on every house's relation/heat with the imperial house.
   - Design intent: reaching Dictator is itself hard (needs a crisis pretext + Senate
     support + rivals' opposition), and Dictator -> Emperor is harder still and
     frequently fails. Both steps are driven by events with branching complications,
     not a single button.
4. **Hereditary but contestable succession:** after the first Emperor it becomes
   **hereditary** (heir = imperial house heir). Other families periodically push
   **events to change the succession law** to "by wealth" or "by power/strength"
   (their analogue of CK faction "alter succession"). The reigning **Emperor can
   defend**: spend influence/auctoritas, hold games/donatives (reuse property/cash),
   purge or co-opt rivals, win a Senate vote, or marry into the challenger. If the
   Emperor loses a contest, the throne can pass to the wealthiest/strongest house and
   government may revert toward dictatorship/republic.

### Emperor power mechanics

- **Appointments:** name house heads to Senate offices / governorships (reuse the
  property/region data for provinces) -> ongoing relation + revenue effects.
- **Declare war / proscriptions:** target a house or faction; spawns war-time
  notifications to NPCs, temporary economy debuffs, casualty/loss events, and
  resolves to property/relation transfers. Affects ALL houses, not just the target.
- **Class effect:** becoming Emperor changes the player's own standing (a rank above
  senatorial) and unlocks imperial-only actions; abdication/defeat reverts it.

## Phase 5 — Real-place + real-time flavour polish

- Province/region names gated to the era once the base-game year encoding is
  confirmed (so notifications only cite provinces Rome held at that date).
- War, appointment, and seizure notifications cite real roads/regions consistently.

## Historical / legal grounding (Roman law & custom to model)

Implement mechanics on REAL Roman rules, not generic fantasy. Anchors to honour:

- **Cursus honorum:** ordered magistracies (quaestor -> aedile -> praetor -> consul),
  minimum ages and intervals, prior military service. Senate entry typically via the
  quaestorship. Use this as the senatorial-progression ladder; the base game's
  `state.current.senate` offices map onto it.
- **Dictatorship (Republican, constitutional):** an extraordinary magistracy named by
  a consul on the Senate's authority for a grave crisis; classic **6-month** term (or
  the task's duration), a single colleague the **magister equitum** (master of horse),
  imperium not subject to provocatio. Historically laid down early (Cincinnatus). Sulla
  and Caesar broke the norm (dictator legibus scribundis; dictator perpetuo) — model
  those as rare, destabilising, opposition-spawning exceptions.
- **Path to one-man rule (the Augustan model):** not a legal "emperor" title but an
  accumulation — **imperium proconsulare maius** + **tribunicia potestas**, the name
  **Augustus/Princeps**, control of key provinces and the treasury/army, plus
  **auctoritas**. Model "becoming Emperor" as assembling these powers, not flipping a
  title.
- **Succession was NOT formally hereditary** in 27 BC: it ran through **adoption** and
  grants of powers to a designated heir, ratified in practice by Senate + army +
  Praetorians. So "hereditary but contestable" = heir-by-adoption/designation that
  rivals can challenge; the "change to wealth/power" faction is the ahistorical-but-
  fun analogue of the army/Senate acclaiming the strongest claimant (year of the four
  emperors).
- **Coercion & law to reuse for feuds/abduction:** proscriptions (Sulla, Second
  Triumvirate) = legalised seizure of a rival's property + bounty; **clientela/patron
  duties**; debt bondage (already in the mod) as precedent for leverage; courts and
  prosecutions (repetundae) as a non-violent attack vector.
- **Property/provinces:** land (ager publicus, latifundia), insulae, horrea, provincial
  estates; governors (propraetor/proconsul) extract revenue — maps onto the existing
  property system + the new appointment mechanic. Province names must match dates Rome
  actually held them.

When implementing each phase, verify specifics against the base game's available
fields first, and keep historically wrong-but-needed simplifications explicitly noted.

## Implementation notes / hook points

- New actions: add methods in `actions_status.js` (mirror `startRivalry`/`tradeDeal`),
  expose via `engine.js` + `main.js` `runAction`, add buttons in the House screen
  (`menus.js openHouse`) and a new "Politics / Senate" hub entry.
- AI: extend `simulateInterHouseAffairs` (monthly) for NPC-vs-NPC feuds, abductions,
  and faction moves; bounded per tick like `sustainStrugglingHouses`.
- World state: store Rome government/ruler/succession + factions in `society` (saved),
  invalidate caches on change.
- Notifications: route through `this.log(...)` + `pushModal`, always with a real
  place name where a location makes sense.
