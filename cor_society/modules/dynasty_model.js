{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {},
  methods: {
    _mixinCorSocietyDynastyModel() {
      if (!window.corSociety) {
        return
      }
      if (window.corSociety._mixinCorSocietyDynastyModelVersion === '1.1.293') {
        return
      }
      Object.assign(window.corSociety, {
        gameDynastyIdForHouse(house) {
                  if (!house) {
                    return ''
                  }
                  return house.dynastyId || house.gameDynastyId || house.id || ''
                },
        originHouseIdForDynasty(dynastyId) {
                  return String(dynastyId || '')
                },
        dynastyFeaturesForHouse(house, state, fallback) {
                  fallback = fallback || {}
                  let dynastyId = this.gameDynastyIdForHouse(house || {}) || (house && house.dynastyId)
                  let dynasty = dynastyId && state && state.dynasties ? state.dynasties[dynastyId] : false
                  let nameParts = String((house && house.name) || '').split(/\s+/).filter(Boolean)
                  return {
                    nomen: (dynasty && dynasty.nomen) || fallback.nomen || nameParts[0] || this.pick(this.nomina),
                    cognomen: (dynasty && dynasty.cognomen) || fallback.cognomen || nameParts.slice(1).join(' ') || this.pick(this.cognomina),
                    prestige: parseFloat((dynasty && dynasty.prestige) || (house && house.prestige) || fallback.prestige || 0),
                    heritage: this.normalizedHeritage((dynasty && dynasty.heritage) || (house && house.heritage) || fallback.heritage || 'roman_plebeian')
                  }
                },
        dynastyFeaturesForCharacter(character, state, fallback) {
                  fallback = fallback || {}
                  let dynasty = character && character.dynastyId && state && state.dynasties ? state.dynasties[character.dynastyId] : false
                  return {
                    nomen: (dynasty && dynasty.nomen) || fallback.nomen || this.pick(this.nomina),
                    cognomen: (dynasty && dynasty.cognomen) || fallback.cognomen || this.pick(this.cognomina),
                    prestige: parseFloat((dynasty && dynasty.prestige) || fallback.prestige || 0),
                    heritage: this.normalizedHeritage((dynasty && dynasty.heritage) || fallback.heritage || 'roman_plebeian')
                  }
                },
        normalizeDynastyHouseModel(society, state) {
                  if (!society || !society.houses) {
                    return society
                  }
                  society.dynasties = society.dynasties || {}
                  let knownHousesByDynasty = {}
                  for (let houseId in society.houses) {
                    if (!society.houses.hasOwnProperty(houseId)) {
                      continue
                    }
                    let house = society.houses[houseId]
                    if (!house) {
                      continue
                    }
                    house.id = house.id || houseId
                    let dynastyId = house.dynastyId || house.gameDynastyId || house.id
                    house.dynastyId = dynastyId
                    house.gameDynastyId = dynastyId
                    let originHouseId = this.originHouseIdForDynasty(dynastyId)
                    if (house.originHouse === undefined) {
                      house.originHouse = String(house.id) === originHouseId
                    }
                    house.branchName = house.branchName || (house.originHouse ? 'House of origin' : 'Cadet house')
                    house.houseKind = house.houseKind || (house.originHouse ? 'origin' : 'cadet')
                    knownHousesByDynasty[dynastyId] = knownHousesByDynasty[dynastyId] || []
                    if (knownHousesByDynasty[dynastyId].indexOf(house.id) < 0) {
                      knownHousesByDynasty[dynastyId].push(house.id)
                    }
                  }
                  for (let dynastyId in knownHousesByDynasty) {
                    if (!knownHousesByDynasty.hasOwnProperty(dynastyId)) {
                      continue
                    }
                    let gameDynasty = (state && state.dynasties && state.dynasties[dynastyId]) || {}
                    let record = society.dynasties[dynastyId] || {}
                    let originHouseId = this.originHouseIdForDynasty(dynastyId)
                    let originHouse = society.houses[originHouseId] || society.houses[knownHousesByDynasty[dynastyId][0]] || {}
                    record.id = dynastyId
                    record.name = record.name || this.houseName(gameDynasty, dynastyId)
                    record.originHouseId = record.originHouseId || (society.houses[originHouseId] ? originHouseId : originHouse.id)
                    record.headHouseId = record.headHouseId || record.originHouseId
                    record.houseIds = knownHousesByDynasty[dynastyId].slice().sort((a, b) => {
                      let first = society.houses[a] || {}
                      let second = society.houses[b] || {}
                      if (!!second.originHouse !== !!first.originHouse) {
                        return first.originHouse ? -1 : 1
                      }
                      return String(first.name || '').localeCompare(String(second.name || ''))
                    })
                    record.stratum = originHouse.stratum || record.stratum || 'plebeian'
                    record.prestige = Math.max(parseFloat(record.prestige || 0), parseFloat(originHouse.prestige || gameDynasty.prestige || 0))
                    record.heritage = record.heritage || originHouse.heritage || gameDynasty.heritage || 'unknown'
                    record.lastSeen = this.monthKey(state || daapi.getState())
                    if (!society.houses[record.headHouseId]) {
                      record.headHouseId = record.originHouseId
                    }
                    society.dynasties[dynastyId] = record
                  }
                  return society
                },
        societyDynastyForHouse(society, house) {
                  if (!society || !house) {
                    return false
                  }
                  let dynastyId = this.gameDynastyIdForHouse(house)
                  return dynastyId && society.dynasties ? society.dynasties[dynastyId] : false
                },
        sortedDynasties(society) {
                  society = society || this.load()
                  let dynasties = Object.keys(society.dynasties || {}).map((id) => society.dynasties[id]).filter(Boolean)
                  return dynasties.sort((a, b) => {
                    let firstHouse = society.houses && society.houses[a.originHouseId]
                    let secondHouse = society.houses && society.houses[b.originHouseId]
                    let firstStrength = firstHouse ? firstHouse.strength || 0 : 0
                    let secondStrength = secondHouse ? secondHouse.strength || 0 : 0
                    if (secondStrength !== firstStrength) {
                      return secondStrength - firstStrength
                    }
                    return String(a.name || '').localeCompare(String(b.name || ''))
                  })
                },
        housesForDynasty(society, dynastyId) {
                  society = society || this.load()
                  let record = society.dynasties && society.dynasties[dynastyId]
                  let ids = record && record.houseIds ? record.houseIds.slice() : []
                  if (!ids.length) {
                    ids = Object.keys(society.houses || {}).filter((houseId) => {
                      let house = society.houses[houseId]
                      return house && String(this.gameDynastyIdForHouse(house)) === String(dynastyId)
                    })
                  }
                  return ids.map((houseId) => society.houses[houseId]).filter(Boolean)
                },
        primaryHouseForDynasty(society, dynastyId) {
                  let houses = this.housesForDynasty(society, dynastyId)
                  return houses.find((house) => house.originHouse) || houses[0] || false
                },
        memberIdsForDynasty(society, state, dynastyId) {
                  let seen = {}
                  let ids = []
                  this.housesForDynasty(society, dynastyId).forEach((house) => {
                    ;((house && house.memberIds) || []).concat((house && house.slaveIds) || []).forEach((characterId) => {
                      if (!characterId || seen[characterId]) {
                        return
                      }
                      let character = state && state.characters && state.characters[characterId]
                      if (!character || character.isDead) {
                        return
                      }
                      seen[characterId] = true
                      ids.push(characterId)
                    })
                  })
                  for (let characterId in (state && state.characters) || {}) {
                    if (!state.characters.hasOwnProperty(characterId) || seen[characterId]) {
                      continue
                    }
                    let character = state.characters[characterId]
                    if (character && !character.isDead && character.dynastyId && String(character.dynastyId) === String(dynastyId)) {
                      seen[characterId] = true
                      ids.push(characterId)
                    }
                  }
                  return ids
                },
        branchHouseId(dynastyId, seed) {
                  return this.originHouseIdForDynasty(dynastyId) + '_branch_' + this.safeId(seed || Date.now() + '_' + this.randomInt(1000, 9999))
                },
        cadetHouseLimitForStratum(stratum) {
                  if (stratum === 'senatorial') return 5
                  if (stratum === 'equestrian') return 4
                  if (stratum === 'civic') return 3
                  if (stratum === 'plebeian') return 2
                  if (stratum === 'freedmen') return 2
                  return 1
                },
        playerCadetHouseInfo(society, state, dynasty) {
                  let currentId = this.currentCharacterId(state)
                  let player = state.characters && state.characters[currentId]
                  let visible = !!(dynasty && player && player.dynastyId && String(player.dynastyId) === String(dynasty.id))
                  if (!visible) {
                    return { visible: false, available: false, reason: 'not your dynasty', tooltip: '' }
                  }
                  let houses = this.housesForDynasty(society, dynasty.id)
                  let headHouse = society.houses[dynasty.headHouseId] || this.primaryHouseForDynasty(society, dynasty.id) || {}
                  let limit = this.cadetHouseLimitForStratum(headHouse.stratum || dynasty.stratum)
                  let cash = parseFloat(((state || {}).current || {}).cash || 0)
                  let prestige = parseFloat(((state || {}).current || {}).prestige || 0)
                  let influence = parseFloat(((state || {}).current || {}).influence || 0)
                  let cost = this.playerCadetHouseCost(headHouse)
                  let candidate = this.cadetFounderCandidate(society, state, dynasty.id, true)
                  let reason = ''
                  if (houses.length >= limit) reason = 'branch limit'
                  else if (!candidate) reason = 'no adult branch'
                  else if (cash < cost.cash) reason = 'need ' + cost.cash + ' cash'
                  else if (prestige < cost.prestige) reason = 'need ' + cost.prestige + ' prestige'
                  else if (influence < cost.influence) reason = 'need ' + cost.influence + ' influence'
                  return {
                    visible,
                    available: !reason,
                    reason,
                    cost,
                    candidate,
                    tooltip: [
                      'Creates a secondary house inside your dynasty. The dynasty name stays unchanged.',
                      'Requires an adult married or landed branch member.',
                      'Cost: ' + cost.cash + ' cash, ' + cost.prestige + ' prestige, ' + cost.influence + ' influence.',
                      'Current houses: ' + houses.length + '/' + limit + '.',
                      reason ? 'Unavailable: ' + reason + '.' : 'The new house may one day contest the dynasty headship.'
                    ].join('\n')
                  }
                },
        playerCadetHouseCost(house) {
                  let level = this.socialLevel((house && house.stratum) || 'plebeian')
                  return {
                    cash: [90, 140, 220, 420, 800, 1400][level] || 220,
                    prestige: [3, 5, 8, 14, 25, 45][level] || 8,
                    influence: [5, 8, 14, 24, 42, 75][level] || 14
                  }
                },
        cadetFounderCandidate(society, state, dynastyId, playerOnly) {
                  let currentId = this.currentCharacterId(state)
                  let ids = playerOnly ? this.playerFamilyMemberIds(state) : this.memberIdsForDynasty(society, state, dynastyId)
                  let candidates = ids.map((id) => {
                    let character = state.characters && state.characters[id]
                    if (character) character.id = character.id || id
                    return character
                  }).filter((character) => {
                    if (!character || character.isDead || character.corSocietySlave || character.corSocietySlaveActive) return false
                    if (!character.dynastyId || String(character.dynastyId) !== String(dynastyId)) return false
                    if (character.corSocietyHouseId && !String(character.corSocietyHouseId).endsWith(String(dynastyId))) return false
                    if (playerOnly && this.sameCharacterId(character.id, currentId)) return false
                    let age = this.age(character, state)
                    return age >= 18 && (character.spouseId || (character.childrenIds || []).length || this.characterScore(character, state) >= 35)
                  })
                  return candidates.sort((a, b) => this.characterScore(b, state) - this.characterScore(a, state))[0] || false
                },
        createCadetHouse(society, state, dynastyId, founder, reason) {
                  if (!society || !state || !dynastyId || !founder) {
                    return false
                  }
                  let dynasty = society.dynasties[dynastyId] || {}
                  let originHouse = this.primaryHouseForDynasty(society, dynastyId)
                  if (!originHouse) {
                    return false
                  }
                  let houses = this.housesForDynasty(society, dynastyId)
                  let limit = this.cadetHouseLimitForStratum(originHouse.stratum || dynasty.stratum)
                  if (houses.length >= limit) {
                    return false
                  }
                  let houseId = this.branchHouseId(dynastyId, founder.id + '_' + houses.length + '_' + this.monthKey(state))
                  let house = this.createHouseRecord(houseId, dynastyId)
                  house.name = 'House of ' + (founder.praenomen || 'Cadet') + ' ' + (dynasty.name || originHouse.name || '')
                  house.branchName = 'Cadet branch of ' + (dynasty.name || originHouse.name || 'the dynasty')
                  house.originHouse = false
                  house.houseKind = 'cadet'
                  house.stratum = originHouse.stratum || dynasty.stratum || 'plebeian'
                  house.generated = true
                  house.cadetHouse = true
                  house.foundedByCharacterId = founder.id
                  house.foundedReason = reason || 'cadet branch'
                  house.relation = this.clamp((originHouse.relation || 0) - this.randomInt(3, 12), -100, 100)
                  house.wealth = Math.max(20, Math.round((originHouse.wealth || 60) * 0.35))
                  house.power = Math.max(5, Math.round((originHouse.power || 15) * 0.35 + this.characterScore(founder, state) / 5))
                  house.strength = Math.max(10, Math.round((originHouse.strength || 30) * 0.30 + this.characterScore(founder, state) / 3))
                  house.prestige = Math.max(100, Math.round((originHouse.prestige || dynasty.prestige || 500) * 0.20))
                  house.heritage = originHouse.heritage || dynasty.heritage || 'unknown'
                  house.citizenRank = this.rankFromStrength(house.strength)
                  house.agenda = this.pick(['wealth', 'marriage', 'office', 'security'])
                  house.memberIds = []
                  house.notableIds = []
                  society.houses[houseId] = house
                  let moveIds = this.cadetBranchMemberIds(state, founder)
                  moveIds.forEach((characterId) => {
                    try {
                      daapi.updateCharacter({ characterId, character: { corSocietyHouseId: houseId, dynastyId } })
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                  state = daapi.getState()
                  this.refreshHouseMemberLists(society, state, originHouse)
                  this.refreshHouseMemberLists(society, state, house)
                  this.normalizeDynastyHouseModel(society, state)
                  this.log(society, house.name + ' is founded as a cadet house of ' + (dynasty.name || originHouse.name) + '.', 'familyTree', house.id)
                  return house
                },
        cadetBranchMemberIds(state, founder) {
                  let seen = {}
                  let ids = []
                  let add = (id) => {
                    if (!id || seen[id] || !state.characters || !state.characters[id]) return
                    seen[id] = true
                    ids.push(id)
                  }
                  add(founder.id)
                  add(founder.spouseId)
                  ;(founder.childrenIds || []).forEach(add)
                  let spouse = state.characters[founder.spouseId]
                  if (spouse && spouse.childrenIds) {
                    spouse.childrenIds.forEach(add)
                  }
                  return ids.slice(0, 8)
                },
        updateDynastyHeadship(society, state) {
                  society = society || this.load()
                  let changed = false
                  this.normalizeDynastyHouseModel(society, state || daapi.getState())
                  for (let dynastyId in society.dynasties) {
                    if (!society.dynasties.hasOwnProperty(dynastyId)) continue
                    let dynasty = society.dynasties[dynastyId]
                    let houses = this.housesForDynasty(society, dynastyId)
                    if (houses.length < 2) continue
                    let currentHead = society.houses[dynasty.headHouseId] || this.primaryHouseForDynasty(society, dynastyId)
                    let challenger = houses.slice().sort((a, b) => this.houseHeadshipScore(b) - this.houseHeadshipScore(a))[0]
                    if (!currentHead || !challenger || challenger.id === currentHead.id) continue
                    let lead = this.houseHeadshipScore(challenger) - this.houseHeadshipScore(currentHead)
                    if (lead >= 35 && (challenger.power || 0) >= (currentHead.power || 0) + 8) {
                      dynasty.headHouseId = challenger.id
                      challenger.lastFamilyEvent = 'Claims leadership of the dynasty.'
                      currentHead.lastFamilyEvent = 'Loses dynasty leadership to a cadet house.'
                      this.log(society, challenger.name + ' becomes head house of ' + (dynasty.name || dynastyId) + ' without changing any house names.', 'familyTree', challenger.id)
                      changed = true
                    }
                  }
                  return changed
                },
        houseHeadshipScore(house) {
                  if (!house) return 0
                  return Math.round((house.strength || 0) + (house.power || 0) * 1.4 + (house.wealth || 0) / 12 + (house.prestige || 0) / 900 + (house.stability || 0) / 3)
                },
        changeText(label, value) {
                  value = Math.round(parseFloat(value || 0))
                  if (!value) {
                    return ''
                  }
                  return (value > 0 ? '+' : '') + value + ' ' + label
                },
        syncWithGame(society, state) {
                  let members = this.collectHouseMembers(state, society)
                  for (let houseId in members) {
                    if (!members.hasOwnProperty(houseId)) {
                      continue
                    }
                    let firstMember = members[houseId][0] || {}
                    let dynastyId = (society.houses[houseId] && this.gameDynastyIdForHouse(society.houses[houseId])) || firstMember.dynastyId || houseId
                    let house = society.houses[houseId] || this.createHouseRecord(houseId, dynastyId)
                    let summary = this.summarizeHouse(dynastyId, members[houseId], state)
                    let previousMembers = {}
                    ;(house.memberIds || []).forEach((characterId) => {
                      previousMembers[characterId] = true
                    })
                    if (house.originHouse || !house.name) {
                      house.name = summary.name
                    }
                    house.stratum = summary.stratum
                    house.strength = summary.strength
                    house.memberIds = summary.memberIds
                    house.notableIds = summary.notableIds
                    house.prestige = summary.prestige
                    house.heritage = summary.heritage
                    house.citizenRank = summary.citizenRank
                    if (!house.wealth) {
                      house.wealth = Math.max(20, Math.round(summary.strength * 18 + summary.prestige / 80))
                    }
                    if (!house.power) {
                      house.power = Math.max(5, Math.round(summary.strength / 2))
                    }
                    if (!house.stability) {
                      house.stability = this.randomInt(35, 75)
                    }
                    summary.memberIds.forEach((characterId) => {
                      let character = state.characters[characterId]
                      if (!previousMembers[characterId] && character && (character.fatherId || character.motherId) && this.age(character, state) <= 1) {
                        this.log(society, 'A child is born into ' + summary.name + ': ' + this.characterName(character, state) + '.', 'birth', house.id)
                      }
                    })
                    house.lastSeen = this.monthKey(state)
                    society.houses[house.id] = house
                  }
                  this.normalizeDynastyHouseModel(society, state)
                  if (society.settings.autoGenerate) {
                    this.ensureMinimumHouses(society, state)
                    state = daapi.getState()
                    this.normalizeDynastyHouseModel(society, state)
                  }
                },
        collectHouseMembers(state, society) {
                  let result = {}
                  let current = state.current || {}
                  let player = state.characters[this.currentCharacterId(state)] || {}
                  let playerDynastyId = player.dynastyId
                  let household = {}
                  ;(current.householdCharacterIds || []).forEach((characterId) => {
                    household[characterId] = true
                  })
                  if (state.dynasties) {
                    for (let dynastyId in state.dynasties) {
                      if (!state.dynasties.hasOwnProperty(dynastyId) || dynastyId === playerDynastyId) {
                        continue
                      }
                      let dynasty = state.dynasties[dynastyId]
                      if (!dynasty || !dynasty.memberIds) continue
                      dynasty.memberIds.forEach((characterId) => {
                        let character = state.characters[characterId]
                        if (!character || character.isDead || !character.dynastyId) {
                          return
                        }
                        if (character.corSocietySlaveMarket && character.corSocietySlaveActive === false) {
                          return
                        }
                        if (household[characterId] && character.dynastyId === playerDynastyId) {
                          return
                        }
                        character.id = character.id || characterId
                        let houseId = character.corSocietyHouseId && society && society.houses && society.houses[character.corSocietyHouseId]
                          ? character.corSocietyHouseId
                          : character.dynastyId
                        result[houseId] = result[houseId] || []
                        result[houseId].push(character)
                      })
                    }
                  }
                  return result
                },
        createHouseRecord(houseId, dynastyId) {
                  dynastyId = dynastyId || houseId
                  return {
                    id: houseId,
                    dynastyId,
                    gameDynastyId: dynastyId,
                    originHouse: String(houseId) === String(dynastyId),
                    houseKind: String(houseId) === String(dynastyId) ? 'origin' : 'cadet',
                    branchName: String(houseId) === String(dynastyId) ? 'House of origin' : 'Cadet house',
                    relation: this.randomInt(-12, 16),
                    favor: 0,
                    heat: 0,
                    rivalry: false,
                    patronageUntil: '',
                    tradeUntil: '',
                    wealth: 0,
                    power: 0,
                    stability: this.randomInt(35, 75),
                    ai: false,
                    agenda: this.pick(['office', 'wealth', 'honor', 'marriage', 'security', 'revenge']),
                    lastFamilyEvent: '',
                    pendingPlayerEvent: false,
                    lastInteraction: '',
                    notes: []
                  }
                },
        summarizeHouse(dynastyId, members, state) {
                  let dynasty = state.dynasties[dynastyId] || {}
                  let prestige = parseFloat(dynasty.prestige || 0)
                  let inheritance = 0
                  let maxJob = 0
                  let hasSenate = false
                  let memberIds = []
                  members.forEach((character) => {
                    memberIds.push(character.id)
                    inheritance += parseFloat(character.inheritance || 0)
                    maxJob = Math.max(maxJob, parseFloat(character.jobLevel || 0))
                    if (this.isSenatorialCharacter(character, state)) {
                      hasSenate = true
                    }
                  })
                  let strength = Math.round(prestige / 1000 + inheritance / 100 + maxJob * 8 + members.length * 4 + (hasSenate ? 60 : 0))
                  let notableIds = members
                    .slice()
                    .sort((a, b) => this.characterScore(b, state) - this.characterScore(a, state))
                    .slice(0, 8)
                    .map((character) => character.id)
                  return {
                    name: this.houseName(dynasty, dynastyId),
                    stratum: this.classifyHouse(dynasty, members, strength, hasSenate),
                    strength,
                    memberIds,
                    notableIds,
                    prestige,
                    heritage: dynasty.heritage || 'unknown',
                    citizenRank: this.rankFromStrength(strength)
                  }
                }
      })
      window.corSociety._mixinCorSocietyDynastyModelVersion = '1.1.293'
    }
  }
}
