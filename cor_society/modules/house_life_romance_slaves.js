{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {},
  methods: {
    _mixinCorSocietyHouseLifeRomanceSlaves() {
      if (!window.corSociety) {
        return
      }
      if (window.corSociety._mixinCorSocietyHouseLifeRomanceSlavesVersion === '1.1.293') {
        return
      }
      Object.assign(window.corSociety, {
        simulateHouseFamilyLife(society, state, house, houses) {
                  if (!house || !house.memberIds || !house.memberIds.length) {
                    return
                  }
                  let marriageChance = house.agenda === 'marriage' ? 0.12 : 0.04
                  if (Math.random() < marriageChance) {
                    let candidates = (houses || []).filter((other) => {
                      if (!other || other.id === house.id || !other.memberIds || !other.memberIds.length) {
                        return false
                      }
                      let relation = this.getHouseRelation(society, house.id, other.id)
                      return relation > -35 && Math.abs(this.socialLevel(house.stratum) - this.socialLevel(other.stratum)) <= 2
                    })
                    let other = candidates.length ? this.pick(candidates) : false
                    if (other && this.tryInterHouseMarriage(society, state, house, other)) {
                      return
                    }
                  }
                  let pregnancyChance = house.agenda === 'marriage' ? 0.18 : 0.08
                  if (Math.random() < pregnancyChance) {
                    this.tryHousePregnancy(society, state, house)
                  }
                },
        simulateHouseHostileActions(society, state, house, houses) {
                  if (!house || !houses || !houses.length || !house.memberIds || !house.memberIds.length) {
                    return false
                  }
                  let pressure = (house.agenda === 'revenge' ? 0.055 : 0.012) + Math.max(0, (house.heat || 0) - 2) * 0.004
                  if (Math.random() > this.clamp(pressure, 0.006, 0.09)) {
                    return false
                  }
                  let rivals = houses.filter((other) => {
                    if (!other || other.id === house.id || !other.memberIds || !other.memberIds.length) return false
                    let relation = this.getHouseRelation(society, house.id, other.id)
                    return relation <= -45 || house.rivalry || other.rivalry
                  })
                  let targetHouse = rivals.length ? this.pick(rivals) : false
                  if (!targetHouse) {
                    return false
                  }
                  let protectedPlayerKin = this.idSet(this.playerFamilyMemberIds(state).concat((state.current && state.current.householdCharacterIds) || []).concat(society.extendedKinVisibilityIds || []))
                  let targets = this.visibleHousePeople(targetHouse, state)
                    .map((id) => {
                      let character = state.characters && state.characters[id]
                      if (character) character.id = character.id || id
                      return character
                    })
                    .filter((character) => character && !character.isDead && !character.corSocietySlave && !protectedPlayerKin[character.id] && this.age(character, state) >= 16)
                  if (!targets.length) {
                    return false
                  }
                  let target = this.pick(targets)
                  let powerGap = ((house.power || 0) - (targetHouse.power || 0)) / 160
                  let success = Math.random() < this.clamp(0.18 + powerGap + Math.max(0, house.heat || 0) * 0.015, 0.08, 0.48)
                  let exposed = Math.random() < (success ? 0.36 : 0.62)
                  if (success) {
                    try {
                      daapi.kill({ characterId: target.id, deathCause: 'murdered in a private feud' })
                    } catch (err) {
                      console.warn(err)
                      return false
                    }
                    targetHouse.power = Math.max(0, (targetHouse.power || 0) - 5)
                    targetHouse.stability = this.clamp((targetHouse.stability || 50) - 7, 0, 100)
                    targetHouse.lastFamilyEvent = this.characterName(target, state) + ' dies in suspicious circumstances.'
                    this.log(society, targetHouse.name + ' loses ' + this.characterName(target, state) + ' in a suspected private feud.', 'scandal', targetHouse.id)
                  } else {
                    house.heat = (house.heat || 0) + 2
                    house.stability = this.clamp((house.stability || 50) - 4, 0, 100)
                  }
                  if (exposed) {
                    house.heat = (house.heat || 0) + 3
                    house.stability = this.clamp((house.stability || 50) - 7, 0, 100)
                    this.changeHouseRelation(society, house.id, targetHouse.id, -this.randomInt(18, 34))
                    house.lastFamilyEvent = 'A hostile scheme is traced back to the house.'
                    this.log(society, house.name + ' is blamed for a hostile scheme against ' + targetHouse.name + '.', 'rivalry', house.id)
                  }
                  return true
                },
        tryInterHouseMarriage(society, state, firstHouse, secondHouse) {
                  let firstCandidates = this.eligibleHouseMarriageAdults(firstHouse, state)
                  let secondCandidates = this.eligibleHouseMarriageAdults(secondHouse, state)
                  if (!firstCandidates.length || !secondCandidates.length) {
                    return false
                  }
                  let pairs = []
                  firstCandidates.forEach((first) => {
                    secondCandidates.forEach((second) => {
                      if (this.isMarriageCompatible(first, second)) {
                        pairs.push({ first, second })
                      }
                    })
                  })
                  if (!pairs.length) {
                    return false
                  }
                  let pair = this.pick(pairs)
                  let first = pair.first
                  let second = pair.second
                  let mother = this.characterIsMale(first) ? second : first
                  let father = this.characterIsMale(first) ? first : second
                  let motherHouse = mother.dynastyId === firstHouse.id ? firstHouse : secondHouse
                  let fatherHouse = father.dynastyId === firstHouse.id ? firstHouse : secondHouse
                  let isMatrilineal = this.socialLevel(motherHouse.stratum) >= this.socialLevel(fatherHouse.stratum)
                  try {
                    daapi.performMarriage({
                      characterId: first.id,
                      spouseId: second.id,
                      isMatrilineal
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId: first.id })
                    daapi.forceUpdateCharacterDisplay({ characterId: second.id })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  firstHouse.stability = this.clamp((firstHouse.stability || 50) + 3, 0, 100)
                  secondHouse.stability = this.clamp((secondHouse.stability || 50) + 3, 0, 100)
                  this.changeHouseRelation(society, firstHouse.id, secondHouse.id, this.randomInt(8, 18))
                  firstHouse.lastFamilyEvent = 'Marriage alliance with ' + secondHouse.name + '.'
                  secondHouse.lastFamilyEvent = 'Marriage alliance with ' + firstHouse.name + '.'
                  let newState = daapi.getState()
                  this.refreshHouseMemberLists(society, newState, firstHouse)
                  this.refreshHouseMemberLists(society, newState, secondHouse)
                  this.log(
                    society,
                    firstHouse.name + ' and ' + secondHouse.name + ' join houses through the marriage of ' + this.characterName(first, state) + ' and ' + this.characterName(second, state) + '.',
                    'marriage',
                    firstHouse.id
                  )
                  return true
                },
        eligibleHouseMarriageAdults(house, state) {
                  return this.visibleHousePeople(house, state)
                    .map((characterId) => {
                      let character = state.characters[characterId]
                      if (character) {
                        character.id = character.id || characterId
                      }
                      return character
                    })
                    .filter((character) => {
                      if (!this.isMarriageEligible(character, state)) {
                        return false
                      }
                      let age = this.age(character, state)
                      return age >= 16 && age <= 48
                    })
                    .sort((a, b) => this.characterScore(b, state) - this.characterScore(a, state))
                },
        tryHousePregnancy(society, state, house) {
                  let couples = []
                  this.visibleHousePeople(house, state).forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.isDead || !character.spouseId || character.startedPregnancyTime) {
                      return
                    }
                    character.id = character.id || characterId
                    let spouse = state.characters[character.spouseId]
                    if (!spouse || spouse.isDead || spouse.startedPregnancyTime) {
                      return
                    }
                    spouse.id = spouse.id || character.spouseId
                    let mother = this.characterIsMale(character) ? spouse : character
                    let father = this.characterIsMale(character) ? character : spouse
                    if (!mother || !father || mother.startedPregnancyTime) {
                      return
                    }
                    let age = this.age(mother, state)
                    if (age < 16 || age > 42 || mother.flagCannotGetPregnant || father.flagCannotImpregnate) {
                      return
                    }
                    let children = this.childrenCountForCouple(state, mother.id, father.id)
                    if (children >= 6) {
                      return
                    }
                    couples.push({ mother, father, children })
                  })
                  if (!couples.length) {
                    return false
                  }
                  let couple = this.pick(couples)
                  let chance = this.clamp(0.86 - couple.children * 0.13, 0.16, 0.86)
                  if (Math.random() > chance) {
                    return false
                  }
                  try {
                    daapi.impregnate({
                      characterId: couple.mother.id,
                      fatherId: couple.father.id
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId: couple.mother.id })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  house.lastFamilyEvent = this.characterName(couple.mother, state) + ' is expecting a child.'
                  this.log(
                    society,
                    this.characterName(couple.mother, state) + ' of ' + house.name + ' is expecting a child with ' + this.characterName(couple.father, state) + '.',
                    'birth',
                    house.id
                  )
                  return true
                },
        childrenCountForCouple(state, firstId, secondId) {
                  let count = 0
                  let first = state.characters[firstId]
                  let second = state.characters[secondId]
                  if (!first || !second) return 0
                  let ids = (first.childrenIds || []).concat(second.childrenIds || [])
                  let seen = {}
                  ids.forEach((id) => {
                    if (seen[id]) return
                    seen[id] = true
                    let child = state.characters[id]
                    if (!child || child.isDead) return
                    let parents = [child.fatherId, child.motherId]
                    if (parents.indexOf(firstId) >= 0 && parents.indexOf(secondId) >= 0) {
                      count += 1
                    }
                  })
                  return count
                },
        maybeStartNpcRomance(society, state) {
                  if (Math.random() > 0.10) {
                    return false
                  }
                  let houses = this.sortedHouses(society).filter((house) => house.memberIds && house.memberIds.length)
                  if (houses.length < 2) {
                    return false
                  }
                  let firstHouse = this.pick(houses)
                  let secondHouse = this.pick(houses.filter((house) => house.id !== firstHouse.id))
                  if (!firstHouse || !secondHouse) {
                    return false
                  }
                  let firstCandidates = this.romanceCandidatesForHouse(firstHouse, state)
                  let secondCandidates = this.romanceCandidatesForHouse(secondHouse, state)
                  if (!firstCandidates.length || !secondCandidates.length) {
                    return false
                  }
                  let first = this.pick(firstCandidates)
                  let secondPool = secondCandidates.filter((character) => {
                    return character && !this.sameCharacterId(character.id, first.id) && !this.getRomance(society, first.id, character.id)
                  })
                  if (!secondPool.length) {
                    return false
                  }
                  let second = this.pick(secondPool)
                  let romance = this.createRomance(society, first.id, second.id, {
                    source: 'npc',
                    intensity: this.randomInt(18, 42),
                    secrecy: this.romanceBaseRisk(first, second, state)
                  })
                  firstHouse.lastFamilyEvent = 'A private attachment begins near ' + secondHouse.name + '.'
                  secondHouse.lastFamilyEvent = 'A private attachment begins near ' + firstHouse.name + '.'
                  if (romance.secrecy >= 45 && Math.random() < 0.25) {
                    this.log(society, 'Rumors whisper of a private attachment between ' + firstHouse.name + ' and ' + secondHouse.name + '.', 'romance', firstHouse.id)
                  }
                  return true
                },
        romanceCandidatesForHouse(house, state) {
                  return this.visibleHousePeople(house, state)
                    .map((characterId) => {
                      let character = state.characters[characterId]
                      if (character) {
                        character.id = character.id || characterId
                      }
                      return character
                    })
                    .filter((character) => {
                      if (!character || character.isDead) {
                        return false
                      }
                      let age = this.age(character, state)
                      return age >= 16 && age <= 58
                    })
                },
        simulateRomances(society, state) {
                  society.romances = society.romances || {}
                  let keys = Object.keys(society.romances)
                  keys.forEach((key) => {
                    let romance = society.romances[key]
                    if (!romance || romance.status !== 'active') {
                      return
                    }
                    let first = state.characters[romance.firstId]
                    let second = state.characters[romance.secondId]
                    if (!first || !second || first.isDead || second.isDead) {
                      this.cleanupPendingPaternitiesForRomance(society, romance.id || key)
                      delete society.romances[key]
                      return
                    }
                    first.id = first.id || romance.firstId
                    second.id = second.id || romance.secondId
                    if (this.age(first, state) < 13 || this.age(second, state) < 13) {
                      this.cleanupPendingPaternitiesForRomance(society, romance.id || key)
                      delete society.romances[key]
                      return
                    }
                    romance.months = (romance.months || 0) + 1
                    romance.intensity = this.clamp((romance.intensity || 25) + this.randomInt(-2, 4), 1, 100)
                    romance.secrecy = this.clamp((romance.secrecy || 20) + this.randomInt(-1, 3), 0, 100)
                    if (this.tryRomancePregnancy(society, state, romance, first, second)) {
                      romance.intensity = this.clamp((romance.intensity || 25) + 6, 1, 100)
                    }
                    if (Math.random() < this.romanceScandalChance(romance, first, second, state)) {
                      this.revealRomanceScandal(society, state, romance, first, second)
                    } else if (Math.random() < 0.08) {
                      let firstHouse = this.houseForPortraitCharacter(first, society)
                      let secondHouse = this.houseForPortraitCharacter(second, society)
                      if (firstHouse && secondHouse && firstHouse.id !== secondHouse.id) {
                        this.changeHouseRelation(society, firstHouse.id, secondHouse.id, this.randomInt(-2, 4))
                      }
                    }
                    if (romance.intensity <= 3 && Math.random() < 0.25) {
                      romance.status = 'ended'
                      romance.ended = this.monthKey(state)
                    }
                  })
                },
        cleanupPendingPaternitiesForRomance(society, romanceId) {
                  if (!society || !romanceId || !society.pendingPaternities) {
                    return false
                  }
                  let before = society.pendingPaternities.length
                  society.pendingPaternities = society.pendingPaternities.filter((record) => {
                    return !record || record.childId || record.romanceId !== romanceId
                  })
                  return society.pendingPaternities.length !== before
                },
        romanceBaseRisk(first, second, state) {
                  let risk = 12
                  if (first && first.spouseId && !this.sameCharacterId(first.spouseId, second && second.id)) risk += 28
                  if (second && second.spouseId && !this.sameCharacterId(second.spouseId, first && first.id)) risk += 28
                  let firstAge = this.age(first || {}, state)
                  let secondAge = this.age(second || {}, state)
                  if (firstAge < 18 || secondAge < 18) risk += 8
                  return this.clamp(risk, 5, 88)
                },
        romanceScandalChance(romance, first, second, state) {
                  if (!romance || romance.status !== 'active') {
                    return 0
                  }
                  if (romance.lastScandalMonth && this.monthIndex(this.monthKey(state)) - this.monthIndex(romance.lastScandalMonth) < 12) {
                    return 0
                  }
                  let risk = 0.01 + (romance.secrecy || 0) / 900 + (romance.intensity || 0) / 1800
                  if (first && first.spouseId && !this.sameCharacterId(first.spouseId, second && second.id)) risk += 0.045
                  if (second && second.spouseId && !this.sameCharacterId(second.spouseId, first && first.id)) risk += 0.045
                  return this.clamp(risk, 0.005, 0.18)
                },
        romanceCanConceive(first, second, state) {
                  if (!first || !second || this.characterIsMale(first) === this.characterIsMale(second)) {
                    return false
                  }
                  let mother = this.characterIsMale(first) ? second : first
                  let father = this.characterIsMale(first) ? first : second
                  let age = this.age(mother, state)
                  if (age < 18 || age > 42 || this.age(father, state) < 18 || mother.startedPregnancyTime || mother.flagCannotGetPregnant || father.flagCannotImpregnate) {
                    return false
                  }
                  return { mother, father }
                },
        tryRomancePregnancy(society, state, romance, first, second) {
                  let parents = this.romanceCanConceive(first, second, state)
                  if (!parents) {
                    return false
                  }
                  let chance = this.clamp(0.015 + (romance.intensity || 20) / 1400, 0.015, 0.085)
                  if (Math.random() > chance) {
                    return false
                  }
                  try {
                    daapi.impregnate({
                      characterId: parents.mother.id,
                      fatherId: parents.father.id
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId: parents.mother.id })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  romance.lastPregnancyMonth = this.monthKey(state)
                  this.trackIllegitimatePregnancy(society, state, romance, parents.mother, parents.father)
                  let motherHouse = this.houseForPortraitCharacter(parents.mother, society)
                  let fatherHouse = this.houseForPortraitCharacter(parents.father, society)
                  if (motherHouse) {
                    motherHouse.lastFamilyEvent = this.characterName(parents.mother, state) + ' is expecting a child.'
                  }
                  this.log(society, this.characterName(parents.mother, state) + ' is expecting a child with ' + this.characterName(parents.father, state) + '.', 'birth', motherHouse ? motherHouse.id : (fatherHouse && fatherHouse.id))
                  if ((parents.mother.spouseId && !this.sameCharacterId(parents.mother.spouseId, parents.father.id)) && Math.random() < 0.45) {
                    this.revealRomanceScandal(society, state, romance, first, second)
                  }
                  return true
                },
        trackIllegitimatePregnancy(society, state, romance, mother, biologicalFather) {
                  if (!society || !mother || !biologicalFather || !mother.spouseId || this.sameCharacterId(mother.spouseId, biologicalFather.id)) {
                    return false
                  }
                  let officialFather = state.characters && state.characters[mother.spouseId]
                  if (!officialFather || !this.characterIsMale(officialFather)) {
                    return false
                  }
                  society.pendingPaternities = society.pendingPaternities || []
                  let id = 'paternity_' + this.safeId(mother.id) + '_' + this.safeId(biologicalFather.id) + '_' + this.monthIndex(this.monthKey(state))
                  if (society.pendingPaternities.some((item) => item && item.id === id)) {
                    return false
                  }
                  society.pendingPaternities.push({
                    id,
                    romanceId: romance && romance.id,
                    motherId: mother.id,
                    biologicalFatherId: biologicalFather.id,
                    officialFatherId: officialFather.id || mother.spouseId,
                    startedIndex: this.monthIndex(this.monthKey(state)),
                    childId: '',
                    discovered: false
                  })
                  return true
                },
        resolvePendingPaternities(society, state) {
                  society.pendingPaternities = society.pendingPaternities || []
                  society.discoveredPaternities = society.discoveredPaternities || {}
                  society.pendingPaternities.forEach((record) => {
                    if (!record || record.childId || !record.motherId || !record.biologicalFatherId || !record.officialFatherId) {
                      return
                    }
                    let child = this.findPaternityChild(state, record)
                    if (!child) {
                      return
                    }
                    record.childId = child.id
                    let patch = {
                      corSocietyTrueFatherId: record.biologicalFatherId,
                      corSocietyOfficialFatherId: record.officialFatherId,
                      corSocietyTrueMotherId: record.motherId,
                      corSocietyBastard: true,
                      corSocietyIllegitimate: true,
                      corSocietyPaternityDiscovered: !!record.discovered
                    }
                    if (!record.discovered) {
                      patch.fatherId = record.officialFatherId
                      let officialFather = state.characters[record.officialFatherId]
                      if (officialFather && officialFather.dynastyId) {
                        patch.dynastyId = officialFather.dynastyId
                      }
                    }
                    try {
                      daapi.updateCharacter({ characterId: child.id, character: patch })
                      Object.assign(child, patch)
                    } catch (err) {
                      console.warn(err)
                    }
                    if (record.isPrivateCompany && !child.corSocietySlave) {
                      let currentDynastyId = this.currentCharacterDynastyId(state)
                      let mother = state.characters[record.motherId]
                      let origin = (mother && mother.corSocietySlaveOrigin) || this.randomSlaveOrigin()
                      let privatePatch = {
                        dynastyId: currentDynastyId || child.dynastyId,
                        corSocietySlave: true,
                        corSocietySlaveActive: true,
                        corSocietySlaveType: 'labor',
                        corSocietySlaveLevel: 1,
                        corSocietySlaveOwnerHouseId: currentDynastyId || '',
                        corSocietySlaveOrigin: origin,
                        corSocietySlaveTask: 'labor',
                        corSocietySlaveSavings: 0,
                        corSocietyOrigin: 'private_company_bastard',
                        flagCannotMarry: true,
                        flagDoNotCull: true
                      }
                      try {
                        daapi.updateCharacter({
                          characterId: child.id,
                          character: privatePatch
                        })
                        Object.assign(child, privatePatch)
                      } catch (err) {
                        console.warn(err)
                      }
                      let slaveRecord = this.playerSlaveRecordFromCharacter({
                        key: 'slave_' + this.safeId(child.id),
                        characterId: child.id,
                        type: 'labor',
                        level: 1,
                        age: this.age(child, state),
                        origin,
                        task: 'labor',
                        savings: 0
                      }, child, state)
                      society.playerSlaves = society.playerSlaves || []
                      if (!society.playerSlaves.some((slave) => slave && this.sameCharacterId(slave.characterId, child.id))) {
                        society.playerSlaves.push(slaveRecord)
                        this.log(society, this.characterName(child, state) + ' is born into slavery and recorded in the household slave list.', 'birth')
                      }
                    }
                  })
                },
        findPaternityChild(state, record) {
                  let mother = state.characters[record.motherId]
                  if (!mother || !mother.childrenIds) return false
                  let best = false
                  for (let i = 0; i < mother.childrenIds.length; i++) {
                    let characterId = mother.childrenIds[i]
                    let child = state.characters[characterId]
                    if (!child || child.isDead || child.corSocietyPaternityId) {
                      continue
                    }
                    child.id = child.id || characterId
                    if (!this.sameCharacterId(child.fatherId, record.biologicalFatherId) && !this.sameCharacterId(child.fatherId, record.officialFatherId)) {
                      continue
                    }
                    let bornIndex = (parseInt(child.birthYear || 0, 10) * 13) + parseInt(child.birthMonth || 0, 10)
                    if (bornIndex < record.startedIndex) {
                      continue
                    }
                    best = child
                    break
                  }
                  if (best) {
                    try {
                      daapi.updateCharacter({ characterId: best.id, character: { corSocietyPaternityId: record.id } })
                      best.corSocietyPaternityId = record.id
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                  return best
                },
        revealPaternityForRomance(society, state, romance, first, second) {
                  if (!society || !romance) {
                    return false
                  }
                  let changed = false
                  society.pendingPaternities = society.pendingPaternities || []
                  society.pendingPaternities.forEach((record) => {
                    if (!record || record.discovered) {
                      return
                    }
                    let matchesRomance = record.romanceId && record.romanceId === romance.id
                    let matchesPeople = (
                      (this.sameCharacterId(record.motherId, first && first.id) && this.sameCharacterId(record.biologicalFatherId, second && second.id)) ||
                      (this.sameCharacterId(record.motherId, second && second.id) && this.sameCharacterId(record.biologicalFatherId, first && first.id))
                    )
                    if (!matchesRomance && !matchesPeople) {
                      return
                    }
                    record.discovered = true
                    let child = record.childId && state.characters[record.childId]
                    if (!child) {
                      changed = true
                      return
                    }
                    let biologicalFather = state.characters[record.biologicalFatherId]
                    let patch = {
                      fatherId: record.biologicalFatherId,
                      corSocietyPaternityDiscovered: true
                    }
                    if (biologicalFather && biologicalFather.dynastyId) {
                      patch.dynastyId = biologicalFather.dynastyId
                    }
                    try {
                      daapi.updateCharacter({ characterId: child.id, character: patch })
                      Object.assign(child, patch)
                      daapi.forceUpdateCharacterDisplay({ characterId: child.id })
                      changed = true
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                  if (changed) {
                    this.log(society, 'A child\'s true paternity is exposed and the family tree is corrected.', 'scandal')
                  }
                  return changed
                },
        revealRomanceScandal(society, state, romance, first, second, options) {
                  if (!romance || !first || !second) {
                    return false
                  }
                  romance.discovered = true
                  romance.lastScandalMonth = this.monthKey(state)
                  romance.secrecy = this.clamp((romance.secrecy || 20) - 25, 0, 100)
                  romance.intensity = this.clamp((romance.intensity || 20) - this.randomInt(8, 22), 1, 100)
                  this.revealPaternityForRomance(society, state, romance, first, second)
                  ;[first, second].forEach((character) => {
                    if (character && character.spouseId) {
                      this.addSocietyTrait(society, character.id, 'adulterer')
                    }
                  })
                  let firstHouse = this.houseForPortraitCharacter(first, society)
                  let secondHouse = this.houseForPortraitCharacter(second, society)
                  if (firstHouse) {
                    firstHouse.heat = (firstHouse.heat || 0) + 2
                    firstHouse.stability = this.clamp((firstHouse.stability || 50) - 8, 0, 100)
                    firstHouse.lastFamilyEvent = 'A lover scandal embarrasses the house.'
                  }
                  if (secondHouse && (!firstHouse || secondHouse.id !== firstHouse.id)) {
                    secondHouse.heat = (secondHouse.heat || 0) + 2
                    secondHouse.stability = this.clamp((secondHouse.stability || 50) - 8, 0, 100)
                    secondHouse.lastFamilyEvent = 'A lover scandal embarrasses the house.'
                  }
                  if (firstHouse && secondHouse && firstHouse.id !== secondHouse.id) {
                    this.changeHouseRelation(society, firstHouse.id, secondHouse.id, -this.randomInt(10, 28))
                  }
                  let divorces = []
                  ;[
                    { lover: first, other: second },
                    { lover: second, other: first }
                  ].forEach((pair) => {
                    if (pair.lover.spouseId && !this.sameCharacterId(pair.lover.spouseId, pair.other.id)) {
                      this.changePersonalRelation(society, pair.lover.spouseId, pair.lover.id, -35, 'traitor')
                      let chance = (romance.intensity || 25) >= 55 ? 0.55 : 0.34
                      if (Math.random() < chance && this.divorceCharacterFromSpouse(state, pair.lover)) {
                        divorces.push(pair.lover)
                      }
                    }
                  })
                  let playerInvolved = this.romanceInvolvesPlayer(romance, state)
                  if (playerInvolved) {
                    this.applyStats({ prestige: -18, influence: -25 })
                  }
                  let message = 'A lover scandal exposes ' + this.characterName(first, state) + ' and ' + this.characterName(second, state) + '.'
                  if (divorces.length) {
                    message += ' Divorce follows in the household.'
                  }
                  this.log(society, message, divorces.length ? 'divorce' : 'scandal', firstHouse ? firstHouse.id : (secondHouse && secondHouse.id))
                  if (playerInvolved && !(options && options.quietPlayerModal)) {
                    this.pushModal({
                      title: divorces.length ? 'Lover scandal and divorce' : 'Lover scandal',
                      message: message + '\nYour prestige and influence suffer.',
                      image: this.affairIcon(divorces.length ? 'divorce' : 'scandal'),
                      options: [
                        {
                          text: 'Endure the gossip'
                        }
                      ]
                    })
                  }
                  return true
                },
        romanceInvolvesPlayer(romance, state) {
                  let currentId = this.currentCharacterId(state)
                  return !!(romance && currentId && (this.sameCharacterId(romance.firstId, currentId) || this.sameCharacterId(romance.secondId, currentId)))
                },
        divorceCharacterFromSpouse(state, character) {
                  if (!character || !character.id || !character.spouseId) {
                    return false
                  }
                  let spouseId = character.spouseId
                  let spouse = state.characters && state.characters[spouseId]
                  try {
                    daapi.updateCharacter({
                      characterId: character.id,
                      character: { spouseId: null }
                    })
                    character.spouseId = null
                    if (spouse) {
                      daapi.updateCharacter({
                        characterId: spouseId,
                        character: { spouseId: null }
                      })
                      spouse.spouseId = null
                    }
                    daapi.forceUpdateCharacterDisplay({ characterId: character.id })
                    if (spouse) {
                      daapi.forceUpdateCharacterDisplay({ characterId: spouseId })
                    }
                    return true
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                },
        romanceKey(firstId, secondId) {
                  return this.relationKey(firstId, secondId)
                },
        getRomance(society, firstId, secondId) {
                  if (!society || !society.romances || !firstId || !secondId) {
                    return false
                  }
                  let romance = society.romances[this.romanceKey(firstId, secondId)]
                  return romance && romance.status === 'active' ? romance : false
                },
        createRomance(society, firstId, secondId, details) {
                  society.romances = society.romances || {}
                  let state = daapi.getState()
                  let first = state.characters && state.characters[firstId]
                  let second = state.characters && state.characters[secondId]
                  if ((first && this.age(first, state) < 13) || (second && this.age(second, state) < 13)) {
                    return false
                  }
                  let key = this.romanceKey(firstId, secondId)
                  let existing = society.romances[key]
                  if (existing && existing.status === 'active') {
                    existing.intensity = this.clamp((existing.intensity || 20) + ((details && details.intensity) || 8), 1, 100)
                    return existing
                  }
                  let romance = {
                    id: key,
                    firstId,
                    secondId,
                    status: 'active',
                    started: this.monthKey(state),
                    months: 0,
                    intensity: this.clamp((details && details.intensity) || 28, 1, 100),
                    secrecy: this.clamp((details && details.secrecy) || 18, 0, 100),
                    source: (details && details.source) || 'player'
                  }
                  society.romances[key] = romance
                  return romance
                },
        slaveTypes() {
                  return Object.keys(this.slaveTypeProfiles())
                },
        slaveTypeProfiles() {
                  return {
                    educator: { label: 'Educator', task: 'educator', icon: 'educator', cost: 1.18, job: 'rhetor', traits: ['literate'], skill: 'intelligence' },
                    tutor: { label: 'Greek Tutor', task: 'educator', icon: 'educator', cost: 1.32, job: 'rhetor', traits: ['literate', 'educated'], skill: 'intelligence' },
                    scribe: { label: 'Scribe', task: 'manager', icon: 'educator', cost: 1.22, job: 'rhetor', traits: ['literate'], skill: 'stewardship' },
                    doctor: { label: 'Doctor', task: 'doctor', icon: 'doctor', cost: 1.25, job: 'physician', traits: ['literate'], skill: 'intelligence' },
                    nurse: { label: 'Nurse', task: 'doctor', icon: 'doctor', cost: 1.05, job: 'physician', traits: ['content'], skill: 'intelligence' },
                    midwife: { label: 'Midwife', task: 'doctor', icon: 'doctor', cost: 1.16, job: 'physician', traits: ['content'], skill: 'intelligence' },
                    entertainer: { label: 'Entertainer', task: 'entertainer', icon: 'entertainer', cost: 0.92, job: 'labourer', traits: ['gregarious'], skill: 'eloquence' },
                    musician: { label: 'Musician', task: 'entertainer', icon: 'entertainer', cost: 1.02, job: 'labourer', traits: ['gregarious'], skill: 'eloquence' },
                    dancer: { label: 'Dancer', task: 'entertainer', icon: 'entertainer', cost: 0.98, job: 'labourer', traits: ['gregarious'], skill: 'eloquence' },
                    manager: { label: 'Manager', task: 'manager', icon: 'manager', cost: 1.35, job: 'labourer', traits: ['trusting'], skill: 'stewardship' },
                    steward: { label: 'Steward', task: 'manager', icon: 'manager', cost: 1.42, job: 'trader', traits: ['trusting'], skill: 'stewardship' },
                    accountant: { label: 'Accountant', task: 'manager', icon: 'manager', cost: 1.48, job: 'trader', traits: ['literate'], skill: 'stewardship' },
                    courier: { label: 'Courier', task: 'manager', icon: 'manager', cost: 0.95, job: 'labourer', traits: ['strong'], skill: 'stewardship' },
                    warrior: { label: 'Warrior', task: 'warrior', icon: 'warrior', cost: 1.08, job: 'labourer', traits: ['strong'], skill: 'combat' },
                    bodyguard: { label: 'Bodyguard', task: 'warrior', icon: 'warrior', cost: 1.28, job: 'labourer', traits: ['strong'], skill: 'combat' },
                    gladiator: { label: 'Gladiator', task: 'warrior', icon: 'warrior', cost: 1.36, job: 'labourer', traits: ['strong'], skill: 'combat' },
                    hunter: { label: 'Hunter', task: 'warrior', icon: 'warrior', cost: 1.02, job: 'labourer', traits: ['strong'], skill: 'combat' },
                    labor: { label: 'Laborer', task: 'labor', icon: 'labor', cost: 0.78, job: 'labourer', traits: ['content'], skill: 'stewardship' },
                    cook: { label: 'Cook', task: 'labor', icon: 'labor', cost: 0.86, job: 'labourer', traits: ['content'], skill: 'stewardship' },
                    artisan: { label: 'Artisan', task: 'labor', icon: 'labor', cost: 1.04, job: 'labourer', traits: ['educated'], skill: 'stewardship' },
                    groom: { label: 'Stable Hand', task: 'labor', icon: 'labor', cost: 0.84, job: 'labourer', traits: ['strong'], skill: 'stewardship' }
                  }
                },
        slaveTypeProfile(type) {
                  let profiles = this.slaveTypeProfiles()
                  return profiles[type] || profiles.labor
                },
        slaveTypeLabel(type) {
                  return this.slaveTypeProfile(type).label || 'Servant'
                },
        slaveTasks() {
                  return {
                    manager: { label: 'Household accounts', icon: 'manager', type: 'manager', effect: 'Owner: periodic cash. Slave: slightly faster savings.' },
                    educator: { label: 'Educate children', icon: 'educator', type: 'educator', effect: 'Owner: may improve child intelligence, stewardship, or eloquence.' },
                    doctor: { label: 'Tend the sick', icon: 'doctor', type: 'doctor', effect: 'Owner: may remove illness, wounds, stress, or depression from household members.' },
                    entertainer: { label: 'Entertain household', icon: 'entertainer', type: 'entertainer', effect: 'Owner: periodic prestige and morale.' },
                    warrior: { label: 'Guard the house', icon: 'warrior', type: 'warrior', effect: 'Owner: periodic influence and household security.' },
                    labor: { label: 'General labor', icon: 'labor', type: 'labor', effect: 'Owner: small periodic cash. Slave: steady savings.' }
                  }
                },
        slaveTaskInfo(slave) {
                  let tasks = this.slaveTasks()
                  let key = (slave && slave.task) || (slave && slave.type) || 'labor'
                  let aliases = { accounts: 'manager', educate: 'educator', tend: 'doctor', entertain: 'entertainer', guard: 'warrior' }
                  key = aliases[key] || key
                  return tasks[key] || tasks[this.slaveTypeProfile(slave && slave.type).task] || tasks.labor
                },
        slaveTaskLabel(slave) {
                  return this.slaveTaskInfo(slave).label
                },
        slaveTaskCooldownMonths() {
                  return 4
                },
        slaveTaskCooldownActive(slave, state) {
                  return !!(slave && slave.nextTaskChangeMonth && !this.monthKeyReached(slave.nextTaskChangeMonth, state || daapi.getState()))
                },
        householdChildrenUnder13(state) {
                  return ((state.current && state.current.householdCharacterIds) || [])
                    .map((characterId) => {
                      let character = state.characters && state.characters[characterId]
                      if (character) character.id = character.id || characterId
                      return character
                    })
                    .filter((character) => character && !character.isDead && this.age(character, state) >= 3 && this.age(character, state) < 13)
                },
        slaveNames() {
                  return ['Ada', 'Aelia', 'Afer', 'Amalric', 'Bato', 'Brennus', 'Cleon', 'Dama', 'Daphnis', 'Eirene', 'Felix', 'Germanus', 'Hanno', 'Idir', 'Iris', 'Kleon', 'Lydus', 'Mago', 'Nysa', 'Philo', 'Rufus', 'Sabina', 'Siro', 'Tajeddigt', 'Thrax', 'Tiro', 'Vera', 'Zeno']
                },
        slaveOrigins() {
                  return [
                    'Gallic',
                    'Egyptian',
                    'Greek',
                    'Numidian',
                    'Syrian',
                    'Thracian',
                    'Iberian',
                    'Germanic',
                    'Dacian',
                    'Punic',
                    'Judean',
                    'Illyrian',
                    'Anatolian',
                    'Roman debt-bond',
                    'Roman condemned',
                    'Roman renegade'
                  ]
                },
        slaveForeignNamePools() {
                  return {
                    Gallic: {
                      male: ['Ategnatos Arverno', 'Commius Remus', 'Litaviccos Aeduus', 'Ambiorix Treverus', 'Catugnatus Helvetios', 'Brennos Biturix'],
                      female: ['Ategnata Arverna', 'Eponina Remia', 'Litavica Aedua', 'Camma Trevera', 'Nantosuelta Helvetia', 'Bricta Bituriga']
                    },
                    Egyptian: {
                      male: ['Amenmose sa Panehesy', 'Hori sa Iset', 'Nesamun sa Hapu', 'Paser sa Ramose', 'Panehsy sa Minmose', 'Wennefer sa Nakht'],
                      female: ['Tiaa ta Beketaten', 'Merit ta Hori', 'Tanetnefer ta Hapu', 'Iset ta Panehsy', 'Henut ta Nakht', 'Tabubu ta Pahemnetjer']
                    },
                    Greek: {
                      male: ['Kleon Nikandrou', 'Diodoros Menandrou', 'Sostratos Philonidou', 'Menon Theodorou', 'Nikon Alexandrou', 'Herakleides Timonidou'],
                      female: ['Phila Timonidou', 'Nikaia Dorotheou', 'Eirene Menandrou', 'Damaris Kleandrou', 'Thais Nikandrou', 'Melitta Alexandrou']
                    },
                    Numidian: {
                      male: ['Idir Massylus', 'Tacfarinas Numida', 'Mastanabal Gaetulus', 'Aderbal Masaesyli', 'Iarbas Massylus', 'Micipsa Numida'],
                      female: ['Tinhinan Masaesyli', 'Dihya Gaetula', 'Salwa Massyla', 'Tafat Numida', 'Ayla Masaesyli', 'Tamella Gaetula']
                    },
                    Syrian: {
                      male: ['Barates Palmyrenos', 'Malchos Damasenos', 'Abdashtart Arados', 'Iamblichos Emesenos', 'Sampsigeramos Apamenos', 'Aglibol Palmyrenos'],
                      female: ['Zenobia Emesene', 'Berenike Damasene', 'Martha Palmyrene', 'Atargatis Aradene', 'Salome Apamene', 'Noora Emesene']
                    },
                    Thracian: {
                      male: ['Seuthes Odrysian', 'Kotys Bessos', 'Rhescuporis Triballos', 'Dromichaetes Getic', 'Sadalas Dentheletae', 'Teres Odrysian'],
                      female: ['Bendis Dentheletae', 'Medopa Bessa', 'Thraike Odrysia', 'Rheskypora Triballa', 'Kotyla Getica', 'Sadalina Bessa']
                    },
                    Iberian: {
                      male: ['Indibilis Ilergetes', 'Edeco Turdetan', 'Tautalos Celtiber', 'Mandonius Ausetan', 'Corbis Lusitanus', 'Culchas Bastetan'],
                      female: ['Ausetana Laietana', 'Iliturgi Turdetana', 'Tautala Celtibera', 'Mandona Ilergeta', 'Aunia Lusitana', 'Orissia Bastetana']
                    },
                    Germanic: {
                      male: ['Armin Cherusker', 'Segimerus Suebus', 'Hariulf Marcomann', 'Inguiomer Bructer', 'Chariovalda Batavus', 'Gannascus Chaucan'],
                      female: ['Thusnelda Bructera', 'Ganna Sueba', 'Albruna Cherusca', 'Hilde Marcomanna', 'Swanhild Batava', 'Brunhild Chauca']
                    },
                    Dacian: {
                      male: ['Decebalus Dacus', 'Cotiso Geta', 'Duras Costobocus', 'Comosicus Dacus', 'Dicomes Geta', 'Bastiza Carpic'],
                      female: ['Zia Dacica', 'Medopa Getica', 'Dacina Costoboca', 'Bendis Dacica', 'Cotisa Getica', 'Carpia Bastarna']
                    },
                    Punic: {
                      male: ['Hanno Barcid', 'Bomilcar Sufet', 'Abdeshmun Motyan', 'Bostar Qartadast', 'Mago Gadirite', 'Himilco Carthaginian'],
                      female: ['Sophonisba Qartadast', 'Elissa Motyan', 'Tanitbaal Gadirite', 'Abibaal Punic', 'Arishat Carthaginian', 'Salambo Motyan']
                    },
                    Judean: {
                      male: ['Eleazar ben Mattathias', 'Yosef ben Hanan', 'Yehuda ben Azariah', 'Simon ben Onias', 'Nathan ben Levi', 'Hanan ben Eleazar'],
                      female: ['Miriam bat Yonatan', 'Salome bat Azariah', 'Hannah bat Eleazar', 'Judith bat Hanan', 'Rachel bat Levi', 'Martha bat Simon']
                    },
                    Illyrian: {
                      male: ['Gentius Labeatan', 'Bato Daesitiates', 'Plator Delmata', 'Pinnes Ardiaean', 'Monunius Taulantian', 'Skerdilaidas Illyrian'],
                      female: ['Teuta Ardiaea', 'Etuta Labeata', 'Batoia Delmata', 'Pinnia Taulantia', 'Daita Daesitiata', 'Triteuta Illyria']
                    },
                    Anatolian: {
                      male: ['Attalos Phrygios', 'Mithridates Pontikos', 'Ariobarzanes Kappadokian', 'Menandros Lydios', 'Tarkondimotos Kilikian', 'Midas Galatian'],
                      female: ['Artemisia Karia', 'Nysa Galatia', 'Amastris Pontike', 'Laodike Lydian', 'Aryenis Kappadokian', 'Myrina Phrygia']
                    },
                    'Roman renegade': {
                      male: ['Publius Exsul', 'Marcus Profugus', 'Gaius Infamis', 'Titus Fugitivus', 'Lucius Perditus', 'Sextus Abiectus'],
                      female: ['Livia Exsul', 'Aelia Profuga', 'Julia Infamis', 'Marcia Fugitiva', 'Claudia Perdita', 'Fabia Abiecta']
                    },
                    'Roman debt-bond': {
                      male: ['Aulus Nexarius', 'Spurius Debitor', 'Numerius Obligatus', 'Manius Addictus', 'Tiberius Egenus', 'Postumus Nummarius'],
                      female: ['Aula Nexaria', 'Spuria Debita', 'Numeria Obligata', 'Mania Addicta', 'Tiberia Egena', 'Postuma Nummaria']
                    },
                    'Roman condemned': {
                      male: ['Gaius Damnatus', 'Lucius Noxius', 'Marcus Poenalis', 'Quintus Relegatus', 'Servius Infamis', 'Titus Ferratus'],
                      female: ['Gaia Damnata', 'Lucia Noxia', 'Marcia Poenalis', 'Quinta Relegata', 'Servia Infamis', 'Titia Ferrata']
                    }
                  }
                },
        randomSlaveOrigin() {
                  return this.pick(this.slaveOrigins())
                },
        randomSlaveFullName(origin, isMale) {
                  let pools = this.slaveForeignNamePools()
                  let pool = pools[origin] || pools.Greek
                  return this.pick(isMale ? pool.male : pool.female) || this.pick(this.slaveNames())
                },
        shortSlaveName(fullName) {
                  let parts = String(fullName || '').replace(/,/g, '').split(/\s+/).filter(Boolean)
                  return parts[0] || this.pick(this.slaveNames())
                },
        slaveOriginDescription(origin) {
                  origin = origin || 'unknown origin'
                  if (origin === 'Roman debt-bond') {
                    return 'Roman debt-bond; enslaved after household debt and legal disgrace. This note is cleared after manumission.'
                  }
                  if (origin === 'Roman condemned') {
                    return 'Roman condemned; enslaved by sentence or civic punishment. This note is cleared after manumission.'
                  }
                  if (origin === 'Roman renegade') {
                    return 'Roman renegade; treated as an outsider by Society. This note is cleared after manumission.'
                  }
                  return origin + ' origin; not counted as a Roman citizen household by Society.'
                },
        randomSlaveTemplate(ownerHouse, levelBias) {
                  let level = this.clamp(this.randomInt(1, 4) + (levelBias || 0), 1, 8)
                  let type = this.pick(this.slaveTypes())
                  let profile = this.slaveTypeProfile(type)
                  let origin = this.randomSlaveOrigin()
                  let isMale = Math.random() > 0.45
                  let fullName = this.randomSlaveFullName(origin, isMale)
                  return {
                    key: 'slave_' + this.safeId(ownerHouse && ownerHouse.id ? ownerHouse.id : 'player') + '_' + Date.now() + '_' + this.randomInt(1000, 9999),
                    name: this.shortSlaveName(fullName),
                    fullName,
                    isMale,
                    origin,
                    type,
                    level,
                    age: this.randomInt(15, 46),
                    acquired: this.monthKey(daapi.getState()),
                    characterId: '',
                    task: profile.task || type,
                    savings: 0
                  }
                },
        slaveCost(slave) {
                  slave = slave || {}
                  let profile = this.slaveTypeProfile(slave.type)
                  let age = parseFloat(slave.age || 24)
                  let ageFactor = age < 16 ? 0.72 : age > 42 ? 0.88 : 1
                  return Math.max(70, Math.round((105 + (slave.level || 1) * 92) * (profile.cost || 1) * ageFactor))
                },
        slaveFreedomPrice(slave) {
                  return Math.max(120, Math.round(this.slaveCost(slave) * 1.35))
                },
        slaveSkills(type, level) {
                  level = parseFloat(level || 1)
                  let skills = {
                    intelligence: this.randomInt(2, 8),
                    stewardship: this.randomInt(2, 8),
                    eloquence: this.randomInt(2, 8),
                    combat: this.randomInt(2, 8)
                  }
                  let profile = this.slaveTypeProfile(type)
                  if (profile.skill && skills[profile.skill] !== undefined) {
                    skills[profile.skill] += Math.round(level * 2)
                  }
                  if (profile.task === 'doctor') skills.intelligence += Math.round(level * 0.5)
                  if (profile.task === 'educator') skills.eloquence += Math.round(level * 0.5)
                  if (profile.task === 'warrior') skills.combat += Math.round(level * 0.5)
                  return skills
                },
        generateSlaveCharacter(society, state, ownerHouse, template) {
                  template = template || this.randomSlaveTemplate(ownerHouse)
                  let ownerDynastyId = ownerHouse && ownerHouse.id
                  if (!ownerDynastyId && !template.market) {
                    let currentId = this.currentCharacterId(state)
                    let current = state.characters && state.characters[currentId]
                    ownerDynastyId = current && current.dynastyId
                  }
                  let isMale = template.isMale !== undefined ? !!template.isMale : Math.random() > 0.45
                  template.origin = template.origin || this.randomSlaveOrigin()
                  template.fullName = template.fullName || this.randomSlaveFullName(template.origin, isMale)
                  template.name = template.name || this.shortSlaveName(template.fullName)
                  let profile = this.slaveTypeProfile(template.type)
                  let traits = ['content'].concat(profile.traits || [])
                  traits = traits.filter((trait, index, list) => trait && list.indexOf(trait) === index)
                  let characterId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: template.name || this.pick(this.slaveNames()),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: (state.year || 500) - Math.round(template.age || this.randomInt(16, 40)),
                      look: this.generatedVanillaLook(isMale, 'slave-' + template.key),
                      job: profile.job || 'labourer',
                      jobLevel: Math.max(0, Math.round((template.level || 1) / 2)),
                      traits,
                      skills: this.slaveSkills(template.type, template.level),
                      corSocietyGenerated: true,
                      corSocietySlave: true,
                      corSocietySlaveActive: !template.market,
                      corSocietySlaveMarket: !!template.market,
                      corSocietySlaveType: template.type,
                      corSocietySlaveLevel: template.level,
                      corSocietySlaveOwnerHouseId: ownerDynastyId || '',
                      corSocietySlaveOrigin: template.origin,
                      corSocietySlaveFullName: template.fullName,
                      corSocietySlaveTask: template.task || profile.task || template.type || 'labor',
                      corSocietySlaveSavings: Math.max(0, parseFloat(template.savings || 0)),
                      corSocietyOrigin: 'enslaved_dependant',
                      flagDoNotCull: true,
                      flagCannotMarry: true,
                      flagCanHoldImperium: false
                    },
                    dynastyFeatures: {}
                  })
                  let patch = {
                    dynastyId: template.market ? '' : (ownerDynastyId || undefined),
                    corSocietySlave: true,
                    corSocietySlaveActive: !template.market,
                    corSocietySlaveMarket: !!template.market,
                    corSocietySlaveType: template.type,
                    corSocietySlaveLevel: template.level,
                    corSocietySlaveOwnerHouseId: ownerDynastyId || '',
                    corSocietySlaveOrigin: template.origin,
                    corSocietySlaveFullName: template.fullName,
                    corSocietySlaveTask: template.task || profile.task || template.type || 'labor',
                    corSocietySlaveSavings: Math.max(0, parseFloat(template.savings || 0)),
                    corSocietyOrigin: 'enslaved_dependant',
                    flagDoNotCull: true,
                    flagCannotMarry: true,
                    flagCanHoldImperium: false
                  }
                  try {
                    daapi.updateCharacter({ characterId, character: patch })
                  } catch (err) {
                    console.warn(err)
                  }
                  template.characterId = characterId
                  template.ownerHouseId = ownerDynastyId || ''
                  template.active = !template.market
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(characterId) < 0) {
                    society.generatedCharacterIds.push(characterId)
                  }
                  if (ownerHouse) {
                    ownerHouse.slaveIds = ownerHouse.slaveIds || []
                    if (ownerHouse.slaveIds.indexOf(characterId) < 0) ownerHouse.slaveIds.push(characterId)
                    ownerHouse.memberIds = ownerHouse.memberIds || []
                    if (ownerHouse.memberIds.indexOf(characterId) < 0) ownerHouse.memberIds.push(characterId)
                  }
                  return template
                },
        activeSlavesForHouse(house, state) {
                  let ids = (house && house.slaveIds) || []
                  return ids
                    .map((characterId) => state.characters && state.characters[characterId])
                    .filter((character) => character && !character.isDead && character.corSocietySlave && character.corSocietySlaveActive !== false)
                },
        playerSlaveRecords(society, state) {
                  society.playerSlaves = society.playerSlaves || []
                  society.playerSlaves = society.playerSlaves.filter((slave) => {
                    let character = slave && slave.characterId && state.characters && state.characters[slave.characterId]
                    return !!(slave && slave.active !== false && character && !character.isDead)
                  })
                  return society.playerSlaves
                },
        currentPlayerSlaveRecord(society, state) {
                  let characterId = this.currentCharacterId(state)
                  let character = state.characters && state.characters[characterId]
                  if (!character || !this.isSlaveCharacter(character)) {
                    return false
                  }
                  let existing = (society.playerSlaves || []).find((slave) => this.sameCharacterId(slave.characterId, characterId))
                  if (existing) {
                    return existing
                  }
                  return this.playerSlaveRecordFromCharacter({
                    key: 'slave_' + this.safeId(characterId),
                    characterId,
                    originHouseId: character.corSocietyOriginHouseId || '',
                    previousOwnerHouseId: character.corSocietyPreviousOwnerHouseId || '',
                    origin: character.corSocietySlaveOrigin || this.randomSlaveOrigin(),
                    type: character.corSocietySlaveType || this.slaveTypeFromCharacter(character),
                    level: character.corSocietySlaveLevel || 1,
                    savings: character.corSocietySlaveSavings || 0
                  }, { ...character, id: characterId }, state)
                },
        openPlayerSlavePath() {
                  let society = this.loadForAction()
                  let state = daapi.getState()
                  let characterId = this.currentCharacterId(state)
                  let character = state.characters && state.characters[characterId]
                  let record = this.currentPlayerSlaveRecord(society, state)
                  if (!character || !record) {
                    this.openHub()
                    return
                  }
                  let freedomPrice = this.slaveFreedomPrice(record)
                  let savings = Math.round(parseFloat(record.savings || character.corSocietySlaveSavings || 0))
                  let ownerHouse = society.houses[character.corSocietySlaveOwnerHouseId] || society.houses[character.corSocietyHouseId] || false
                  let cooldown = character.corSocietySlaveNextFreedomActionMonth && !this.monthKeyReached(character.corSocietySlaveNextFreedomActionMonth, state)
                  let options = [
                    {
                      variant: 'info',
                      text: 'Work extra for savings',
                      disabled: !!cooldown,
                      showDisabledWithTooltip: true,
                      tooltip: cooldown ? 'Available after ' + character.corSocietySlaveNextFreedomActionMonth + '.' : 'Gain savings toward self-purchase; small risk of stress or injury.',
                      icons: [this.slaveTypeIcon(record.type), this.affairIcon('coins')],
                      action: { event: this.event, method: 'playerSlaveWorkExtra' }
                    },
                    {
                      variant: 'info',
                      text: 'Petition for freedom',
                      disabled: !!cooldown || savings < Math.round(freedomPrice * 0.45),
                      showDisabledWithTooltip: true,
                      tooltip: savings < Math.round(freedomPrice * 0.45) ? 'You need at least 45% of the freedom price saved.' : cooldown ? 'Available after ' + character.corSocietySlaveNextFreedomActionMonth + '.' : 'Ask the owner or controlling house to accept partial payment and goodwill.',
                      icons: [this.affairIcon('support'), this.affairIcon('coins')],
                      action: { event: this.event, method: 'playerSlavePetitionFreedom' }
                    },
                    {
                      variant: 'info',
                      text: 'Seek a patron',
                      disabled: !!cooldown,
                      showDisabledWithTooltip: true,
                      tooltip: cooldown ? 'Available after ' + character.corSocietySlaveNextFreedomActionMonth + '.' : 'Try to gain outside support. Can add savings or improve chance of manumission.',
                      icons: [this.affairIcon('prestige')],
                      action: { event: this.event, method: 'playerSlaveSeekPatron' }
                    },
                    {
                      variant: 'danger',
                      text: 'Attempt escape',
                      disabled: !!cooldown,
                      showDisabledWithTooltip: true,
                      tooltip: cooldown ? 'Available after ' + character.corSocietySlaveNextFreedomActionMonth + '.' : 'Risky. Success creates a freedman house; failure hurts relations and may wound you.',
                      icons: [this.affairIcon('rivalry')],
                      action: { event: this.event, method: 'playerSlaveEscape' }
                    },
                    {
                      text: 'Back',
                      action: { event: this.event, method: 'openHub' }
                    }
                  ]
                  this.pushModal({
                    societyMenu: true,
                    title: 'Path to Freedom',
                    message: 'Slave-focused Society actions for ' + this.characterName({ ...character, id: characterId }, state) + '.',
                    societySummaryOptions: [
                      this.summaryOption('Status', 'Enslaved; owner ' + (ownerHouse ? ownerHouse.name : 'unknown'), [this.slaveTypeIcon(record.type)], 'These mechanics are available when playing as an enslaved character through Play As.'),
                      this.summaryOption('Freedom fund', savings + '/' + freedomPrice, [this.affairIcon('coins')], 'Savings are stored on the real character.'),
                      this.summaryOption('Origin', this.slaveOriginDescription(record.origin || character.corSocietySlaveOrigin || 'unknown'), [this.affairIcon('log')], 'Roman slavery notes are removed when the character becomes free.'),
                      this.summaryOption('Work', this.slaveTaskLabel(record) + ', level ' + Math.round(record.level || 1), [this.slaveTypeIcon(record.type)], 'Skill and task affect savings and success chances.')
                    ],
                    image: this.characterPortrait({ ...character, id: characterId }, state),
                    options
                  })
                },
        setPlayerSlaveActionCooldown(characterId, months) {
                  try {
                    daapi.updateCharacter({
                      characterId,
                      character: {
                        corSocietySlaveNextFreedomActionMonth: this.futureMonthKey(months || 3)
                      }
                    })
                  } catch (err) {
                    console.warn(err)
                  }
                },
        playerSlaveWorkExtra() {
                  let society = this.loadForAction()
                  let state = daapi.getState()
                  let characterId = this.currentCharacterId(state)
                  let character = state.characters && state.characters[characterId]
                  let record = this.currentPlayerSlaveRecord(society, state)
                  if (!character || !record) {
                    this.openHub()
                    return
                  }
                  let gain = Math.max(4, Math.round((record.level || 1) * 3 + this.characterScore(character, state) / 18))
                  let savings = Math.max(0, parseFloat(record.savings || character.corSocietySlaveSavings || 0)) + gain
                  record.savings = savings
                  this.setPlayerSlaveActionCooldown(characterId, 2)
                  try {
                    daapi.updateCharacter({ characterId, character: { corSocietySlaveSavings: savings } })
                    if (Math.random() < 0.16) daapi.addTrait({ characterId, trait: Math.random() < 0.5 ? 'stressed' : 'wounded' })
                  } catch (err) {
                    console.warn(err)
                  }
                  this.log(society, this.characterName({ ...character, id: characterId }, state) + ' works extra and saves ' + gain + ' toward freedom.', 'slaves')
                  this.save(society)
                  this.openPlayerSlavePath()
                },
        playerSlaveSeekPatron() {
                  let society = this.loadForAction()
                  let state = daapi.getState()
                  let characterId = this.currentCharacterId(state)
                  let character = state.characters && state.characters[characterId]
                  let record = this.currentPlayerSlaveRecord(society, state)
                  if (!character || !record) {
                    this.openHub()
                    return
                  }
                  let success = Math.random() < this.clamp(0.30 + this.characterScore(character, state) / 180, 0.18, 0.72)
                  let gain = success ? Math.max(8, Math.round((record.level || 1) * 5 + 8)) : Math.max(1, Math.round((record.level || 1) * 2))
                  let savings = Math.max(0, parseFloat(record.savings || character.corSocietySlaveSavings || 0)) + gain
                  record.savings = savings
                  this.setPlayerSlaveActionCooldown(characterId, success ? 3 : 4)
                  try {
                    daapi.updateCharacter({ characterId, character: { corSocietySlaveSavings: savings } })
                  } catch (err) {
                    console.warn(err)
                  }
                  this.log(society, success ? 'A patron quietly supports an enslaved dependant seeking freedom.' : 'A search for patronage gains only a little sympathy.', 'slaves')
                  this.save(society)
                  this.openPlayerSlavePath()
                },
        playerSlavePetitionFreedom() {
                  let society = this.loadForAction()
                  let state = daapi.getState()
                  let characterId = this.currentCharacterId(state)
                  let character = state.characters && state.characters[characterId]
                  let record = this.currentPlayerSlaveRecord(society, state)
                  if (!character || !record) {
                    this.openHub()
                    return
                  }
                  let ownerHouse = society.houses[character.corSocietySlaveOwnerHouseId] || society.houses[character.corSocietyHouseId] || false
                  let savings = Math.max(0, parseFloat(record.savings || character.corSocietySlaveSavings || 0))
                  let price = this.slaveFreedomPrice(record)
                  let chance = this.clamp(0.18 + savings / Math.max(1, price) * 0.55 + this.characterScore(character, state) / 250, 0.12, 0.86)
                  if (ownerHouse && (ownerHouse.relation || 0) < -20) chance -= 0.12
                  this.setPlayerSlaveActionCooldown(characterId, 5)
                  if (Math.random() < chance) {
                    this.manumitCurrentSlaveCharacter(society, state, record, 'self_petition')
                    this.save(society)
                    this.pushModal({
                      societyMenu: true,
                      title: 'Freedom granted',
                      message: 'The petition is accepted. The character enters a freedman house and the slavery origin note is cleared.',
                      image: this.affairIcon('freedmen'),
                      options: [{ text: 'Open Society', action: { event: this.event, method: 'openHub' } }]
                    })
                    return
                  }
                  if (ownerHouse) {
                    ownerHouse.relation = this.clamp((ownerHouse.relation || 0) - 4, -100, 100)
                    ownerHouse.heat = (ownerHouse.heat || 0) + 1
                  }
                  this.log(society, 'A slave petition for freedom is refused.', 'slaves', ownerHouse ? ownerHouse.id : '')
                  this.save(society)
                  this.openPlayerSlavePath()
                },
        playerSlaveEscape() {
                  let society = this.loadForAction()
                  let state = daapi.getState()
                  let characterId = this.currentCharacterId(state)
                  let character = state.characters && state.characters[characterId]
                  let record = this.currentPlayerSlaveRecord(society, state)
                  if (!character || !record) {
                    this.openHub()
                    return
                  }
                  let ownerHouse = society.houses[character.corSocietySlaveOwnerHouseId] || society.houses[character.corSocietyHouseId] || false
                  let skills = character.skills || {}
                  let chance = this.clamp(0.20 + parseFloat(skills.combat || 0) / 120 + parseFloat(skills.intelligence || 0) / 180 - ((ownerHouse && ownerHouse.power) || 0) / 350, 0.08, 0.62)
                  this.setPlayerSlaveActionCooldown(characterId, 8)
                  if (Math.random() < chance) {
                    this.manumitCurrentSlaveCharacter(society, state, record, 'escaped_freedman')
                    this.save(society)
                    this.pushModal({
                      societyMenu: true,
                      title: 'Escape succeeds',
                      message: 'The escape succeeds. The character survives as a freedman and starts a precarious free house.',
                      image: this.affairIcon('freedmen'),
                      options: [{ text: 'Open Society', action: { event: this.event, method: 'openHub' } }]
                    })
                    return
                  }
                  if (ownerHouse) {
                    ownerHouse.relation = this.clamp((ownerHouse.relation || 0) - 12, -100, 100)
                    ownerHouse.heat = (ownerHouse.heat || 0) + 2
                  }
                  try {
                    daapi.addTrait({ characterId, trait: Math.random() < 0.55 ? 'wounded' : 'stressed' })
                  } catch (err) {
                    console.warn(err)
                  }
                  this.log(society, 'An escape attempt fails and the owner house tightens control.', 'slaves', ownerHouse ? ownerHouse.id : '')
                  this.save(society)
                  this.openPlayerSlavePath()
                },
        manumitCurrentSlaveCharacter(society, state, record, reason) {
                  let characterId = record && record.characterId
                  let character = characterId && state.characters && state.characters[characterId]
                  if (!character) {
                    return false
                  }
                  character.id = character.id || characterId
                  let ownerHouseId = character.corSocietySlaveOwnerHouseId || character.corSocietyHouseId || ''
                  let ownerHouse = society.houses[ownerHouseId]
                  let freedHouse = this.freedmanHouseForCharacter(society, state, record, character)
                  try {
                    daapi.updateCharacter({
                      characterId,
                      character: {
                        dynastyId: freedHouse ? this.gameDynastyIdForHouse(freedHouse) : character.dynastyId,
                        corSocietyHouseId: freedHouse ? freedHouse.id : '',
                        corSocietySlave: false,
                        corSocietySlaveActive: false,
                        corSocietySlaveMarket: false,
                        corSocietySlaveOrigin: '',
                        corSocietyFreedman: true,
                        corSocietyOrigin: reason || 'manumitted_freedman',
                        corSocietySlaveOwnerHouseId: '',
                        flagCannotMarry: false,
                        flagDoNotCull: true
                      }
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId })
                  } catch (err) {
                    console.warn(err)
                  }
                  if (ownerHouse) {
                    ownerHouse.slaveIds = (ownerHouse.slaveIds || []).filter((id) => !this.sameCharacterId(id, characterId))
                    ownerHouse.memberIds = (ownerHouse.memberIds || []).filter((id) => !this.sameCharacterId(id, characterId))
                  }
                  if (freedHouse) {
                    freedHouse.memberIds = freedHouse.memberIds || []
                    if (freedHouse.memberIds.indexOf(characterId) < 0) freedHouse.memberIds.push(characterId)
                  }
                  society.playerSlaves = (society.playerSlaves || []).filter((slave) => !this.sameCharacterId(slave.characterId, characterId))
                  state = daapi.getState()
                  if (ownerHouse) this.refreshHouseMemberLists(society, state, ownerHouse)
                  if (freedHouse) this.refreshHouseMemberLists(society, state, freedHouse)
                  this.log(society, this.characterName(character, state) + ' becomes free and enters the freedmen order.', 'slaves', freedHouse ? freedHouse.id : '')
                  return true
                },
        processPlayerSlaves(society, state) {
                  this.syncOwnedSlaveChildren(society, state)
                  let slaves = this.playerSlaveRecords(society, state)
                  slaves.forEach((slave) => {
                    let character = slave.characterId && state.characters ? state.characters[slave.characterId] : false
                    slave.monthsOwned = (slave.monthsOwned || 0) + 1
                    slave.age = character ? this.age(character, state) : parseFloat(slave.age || 20) + (1 / 12)
                    if (character && character.corSocietySlaveTask) {
                      slave.task = character.corSocietySlaveTask
                    }
                    slave.savings = Math.max(0, parseFloat(slave.savings || 0))
                    let taskInfo = this.slaveTaskInfo(slave)
                    let savingGain = Math.max(1, Math.round((slave.level || 1) * 0.35 + (taskInfo.type === 'manager' ? 1 : 0)))
                    slave.savings += savingGain
                    let freedomPrice = this.slaveFreedomPrice(slave)
                    if (slave.savings >= freedomPrice && !slave.flagFreedomReadyLogged) {
                      slave.flagFreedomReadyLogged = true
                      this.log(society, slave.name + ' has saved enough to ask to buy freedom.', 'slaves')
                    }
                    try {
                      if (slave.characterId) {
                        daapi.updateCharacter({
                          characterId: slave.characterId,
                          character: {
                            corSocietySlaveSavings: slave.savings,
                            corSocietySlaveTask: taskInfo.type || slave.task || 'labor'
                          }
                        })
                      }
                    } catch (err) {
                      console.warn(err)
                    }
                    if (Math.random() < Math.max(0.001, (slave.age || 20) > 55 ? 0.012 : 0.002)) {
                      slave.active = false
                      try {
                        if (character) daapi.kill({ characterId: slave.characterId, deathCause: 'natural causes' })
                      } catch (err) {
                        console.warn(err)
                      }
                      this.log(society, 'Household slave ' + slave.name + ' has died.', 'slaves')
                      return
                    }
                    if (slave.monthsOwned % 3 !== 0) {
                      return
                    }
                    let gain = Math.max(1, Math.round((slave.level || 1) / 2))
                    let workType = taskInfo.type || slave.type
                    if ((slave.age || 20) < 12) {
                      return
                    }
                    if (workType === 'manager') {
                      this.applyStats({ cash: gain * 6 })
                      this.log(society, slave.name + ' manages household accounts: +' + (gain * 6) + ' cash.', 'slaves')
                    } else if (workType === 'entertainer') {
                      this.applyStats({ prestige: gain })
                      this.log(society, slave.name + ' entertains the household: +' + gain + ' prestige.', 'slaves')
                    } else if (workType === 'warrior') {
                      this.applyStats({ influence: gain * 3 })
                      this.log(society, slave.name + ' trains guards and retainers: +' + (gain * 3) + ' influence.', 'slaves')
                    } else if (workType === 'educator') {
                      this.educateAssignedHouseholdChild(society, state, gain, slave)
                    } else if (workType === 'doctor') {
                      this.treatRandomHouseholdMember(society, state, gain, slave)
                    } else {
                      this.applyStats({ cash: gain * 2 })
                      this.log(society, slave.name + ' performs household labor: +' + (gain * 2) + ' cash.', 'slaves')
                    }
                  })
                  society.playerSlaves = slaves.filter((slave) => slave && slave.active !== false)
                  this.tryOwnedSlavePregnancies(society, daapi.getState())
                },
        syncOwnedSlaveChildren(society, state) {
                  let records = society.playerSlaves || []
                  let parentIds = {}
                  records.forEach((record) => {
                    if (record && record.active !== false && record.characterId) parentIds[record.characterId] = record
                  })
                  if (!Object.keys(parentIds).length || !state.characters) {
                    return false
                  }
                  let currentDynastyId = this.currentCharacterDynastyId(state)
                  let added = false
                  Object.keys(parentIds).forEach((parentId) => {
                    let parent = state.characters[parentId]
                    if (!parent || !parent.childrenIds) return
                    parent.childrenIds.forEach((characterId) => {
                      let character = state.characters[characterId]
                      if (!character || character.isDead || character.corSocietySlave) return
                      let parentRecord = parentIds[character.fatherId] || parentIds[character.motherId]
                      if (!parentRecord) return
                      let age = this.age(character, state)
                      if (age > 16) return
                      let origin = parentRecord.origin || (state.characters[parentRecord.characterId] && state.characters[parentRecord.characterId].corSocietySlaveOrigin) || this.randomSlaveOrigin()
                      try {
                        daapi.updateCharacter({
                          characterId,
                          character: {
                            dynastyId: currentDynastyId || character.dynastyId,
                            corSocietySlave: true,
                            corSocietySlaveActive: true,
                            corSocietySlaveType: 'labor',
                            corSocietySlaveLevel: 1,
                            corSocietySlaveOwnerHouseId: currentDynastyId || '',
                            corSocietySlaveOrigin: origin,
                            corSocietySlaveTask: 'labor',
                            corSocietySlaveSavings: 0,
                            corSocietyOrigin: 'enslaved_dependant',
                            flagCannotMarry: true,
                            flagDoNotCull: true
                          }
                        })
                      } catch (err) {
                        console.warn(err)
                        return
                      }
                      let updated = (daapi.getState().characters || {})[characterId] || { ...character, id: characterId }
                      records = records.filter((record) => !this.sameCharacterId(record.characterId, characterId))
                      records.push(this.playerSlaveRecordFromCharacter({
                        key: 'slave_' + this.safeId(characterId),
                        characterId,
                        type: 'labor',
                        level: 1,
                        age,
                        origin,
                        task: 'labor',
                        savings: 0
                      }, updated, state))
                      added = true
                    })
                  })
                  society.playerSlaves = records
                  if (added) {
                    this.log(society, 'A child born to household slaves is recorded in the household slave list.', 'birth')
                  }
                  return added
                },
        tryPrivateCompanyPregnancy(society, state, record, ownerId) {
                  if (!record || !record.characterId) {
                    return false
                  }
                  let slave = state.characters && state.characters[record.characterId]
                  if (!slave || slave.isDead) {
                    return false
                  }
                  slave.id = slave.id || record.characterId
                  let isFemale = !this.characterIsMale(slave)
                  if (!isFemale) {
                    return false
                  }
                  let age = this.age(slave, state)
                  if (age < 18 || age > 42 || slave.flagCannotGetPregnant || slave.startedPregnancyTime) {
                    return false
                  }
                  let owner = state.characters && state.characters[ownerId]
                  if (!owner || owner.isDead || !this.characterIsMale(owner)) {
                    return false
                  }
                  owner.id = owner.id || ownerId
                  if (this.age(owner, state) < 18 || owner.corSocietySlave) {
                    return false
                  }
                  let level = Math.max(1, parseFloat(record.level || slave.corSocietySlaveLevel || 1))
                  let ageBand = age >= 20 && age <= 32 ? 0.05 : age >= 33 && age <= 38 ? 0.025 : 0
                  let chance = this.clamp(0.035 + level * 0.012 + ageBand, 0.035, 0.18)
                  if (Math.random() > chance) {
                    return false
                  }
                  try {
                    daapi.impregnate({
                      characterId: slave.id,
                      fatherId: owner.id
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId: slave.id })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  society.pendingPaternities = society.pendingPaternities || []
                  let id = 'private_company_' + this.safeId(slave.id) + '_' + this.safeId(owner.id) + '_' + this.monthIndex(this.monthKey(state))
                  if (!society.pendingPaternities.some((item) => item && item.id === id)) {
                    society.pendingPaternities.push({
                      id,
                      motherId: slave.id,
                      biologicalFatherId: owner.id,
                      officialFatherId: owner.id,
                      isPrivateCompany: true,
                      startedIndex: this.monthIndex(this.monthKey(state)),
                      childId: '',
                      discovered: false
                    })
                  }
                  this.log(society, this.slaveDisplayName(slave, record, state) + ', a household slave, is expecting a child with ' + this.characterName(owner, state) + '.', 'birth')
                  return true
                },
        tryOwnedSlavePregnancies(society, state) {
                  let records = this.playerSlaveRecords(society, state)
                  if (!records.length || Math.random() > 0.055) {
                    return false
                  }
                  let owned = {}
                  records.forEach((record) => {
                    if (record.characterId) owned[record.characterId] = record
                  })
                  let couples = []
                  records.forEach((record) => {
                    let character = record.characterId && state.characters && state.characters[record.characterId]
                    if (!character || !character.spouseId || !owned[character.spouseId]) return
                    character.id = character.id || record.characterId
                    let spouse = state.characters[character.spouseId]
                    if (!spouse || !this.isMarriageCompatibleForSlaves(character, spouse)) return
                    spouse.id = spouse.id || character.spouseId
                    let mother = this.characterIsMale(character) ? spouse : character
                    let father = this.characterIsMale(character) ? character : spouse
                    let age = this.age(mother, state)
                    if (age < 16 || age > 42 || mother.flagCannotGetPregnant || father.flagCannotImpregnate) return
                    if (this.childrenCountForCouple(state, mother.id, father.id) >= 5) return
                    couples.push({ mother, father })
                  })
                  if (!couples.length) {
                    return false
                  }
                  let couple = this.pick(couples)
                  try {
                    daapi.impregnate({
                      characterId: couple.mother.id,
                      fatherId: couple.father.id
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId: couple.mother.id })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  this.log(society, this.slaveDisplayName(couple.mother, null, state) + ', a household slave, is expecting a child with spouse ' + this.slaveDisplayName(couple.father, null, state) + '.', 'birth')
                  return true
                },
        processBankYear(society, state) {
                  society.bank = {
                    principal: 0,
                    interestRate: 0.083,
                    loansTaken: 0,
                    lastPaymentYear: '',
                    lastNoticeYear: '',
                    lastClearedYear: '',
                    ...(society.bank || {})
                  }
                  let principal = Math.round(parseFloat(society.bank.principal || 0))
                  if (principal <= 0) {
                    society.bank.principal = 0
                    return false
                  }
                  let year = String((state && state.year) || '')
                  if ((state && parseInt(state.month || 0, 10) !== 0) || !year) {
                    return false
                  }
                  if (society.bank.lastPaymentYear === year || society.bank.lastNoticeYear === year) {
                    return false
                  }
                  society.bank.lastNoticeYear = year
                  let interest = this.bankInterest(society)
                  let yearlyPrincipalChunk = Math.min(principal, Math.max(50, Math.round(principal * 0.25)))
                  this.pushModal({
                    corTranslatorPretranslateNow: true,
                    disableSocietyClose: true,
                    title: 'Bank of Rome interest',
                    message: 'The Bank of Rome expects yearly interest on your outstanding loan.\nPrincipal: ' + principal + '\nInterest due: ' + interest,
                    image: this.bundledIcon('bank_of_rome', 'money'),
                    options: [
                      {
                        variant: 'info',
                        text: 'Pay interest (' + interest + ')',
                        disabled: parseFloat(((state || {}).current || {}).cash || 0) < interest,
                        showDisabledWithTooltip: true,
                        tooltip: 'Pay only this year\'s interest. Principal remains unchanged.',
                        statChanges: { cash: -interest },
                        action: {
                          event: this.event,
                          method: 'payBankLoan',
                          context: { amount: 0, interestOnly: true }
                        }
                      },
                      {
                        text: 'Pay down principal (' + yearlyPrincipalChunk + ')',
                        disabled: parseFloat(((state || {}).current || {}).cash || 0) < (interest + yearlyPrincipalChunk),
                        showDisabledWithTooltip: true,
                        tooltip: 'Pay interest plus a chunk of principal.',
                        statChanges: { cash: -(interest + yearlyPrincipalChunk) },
                        action: {
                          event: this.event,
                          method: 'payBankLoan',
                          context: { amount: yearlyPrincipalChunk }
                        }
                      },
                      {
                        variant: 'danger',
                        text: 'Defer payment',
                        tooltip: 'Adds the interest to principal and hurts public standing.',
                        statChanges: { prestige: -8, influence: -20 },
                        action: {
                          event: this.event,
                          method: 'deferBankPayment'
                        }
                      }
                    ]
                  })
                  return true
                },
        queueBankDebtReliefEvent(society, state) {
                  this.installDebtSaleModalPatch()
                  return this.injectDebtLoanButtonIntoDebtModal()
                },
        bankInterest(society) {
                  society = society || this.load()
                  let bank = society.bank || {}
                  return Math.max(1, Math.ceil(parseFloat(bank.principal || 0) * parseFloat(bank.interestRate || 0.083)))
                },
        educationSkillForSlave(slave) {
                  let type = (slave && (slave.type || slave.task)) || 'educator'
                  let profile = this.slaveTypeProfile(type)
                  if (profile && profile.skill) return profile.skill
                  if (type === 'doctor') return 'intelligence'
                  if (type === 'manager') return 'stewardship'
                  if (type === 'entertainer') return 'eloquence'
                  if (type === 'warrior') return 'combat'
                  if (type === 'labor') return 'stewardship'
                  return this.pick(['intelligence', 'stewardship', 'eloquence'])
                },
        educateAssignedHouseholdChild(society, state, gain, slave) {
                  let children = this.householdChildrenUnder13(state)
                  if (!children.length) return false
                  let child = slave.educationTargetId && state.characters && state.characters[slave.educationTargetId]
                  if (!child || child.isDead || this.age(child, state) >= 13) {
                    child = children[0]
                    slave.educationTargetId = child.id
                  }
                  let characterId = child.id
                  let character = state.characters[characterId]
                  let skill = this.educationSkillForSlave(slave)
                  let skills = { ...(character.skills || {}) }
                  skills[skill] = parseFloat(skills[skill] || 0) + Math.max(1, gain)
                  skills.intelligence = parseFloat(skills.intelligence || 0) + (skill === 'intelligence' ? 0 : 0.35)
                  try {
                    daapi.updateCharacter({
                      characterId,
                      character: {
                        skills,
                        corSocietyApprenticeship: slave.type || 'educator',
                        corSocietyApprenticeTeacherId: slave.characterId || ''
                      }
                    })
                    if (Math.random() < 0.28) {
                      try {
                        daapi.addTrait({ characterId, trait: skill === 'combat' ? 'strong' : 'educated' })
                      } catch (traitErr) {
                        console.warn(traitErr)
                      }
                    }
                    this.log(society || this.load(), slave.name + ' teaches ' + this.characterName(character, state) + ': +' + gain + ' ' + skill + '.', 'slaves')
                  } catch (err) {
                    console.warn(err)
                  }
                  return true
                },
        educateRandomHouseholdChild(state, gain, slave, society) {
                  return this.educateAssignedHouseholdChild(society || this.load(), state, gain, slave)
                },
        treatRandomHouseholdMember(society, state, gain, slave) {
                  let maladies = ['stress', 'highlyStress', 'depression', 'cripplingDepression', 'illness', 'wounded', 'greviouslyWounded', 'malnourished']
                  let ids = ((state.current && state.current.householdCharacterIds) || []).filter((characterId) => {
                    let character = state.characters && state.characters[characterId]
                    return character && !character.isDead && (character.traits || []).some((trait) => maladies.indexOf(trait) >= 0)
                  })
                  if (!ids.length) return false
                  let characterId = this.pick(ids)
                  let character = state.characters[characterId]
                  let trait = (character.traits || []).find((item) => maladies.indexOf(item) >= 0)
                  if (trait && Math.random() < this.clamp(0.28 + gain * 0.08, 0.28, 0.82)) {
                    try {
                      daapi.removeTrait({ characterId, trait })
                      this.log(society || this.load(), slave.name + ' treats ' + this.characterName(character, state) + ' and relieves ' + trait + '.', 'slaves')
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                  return true
                },
        simulateHouseBanking(society, state, house) {
                  if (!house || !house.ai) return
                  house.ai.bankPrincipal = parseFloat(house.ai.bankPrincipal || 0)
                  house.ai.bankRate = parseFloat(house.ai.bankRate || 0.083)
                  if (house.ai.cash < 20 && house.ai.bankPrincipal < Math.max(300, (house.wealth || 100) * 1.2)) {
                    let amount = Math.max(80, Math.round((this.strata[house.stratum] || this.strata.plebeian).cost * 0.55))
                    house.ai.cash += amount
                    house.ai.bankPrincipal += amount
                    house.lastFamilyEvent = 'Takes a loan from the Bank of Rome.'
                    this.log(society, house.name + ' borrows ' + amount + ' from the Bank of Rome.', 'bank', house.id)
                  }
                  if ((state.month || 0) === 0 && house.ai.bankPrincipal > 0) {
                    let interest = Math.ceil(house.ai.bankPrincipal * house.ai.bankRate)
                    if (house.ai.cash >= interest) {
                      house.ai.cash -= interest
                      let principalPay = Math.min(house.ai.bankPrincipal, Math.max(0, Math.min(Math.round((house.ai.cash || 0) * 0.16), Math.max(3, Math.round((house.ai.bankPrincipal || 0) * 0.10)))))
                      house.ai.cash -= principalPay
                      house.ai.bankPrincipal -= principalPay
                    } else {
                      house.ai.bankPrincipal += interest
                      house.stability = this.clamp((house.stability || 50) - 4, 0, 100)
                      house.power = Math.max(0, (house.power || 0) - 2)
                      if (Math.random() < 0.18) {
                        house.lastFamilyEvent = 'Debt trouble at the Bank of Rome.'
                        this.log(society, house.name + ' fails to cover bank interest and loses standing.', 'bank', house.id)
                      }
                    }
                  }
                },
        simulateHouseSlaves(society, state, house, candidates) {
                  if (!house || !house.ai) return
                  house.slaveIds = (house.slaveIds || []).filter((characterId) => {
                    let character = state.characters && state.characters[characterId]
                    return character && !character.isDead && character.corSocietySlaveActive !== false
                  })
                  let slaves = this.activeSlavesForHouse(house, state)
                  let maxSlaves = this.clamp(1 + this.socialLevel(house.stratum), 1, 6)
                  if (slaves.length < maxSlaves && house.ai.cash > 180 && Math.random() < (house.agenda === 'wealth' ? 0.08 : 0.035)) {
                    let marketCandidate = (candidates || this.npcEnslavedCandidates(society, state, house)).filter(c => c.sellerHouse.id !== house.id)[0]
                    if (marketCandidate && house.ai.cash >= marketCandidate.cost && Math.random() < 0.72) {
                      this.npcPurchaseEnslavedCharacter(society, state, house, marketCandidate)
                      state = daapi.getState()
                      slaves = this.activeSlavesForHouse(house, state)
                    } else {
                      let template = this.randomSlaveTemplate(house, this.socialLevel(house.stratum) >= 4 ? 1 : 0)
                      let cost = this.slaveCost(template)
                      if (house.ai.cash >= cost) {
                        house.ai.cash -= cost
                        let record = this.generateSlaveCharacter(society, state, house, template)
                        house.lastFamilyEvent = 'Purchases ' + record.name + ', an enslaved ' + this.slaveTypeLabel(record.type).toLowerCase() + ' of ' + record.origin + ' origin.'
                        this.log(society, house.name + ' purchases ' + record.name + ', an enslaved ' + this.slaveTypeLabel(record.type).toLowerCase() + ' of ' + record.origin + ' origin.', 'slaves', house.id)
                      }
                      state = daapi.getState()
                      slaves = this.activeSlavesForHouse(house, state)
                    }
                  }
                  slaves.forEach((slave) => {
                    let level = parseFloat(slave.corSocietySlaveLevel || 1)
                    let type = slave.corSocietySlaveType || 'manager'
                    if (Math.random() < 0.002 + Math.max(0, this.age(slave, state) - 50) / 4000) {
                      try {
                        daapi.kill({ characterId: slave.id, deathCause: 'natural causes' })
                      } catch (err) {
                        console.warn(err)
                      }
                      house.lastFamilyEvent = this.characterName(slave, state) + ', an enslaved dependant, dies.'
                      return
                    }
                    if (type === 'manager') {
                      house.ai.cash += Math.round(4 + level * 5)
                      house.wealth += Math.round(level * 4)
                    } else if (type === 'educator') {
                      house.power += Math.round(level / 2)
                      house.ai.prestige += Math.round(level * 2)
                    } else if (type === 'doctor') {
                      house.stability = this.clamp((house.stability || 50) + Math.round(level / 2), 0, 100)
                    } else if (type === 'entertainer') {
                      house.ai.prestige += Math.round(level * 3)
                      house.heat = Math.max(0, (house.heat || 0) - 0.15)
                    } else if (type === 'warrior') {
                      house.ai.influence += Math.round(level * 5)
                      if (house.agenda === 'revenge') house.power += 1
                    }
                  })
                },
        simulateFreedmanRescueAttempts(society, state, house) {
                  let hasFreedmanRoots = !!(house && (house.manumittedHouse || (house.memberIds || []).some((id) => {
                    let character = state && state.characters && state.characters[id]
                    return character && character.corSocietyFreedman
                  })))
                  if (!house || house.stratum !== 'freedmen' || !hasFreedmanRoots || !house.ai || Math.random() > 0.045) {
                    return false
                  }
                  let freedIds = (house.memberIds || []).filter((characterId) => {
                    let character = state.characters && state.characters[characterId]
                    return character && !character.isDead && character.corSocietyFreedman
                  })
                  if (!freedIds.length) {
                    return false
                  }
                  let relationMap = {}
                  freedIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    let relatives = this.familyTreeRelatives(character, state)
                    ;[character.fatherId, character.motherId].concat(relatives.children, relatives.siblings).forEach((relativeId) => {
                      relationMap[relativeId] = characterId
                    })
                    if (character.spouseId) relationMap[character.spouseId] = characterId
                  })
                  let targets = []
                  this.sortedHouses(society).forEach((otherHouse) => {
                    if (!otherHouse || otherHouse.id === house.id) return
                    this.visibleHousePeople(otherHouse, state).forEach((characterId) => {
                      let character = state.characters && state.characters[characterId]
                      if (!character || character.isDead || !relationMap[characterId] || !this.isSlaveCharacter(character, otherHouse)) return
                      targets.push({ house: otherHouse, character })
                    })
                  })
                  if (!targets.length) {
                    return false
                  }
                  let target = this.pick(targets)
                  let cost = Math.max(80, Math.round(this.enslavedCharacterCost(society, state, target.house, target.character) * 1.05))
                  if (house.ai.cash < cost) {
                    house.ai.cash += Math.max(2, Math.round((house.ai.cash || 0) * 0.03 + 4))
                    return false
                  }
                  house.ai.cash -= cost
                  if (target.house && target.house.ai) {
                    target.house.ai.cash = Math.max(0, Math.round(parseFloat(target.house.ai.cash || 0) + cost))
                  }
                  try {
                    daapi.updateCharacter({
                      characterId: target.character.id,
                      character: {
                        dynastyId: this.gameDynastyIdForHouse(house),
                        corSocietyHouseId: house.id,
                        corSocietySlave: false,
                        corSocietySlaveActive: false,
                        corSocietySlaveMarket: false,
                        corSocietySlaveOrigin: '',
                        corSocietyFreedman: true,
                        corSocietyOrigin: 'rescued_freedman',
                        corSocietyFreedByHouseId: house.id,
                        flagCannotMarry: false
                      }
                    })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  state = daapi.getState()
                  if (target.house) {
                    target.house.slaveIds = (target.house.slaveIds || []).filter((id) => !this.sameCharacterId(id, target.character.id))
                    this.refreshHouseMemberLists(society, state, target.house)
                  }
                  this.refreshHouseMemberLists(society, state, house)
                  house.lastFamilyEvent = 'Buys and frees a relative from slavery.'
                  this.log(society, house.name + ' buys and frees ' + this.characterName(target.character, state) + ', a relative still held in slavery.', 'slaves', house.id)
                  return true
                },
        npcEnslavedCandidates(society, state, buyerHouse) {
                  let candidates = []
                  let buyerHouseId = buyerHouse ? buyerHouse.id : false
                  this.sortedHouses(society).forEach((house) => {
                    if (!house || house.id === buyerHouseId || house.stratum !== 'poor') {
                      return
                    }
                    this.visibleHousePeople(house, state).forEach((characterId) => {
                      let character = state.characters && state.characters[characterId]
                      if (!character || character.isDead || character.corSocietySlaveActive === true || this.age(character, state) < 5) {
                        return
                      }
                      character.id = character.id || characterId
                      let type = this.slaveTypeFromCharacter(character)
                      let level = Math.max(1, Math.round(character.corSocietySlaveLevel || this.characterScore(character, state) / 24 || 1))
                      let cost = this.enslavedCharacterCost(society, state, house, character)
                      candidates.push({ sellerHouse: house, character, type, level, cost })
                    })
                  })
                  return candidates.sort((a, b) => a.cost - b.cost)
                },
        npcPurchaseEnslavedCharacter(society, state, buyerHouse, item) {
                  if (!buyerHouse || !item || !item.character || !item.sellerHouse) {
                    return false
                  }
                  let character = item.character
                  let sellerHouse = item.sellerHouse
                  let cost = Math.max(1, Math.round(item.cost || 0))
                  if (!buyerHouse.ai || buyerHouse.ai.cash < cost) {
                    return false
                  }
                  buyerHouse.ai.cash -= cost
                  sellerHouse.ai = sellerHouse.ai || {}
                  sellerHouse.ai.cash = Math.max(0, Math.round(parseFloat(sellerHouse.ai.cash || 0) + cost))
                  sellerHouse.relation = this.clamp((sellerHouse.relation || 0) - this.randomInt(0, 3), -100, 100)
                  sellerHouse.memberIds = (sellerHouse.memberIds || []).filter((id) => !this.sameCharacterId(id, character.id))
                  sellerHouse.notableIds = (sellerHouse.notableIds || []).filter((id) => !this.sameCharacterId(id, character.id))
                  buyerHouse.memberIds = buyerHouse.memberIds || []
                  buyerHouse.slaveIds = buyerHouse.slaveIds || []
                  if (buyerHouse.memberIds.indexOf(character.id) < 0) buyerHouse.memberIds.push(character.id)
                  if (buyerHouse.slaveIds.indexOf(character.id) < 0) buyerHouse.slaveIds.push(character.id)
                  let origin = character.corSocietySlaveOrigin || this.randomSlaveOrigin()
                  try {
                    daapi.updateCharacter({
                      characterId: character.id,
                      character: {
                        dynastyId: this.gameDynastyIdForHouse(buyerHouse),
                        corSocietyHouseId: buyerHouse.id,
                        corSocietySlave: true,
                        corSocietySlaveActive: true,
                        corSocietySlaveMarket: false,
                        corSocietySlaveType: item.type || this.slaveTypeFromCharacter(character),
                        corSocietySlaveLevel: item.level || 1,
                        corSocietySlaveOwnerHouseId: buyerHouse.id,
                        corSocietySlaveOrigin: origin,
                        corSocietyOriginHouseId: character.corSocietyOriginHouseId || sellerHouse.id,
                        corSocietyPreviousOwnerHouseId: sellerHouse.id,
                        flagCannotMarry: true,
                        flagDoNotCull: true
                      }
                    })
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                  state = daapi.getState()
                  this.refreshHouseMemberLists(society, state, sellerHouse)
                  this.refreshHouseMemberLists(society, state, buyerHouse)
                  buyerHouse.lastFamilyEvent = 'Purchases ' + this.characterName(state.characters[character.id] || character, state) + ', an enslaved dependant from ' + sellerHouse.name + '.'
                  this.log(society, buyerHouse.name + ' purchases ' + this.characterName(state.characters[character.id] || character, state) + ' from ' + sellerHouse.name + '.', 'slaves', buyerHouse.id)
                  return true
                },
        runHouseEconomy(society, state, house) {
                  let profile = this.strata[house.stratum] || this.strata.plebeian
                  this.normalizeHousePropertyDetails(house)
                  this.aiSellExcessProperty(house, state)
                  let members = (house.memberIds || []).length || 1
                  let propertyIncome = this.housePropertyRevenue(house, state)
                  let baseIncome = 0.5 + this.houseAdditiveModifier(house, 'revenue', state)
                  let officeIncome = Math.max(0, Math.round((profile.revenue || 20) / 10))
                  let income = propertyIncome + baseIncome + officeIncome
                  let expenses = members * (house.stratum === 'senatorial' ? 10 : house.stratum === 'equestrian' ? 7 : 4)
                  house.ai.lastPropertyRevenue = propertyIncome
                  house.ai.lastTotalRevenue = income - expenses
                  house.ai.cash += income - expenses
                  if (house.ai.cash < 0) {
                    this.aiSellPropertyForCash(house, state, Math.abs(house.ai.cash) + 10)
                  }
                  if (house.ai.cash < 0) {
                    house.ai.influence = Math.max(0, house.ai.influence - 8)
                    house.stability -= 3
                  }
                  let cashLimit = this.houseEffectiveMaxCashHolding(house, state)
                  let investmentThreshold = Math.min(25000, Math.max(80, cashLimit / 5))
                  if (house.ai.cash > investmentThreshold && Math.random() < (house.agenda === 'wealth' ? 0.18 : 0.08)) {
                    this.aiBuyProperty(house, {}, state)
                  }
                  if (house.ai.cash > (profile.cost || 200) * 3 && Math.random() < 0.08) {
                    house.agenda = this.pick(['office', 'wealth', 'marriage', 'security'])
                    house.ai.focus = house.agenda
                  }
                },
        houseEffectiveMaxCashHolding(house, state) {
                  let classWealthLimits = [1100, 2500, 5000, 7500, 10000, 25000]
                  let stewardship = this.houseHouseholdStewardship(house, state || daapi.getState())
                  let max = 9819 * stewardship
                  let classLimit = classWealthLimits[this.housePropertyClass(house)]
                  return classLimit ? Math.min(max, classLimit) : max
                },
        aiSellExcessProperty(house, state) {
                  let details = this.normalizeHousePropertyDetails(house)
                  let types = this.vanillaPropertyTypes()
                  let sold = false
                  Object.keys(details).forEach((key) => {
                    let limit = Math.max(0, Math.floor(this.housePropertyMaxCount(house, key, state || daapi.getState())))
                    let count = Math.max(0, Math.floor(parseFloat(details[key] || 0)))
                    if (count <= limit) return
                    let excess = count - limit
                    details[key] = limit
                    house.ai.cash += excess * ((types[key] && types[key].value) || 0) * 0.9
                    sold = true
                  })
                  if (sold) {
                    this.normalizeHousePropertyDetails(house)
                    house.lastFamilyEvent = 'Sells excess property above vanilla management limits.'
                    house.lastFamilyKind = 'trade'
                  }
                  return sold
                },
        aiSellPropertyForCash(house, state, targetCash) {
                  let details = this.normalizeHousePropertyDetails(house)
                  let types = this.vanillaPropertyTypes()
                  let keys = Object.keys(details).filter((key) => details[key] > 0 && types[key]).sort((a, b) => {
                    let va = (types[a].value || 0) / Math.max(0.01, types[a].revenue || 0.01)
                    let vb = (types[b].value || 0) / Math.max(0.01, types[b].revenue || 0.01)
                    return vb - va
                  })
                  for (let i = 0; i < keys.length && house.ai.cash < targetCash; i++) {
                    let key = keys[i]
                    while (house.ai.cash < targetCash) {
                      let count = Math.max(0, Math.floor(parseFloat(details[key] || 0)))
                      if (!count) break
                      details[key] = count - 1
                      house.ai.cash += ((types[key] && types[key].value) || 0) * 0.9
                    }
                  }
                  this.normalizeHousePropertyDetails(house)
                  return house.ai.cash >= targetCash
                },
        aiBuyProperty(house, options, state) {
                  state = state || daapi.getState()
                  this.normalizeHousePropertyDetails(house)
                  let types = this.vanillaPropertyTypes()
                  let details = house.ai.propertyDetails || {}
                  let key = this.aiPropertyInvestmentChoice(house, options || {}, state)
                  let def = key && types[key]
                  if (!def) {
                    return false
                  }
                  let limit = Math.max(0, Math.floor(this.housePropertyMaxCount(house, key, state)))
                  let owned = Math.max(0, Math.floor(parseFloat(details[key] || 0)))
                  let maxAffordable = Math.floor(Math.max(0, parseFloat(house.ai.cash || 0)) / def.value)
                  let quantity = Math.min(Math.max(0, limit - owned), maxAffordable)
                  if (options && options.maxQuantity) {
                    quantity = Math.min(quantity, Math.max(1, Math.floor(parseFloat(options.maxQuantity || 1))))
                  }
                  if (quantity <= 0) {
                    return false
                  }
                  house.ai.cash -= quantity * def.value
                  details[key] = owned + quantity
                  this.normalizeHousePropertyDetails(house)
                  house.stability = this.clamp((house.stability || 50) + 1, 0, 100)
                  house.lastFamilyEvent = 'Buys ' + quantity + ' ' + def.title + (quantity > 1 ? ' holdings' : ' holding') + ' using vanilla property limits.'
                  house.lastFamilyKind = 'trade'
                  return true
                },
        generateHouseMember(society, state, house) {
                  let headId = (house.notableIds || house.memberIds || [])[0]
                  let head = state.characters[headId]
                  if (!head) {
                    return false
                  }
                  head.id = head.id || headId
                  this.generateRelative(society, state, house, house.stratum || 'plebeian', head)
                  house.lastFamilyEvent = house.name + ' expands its household through marriage and dependants.'
                  return true
                },
        ensureVisibleHouseMembers(society, state) {
                  let totalGeneratedThisTick = 0
                  for (let houseId in society.houses) {
                    if (!society.houses.hasOwnProperty(houseId)) {
                      continue
                    }
                    let house = society.houses[houseId]
                    this.refreshHouseMemberLists(society, state, house)
                    let visible = this.visibleHousePeople(house, state)
                    if (!visible.length && totalGeneratedThisTick < 6) {
                      this.generateHouseSeedMember(society, state, house)
                      state = daapi.getState()
                      this.refreshHouseMemberLists(society, state, house)
                      visible = this.visibleHousePeople(house, state)
                      totalGeneratedThisTick++
                    }
                    while (visible.length < this.minimumVisibleMembers(house) && (society.generatedCharacterIds || []).length < 260 && totalGeneratedThisTick < 6) {
                      let headId = visible[0]
                      let head = state.characters[headId]
                      if (!head) {
                        break
                      }
                      head.id = head.id || headId
                      if (!head.spouseId && this.age(head, state) >= 20 && Math.random() < 0.35) {
                        this.generateHouseSpouse(society, state, house, house.stratum || 'plebeian', head)
                      } else {
                        this.generateRelative(society, state, house, house.stratum || 'plebeian', head)
                      }
                      state = daapi.getState()
                      this.refreshHouseMemberLists(society, state, house)
                      visible = this.visibleHousePeople(house, state)
                      totalGeneratedThisTick++
                    }
                  }
                },
        minimumVisibleMembers(house) {
                  let stratum = (house && house.stratum) || 'plebeian'
                  if (stratum === 'senatorial' || stratum === 'equestrian') return 5
                  if (stratum === 'civic' || stratum === 'plebeian') return 4
                  return 3
                },
        characterBelongsToHouse(character, house) {
                  if (!character || !house) {
                    return false
                  }
                  if (character.corSocietyHouseId) {
                    return String(character.corSocietyHouseId) === String(house.id)
                  }
                  return !!(house.originHouse && character.dynastyId && String(character.dynastyId) === String(this.gameDynastyIdForHouse(house)))
                },
        refreshHouseMemberLists(society, state, house) {
                  if (!house || !house.id || !state || !state.characters) {
                    return
                  }
                  let month = this.monthKey(state)
                  let dynastyId = this.gameDynastyIdForHouse(house)
                  let dynastyMembers = dynastyId && state.dynasties && state.dynasties[dynastyId] && state.dynasties[dynastyId].memberIds ? state.dynasties[dynastyId].memberIds : []
                  let refreshSignature = [
                    month,
                    (house.memberIds || []).join('|'),
                    (house.notableIds || []).join('|'),
                    (house.slaveIds || []).join('|'),
                    dynastyMembers.join('|')
                  ].join('::')
                  if (house._lastRefreshedSignature === refreshSignature && house.memberIds && house.memberIds.length) {
                    return
                  }
                  let seen = {}
                  let ids = []
                  let add = (characterId) => {
                    if (!characterId || seen[characterId]) {
                      return
                    }
                    let character = state.characters[characterId]
                    if (!character || character.isDead || !this.characterBelongsToHouse(character, house)) {
                      return
                    }
                    character.id = character.id || characterId
                    seen[characterId] = true
                    ids.push(characterId)
                  }
                  ;(house.memberIds || []).forEach(add)
                  ;(house.notableIds || []).forEach(add)
                  dynastyMembers.forEach(add)
                  house.memberIds = ids
                  house.notableIds = ids
                    .slice()
                    .sort((a, b) => this.characterScore(state.characters[b], state) - this.characterScore(state.characters[a], state))
                    .slice(0, 8)
                  house._lastRefreshedMonth = month
                  house._lastRefreshedSignature = refreshSignature
                },
        generateHouseSeedMember(society, state, house) {
                  let stratum = house.stratum || 'plebeian'
                  let profile = this.strata[stratum] || this.strata.plebeian
                  let isMale = Math.random() > 0.45
                  let job = this.pick(profile.jobs)
                  let traits = this.generatedTraitsForStratum(stratum, job)
                  let age = this.randomInt(19, 30)
                  let characterId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - age,
                      look: this.generatedVanillaLook(isMale, stratum + '-' + house.id + '-seed-' + Date.now()),
                      job,
                      jobLevel: this.randomInt(0, stratum === 'senatorial' ? 10 : stratum === 'equestrian' ? 7 : 4),
                      traits,
                      skills: this.skillsForStratum(stratum),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      flagCanHoldImperium: stratum === 'senatorial' || stratum === 'equestrian' || Math.random() > 0.7,
                      childrenIds: []
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  daapi.updateCharacter({
                    characterId,
                    character: {
                      dynastyId: this.gameDynastyIdForHouse(house),
                      corSocietyHouseId: house.id,
                      spouseId: null,
                      childrenIds: []
                    }
                  })
                  house.memberIds = house.memberIds || []
                  house.notableIds = house.notableIds || []
                  if (house.memberIds.indexOf(characterId) < 0) {
                    house.memberIds.push(characterId)
                  }
                  if (house.notableIds.indexOf(characterId) < 0) {
                    house.notableIds.push(characterId)
                  }
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(characterId) < 0) {
                    society.generatedCharacterIds.push(characterId)
                  }
                  this.applyGeneratedTraits(characterId, traits)
                  this.seedSocialTraitsForCharacter(society, characterId, traits)
                  house.lastFamilyEvent = house.name + ' restores a visible family representative.'
                  this.log(society, house.name + ' restores a visible family representative.', 'log', house.id)
                  return characterId
                },
        generateMarriageProspect(society, state, house, matchCharacter) {
                  if (!house || house.stratum === 'poor') {
                    return false
                  }
                  let profile = this.strata[house.stratum || 'plebeian'] || this.strata.plebeian
                  let isMale = !this.characterIsMale(matchCharacter)
                  let age = this.randomInt(18, 34)
                  let job = this.pick(profile.jobs)
                  let traits = this.generatedTraitsForStratum(house.stratum || 'plebeian', job)
                  let prospectId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - age,
                      look: this.generatedVanillaLook(isMale, (house.stratum || 'plebeian') + '-' + house.id + '-marriage-' + matchCharacter.id),
                      job,
                      jobLevel: this.randomInt(0, house.stratum === 'senatorial' ? 8 : house.stratum === 'equestrian' ? 6 : 4),
                      traits,
                      skills: this.skillsForStratum(house.stratum || 'plebeian'),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      flagCanHoldImperium: house.stratum === 'senatorial' || house.stratum === 'equestrian' || Math.random() > 0.65
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  daapi.updateCharacter({
                    characterId: prospectId,
                    character: {
                      dynastyId: this.gameDynastyIdForHouse(house),
                      corSocietyHouseId: house.id,
                      spouseId: null,
                      corSocietyGenerated: true
                    }
                  })
                  house.memberIds = house.memberIds || []
                  house.notableIds = house.notableIds || []
                  if (house.memberIds.indexOf(prospectId) < 0) {
                    house.memberIds.push(prospectId)
                  }
                  if (house.notableIds.indexOf(prospectId) < 0) {
                    house.notableIds.unshift(prospectId)
                  }
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  society.generatedCharacterIds.push(prospectId)
                  this.applyGeneratedTraits(prospectId, traits)
                  this.seedSocialTraitsForCharacter(society, prospectId, traits)
                  house.lastFamilyEvent = house.name + ' introduces a marriage prospect.'
                  this.log(society, house.name + ' introduces a marriage prospect for your household.')
                  return prospectId
                },
        ensureSlaveOrderPeople(society, state) {
                  if (!society || !state || !state.characters) {
                    return
                  }
                  this.sortedHouses(society).forEach((house) => {
                    if (!house || house.stratum !== 'poor') {
                      return
                    }
                    house.slaveMarketHouse = true
                    house.agenda = house.agenda || 'security'
                    this.refreshHouseMemberLists(society, state, house)
                    this.visibleHousePeople(house, state).forEach((characterId) => {
                      let character = state.characters[characterId]
                      if (!character || character.isDead) {
                        return
                      }
                      character.id = character.id || characterId
                      let patch = {}
                      if (!character.corSocietyOrigin || character.corSocietyOrigin !== 'enslaved_dependant') patch.corSocietyOrigin = 'enslaved_dependant'
                      if (!character.corSocietySlaveMarket) patch.corSocietySlaveMarket = true
                      if (!character.corSocietySlaveOrigin) patch.corSocietySlaveOrigin = this.randomSlaveOrigin()
                      if (!character.corSocietySlaveFullName) {
                        let origin = patch.corSocietySlaveOrigin || character.corSocietySlaveOrigin || this.randomSlaveOrigin()
                        let fullName = this.randomSlaveFullName(origin, this.characterIsMale(character))
                        patch.corSocietySlaveFullName = fullName
                        if (character.corSocietyGenerated || house.generated) {
                          patch.praenomen = this.shortSlaveName(fullName)
                        }
                      }
                      if (!character.corSocietySlaveType) patch.corSocietySlaveType = this.slaveTypeFromCharacter(character)
                      if (!character.corSocietySlaveLevel) patch.corSocietySlaveLevel = Math.max(1, Math.round(this.characterScore(character, state) / 24))
                      if (Object.keys(patch).length) {
                        try {
                          daapi.updateCharacter({ characterId, character: patch })
                          Object.assign(character, patch)
                        } catch (err) {
                          console.warn(err)
                        }
                      }
                    })
                  })
                },
        recordFamilyEvent(society, house, event) {
                  let labels = {
                    officeCampaign: 'This house begins maneuvering for public office.',
                    tradeVenture: 'This house expands a commercial venture.',
                    marriageAlliance: 'This house negotiates a marriage alliance.',
                    inheritanceDispute: 'This house is pulled into an inheritance dispute.',
                    feud: 'This house sharpens an old feud.',
                    scandal: 'A scandal weakens this house.'
                  }
                  house.lastFamilyEvent = labels[event] || event
                  if (!house.pendingPlayerEvent && Math.random() < this.playerEventChance(house, event)) {
                    house.pendingPlayerEvent = event
                  }
                  this.log(society, 'House: ' + house.name + '. ' + house.lastFamilyEvent, event, house.id)
                },
        playerEventChance(house, event) {
                  let relation = house.relation || 0
                  if (event === 'feud' || event === 'scandal') {
                    return house.rivalry || relation < -35 ? 0.45 : 0.15
                  }
                  if (relation > 40 || (house.favor || 0) > 0) {
                    return 0.42
                  }
                  if (relation > 5) {
                    return 0.24
                  }
                  return 0.08
                }
      })
      window.corSociety._mixinCorSocietyHouseLifeRomanceSlavesVersion = '1.1.293'
    }
  }
}
