{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {},
  methods: {
    _mixinCorSocietyDynastyModel() {
      if (!window.corSociety) {
        return
      }
      if (window.corSociety._mixinCorSocietyDynastyModelVersion === '1.1.307') {
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
                    house.type = house.type || house.houseKind
                    house.createdAtTurn = house.createdAtTurn || house.createdMonth || house.lastSeen || this.monthKey(state || daapi.getState())
                    house.version = house.version || this.version
                    if (house.originHouse) {
                      house.parentHouseId = ''
                      house.founderId = house.founderId || ((house.notableIds || [])[0]) || ((house.memberIds || [])[0]) || ''
                      house.branchRootId = house.branchRootId || house.founderId || ''
                    } else {
                      if (!house.parentHouseId || !society.houses[house.parentHouseId] || String(this.gameDynastyIdForHouse(society.houses[house.parentHouseId])) !== String(dynastyId)) {
                        house.parentHouseId = originHouseId
                      }
                      house.founderId = house.founderId || house.foundedByCharacterId || ((house.notableIds || [])[0]) || ((house.memberIds || [])[0]) || ''
                      house.branchRootId = house.branchRootId || house.founderId || ''
                    }
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
                    if (!record.originHouseId || !society.houses[record.originHouseId] || String(this.gameDynastyIdForHouse(society.houses[record.originHouseId])) !== String(dynastyId)) {
                      record.originHouseId = society.houses[originHouseId] ? originHouseId : originHouse.id
                    }
                    record.rootAncestorId = record.rootAncestorId || ''
                    record.rootCoupleId = record.rootCoupleId || ''
                    record.createdAtTurn = record.createdAtTurn || record.createdMonth || this.monthKey(state || daapi.getState())
                    record.version = record.version || this.version
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
        repairDynastyHouseSystem(society, state) {
                  if (!society || !state || !state.characters) {
                    return false
                  }
                  let repairKey = 'dynasty-house-canonical-' + this.version + '-lineage-v3'
                  if (society.dynastyHouseRepairVersion === repairKey) {
                    return false
                  }
                  let changed = false
                  this.normalizeDynastyHouseModel(society, state)
                  if (this.repairGeneratedHouseGenealogy && this.repairGeneratedHouseGenealogy(society, state)) {
                    changed = true
                  }
                  if (this.repairDynastyGenealogyConnectivity && this.repairDynastyGenealogyConnectivity(society, state)) {
                    changed = true
                    state = daapi.getState()
                  }
                  Object.keys(society.dynasties || {}).forEach((dynastyId) => {
                    let dynasty = society.dynasties[dynastyId]
                    let originHouseId = this.canonicalOriginHouseId(society, dynastyId)
                    if (!society.houses[originHouseId]) {
                      society.houses[originHouseId] = this.createHouseRecord(originHouseId, dynastyId)
                      changed = true
                    }
                    if (dynasty.originHouseId !== originHouseId) {
                      dynasty.originHouseId = originHouseId
                      changed = true
                    }
                  })
                  Object.keys(society.houses || {}).forEach((houseId) => {
                    let house = society.houses[houseId]
                    if (!house) return
                    let dynastyId = this.gameDynastyIdForHouse(house)
                    if (!dynastyId) {
                      house.dynastyId = house.id
                      house.gameDynastyId = house.id
                      dynastyId = house.id
                      changed = true
                    }
                    if (!society.dynasties[dynastyId]) {
                      society.dynasties[dynastyId] = {
                        id: dynastyId,
                        name: house.name || String(dynastyId),
                        originHouseId: this.originHouseIdForDynasty(dynastyId),
                        headHouseId: this.originHouseIdForDynasty(dynastyId),
                        houseIds: []
                      }
                      changed = true
                    }
                    if (!house.originHouse) {
                      if (!house.parentHouseId || !society.houses[house.parentHouseId] || String(this.gameDynastyIdForHouse(society.houses[house.parentHouseId])) !== String(dynastyId)) {
                        house.parentHouseId = this.canonicalOriginHouseId(society, dynastyId)
                        changed = true
                      }
                    }
                    let founder = house.founderId && state.characters[house.founderId]
                    if (founder && founder.dynastyId && String(founder.dynastyId) !== String(dynastyId)) {
                      house.founderId = ''
                      house.branchRootId = ''
                      changed = true
                    }
                    let cleanKnown = []
                    let knownSeen = {}
                    this.canonicalHouseMemberSourceIds(society, state, house, { includeKnown: true, includeSlaves: true }).forEach((characterId) => {
                      let character = state.characters[characterId]
                      if (!character || knownSeen[characterId]) return
                      let resolvedHouseId = this.resolveCharacterHouseId(character, state, society, { repair: true, includeSlaves: true })
                      if (resolvedHouseId && String(resolvedHouseId) === String(house.id)) {
                        knownSeen[characterId] = true
                        cleanKnown.push(characterId)
                      } else {
                        changed = true
                      }
                    })
                    house.knownMemberIds = cleanKnown.slice(-160)
                    house._lastRefreshedSignature = ''
                    this.refreshHouseMemberLists(society, state, house)
                  })
                  this.normalizeDynastyHouseModel(society, state)
                  society.dynastyHouseRepairVersion = repairKey
                  if (changed && this.clearFamilyTreeRuntimeCache) {
                    this.clearFamilyTreeRuntimeCache()
                  }
                  return changed
                },
        repairDynastyGenealogyConnectivity(society, state) {
                  if (!society || !state || !state.characters || !this.ensureDynastyCommonTree) {
                    return false
                  }
                  let changed = false
                  Object.keys(society.dynasties || {}).forEach((dynastyId) => {
                    let seedIds = this.dynastyGenealogyRepairSeedIds(society, state, dynastyId)
                    if (seedIds.length < 2) {
                      return
                    }
                    let components = this.genealogyComponentsForIds(state, seedIds)
                    if (components.length <= 1) {
                      return
                    }
                    if (this.ensureDynastyCommonTree(society, state, dynastyId, {
                      force: true,
                      allowGhostAncestors: true,
                      allowRetroactiveGeneration: true,
                      budget: Math.min(24, Math.max(8, components.length * 3))
                    })) {
                      changed = true
                      state = daapi.getState()
                    }
                  })
                  return changed
                },
        dynastyGenealogyRepairSeedIds(society, state, dynastyId) {
                  let seen = {}
                  let ids = []
                  let primaryIds = []
                  let add = (id, options) => {
                    options = options || {}
                    id = id !== undefined && id !== null ? String(id) : ''
                    if (!id || seen[id] || !state.characters[id]) {
                      return
                    }
                    let character = state.characters[id]
                    if (!character || character.corSocietySlave || character.corSocietySlaveActive || character.corSocietyDetachedHouseMember) {
                      return
                    }
                    if (!character.dynastyId || String(character.dynastyId) !== String(dynastyId)) {
                      return
                    }
                    if (character.corSocietyGhostParent && !options.allowGhost) {
                      return
                    }
                    seen[id] = true
                    ids.push(id)
                    if (!character.corSocietyGhostParent) {
                      primaryIds.push(id)
                    }
                  }
                  this.housesForDynasty(society, dynastyId).forEach((house) => {
                    ;(house.memberIds || []).forEach(add)
                    ;(house.notableIds || []).forEach(add)
                    ;(house.knownMemberIds || []).forEach(add)
                    ;(house.deadMemberIds || []).forEach(add)
                    add(house.founderId)
                    add(house.branchRootId)
                  })
                  let dynasty = state.dynasties && state.dynasties[dynastyId]
                  ;((dynasty && dynasty.memberIds) || []).forEach(add)
                  Object.keys(state.characters || {}).forEach((id) => {
                    let character = state.characters[id]
                    if (character && !character.corSocietyGhostParent && character.dynastyId && String(character.dynastyId) === String(dynastyId)) {
                      add(id)
                    }
                  })
                  let addAncestors = (id) => {
                    let queue = [{ id, depth: 12 }]
                    while (queue.length) {
                      let item = queue.shift()
                      let character = state.characters[item.id]
                      if (!character || item.depth <= 0) {
                        continue
                      }
                      ;[character.fatherId, character.motherId].forEach((parentId) => {
                        parentId = parentId !== undefined && parentId !== null ? String(parentId) : ''
                        if (!parentId || !state.characters[parentId]) return
                        let parent = state.characters[parentId]
                        if (!parent.dynastyId || String(parent.dynastyId) !== String(dynastyId)) return
                        add(parentId, { allowGhost: true })
                        queue.push({ id: parentId, depth: item.depth - 1 })
                      })
                    }
                  }
                  primaryIds.slice().forEach(addAncestors)
                  return ids.slice(0, 260)
                },
        repairHouseMembership(society, state, houseId) {
                  if (!society || !state || !state.characters || !houseId || !society.houses || !society.houses[houseId]) {
                    return false
                  }
                  let house = society.houses[houseId]
                  let dynastyId = this.gameDynastyIdForHouse(house)
                  let changed = false
                  if (!dynastyId) {
                    return false
                  }
                  let assignToHouse = (characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.isDead || character.corSocietySlave || character.corSocietySlaveActive) {
                      return
                    }
                    if (!character.dynastyId || String(character.dynastyId) !== String(dynastyId)) {
                      return
                    }
                    if (String(character.corSocietyHouseId || '') !== String(house.id)) {
                      if (this.repairCharacterHousePointer(state, characterId, house.id)) {
                        changed = true
                      }
                    }
                  }
                  if (!house.originHouse && house.founderId && state.characters[house.founderId]) {
                    this.cadetBranchMemberIds(state, state.characters[house.founderId]).forEach(assignToHouse)
                  }
                  let sourceIds = this.canonicalHouseMemberSourceIds(society, state, house, { includeKnown: true, includeSlaves: false })
                  sourceIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.corSocietySlave || character.corSocietySlaveActive) {
                      return
                    }
                    let explicitHouseId = character.corSocietyHouseId || ''
                    if (explicitHouseId && (!society.houses[explicitHouseId] || String(this.gameDynastyIdForHouse(society.houses[explicitHouseId])) !== String(character.dynastyId || ''))) {
                      if (this.resolveCharacterHouseId(character, state, society, { repair: true })) {
                        changed = true
                      }
                    } else if (!explicitHouseId && character.dynastyId && String(character.dynastyId) === String(dynastyId)) {
                      let resolvedHouseId = this.resolveCharacterHouseId(character, state, society, { repair: true })
                      if (resolvedHouseId) {
                        changed = true
                      }
                    }
                  })
                  let cleanKnown = []
                  let seen = {}
                  this.canonicalHouseMemberSourceIds(society, state, house, { includeKnown: true, includeSlaves: true }).forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || seen[characterId]) {
                      return
                    }
                    let resolvedHouseId = this.resolveCharacterHouseId(character, state, society, { repair: false, includeSlaves: true })
                    if (resolvedHouseId && String(resolvedHouseId) === String(house.id)) {
                      seen[characterId] = true
                      cleanKnown.push(characterId)
                    } else {
                      changed = true
                    }
                  })
                  house.knownMemberIds = cleanKnown.slice(-160)
                  house._lastRefreshedSignature = ''
                  this.refreshHouseMemberLists(society, state, house)
                  if (changed && this.clearFamilyTreeRuntimeCache) {
                    this.clearFamilyTreeRuntimeCache()
                  }
                  return changed
                },
        validateDynastyHouseSystem(society, state, options) {
                  society = society || this.load()
                  state = state || daapi.getState()
                  options = options || {}
                  let warnings = []
                  let addWarning = (code, message, ref) => {
                    warnings.push({ code, message, ref: ref || '' })
                  }
                  Object.keys(society.dynasties || {}).forEach((dynastyId) => {
                    let dynasty = society.dynasties[dynastyId]
                    if (!dynasty.originHouseId || !society.houses[dynasty.originHouseId]) {
                      addWarning('dynasty.originHouse', 'Dynasty has no valid origin house.', dynastyId)
                    } else if (String(this.gameDynastyIdForHouse(society.houses[dynasty.originHouseId])) !== String(dynastyId)) {
                      addWarning('dynasty.originMismatch', 'Dynasty origin house belongs to another dynasty.', dynastyId)
                    }
                    ;(dynasty.houseIds || []).forEach((houseId) => {
                      if (!society.houses[houseId]) {
                        addWarning('dynasty.missingHouse', 'Dynasty references a missing house.', houseId)
                      }
                    })
                  })
                  Object.keys(society.houses || {}).forEach((houseId) => {
                    let house = society.houses[houseId]
                    let dynastyId = this.gameDynastyIdForHouse(house)
                    if (!dynastyId || !society.dynasties[dynastyId]) {
                      addWarning('house.noDynasty', 'House has no valid dynasty record.', houseId)
                    }
                    if (!house.originHouse) {
                      if (!house.parentHouseId || !society.houses[house.parentHouseId]) {
                        addWarning('house.noParent', 'Cadet house has no valid parent house.', houseId)
                      } else if (String(this.gameDynastyIdForHouse(society.houses[house.parentHouseId])) !== String(dynastyId)) {
                        addWarning('house.parentDynasty', 'Cadet parent house belongs to another dynasty.', houseId)
                      }
                    }
                    if (house.founderId && state.characters[house.founderId] && state.characters[house.founderId].dynastyId && String(state.characters[house.founderId].dynastyId) !== String(dynastyId)) {
                      addWarning('house.founderDynasty', 'House founder belongs to another dynasty.', houseId)
                    }
                    let mainIds = this.resolvedHouseMemberIds(society, state, house, { includeKnown: true, includeDead: true, repair: false })
                    mainIds.forEach((characterId) => {
                      let character = state.characters[characterId]
                      if (!character) return
                      if (character.dynastyId && String(character.dynastyId) !== String(dynastyId)) {
                        addWarning('member.dynastyMismatch', 'House member has another dynastyId.', houseId + ':' + characterId)
                      }
                      let resolvedHouseId = this.resolveCharacterHouseId(character, state, society, { repair: false })
                      if (resolvedHouseId && String(resolvedHouseId) !== String(house.id)) {
                        addWarning('member.houseMismatch', 'House list contains a member resolved to another house.', houseId + ':' + characterId)
                      }
                    })
                  })
                  let result = {
                    ok: warnings.length === 0,
                    warnings: warnings.slice(0, options.limit || 80),
                    warningCount: warnings.length,
                    dynastyCount: Object.keys(society.dynasties || {}).length,
                    houseCount: Object.keys(society.houses || {}).length
                  }
                  society.lastDynastyHouseValidation = result
                  return result
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
        canonicalOriginHouseId(society, dynastyId) {
                  if (!dynastyId) {
                    return ''
                  }
                  let record = society && society.dynasties && society.dynasties[dynastyId]
                  if (record && record.originHouseId && society.houses && society.houses[record.originHouseId]) {
                    return record.originHouseId
                  }
                  if (society && society.houses && society.houses[dynastyId]) {
                    return String(dynastyId)
                  }
                  let house = this.primaryHouseForDynasty(society, dynastyId)
                  return house && house.id ? house.id : String(dynastyId)
                },
        houseBelongsToDynasty(society, houseId, dynastyId) {
                  if (!society || !society.houses || !houseId || !dynastyId || !society.houses[houseId]) {
                    return false
                  }
                  return String(this.gameDynastyIdForHouse(society.houses[houseId])) === String(dynastyId)
                },
        resolveCharacterHouseId(character, state, society, options) {
                  if (!character || !state || !state.characters || !society) {
                    return ''
                  }
                  options = options || {}
                  let characterId = String(character.id || character.characterId || '')
                  if ((character.corSocietySlave || character.corSocietySlaveActive) && !options.includeSlaves) {
                    return ''
                  }
                  if (character.corSocietyDetachedHouseMember && !options.includeDetached) {
                    return ''
                  }
                  let dynastyId = character.dynastyId || ''
                  let playerHouseId = this.currentCharacterDynastyId ? this.currentCharacterDynastyId(state) : ''
                  if (!options.ignorePlayerHouse && playerHouseId && characterId && this.isPlayerFreeFamilyCharacter && this.isPlayerFreeFamilyCharacter(state, characterId, character)) {
                    if (character.dynastyId && String(character.dynastyId) !== String(playerHouseId)) {
                      return ''
                    }
                    if (!society.houses[playerHouseId] && this.createHouseRecord && options.createMissing === true) {
                      society.houses[playerHouseId] = this.createHouseRecord(playerHouseId)
                    }
                    return playerHouseId
                  }
                  if (!dynastyId) {
                    return ''
                  }
                  let explicitHouseId = character.corSocietyHouseId || ''
                  if (explicitHouseId && this.houseBelongsToDynasty(society, explicitHouseId, dynastyId)) {
                    return explicitHouseId
                  }
                  let depth = parseInt(options.depth || 0, 10)
                  if (depth < 4) {
                    let parentIds = [character.fatherId, character.motherId]
                    for (let i = 0; i < parentIds.length; i += 1) {
                      let parentId = parentIds[i]
                      let parent = parentId && state.characters[parentId]
                      if (!parent || parent.corSocietySlave || parent.corSocietySlaveActive) {
                        continue
                      }
                      let parentHouseId = this.resolveCharacterHouseId(parent, state, society, { ...options, repair: false, depth: depth + 1 })
                      if (parentHouseId && this.houseBelongsToDynasty(society, parentHouseId, dynastyId)) {
                        if (options.repair && explicitHouseId !== parentHouseId) {
                          this.repairCharacterHousePointer(state, characterId, parentHouseId)
                        }
                        return parentHouseId
                      }
                    }
                  }
                  let originHouseId = this.canonicalOriginHouseId(society, dynastyId)
                  if (originHouseId && society.houses && !society.houses[originHouseId] && options.createMissing === true) {
                    society.houses[originHouseId] = this.createHouseRecord(originHouseId, dynastyId)
                  }
                  if (originHouseId && this.houseBelongsToDynasty(society, originHouseId, dynastyId)) {
                    if (options.repair && explicitHouseId !== originHouseId) {
                      this.repairCharacterHousePointer(state, characterId, originHouseId)
                    }
                    return originHouseId
                  }
                  return ''
                },
        repairGeneratedHouseGenealogy(society, state) {
                  if (!society || !society.houses || !state || !state.characters) {
                    return false
                  }
                  let changed = false
                  Object.keys(society.houses || {}).forEach((houseId) => {
                    let house = society.houses[houseId]
                    if (!house || !house.generated) {
                      return
                    }
                    if (this.repairGeneratedHouseGenealogyForHouse(society, state, house)) {
                      changed = true
                    }
                  })
                  return changed
                },
        repairGeneratedHouseGenealogyForHouse(society, state, house) {
                  let ids = []
                  let seen = {}
                  let add = (id) => {
                    if (!id || seen[String(id)] || !state.characters[id]) return
                    let character = state.characters[id]
                    if (!character || character.isDead || character.corSocietySlave || character.corSocietySlaveActive || character.corSocietyDetachedHouseMember) return
                    if (String(character.corSocietyHouseId || '') !== String(house.id)) return
                    seen[String(id)] = true
                    ids.push(String(id))
                  }
                  ;(house.memberIds || []).forEach(add)
                  ;(house.notableIds || []).forEach(add)
                  ;(house.knownMemberIds || []).forEach(add)
                  Object.keys(state.characters || {}).forEach((id) => {
                    let character = state.characters[id]
                    if (character && String(character.corSocietyHouseId || '') === String(house.id)) {
                      add(id)
                    }
                  })
                  if (ids.length <= 1) {
                    return false
                  }
                  let components = this.genealogyComponentsForIds(state, ids)
                  if (components.length <= 1) {
                    return false
                  }
                  let main = this.mainHouseGenealogyComponent(state, house, components)
                  let mainMap = this.idSet(main)
                  let changed = false
                  components.forEach((component) => {
                    if (component === main) {
                      return
                    }
                    component.forEach((characterId) => {
                      let character = state.characters[characterId]
                      if (!character || !character.corSocietyGenerated || character.corSocietyPlayerTreeGenerated) {
                        return
                      }
                      if (this.tryAttachGeneratedHouseMemberToComponent(society, state, house, characterId, main)) {
                        changed = true
                        main.push(String(characterId))
                        mainMap[String(characterId)] = true
                        return
                      }
                      let hasOwnGenealogy = !!(character.spouseId || character.fatherId || character.motherId || (character.childrenIds || []).length || (character.siblingIds || []).length)
                      if (component.length > 1 || hasOwnGenealogy) {
                        return
                      }
                      if (this.detachGeneratedHouseMember(state, characterId)) {
                        changed = true
                      }
                    })
                  })
                  if (changed) {
                    house._lastRefreshedSignature = ''
                    this.refreshHouseMemberLists(society, state, house)
                  }
                  return changed
                },
        genealogyComponentsForIds(state, ids) {
                  let allowed = this.idSet(ids)
                  let seen = {}
                  let components = []
                  let neighbors = (id) => {
                    let character = state.characters[id]
                    let result = []
                    let add = (nextId) => {
                      nextId = nextId ? String(nextId) : ''
                      if (nextId && allowed[nextId] && state.characters[nextId] && result.indexOf(nextId) < 0) {
                        result.push(nextId)
                      }
                    }
                    if (!character) return result
                    add(character.fatherId)
                    add(character.motherId)
                    add(character.spouseId)
                    ;(character.childrenIds || []).forEach(add)
                    ;(character.siblingIds || []).forEach(add)
                    Object.keys(allowed).forEach((candidateId) => {
                      let candidate = state.characters[candidateId]
                      if (!candidate) return
                      if (this.sameCharacterId(candidate.spouseId, id)) {
                        add(candidateId)
                      }
                      if (this.sameCharacterId(candidate.fatherId, id) || this.sameCharacterId(candidate.motherId, id)) {
                        add(candidateId)
                      }
                      if ((candidate.siblingIds || []).some((siblingId) => this.sameCharacterId(siblingId, id))) {
                        add(candidateId)
                      }
                    })
                    return result
                  }
                  ;(ids || []).forEach((startId) => {
                    startId = String(startId)
                    if (seen[startId] || !allowed[startId]) {
                      return
                    }
                    let queue = [startId]
                    let component = []
                    while (queue.length) {
                      let id = String(queue.shift())
                      if (seen[id] || !allowed[id]) {
                        continue
                      }
                      seen[id] = true
                      component.push(id)
                      neighbors(id).forEach((nextId) => {
                        if (!seen[nextId]) queue.push(nextId)
                      })
                    }
                    if (component.length) {
                      components.push(component)
                    }
                  })
                  return components.sort((a, b) => b.length - a.length)
                },
        mainHouseGenealogyComponent(state, house, components) {
                  let preferred = [house && house.founderId, house && house.branchRootId].filter(Boolean).map(String)
                  for (let i = 0; i < preferred.length; i += 1) {
                    let id = preferred[i]
                    let found = components.find((component) => component.map(String).indexOf(id) >= 0)
                    if (found) return found
                  }
                  return components[0] || []
                },
        tryAttachGeneratedHouseMemberToComponent(society, state, house, characterId, mainIds) {
                  let character = state.characters[characterId]
                  if (!character || character.isDead || character.spouseId || character.fatherId || character.motherId || (character.childrenIds || []).length) {
                    return false
                  }
                  let members = (mainIds || []).map((id) => {
                    let member = state.characters[id]
                    if (member) member.id = member.id || id
                    return member
                  }).filter((item) => item && !item.isDead)
                  let couples = []
                  members.forEach((first) => {
                    let spouse = first.spouseId && state.characters[first.spouseId]
                    if (!spouse || spouse.isDead || mainIds.map(String).indexOf(String(spouse.id || first.spouseId)) < 0) return
                    spouse.id = spouse.id || first.spouseId
                    let father = this.characterIsMale(first) ? first : spouse
                    let mother = this.characterIsMale(first) ? spouse : first
                    if (father && mother && father.id && mother.id) {
                      couples.push({ father, mother })
                    }
                  })
                  let childAge = this.age(character, state)
                  for (let i = 0; i < couples.length; i += 1) {
                    let couple = couples[i]
                    if (this.age(couple.father, state) >= childAge + 16 && this.age(couple.mother, state) >= childAge + 16) {
                      return this.connectCharacterToParents(state, characterId, couple.father.id, couple.mother.id)
                    }
                  }
                  let characterAge = this.age(character, state)
                  let spouseTarget = members
                    .filter((candidate) => {
                      return candidate &&
                        !candidate.spouseId &&
                        this.characterIsMale(candidate) !== this.characterIsMale(character) &&
                        this.age(candidate, state) >= 16 &&
                        characterAge >= 16 &&
                        Math.abs(this.age(candidate, state) - characterAge) <= 18
                    })
                    .sort((a, b) => this.characterScore(b, state) - this.characterScore(a, state))[0]
                  if (!spouseTarget) {
                    return false
                  }
                  try {
                    daapi.updateCharacter({ characterId: spouseTarget.id, character: { spouseId: characterId } })
                    daapi.updateCharacter({ characterId, character: { spouseId: spouseTarget.id } })
                    spouseTarget.spouseId = characterId
                    character.spouseId = spouseTarget.id
                    return true
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                },
        detachGeneratedHouseMember(state, characterId) {
                  let character = state && state.characters && state.characters[characterId]
                  if (!character || !character.corSocietyGenerated) {
                    return false
                  }
                  try {
                    daapi.updateCharacter({
                      characterId,
                      character: {
                        corSocietyHouseId: '',
                        corSocietyDetachedHouseMember: true,
                        flagDoNotCull: true
                      }
                    })
                    character.corSocietyHouseId = ''
                    character.corSocietyDetachedHouseMember = true
                    character.flagDoNotCull = true
                    return true
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                },
        repairCharacterHousePointer(state, characterId, houseId) {
                  if (!characterId || !houseId || !state || !state.characters || !state.characters[characterId]) {
                    return false
                  }
                  try {
                    daapi.updateCharacter({ characterId, character: { corSocietyHouseId: houseId, flagDoNotCull: true } })
                    state.characters[characterId].corSocietyHouseId = houseId
                    state.characters[characterId].flagDoNotCull = true
                    return true
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                },
        canonicalHouseMemberSourceIds(society, state, house, options) {
                  options = options || {}
                  let seen = {}
                  let ids = []
                  let add = (id) => {
                    if (!id || seen[String(id)] || !state || !state.characters || !state.characters[id]) {
                      return
                    }
                    seen[String(id)] = true
                    ids.push(String(id))
                  }
                  ;(house.memberIds || []).forEach(add)
                  ;(house.notableIds || []).forEach(add)
                  ;(house.deadMemberIds || []).forEach(add)
                  add(house.founderId)
                  add(house.branchRootId)
                  if (options.includeKnown) {
                    ;(house.knownMemberIds || []).forEach(add)
                  }
                  if (options.includeSlaves) {
                    ;(house.slaveIds || []).forEach(add)
                  }
                  let dynastyId = this.gameDynastyIdForHouse(house)
                  let dynasty = dynastyId && state && state.dynasties && state.dynasties[dynastyId]
                  ;((dynasty && dynasty.memberIds) || []).forEach(add)
                  ;((society.generatedCharacterIds || [])).forEach((id) => {
                    let character = state.characters && state.characters[id]
                    if (!character) return
                    if (character.corSocietyHouseId && String(character.corSocietyHouseId) === String(house.id)) add(id)
                  })
                  if (house.isPlayerHouse && this.playerFamilyMemberIds) {
                    this.playerFamilyMemberIds(state).forEach(add)
                  }
                  return ids
                },
        resolvedHouseMemberIds(society, state, house, options) {
                  if (!society || !state || !state.characters || !house) {
                    return []
                  }
                  options = options || {}
                  let seen = {}
                  let ids = []
                  this.canonicalHouseMemberSourceIds(society, state, house, { includeKnown: !!options.includeKnown, includeSlaves: !!options.includeSlaves }).forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || seen[characterId]) {
                      return
                    }
                    if (!options.includeDead && character.isDead) {
                      return
                    }
                    let resolvedHouseId = this.resolveCharacterHouseId(character, state, society, { repair: !!options.repair, includeSlaves: !!options.includeSlaves })
                    if (resolvedHouseId && String(resolvedHouseId) === String(house.id)) {
                      seen[characterId] = true
                      ids.push(characterId)
                    }
                  })
                  return ids
                },
        memberIdsForDynasty(society, state, dynastyId) {
                  let seen = {}
                  let ids = []
                  this.housesForDynasty(society, dynastyId).forEach((house) => {
                    this.resolvedHouseMemberIds(society, state, house, { includeKnown: true, repair: false }).forEach((characterId) => {
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
                  let dynasty = state && state.dynasties && state.dynasties[dynastyId]
                  ;((dynasty && dynasty.memberIds) || []).forEach((characterId) => {
                    if (!characterId || seen[characterId]) return
                    let character = state.characters && state.characters[characterId]
                    if (!character || character.isDead || !character.dynastyId || String(character.dynastyId) !== String(dynastyId)) return
                    seen[characterId] = true
                    ids.push(characterId)
                  })
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
                  let originHouse = this.primaryHouseForDynasty(society, dynastyId)
                  let candidates = ids.map((id) => {
                    let character = state.characters && state.characters[id]
                    if (character) character.id = character.id || id
                    return character
                  }).filter((character) => {
                    if (!character || character.isDead || character.corSocietySlave || character.corSocietySlaveActive) return false
                    if (!character.dynastyId || String(character.dynastyId) !== String(dynastyId)) return false
                    let houseId = this.resolveCharacterHouseId(character, state, society, { repair: false })
                    if (originHouse && houseId && String(houseId) !== String(originHouse.id)) return false
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
                  house.type = 'cadet'
                  house.parentHouseId = originHouse.id
                  house.founderId = founder.id
                  house.branchRootId = founder.id
                  house.createdAtTurn = this.monthKey(state)
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
                  if (this.clearFamilyTreeRuntimeCache) {
                    this.clearFamilyTreeRuntimeCache()
                  }
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
                  let dynastyId = founder.dynastyId || ''
                  let queue = [founder.id]
                  let guard = 0
                  while (queue.length && guard < 100) {
                    let id = queue.shift()
                    guard += 1
                    let character = state.characters[id]
                    if (!character || seen[id]) {
                      continue
                    }
                    if (dynastyId && character.dynastyId && String(character.dynastyId) !== String(dynastyId)) {
                      continue
                    }
                    add(id)
                    let spouse = character.spouseId && state.characters[character.spouseId]
                    if (spouse && spouse.dynastyId && String(spouse.dynastyId) === String(dynastyId)) {
                      add(character.spouseId)
                    }
                    ;(character.childrenIds || []).forEach((childId) => {
                      let child = state.characters[childId]
                      if (child && (!dynastyId || String(child.dynastyId || '') === String(dynastyId)) && !seen[childId]) {
                        queue.push(childId)
                      }
                    })
                  }
                  return ids.slice(0, 80)
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
                  this.syncPlayerHouseRecord(society, state)
                },
        syncPlayerHouseRecord(society, state) {
                  if (!society || !state || !state.characters) {
                    return false
                  }
                  let playerHouseId = this.currentCharacterDynastyId(state)
                  if (!playerHouseId) {
                    return false
                  }
                  let currentId = this.currentCharacterId(state)
                  let player = state.characters[currentId] || {}
                  let dynasty = (state.dynasties && state.dynasties[playerHouseId]) || {}
                  let house = society.houses[playerHouseId] || this.createHouseRecord(playerHouseId)
                  let closeMap = this.playerCloseFamilyIdMap ? this.playerCloseFamilyIdMap(state) : {}
                  let candidateMap = {}
                  let add = (id) => {
                    if (id !== undefined && id !== null && id !== '' && state.characters[id]) {
                      candidateMap[String(id)] = true
                    }
                  }
                  Object.keys(closeMap).forEach(add)
                  if (dynasty && dynasty.memberIds) {
                    dynasty.memberIds.forEach(add)
                  }
                  let freeIds = []
                  let guestIds = []
                  let slaveIds = []
                  Object.keys(candidateMap).forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.isDead) {
                      return
                    }
                    character.id = character.id || characterId
                    let explicitSlave = this.isExplicitlyEnslavedCharacter && this.isExplicitlyEnslavedCharacter(character)
                    let slaveBastard = character.corSocietyOrigin === 'private_company_bastard' || character.corSocietyBastard === true
                    if (explicitSlave && slaveBastard) {
                      slaveIds.push(characterId)
                      return
                    }
                    if (!character.dynastyId || String(character.dynastyId) === String(playerHouseId)) {
                      freeIds.push(characterId)
                    } else {
                      guestIds.push(characterId)
                    }
                  })
                  if (!freeIds.length && currentId && state.characters[currentId]) {
                    freeIds.push(String(currentId))
                  }
                  let removeFromHouse = (otherHouse, characterId) => {
                    if (!otherHouse || String(otherHouse.id) === String(playerHouseId)) return
                    otherHouse.memberIds = (otherHouse.memberIds || []).filter((id) => !this.sameCharacterId(id, characterId))
                    otherHouse.notableIds = (otherHouse.notableIds || []).filter((id) => !this.sameCharacterId(id, characterId))
                    otherHouse.slaveIds = (otherHouse.slaveIds || []).filter((id) => !this.sameCharacterId(id, characterId))
                    otherHouse.knownMemberIds = (otherHouse.knownMemberIds || []).filter((id) => !this.sameCharacterId(id, characterId))
                    otherHouse._lastRefreshedSignature = ''
                  }
                  freeIds.concat(slaveIds).forEach((characterId) => {
                    Object.keys(society.houses || {}).forEach((houseId) => removeFromHouse(society.houses[houseId], characterId))
                  })
                  guestIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || String(character.corSocietyHouseId || '') !== String(playerHouseId)) {
                      return
                    }
                    try {
                      daapi.updateCharacter({ characterId, character: { corSocietyHouseId: '', flagDoNotCull: true } })
                      character.corSocietyHouseId = ''
                      character.flagDoNotCull = true
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                  freeIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.isDead) return
                    if (character.corSocietyHouseId !== playerHouseId || character.corSocietyOrigin === 'enslaved_dependant') {
                      let patch = {
                        corSocietyHouseId: playerHouseId,
                        corSocietyOrigin: character.corSocietyOrigin === 'enslaved_dependant' ? '' : character.corSocietyOrigin,
                        flagDoNotCull: true
                      }
                      try {
                        daapi.updateCharacter({ characterId, character: patch })
                        Object.assign(character, patch)
                      } catch (err) {
                        console.warn(err)
                      }
                    }
                  })
                  let members = freeIds.map((characterId) => state.characters[characterId]).filter(Boolean)
                  let summary = this.summarizeHouse(playerHouseId, members, state)
                  let status = this.playerSocietyStatus ? this.playerSocietyStatus(state) : false
                  house.id = playerHouseId
                  house.dynastyId = playerHouseId
                  house.gameDynastyId = playerHouseId
                  house.originHouse = true
                  house.houseKind = 'origin'
                  house.type = 'origin'
                  house.founderId = house.founderId || currentId
                  house.branchRootId = house.branchRootId || currentId
                  house.parentHouseId = ''
                  house.createdAtTurn = house.createdAtTurn || this.monthKey(state)
                  house.branchName = 'Player household'
                  house.isPlayerHouse = true
                  house.generated = false
                  house.name = summary.name || this.houseName(dynasty, playerHouseId)
                  house.stratum = (status && status.stratum) || summary.stratum || house.stratum || 'plebeian'
                  house.memberIds = freeIds
                  house.slaveIds = slaveIds
                  house.knownMemberIds = this.uniqueIds(freeIds.concat(guestIds).concat(slaveIds).concat(house.knownMemberIds || [])).slice(-180)
                  house.notableIds = freeIds
                    .slice()
                    .sort((a, b) => this.characterScore(state.characters[b], state) - this.characterScore(state.characters[a], state))
                    .slice(0, 8)
                  house.prestige = Math.max(parseFloat(house.prestige || 0), parseFloat(summary.prestige || dynasty.prestige || 0))
                  house.heritage = (status && status.heritage) || summary.heritage || house.heritage || dynasty.heritage || 'unknown'
                  house.citizenRank = (status && status.className) || summary.citizenRank || house.citizenRank
                  house.strength = Math.max(1, Math.round(summary.strength || house.strength || 1))
                  house.lastSeen = this.monthKey(state)
                  society.houses[playerHouseId] = house
                  society.generatedHouseIds = (society.generatedHouseIds || []).filter((id) => String(id) !== String(playerHouseId))
                  this.normalizeDynastyHouseModel(society, state)
                  return house
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
                      if (character.corSocietyDetachedHouseMember) {
                        return
                      }
                      if (character.corSocietySlaveMarket && character.corSocietySlaveActive === false) {
                        return
                      }
                      if (household[characterId] && character.dynastyId === playerDynastyId) {
                        return
                        }
                        character.id = character.id || characterId
                        let houseId = this.resolveCharacterHouseId
                          ? this.resolveCharacterHouseId(character, state, society, { repair: true })
                          : (character.corSocietyHouseId || character.dynastyId)
                        if (!houseId) {
                          houseId = character.dynastyId
                        }
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
                    type: String(houseId) === String(dynastyId) ? 'origin' : 'cadet',
                    founderId: '',
                    parentHouseId: String(houseId) === String(dynastyId) ? '' : String(dynastyId),
                    branchRootId: '',
                    createdAtTurn: '',
                    version: this.version,
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
      window.corSociety._mixinCorSocietyDynastyModelVersion = '1.1.307'
    }
  }
}
