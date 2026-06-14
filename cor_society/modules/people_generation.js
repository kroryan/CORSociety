{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {},
  methods: {
    _mixinCorSocietyPeopleGeneration() {
      if (!window.corSociety) {
        return
      }
      if (window.corSociety._mixinCorSocietyPeopleGenerationVersion === '1.1.293') {
        return
      }
      Object.assign(window.corSociety, {
        ensureMinimumHouses(society, state) {
                  let counts = this.countByStratum(society)
                  this.stratumOrder.forEach((stratum) => {
                    let needed = (this.strata[stratum].min || 0) - (counts[stratum] || 0)
                    for (let i = 0; i < needed; i++) {
                      this.generateHouse(society, state, stratum)
                    }
                  })
                },
        initialHouseHeadIsMale(society, state, stratum) {
                  let counts = { male: 0, female: 0 }
                  Object.keys((society && society.houses) || {}).forEach((houseId) => {
                    let house = society.houses[houseId]
                    if (!house || house.stratum !== stratum) {
                      return
                    }
                    let ids = ((house.notableIds || []).concat(house.memberIds || [])).filter(Boolean)
                    for (let i = 0; i < ids.length; i++) {
                      let character = state.characters && state.characters[ids[i]]
                      if (character && !character.isDead) {
                        if (this.characterIsMale(character)) counts.male += 1
                        else counts.female += 1
                        return
                      }
                    }
                  })
                  if (counts.male > counts.female) return false
                  if (counts.female > counts.male) return true
                  return Math.random() > 0.5
                },
        generateHouse(society, state, stratum) {
                  let profile = this.strata[stratum]
                  let isMale = this.initialHouseHeadIsMale(society, state, stratum)
                  let nomen = this.pick(this.nomina)
                  let cognomen = this.pick(this.cognomina)
                  let prestige = this.randomInt(profile.basePrestige[0], profile.basePrestige[1])
                  let job = this.pick(profile.jobs)
                  let traits = this.generatedTraitsForStratum(stratum, job)
                  let headId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - this.randomInt(20, 30),
                      look: this.generatedVanillaLook(isMale, stratum + '-' + nomen + '-' + cognomen),
                      job,
                      jobLevel: this.randomInt(0, stratum === 'senatorial' ? 12 : stratum === 'equestrian' ? 9 : 6),
                      traits,
                      skills: this.skillsForStratum(stratum),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      flagCanHoldImperium: stratum === 'senatorial' || stratum === 'equestrian' || Math.random() > 0.55
                    },
                    dynastyFeatures: {
                      nomen,
                      cognomen,
                      prestige,
                      heritage: this.pick(profile.heritage)
                    }
                  })
                  let head = daapi.getCharacter({ characterId: headId })
                  if (!head || !head.dynastyId) {
                    return false
                  }
                  this.applyGeneratedTraits(headId, traits)
                  this.seedSocialTraitsForCharacter(society, headId, traits)
                  let house = society.houses[head.dynastyId] || this.createHouseRecord(head.dynastyId)
                  house.name = this.houseName(daapi.getState().dynasties[head.dynastyId] || {}, head.dynastyId)
                  house.stratum = stratum
                  house.generated = true
                  house.relation = this.randomInt(-8, 12)
                  house.memberIds = [headId]
                  house.notableIds = [headId]
                  house.strength = Math.round(prestige / 1000 + 25)
                  house.prestige = prestige
                  house.heritage = (daapi.getState().dynasties[head.dynastyId] || {}).heritage || this.pick(profile.heritage)
                  house.citizenRank = this.rankFromStrength(house.strength)
                  society.houses[head.dynastyId] = house
                  society.generatedHouseIds.push(head.dynastyId)
                  society.generatedCharacterIds.push(headId)
                  this.seedGeneratedHouseFamily(society, daapi.getState(), house, stratum, headId)
                  this.log(society, 'New ' + profile.singular + ' enters public life: ' + house.name + '.')
                  return house
                },
        ensureInitialHouseGenderPair(society, state, house, stratum) {
                  let counts = this.houseLivingGenderCounts(society, state, house)
                  if (!counts.male || !counts.female) {
                    this.generateHouseSeedMember(society, state, house, { gender: counts.male ? 'female' : 'male' })
                    state = daapi.getState()
                    this.refreshHouseMemberLists(society, state, house)
                  }
                  return daapi.getState()
                },
        repairGeneratedHouseInitialGenderPairs(society, state) {
                  let repairKey = 'initial-gender-pair-v1'
                  if (!society || society.initialGenderPairRepairVersion === repairKey || !society.houses) {
                    return false
                  }
                  Object.keys(society.houses).forEach((houseId) => {
                    let house = society.houses[houseId]
                    if (!house || !house.generated || house.initialGenderPairChecked) {
                      return
                    }
                    this.refreshHouseMemberLists(society, state, house)
                    let living = this.houseLivingMemberIds(society, state, house)
                    if (!living.length) {
                      house.initialGenderPairChecked = true
                      return
                    }
                    let counts = this.houseLivingGenderCounts(society, state, house)
                    if (!counts.male || !counts.female) {
                      this.generateHouseSeedMember(society, state, house, { gender: counts.male ? 'female' : 'male' })
                      state = daapi.getState()
                      this.refreshHouseMemberLists(society, state, house)
                    }
                    house.initialGenderPairChecked = true
                  })
                  society.initialGenderPairRepairVersion = repairKey
                  return true
                },
        seedGeneratedHouseFamily(society, state, house, stratum, headId) {
                  let head = (state.characters && state.characters[headId]) || daapi.getCharacter({ characterId: headId })
                  if (!head) {
                    return
                  }
                  head.id = head.id || headId
                  let headAge = this.age(head, state)
                  let spouse = false
                  if (!head.spouseId && headAge >= 20) {
                    spouse = this.generateHouseSpouse(society, state, house, stratum, head)
                    state = daapi.getState()
                    head = state.characters[headId] || head
                  }
                  state = this.ensureInitialHouseGenderPair(society, state, house, stratum)
                  head = state.characters[headId] || head
                  if (headAge >= 34) {
                    let spouseId = (head.spouseId && state.characters[head.spouseId]) ? head.spouseId : (spouse && spouse.id)
                    let spouseCharacter = spouseId ? state.characters[spouseId] || spouse : false
                    if (spouseCharacter) {
                      let mother = this.characterIsMale(head) ? spouseCharacter : head
                      let father = this.characterIsMale(head) ? head : spouseCharacter
                      let childCount = this.randomInt(1, headAge >= 45 ? 3 : 2)
                      for (let i = 0; i < childCount; i++) {
                        this.generateHouseChild(society, state, house, stratum, mother, father, this.randomInt(0, Math.min(18, headAge - 18)))
                        state = daapi.getState()
                      }
                    }
                  }
                  while (this.visibleHousePeople(house, state).length < this.minimumVisibleMembers(house) && (society.generatedCharacterIds || []).length < 260) {
                    this.generateRelative(society, state, house, stratum, head)
                    state = daapi.getState()
                    head = state.characters[headId] || head
                  }
                  state = this.ensureInitialHouseGenderPair(society, state, house, stratum)
                  head = state.characters[headId] || head
                  this.ensureHouseCommonTree(society, state, house, { allowLivingExtras: true })
                  state = daapi.getState()
                  this.refreshHouseMemberLists(society, state, house)
                },
        generateHouseSpouse(society, state, house, stratum, head) {
                  let profile = this.strata[stratum] || this.strata.plebeian
                  let isMale = !this.characterIsMale(head)
                  let headAge = this.age(head, state)
                  let minAge = Math.max(18, Math.min(30, headAge - 4))
                  let maxAge = Math.max(minAge, Math.min(34, headAge + 6))
                  let age = this.randomInt(minAge, maxAge)
                  let job = this.pick(profile.jobs)
                  let traits = this.generatedTraitsForStratum(stratum, job)
                  let spouseId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - age,
                      look: this.generatedVanillaLook(isMale, stratum + '-' + house.id + '-spouse-' + head.id),
                      job,
                      jobLevel: this.randomInt(0, stratum === 'senatorial' ? 8 : stratum === 'equestrian' ? 6 : 4),
                      traits,
                      skills: this.skillsForStratum(stratum),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      flagCanHoldImperium: stratum === 'senatorial' || stratum === 'equestrian' || Math.random() > 0.7
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  this.applyGeneratedTraits(spouseId, traits)
                  this.seedSocialTraitsForCharacter(society, spouseId, traits)
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(spouseId) < 0) {
                    society.generatedCharacterIds.push(spouseId)
                  }
                  house.memberIds = house.memberIds || []
                  house.notableIds = house.notableIds || []
                  if (house.memberIds.indexOf(spouseId) < 0) {
                    house.memberIds.push(spouseId)
                  }
                  if (house.notableIds.indexOf(spouseId) < 0) {
                    house.notableIds.push(spouseId)
                  }
                  try {
                    daapi.performMarriage({
                      characterId: head.id,
                      spouseId,
                      isMatrilineal: !this.characterIsMale(head)
                    })
                    daapi.updateCharacter({
                      characterId: spouseId,
                      character: {
                        dynastyId: this.gameDynastyIdForHouse(house),
                        corSocietyHouseId: house.id
                      }
                    })
                    daapi.forceUpdateCharacterDisplay({ characterId: head.id })
                    daapi.forceUpdateCharacterDisplay({ characterId: spouseId })
                  } catch (err) {
                    console.warn(err)
                  }
                  let spouse = daapi.getCharacter({ characterId: spouseId }) || {}
                  spouse.id = spouse.id || spouseId
                  return spouse
                },
        generateHouseChild(society, state, house, stratum, mother, father, childAge) {
                  mother = mother || {}
                  father = father || {}
                  if (!mother.id || !father.id) {
                    return false
                  }
                  let isMale = Math.random() > 0.5
                  childAge = Math.max(0, Math.min(18, parseInt(childAge || 0, 10)))
                  let traits = childAge >= 12 ? this.generatedTraitsForStratum(stratum, '') : []
                  let childId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - childAge,
                      look: this.inheritedVanillaLook(isMale, mother, father, stratum + '-' + house.id + '-child-' + mother.id + '-' + father.id + '-' + childAge),
                      traits,
                      skills: this.skillsForStratum(stratum),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      fatherId: father.id || null,
                      motherId: mother.id || null,
                      childrenIds: []
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  daapi.updateCharacter({
                    characterId: childId,
                    character: {
                      dynastyId: this.gameDynastyIdForHouse(house),
                      corSocietyHouseId: house.id,
                      fatherId: father.id || null,
                      motherId: mother.id || null,
                      childrenIds: []
                    }
                  })
                  ;[mother, father].forEach((parent) => {
                    if (!parent || !parent.id) {
                      return
                    }
                    let children = (parent.childrenIds || []).slice()
                    if (children.indexOf(childId) < 0) {
                      children.push(childId)
                      daapi.updateCharacter({
                        characterId: parent.id,
                        character: {
                          childrenIds: children
                        }
                      })
                    }
                  })
                  house.memberIds = house.memberIds || []
                  house.notableIds = house.notableIds || []
                  if (house.memberIds.indexOf(childId) < 0) {
                    house.memberIds.push(childId)
                  }
                  if (childAge >= 16 && house.notableIds.indexOf(childId) < 0) {
                    house.notableIds.push(childId)
                  }
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(childId) < 0) {
                    society.generatedCharacterIds.push(childId)
                  }
                  this.applyGeneratedTraits(childId, traits)
                  this.seedSocialTraitsForCharacter(society, childId, traits)
                  return childId
                },
        generateRelative(society, state, house, stratum, head) {
                  let profile = this.strata[stratum]
                  let isMale = Math.random() > 0.5
                  let headIsMale = this.characterIsMale(head)
                  let headAge = this.age(head, state)
                  let canBeChild = headAge >= 34
                  let relativeAge = canBeChild ? this.randomInt(0, Math.min(30, headAge - 18)) : this.randomInt(16, 30)
                  let job = relativeAge >= 16 ? this.pick(profile.jobs) : ''
                  let traits = relativeAge >= 12 ? this.generatedTraitsForStratum(stratum, job) : []
                  let relativeId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - relativeAge,
                      look: canBeChild ? this.inheritedVanillaLook(isMale, headIsMale ? null : head, headIsMale ? head : null, stratum + '-' + house.id + '-' + head.id + '-' + relativeAge) : this.generatedVanillaLook(isMale, stratum + '-' + house.id + '-' + head.id + '-' + relativeAge),
                      job,
                      jobLevel: job ? this.randomInt(0, 5) : 0,
                      traits,
                      skills: this.skillsForStratum(stratum),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      fatherId: canBeChild && headIsMale ? head.id : null,
                      motherId: canBeChild && !headIsMale ? head.id : null,
                      childrenIds: []
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  daapi.updateCharacter({
                    characterId: relativeId,
                    character: {
                      dynastyId: this.gameDynastyIdForHouse(house),
                      corSocietyHouseId: house.id,
                      fatherId: canBeChild && headIsMale ? head.id : null,
                      motherId: canBeChild && !headIsMale ? head.id : null
                    }
                  })
                  if (canBeChild) {
                    let headChildren = (head.childrenIds || []).slice()
                    if (headChildren.indexOf(relativeId) < 0) {
                      headChildren.push(relativeId)
                    }
                    daapi.updateCharacter({
                      characterId: head.id,
                      character: {
                        childrenIds: headChildren
                      }
                    })
                  }
                  house.memberIds = house.memberIds || []
                  house.notableIds = house.notableIds || []
                  if (house.memberIds.indexOf(relativeId) < 0) {
                    house.memberIds.push(relativeId)
                  }
                  if (house.notableIds.indexOf(relativeId) < 0) {
                    house.notableIds.push(relativeId)
                  }
                  if (society.generatedCharacterIds.indexOf(relativeId) < 0) {
                    society.generatedCharacterIds.push(relativeId)
                  }
                  this.applyGeneratedTraits(relativeId, traits)
                  this.seedSocialTraitsForCharacter(society, relativeId, traits)
                },
        skillsForStratum(stratum) {
                  let high = stratum === 'senatorial' ? 28 : stratum === 'equestrian' ? 22 : stratum === 'civic' ? 18 : stratum === 'plebeian' ? 14 : 11
                  let low = stratum === 'poor' ? 1 : 4
                  return {
                    intelligence: this.randomInt(low, high),
                    stewardship: this.randomInt(low, high),
                    eloquence: this.randomInt(low, high),
                    combat: this.randomInt(low, high)
                  }
                },
        generatedTraitsForStratum(stratum, job) {
                  let pools = {
                    senatorial: ['senator', 'ambitious', 'authoritative', 'honorable', 'oratorDeliberative', 'erudite', 'competitive'],
                    equestrian: ['educated', 'competitive', 'gregarious', 'ambitious', 'horseRider', 'fashionable', 'greedy'],
                    civic: ['literate', 'educated', 'content', 'trusting', 'honorable', 'erudite', 'oratorJudicial'],
                    plebeian: ['content', 'gregarious', 'charitable', 'stubborn', 'strong', 'trusting'],
                    freedmen: ['literate', 'greedy', 'trusting', 'sly', 'ambitious', 'fashionable'],
                    poor: ['content', 'charitable', 'stubborn', 'strong', 'shy']
                  }
                  let pool = (pools[stratum] || pools.plebeian).slice()
                  if (job === 'lawyer') {
                    pool.push('oratorJudicial', 'authoritative')
                  } else if (job === 'rhetor') {
                    pool.push('oratorDeliberative', 'erudite')
                  } else if (job === 'physician' || job === 'philosophyTutor' || job === 'litterator' || job === 'grammaticus') {
                    pool.push('educated', 'erudite')
                  } else if (job === 'trader') {
                    pool.push('greedy', 'gregarious', 'sly')
                  } else if (job === 'labourer' || job === 'farmer' || job === 'blacksmith') {
                    pool.push('strong', 'stubborn')
                  }
                  return this.pickUnique(pool, this.randomInt(1, stratum === 'senatorial' || stratum === 'equestrian' ? 3 : 2))
                },
        applyGeneratedTraits(characterId, traits) {
                  ;(traits || []).forEach((trait) => {
                    if (!trait) {
                      return
                    }
                    try {
                      daapi.addTrait({ characterId, trait })
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                },
        seedSocialTraitsForCharacter(society, characterId, vanillaTraits) {
                  if (!society || !characterId) {
                    return
                  }
                  let traits = vanillaTraits || []
                  let possible = []
                  if (traits.indexOf('honorable') >= 0) possible.push('faithful', 'honorable')
                  if (traits.indexOf('ambitious') >= 0 || traits.indexOf('competitive') >= 0) possible.push('ambitious')
                  if (traits.indexOf('sly') >= 0 || traits.indexOf('greedy') >= 0) possible.push('manipulator', 'liar')
                  if (traits.indexOf('charitable') >= 0 || traits.indexOf('content') >= 0) possible.push('charitable', 'faithful')
                  if (traits.indexOf('gregarious') >= 0 || traits.indexOf('fashionable') >= 0) possible.push('gossip')
                  if (traits.indexOf('stubborn') >= 0) possible.push('resentful')
                  if ((traits.indexOf('stubborn') >= 0 || traits.indexOf('competitive') >= 0 || traits.indexOf('greedy') >= 0) && Math.random() < 0.22) possible.push('cruel')
                  if (!possible.length) {
                    possible = ['faithful', 'honorable', 'ambitious', 'charitable', 'gossip']
                  }
                  let count = Math.random() < 0.28 ? 2 : 1
                  this.pickUnique(possible, count).forEach((trait) => this.addSocietyTrait(society, characterId, trait))
                },
        societyTraitDefinitions() {
                  return {
                    adulterer: { label: 'Adulterer', vanillaKey: 'corSocietyAdulterer', description: 'Known for dangerous affairs. Spouses and moral rivals react badly, but close friends may ignore the scandal.' },
                    faithful: { label: 'Faithful', vanillaKey: 'corSocietyFaithful', description: 'Values loyalty and stable household bonds. Improves spousal trust and lowers courtship scandal pressure.' },
                    liar: { label: 'Liar', vanillaKey: 'corSocietyLiar', description: 'Uses falsehoods easily. Honorable characters distrust this person.' },
                    honorable: { label: 'Honorable', vanillaKey: 'corSocietyHonorable', description: 'Publicly values reputation, fairness, and proper conduct.' },
                    manipulator: { label: 'Manipulator', vanillaKey: 'corSocietyManipulator', description: 'Pulls people into useful positions. Trusting characters are easier targets but less comfortable afterward.' },
                    charitable: { label: 'Charitable', vanillaKey: 'corSocietyCharitable', description: 'Gains warmth through gifts, mercy, and household support.' },
                    cruel: { label: 'Cruel', vanillaKey: 'corSocietyCruel', description: 'Feared more than loved. Often harms personal relations unless power matters more than affection.' },
                    gossip: { label: 'Gossip', vanillaKey: 'corSocietyGossip', description: 'Trades in rumors. Useful for intrigue, risky for spouses and private affairs.' },
                    ambitious: { label: 'Ambitious', vanillaKey: 'corSocietyAmbitious', description: 'Seeks rank, wealth, and status. Other ambitious characters may admire the drive.' },
                    resentful: { label: 'Resentful', vanillaKey: 'corSocietyResentful', description: 'Remembers slights and feeds rivalries when trust collapses.' },
                    mentor: { label: 'Mentor', vanillaKey: 'corSocietyMentor', description: 'Guides another character through public life and family politics.' },
                    protege: { label: 'Student', vanillaKey: 'corSocietyProtege', description: 'Learns from a patron, elder, or teacher within Society.' }
                  }
                },
        addSocietyTrait(society, characterId, trait) {
                  if (!society || !characterId || !trait) {
                    return false
                  }
                  let social = this.characterSocialRecord(society, characterId, true)
                  social.traits = social.traits || []
                  if (social.traits.indexOf(trait) < 0) {
                    social.traits.push(trait)
                  }
                  return true
                },
        removeSocietyTrait(society, characterId, trait) {
                  let social = this.characterSocialRecord(society, characterId, false)
                  if (!social || !social.traits) {
                    return false
                  }
                  social.traits = social.traits.filter((item) => item !== trait)
                  return true
                },
        societyTraitsForCharacter(society, characterId) {
                  let social = this.characterSocialRecord(society, characterId, false)
                  return (social && social.traits) ? social.traits.slice() : []
                },
        traitLabel(trait) {
                  let def = this.societyTraitDefinitions()[trait]
                  return def ? def.label : String(trait || '')
                },
        traitIcon(trait) {
                  let def = this.societyTraitDefinitions()[trait]
                  if (def) {
                    this._iconCache = this._iconCache || {}
                    let key = 'trait:' + trait
                    if (this._iconCache[key]) {
                      return this._iconCache[key]
                    }
                    try {
                      this._iconCache[key] = daapi.requireImage('/cor_society/assets/traits/' + trait + '.svg')
                      return this._iconCache[key]
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                  return this.affairIcon('log')
                },
        socialTraitSummary(society, character) {
                  if (!character) {
                    return 'none'
                  }
                  let ids = this.societyTraitsForCharacter(society, character.id)
                  if (!ids.length) {
                    return 'none'
                  }
                  return ids.map((trait) => this.traitLabel(trait)).join(', ')
                },
        societyTraitOptions(society, character) {
                  let definitions = this.societyTraitDefinitions()
                  let traits = this.societyTraitsForCharacter(society, character && character.id)
                  if (!traits.length) {
                    return [{
                      text: 'Social traits: none',
                      disabled: true,
                      showDisabledWithTooltip: true,
                      tooltip: 'No Society social trait is currently known for this character.',
                      icons: [this.affairIcon('prestige')]
                    }]
                  }
                  return traits.map((trait) => {
                    let def = definitions[trait] || { label: this.traitLabel(trait), description: '' }
                    return {
                      text: 'Social trait: ' + def.label,
                      disabled: true,
                      showDisabledWithTooltip: true,
                      tooltip: def.description || 'This Society trait affects relationships, courtship, scandals, trade, and family events.',
                      icons: [this.traitIcon(trait)]
                    }
                  })
                },
        registerSocietyTraitDefinitions() {
                  if (this._societyTraitDefinitionsRegisteredVersion === this.version) {
                    return
                  }
                  let definitions = this.societyTraitDefinitions()
                  Object.keys(definitions).forEach((trait) => {
                    let def = definitions[trait]
                    if (!def || !def.vanillaKey) {
                      return
                    }
                    try {
                      daapi.addOrEditTraitDefinition({
                        trait: def.vanillaKey,
                        traitInfo: {
                          group: 'neutral',
                          modifiers: { skills: {} },
                          isStackable: false,
                          points: 0
                        },
                        icon: this.traitIcon(trait),
                        specialGroups: ['otherCharacterTraits'],
                        text: {
                          title: def.label,
                          description: def.description || def.label
                        }
                      })
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                  this._societyTraitDefinitionsRegisteredVersion = this.version
                },
        syncSocietyTraitsWithVanilla(society, state) {
                  if (!society || !state || !state.characters) {
                    return
                  }
                  let definitions = this.societyTraitDefinitions()
                  let candidateMap = {}
                  let addCandidate = (characterId) => {
                    if (characterId && state.characters[characterId]) {
                      candidateMap[characterId] = true
                    }
                  }
                  Object.keys(society.characterSocial || {}).forEach(addCandidate)
                  ;(society.generatedCharacterIds || []).forEach(addCandidate)
                  ;(society.relationStatusCharacterIds || []).forEach(addCandidate)
                  ;(society.slaveStatusCharacterIds || []).forEach(addCandidate)
                  Object.keys(society.houses || {}).forEach((houseId) => {
                    let house = society.houses[houseId]
                    ;(house.memberIds || []).forEach(addCandidate)
                    ;(house.notableIds || []).forEach(addCandidate)
                    ;(house.slaveIds || []).forEach(addCandidate)
                  })
                  let candidateIds = Object.keys(candidateMap)
                  let currentId = this.currentCharacterId(state)
                  if (currentId && candidateIds.indexOf(currentId) < 0) {
                    candidateIds.push(currentId)
                  }
                  candidateIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character) {
                      return
                    }
                    character.id = character.id || characterId
                    let socialTraits = this.societyTraitsForCharacter(society, characterId)
                    let vanillaTraits = character.traits || []
                    Object.keys(definitions).forEach((trait) => {
                      let def = definitions[trait]
                      let key = def && def.vanillaKey
                      if (!key) {
                        return
                      }
                      let shouldHave = socialTraits.indexOf(trait) >= 0
                      let has = vanillaTraits.indexOf(key) >= 0
                      try {
                        if (shouldHave && !has) {
                          daapi.addTrait({ characterId, trait: key })
                          vanillaTraits.push(key)
                        } else if (!shouldHave && has) {
                          daapi.removeTrait({ characterId, trait: key })
                          vanillaTraits = vanillaTraits.filter((item) => item !== key)
                        }
                      } catch (err) {
                        console.warn(err)
                      }
                    })
                    character.traits = vanillaTraits
                  })
                },
        characterHasTrait(society, character, trait) {
                  if (!character || !trait) {
                    return false
                  }
                  let vanilla = character.traits || []
                  return vanilla.indexOf(trait) >= 0 || this.societyTraitsForCharacter(society, character.id).indexOf(trait) >= 0
                },
        generatedVanillaLook(isMale, seedText) {
                  let types = ['black', 'brown', 'brown_curly', 'dusky', 'olive', 'tan', 'hazel', 'auburn', 'blonde']
                  let random = this.seededRandom(seedText || Math.random())
                  return {
                    group: 'roman',
                    type: this.pickByRandom(types, random),
                    gender: isMale ? 'male' : 'female'
                  }
                },
        inheritedVanillaLook(isMale, mother, father, seedText) {
                  let inheritedTypes = []
                  ;[mother, father].forEach((parent) => {
                    if (parent && parent.look && parent.look.type) {
                      inheritedTypes.push(parent.look.type)
                    }
                  })
                  if (!inheritedTypes.length) {
                    return this.generatedVanillaLook(isMale, seedText)
                  }
                  let random = this.seededRandom(seedText || inheritedTypes.join('-'))
                  let type = this.pickByRandom(inheritedTypes, random)
                  if (random() < 0.16) {
                    type = this.nearbyLookType(type, random)
                  }
                  return {
                    group: 'roman',
                    type,
                    gender: isMale ? 'male' : 'female'
                  }
                },
        nearbyLookType(type, random) {
                  let variants = {
                    black: ['black', 'dusky', 'brown'],
                    brown: ['brown', 'brown_curly', 'tan', 'hazel'],
                    brown_curly: ['brown_curly', 'brown', 'hazel'],
                    dusky: ['dusky', 'black', 'olive'],
                    olive: ['olive', 'tan', 'brown'],
                    tan: ['tan', 'olive', 'hazel'],
                    hazel: ['hazel', 'brown', 'auburn', 'tan'],
                    auburn: ['auburn', 'hazel', 'brown'],
                    blonde: ['blonde', 'hazel', 'tan']
                  }
                  return this.pickByRandom(variants[type] || [type || 'brown'], random || Math.random)
                },
        ensureGeneratedParents(society, state) {
                  let ids = (society.generatedCharacterIds || []).slice()
                  let generatedThisTick = 0
                  if (!ids.length) {
                    return
                  }
                  let cursor = parseInt(society.generatedParentsCursor || 0, 10) || 0
                  let inspected = 0
                  while (inspected < ids.length && inspected < 32) {
                    if (generatedThisTick >= 8) break
                    let i = (cursor + inspected) % ids.length
                    inspected += 1
                    let characterId = ids[i]
                    let character = state.characters[characterId]
                    if (!character || character.isDead || character.corSocietyGhostParent) {
                      continue
                    }
                    character.id = character.id || characterId
                    let patch = {}
                    if (!character.fatherId) {
                      patch.fatherId = this.generateGhostParent(society, state, character, true)
                      generatedThisTick++
                    }
                    if (!character.motherId && generatedThisTick < 10) {
                      patch.motherId = this.generateGhostParent(society, state, character, false)
                      generatedThisTick++
                    }
                    if (patch.fatherId || patch.motherId) {
                      try {
                        daapi.updateCharacter({
                          characterId,
                          character: patch
                        })
                      } catch (err) {
                        console.warn(err)
                      }
                    } else {
                      character.corSocietyParentsCheckedVersion = this.version
                    }
                  }
                  society.generatedParentsCursor = ids.length ? (cursor + Math.max(1, inspected)) % ids.length : 0
                },
        repairIncompleteGeneratedParentPairs(society, state) {
                  if (!society || !state || !state.characters) {
                    return 0
                  }
                  let ids = this.uniqueIds([].concat(society.generatedCharacterIds || [], society.playerTreeGeneratedLivingIds || []))
                  let repaired = 0
                  for (let i = 0; i < ids.length && repaired < 12; i++) {
                    let characterId = ids[i]
                    let character = state.characters[characterId]
                    if (!character || character.corSocietyGhostParent) {
                      continue
                    }
                    if (!character.corSocietyGenerated && !character.corSocietyHouseId && !character.corSocietyPlayerTreeGenerated) {
                      continue
                    }
                    character.id = character.id || characterId
                    let hasFather = !!(character.fatherId && state.characters[character.fatherId])
                    let hasMother = !!(character.motherId && state.characters[character.motherId])
                    if (hasFather && hasMother) {
                      continue
                    }
                    if (!hasFather && !hasMother) {
                      continue
                    }
                    let fatherId = hasFather ? character.fatherId : this.generateGhostParent(society, state, character, true)
                    let motherId = hasMother ? character.motherId : this.generateGhostParent(society, state, character, false)
                    if (fatherId && motherId && this.connectCharacterToParents(state, characterId, fatherId, motherId)) {
                      repaired += 1
                    }
                  }
                  return repaired
                },
        ensureGeneratedDynastyTrees(society, state) {
                  if (!society || !society.houses || !state || !state.characters) {
                    return
                  }
                  let checked = 0
                  for (let houseId in society.houses) {
                    if (!society.houses.hasOwnProperty(houseId)) {
                      continue
                    }
                    let house = society.houses[houseId]
                    if (!house || !house.generated || house.treeIntegrityVersion === this.version) {
                      continue
                    }
                    this.ensureHouseCommonTree(society, state, house, { allowLivingExtras: true })
                    state = daapi.getState()
                    checked += 1
                    if (checked >= 4) {
                      break
                    }
                  }
                },
        ensureHouseCommonTree(society, state, house, options) {
                  if (!society || !house || !house.id || !state || !state.characters) {
                    return
                  }
                  options = options || {}
                  this.refreshHouseMemberLists(society, state, house)
                  let livingIds = this.visibleHousePeople(house, state).filter((characterId) => state.characters[characterId])
                  if (!livingIds.length) {
                    return
                  }
                  let rootId = (house.notableIds || []).find((characterId) => state.characters[characterId] && !state.characters[characterId].isDead) || livingIds[0]
                  let root = state.characters[rootId]
                  if (!root) {
                    return
                  }
                  root.id = root.id || rootId
                  this.ensureDeadParentsAndGrandparents(society, state, root)
                  state = daapi.getState()
                  root = state.characters[rootId] || root
                  root.id = root.id || rootId
                  let rootFatherId = root.fatherId
                  let rootMotherId = root.motherId
                  if (!rootFatherId || !rootMotherId) {
                    return
                  }
                  let siblingIds = livingIds.filter((characterId) => {
                    if (this.sameCharacterId(characterId, rootId)) {
                      return false
                    }
                    let character = state.characters[characterId]
                    return character &&
                      this.sameCharacterId(character.fatherId, rootFatherId) &&
                      this.sameCharacterId(character.motherId, rootMotherId)
                  })
                  let livingAdded = 0
                  if (!siblingIds.length && options.allowLivingExtras && (society.generatedCharacterIds || []).length < 320) {
                    let siblingId = this.generateHouseSibling(society, state, house, house.stratum || 'plebeian', root)
                    if (siblingId) {
                      livingAdded += 1
                      state = daapi.getState()
                      livingIds.push(siblingId)
                      root = state.characters[rootId] || root
                    }
                  }
                  let rootAge = this.age(root, state)
                  livingIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.isDead || this.sameCharacterId(characterId, rootId)) {
                      return
                    }
                    character.id = character.id || characterId
                    if (this.sharesAncestorWithin(state, rootId, characterId, 4)) {
                      return
                    }
                    let age = this.age(character, state)
                    let spouse = root.spouseId && state.characters[root.spouseId] ? state.characters[root.spouseId] : false
                    if (spouse && age <= rootAge - 16) {
                      let mother = this.characterIsMale(root) ? spouse : root
                      let father = this.characterIsMale(root) ? root : spouse
                      this.connectCharacterToParents(state, characterId, father.id || rootId, mother.id || spouse.id)
                    } else {
                      this.connectCharacterThroughCollateralBranch(society, state, house, root, characterId, rootFatherId, rootMotherId)
                    }
                  })
                  state = daapi.getState()
                  this.refreshHouseMemberLists(society, state, house)
                  house.treeIntegrityVersion = this.version
                  house.livingExtrasAdded = Math.min(4, (house.livingExtrasAdded || 0) + livingAdded)
                },
        ensureDeadParentsAndGrandparents(society, state, character) {
                  if (!character) {
                    return false
                  }
                  character.id = character.id || character.characterId
                  if (!character.id) {
                    return false
                  }
                  let patch = {}
                  if (!character.fatherId) {
                    patch.fatherId = this.generateGhostParent(society, state, character, true)
                  }
                  if (!character.motherId) {
                    patch.motherId = this.generateGhostParent(society, state, character, false)
                  }
                  if (patch.fatherId || patch.motherId) {
                    try {
                      daapi.updateCharacter({ characterId: character.id, character: patch })
                      if (patch.fatherId) character.fatherId = patch.fatherId
                      if (patch.motherId) character.motherId = patch.motherId
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                  state = daapi.getState()
                  ;[character.fatherId, character.motherId].forEach((parentId) => {
                    let parent = state.characters && state.characters[parentId]
                    if (!parent) {
                      return
                    }
                    parent.id = parent.id || parentId
                    let parentPatch = {}
                    if (!parent.fatherId) {
                      parentPatch.fatherId = this.generateGhostParent(society, state, parent, true)
                    }
                    if (!parent.motherId) {
                      parentPatch.motherId = this.generateGhostParent(society, state, parent, false)
                    }
                    if (parentPatch.fatherId || parentPatch.motherId) {
                      try {
                        daapi.updateCharacter({ characterId: parentId, character: parentPatch })
                      } catch (err) {
                        console.warn(err)
                      }
                    }
                  })
                  return true
                },
        generateHouseSibling(society, state, house, stratum, anchor) {
                  if (!anchor || !anchor.id || !anchor.fatherId || !anchor.motherId) {
                    return false
                  }
                  let profile = this.strata[stratum] || this.strata.plebeian
                  let isMale = Math.random() > 0.5
                  let anchorAge = this.age(anchor, state)
                  let age = this.clamp(anchorAge + this.randomInt(-5, 5), 18, 34)
                  let job = this.pick(profile.jobs)
                  let traits = this.generatedTraitsForStratum(stratum, job)
                  let father = state.characters[anchor.fatherId] || {}
                  let mother = state.characters[anchor.motherId] || {}
                  let siblingId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear: state.year - age,
                      look: this.inheritedVanillaLook(isMale, mother, father, stratum + '-' + house.id + '-sibling-' + anchor.id),
                      job,
                      jobLevel: this.randomInt(0, stratum === 'senatorial' ? 8 : stratum === 'equestrian' ? 6 : 4),
                      traits,
                      skills: this.skillsForStratum(stratum),
                      corSocietyGenerated: true,
                      flagDoNotCull: true,
                      fatherId: anchor.fatherId,
                      motherId: anchor.motherId,
                      childrenIds: []
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  daapi.updateCharacter({
                    characterId: siblingId,
                    character: {
                      dynastyId: this.gameDynastyIdForHouse(house),
                      corSocietyHouseId: house.id,
                      fatherId: anchor.fatherId,
                      motherId: anchor.motherId,
                      childrenIds: []
                    }
                  })
                  this.addChildToParent(state, anchor.fatherId, siblingId)
                  this.addChildToParent(state, anchor.motherId, siblingId)
                  house.memberIds = house.memberIds || []
                  house.notableIds = house.notableIds || []
                  if (house.memberIds.indexOf(siblingId) < 0) {
                    house.memberIds.push(siblingId)
                  }
                  if (house.notableIds.indexOf(siblingId) < 0) {
                    house.notableIds.push(siblingId)
                  }
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(siblingId) < 0) {
                    society.generatedCharacterIds.push(siblingId)
                  }
                  this.applyGeneratedTraits(siblingId, traits)
                  this.seedSocialTraitsForCharacter(society, siblingId, traits)
                  return siblingId
                },
        connectCharacterToParents(state, characterId, fatherId, motherId) {
                  if (!characterId || (!fatherId && !motherId)) {
                    return false
                  }
                  let patch = {}
                  if (fatherId) patch.fatherId = fatherId
                  if (motherId) patch.motherId = motherId
                  try {
                    daapi.updateCharacter({ characterId, character: patch })
                    if (state.characters && state.characters[characterId]) {
                      if (fatherId) state.characters[characterId].fatherId = fatherId
                      if (motherId) state.characters[characterId].motherId = motherId
                    }
                    this.addChildToParent(state, fatherId, characterId)
                    this.addChildToParent(state, motherId, characterId)
                    return true
                  } catch (err) {
                    console.warn(err)
                    return false
                  }
                },
        addChildToParent(state, parentId, childId) {
                  if (!parentId || !childId || !state || !state.characters || !state.characters[parentId]) {
                    return false
                  }
                  let parent = state.characters[parentId]
                  let children = (parent.childrenIds || []).slice()
                  if (children.indexOf(childId) < 0) {
                    children.push(childId)
                    try {
                      daapi.updateCharacter({ characterId: parentId, character: { childrenIds: children } })
                      parent.childrenIds = children
                      return true
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                  return false
                },
        connectCharacterThroughCollateralBranch(society, state, house, root, characterId, rootFatherId, rootMotherId) {
                  if (!society || !state || !state.characters || !characterId || !rootFatherId || !rootMotherId) {
                    return false
                  }
                  let character = state.characters[characterId]
                  if (!character || character.isDead) {
                    return false
                  }
                  character.id = character.id || characterId
                  let rootParent = state.characters[rootFatherId] || state.characters[rootMotherId]
                  let grandFatherId = rootParent && rootParent.fatherId
                  let grandMotherId = rootParent && rootParent.motherId
                  if (!grandFatherId || !grandMotherId) {
                    return this.connectCharacterToParents(state, characterId, rootFatherId, rootMotherId)
                  }
                  let branchParentId = this.generateCollateralGhostParent(society, state, character, house, grandFatherId, grandMotherId)
                  if (!branchParentId) {
                    return false
                  }
                  let otherParentId = this.generateGhostParent(society, state, character, !this.characterIsMale(state.characters[branchParentId]))
                  let fatherId = this.characterIsMale(state.characters[branchParentId]) ? branchParentId : otherParentId
                  let motherId = this.characterIsMale(state.characters[branchParentId]) ? otherParentId : branchParentId
                  return this.connectCharacterToParents(state, characterId, fatherId, motherId)
                },
        generateCollateralGhostParent(society, state, child, house, grandFatherId, grandMotherId) {
                  let isMale = Math.random() > 0.5
                  let childBirthYear = parseInt(child.birthYear || state.year || 0, 10)
                  let birthYear = childBirthYear - this.randomInt(20, 34)
                  let deathYear = Math.max(childBirthYear, Math.min(state.year || childBirthYear, childBirthYear + this.randomInt(5, 28)))
                  let parentId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear,
                      deathMonth: this.randomInt(0, 11),
                      deathYear,
                      isDead: true,
                      deathCause: 'old age',
                      look: this.inheritedVanillaLook(isMale, state.characters[grandMotherId] || child, state.characters[grandFatherId] || child, 'collateral-parent-' + child.id),
                      corSocietyGenerated: true,
                      corSocietyGhostParent: true,
                      corSocietyCollateralAncestor: true,
                      flagDoNotCull: true,
                      fatherId: grandFatherId,
                      motherId: grandMotherId,
                      childrenIds: [child.id]
                    },
                    dynastyFeatures: this.dynastyFeaturesForHouse(house, state)
                  })
                  try {
                    daapi.updateCharacter({
                      characterId: parentId,
                      character: {
                        dynastyId: child.dynastyId || this.gameDynastyIdForHouse(house),
                        corSocietyHouseId: child.corSocietyHouseId || (house && house.id),
                        isDead: true,
                        deathCause: 'old age',
                        corSocietyGenerated: true,
                        corSocietyGhostParent: true,
                        corSocietyCollateralAncestor: true,
                        fatherId: grandFatherId,
                        motherId: grandMotherId,
                        childrenIds: [child.id],
                        flagDoNotCull: true
                      }
                    })
                    this.addChildToParent(state, grandFatherId, parentId)
                    this.addChildToParent(state, grandMotherId, parentId)
                  } catch (err) {
                    console.warn(err)
                  }
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(parentId) < 0) {
                    society.generatedCharacterIds.push(parentId)
                  }
                  return parentId
                },
        sharesAncestorWithin(state, firstId, secondId, depthLimit) {
                  let first = this.ancestorSet(state, firstId, depthLimit || 4)
                  let second = this.ancestorSet(state, secondId, depthLimit || 4)
                  for (let id in first) {
                    if (first.hasOwnProperty(id) && second[id]) {
                      return true
                    }
                  }
                  return false
                },
        ancestorSet(state, characterId, depthLimit, seen) {
                  seen = seen || {}
                  if (!state || !state.characters || !characterId || depthLimit <= 0) {
                    return seen
                  }
                  let queue = [{ id: characterId, depth: depthLimit }]
                  while (queue.length) {
                    let item = queue.shift()
                    let character = state.characters[item.id]
                    if (!character || item.depth <= 0) {
                      continue
                    }
                    ;[character.fatherId, character.motherId].forEach((parentId) => {
                      if (parentId && state.characters[parentId] && !seen[parentId]) {
                        seen[parentId] = true
                        queue.push({ id: parentId, depth: item.depth - 1 })
                      }
                    })
                  }
                  return seen
                },
        normalizeGeneratedPeople(society, state) {
                  if (society.generatedNormalizationVersion === this.version) {
                    return
                  }
                  let ids = (society.generatedCharacterIds || []).slice()
                  ids.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character) {
                      return
                    }
                    let patch = {
                      corSocietyGenerated: true,
                      flagDoNotCull: true
                    }
                    if (character.corSocietyHouseId && society.houses && society.houses[character.corSocietyHouseId]) {
                      let house = society.houses[character.corSocietyHouseId]
                      let dynastyId = this.gameDynastyIdForHouse(house)
                      if (dynastyId && character.dynastyId !== dynastyId) {
                        patch.dynastyId = dynastyId
                      }
                    }
                    try {
                      daapi.updateCharacter({
                        characterId,
                        character: patch
                      })
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                  society.generatedNormalizationVersion = this.version
                },
        generateGhostParent(society, state, child, isMale) {
                  let childBirthYear = parseInt(child.birthYear || state.year || 0, 10)
                  let parentAgeAtBirth = this.randomInt(19, 34)
                  let birthYear = childBirthYear - parentAgeAtBirth
                  let minDeathYear = birthYear + this.randomInt(42, 68)
                  let currentYear = state.year || minDeathYear
                  let deathYear = Math.max(childBirthYear, Math.min(currentYear, Math.max(minDeathYear, childBirthYear + this.randomInt(8, 30))))
                  let parentId = daapi.generateCharacter({
                    characterFeatures: {
                      gender: isMale ? 'male' : 'female',
                      isMale,
                      praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
                      birthMonth: this.randomInt(0, 11),
                      birthYear,
                      deathMonth: this.randomInt(0, 11),
                      deathYear,
                      isDead: true,
                      deathCause: 'old age',
                      look: this.inheritedVanillaLook(isMale, child, child, 'ghost-parent-' + child.id + '-' + (isMale ? 'father' : 'mother')),
                      corSocietyGenerated: true,
                      corSocietyGhostParent: true,
                      flagDoNotCull: true,
                      childrenIds: [child.id]
                    },
                    dynastyFeatures: this.dynastyFeaturesForCharacter(child, state)
                  })
                  try {
                    daapi.updateCharacter({
                      characterId: parentId,
                      character: {
                        dynastyId: child.dynastyId,
                        isDead: true,
                        deathCause: 'old age',
                        corSocietyGenerated: true,
                        corSocietyGhostParent: true,
                        childrenIds: [child.id]
                      }
                    })
                  } catch (err) {
                    console.warn(err)
                  }
                  society.generatedCharacterIds = society.generatedCharacterIds || []
                  if (society.generatedCharacterIds.indexOf(parentId) < 0) {
                    society.generatedCharacterIds.push(parentId)
                  }
                  return parentId
                },
        ensureGeneratedLooks(society, state) {
                  let generatedIds = society.generatedCharacterIds || []
                  generatedIds.forEach((characterId) => {
                    let character = state.characters[characterId]
                    if (!character || character.isDead) {
                      return
                    }
                    let look = character.look || {}
                    if (look.group && look.type) {
                      return
                    }
                    let newLook = this.generatedVanillaLook(this.characterIsMale(character), characterId + '-' + (character.dynastyId || ''))
                    try {
                      daapi.updateCharacter({
                        characterId,
                        character: {
                          look: newLook,
                          flagDoNotCull: true
                        }
                      })
                      character.look = newLook
                      character.flagDoNotCull = true
                      try {
                        daapi.forceUpdateCharacterDisplay({ characterId })
                      } catch (displayErr) {
                        console.warn(displayErr)
                      }
                    } catch (err) {
                      console.warn(err)
                    }
                  })
                },
        restoreSocietyPortraitLooks(state) {
                  this.repairUnsafeWardrobeLooks(state)
                },
        repairUnsafeWardrobeLooks(state) {
                  if (!state || !state.characters) {
                    return
                  }
                  if (state._corSocietyWardrobeRepaired) {
                    return
                  }
                  state._corSocietyWardrobeRepaired = true
                  for (let characterId in state.characters) {
                    if (!state.characters.hasOwnProperty(characterId)) {
                      continue
                    }
                    let character = state.characters[characterId]
                    if (!character || !character.look) {
                      continue
                    }
                    let lookGroup = character.look.group || ''
                    if (lookGroup !== 'cor_society' && lookGroup !== this.wardrobeLookGroup) {
                      continue
                    }
                    character.id = character.id || characterId
                    this.restoreOriginalLookIfNeeded(character, true, true)
                  }
                },
        originalLookForWardrobe(character) {
                  if (!character) {
                    return {}
                  }
                  if (character.corSocietyOriginalLook && character.corSocietyOriginalLook.group && character.corSocietyOriginalLook.type) {
                    return { ...character.corSocietyOriginalLook }
                  }
                  let look = character.look || {}
                  if (look.group === this.wardrobeLookGroup || look.group === 'cor_society') {
                    return {
                      group: 'roman',
                      type: 'brown'
                    }
                  }
                  return { ...look }
                },
        applyWardrobeLookToCharacter(character, outfit, state, silent) {
                  if (!character || !character.id || !outfit || outfit === 'auto') {
                    return false
                  }
                  state = state || daapi.getState()
                  if (character.look && (character.look.group === this.wardrobeLookGroup || character.look.group === 'cor_society')) {
                    this.restoreOriginalLookIfNeeded(character, true, true)
                  }
                  character.corSocietyOutfit = outfit
                  character.corSocietyOriginalLook = null
                  if (silent) {
                    return true
                  }
                  try {
                    daapi.updateCharacter({
                      characterId: character.id,
                      character: {
                        corSocietyOriginalLook: null,
                        corSocietyOutfit: outfit
                      }
                    })
                  } catch (err) {
                    console.warn(err)
                  }
                  return true
                },
        wardrobePortraitDataUri(character, state, outfit, originalLook, gender, ageStage) {
                  let baseCharacter = {
                    ...character,
                    gender,
                    isMale: gender === 'male',
                    corSocietyOutfit: '',
                    look: {
                      ...(originalLook || {}),
                      gender,
                      ageStage
                    }
                  }
                  let basePortrait = this.vanillaCharacterPortrait(baseCharacter, state) || this.defaultDetailedRomanPortrait(gender, ageStage) || this.genericVanillaCharacterPortrait(baseCharacter, state)
                  let inlinePortrait = this.inlineImageHref(basePortrait)
                  let baseSvg = this.svgTextFromDataUri(inlinePortrait)
                  if (!baseSvg) {
                    if (basePortrait) {
                      return basePortrait
                    }
                    return this.genericVanillaCharacterPortrait(baseCharacter, state) || this.defaultDetailedRomanPortrait(gender, ageStage)
                  }
                  let role = this.characterPortraitRole(character, ageStage, this.playerStratum(state))
                  return this.svgDataUri(this.recolorWardrobeSvgText(baseSvg, outfit, gender, ageStage, role))
                },
        defaultDetailedRomanPortrait(gender, ageStage) {
                  gender = gender === 'female' ? 'female' : 'male'
                  ageStage = ageStage || 'adult'
                  return this.vanillaPortraitAsset('icons/characters/roman/brown/' + gender + '/' + ageStage + '.svg')
                },
        restoreOriginalLookIfNeeded(character, includeGenerated, keepOutfit) {
                  if (!character || (!includeGenerated && character.corSocietyGenerated)) {
                    return
                  }
                  let update = {
                    corSocietyOriginalLook: null,
                    corSocietyOutfit: keepOutfit ? (character.corSocietyOutfit || '') : ''
                  }
                  let originalLook = character.corSocietyOriginalLook
                  let hasUnsafeLook = !!(character.look && (character.look.group === this.wardrobeLookGroup || character.look.group === 'cor_society'))
                  if (hasUnsafeLook && (!originalLook || !originalLook.group || !originalLook.type)) {
                    originalLook = {
                      group: 'roman',
                      type: 'brown'
                    }
                  }
                  if (hasUnsafeLook && originalLook && originalLook.group && originalLook.type) {
                    character.look = originalLook
                    update.look = originalLook
                  }
                  character.corSocietyOriginalLook = null
                  if (!keepOutfit) {
                    delete character.corSocietyOutfit
                  }
                  try {
                    daapi.updateCharacter({
                      characterId: character.id,
                      character: update
                    })
                  } catch (err) {
                    console.warn(err)
                  }
                },
        societyLookType(character) {
                  return 'c_' + this.safeId(character.id || character.charHash || character.praenomen || 'unknown')
                },
        houseForPortraitCharacter(character, society) {
                  if (!character || !society || !society.houses) {
                    return false
                  }
                  if (character.corSocietyHouseId && society.houses[character.corSocietyHouseId]) {
                    return society.houses[character.corSocietyHouseId]
                  }
                  if (character.dynastyId && society.houses[character.dynastyId]) {
                    return society.houses[character.dynastyId]
                  }
                  return false
                },
        allowAchievementsWithSociety(state) {
                  try {
                    if (!state || !state.current) {
                      return
                    }
                    if (state.current.flagUsedMods) {
                      state.current.flagUsedMods = false
                      state.current.flagSocietyAllowedAchievementsWithMods = true
                    }
                    if (state.settings) {
                      state.settings.enableAPIAchievements = true
                    }
                  } catch (err) {
                    console.warn(err)
                  }
                },
        classifyHouse(dynasty, members, strength, hasSenate) {
                  let heritage = this.normalizedHeritage(dynasty.heritage || '')
                  let prestige = parseFloat(dynasty.prestige || 0)
                  let hasEliteJob = members.some((character) => ['lawyer', 'rhetor', 'physician', 'trader'].indexOf(character.job) >= 0 && parseFloat(character.jobLevel || 0) >= 5)
                  let hasLabor = members.some((character) => character.job === 'labourer')
                  if (hasSenate || heritage === 'roman_patrician' || prestige >= 75000 || strength >= 95) {
                    return 'senatorial'
                  }
                  if (prestige >= 25000 || strength >= 55 || hasEliteJob) {
                    return 'equestrian'
                  }
                  if (prestige >= 8000 || strength >= 30) {
                    return 'civic'
                  }
                  if (heritage === 'roman_freedman') {
                    return prestige < 500 || (prestige < 1200 && hasLabor) ? 'poor' : 'freedmen'
                  }
                  if (heritage === 'roman_plebeian' && prestige >= 1200) {
                    return 'plebeian'
                  }
                  if (prestige < 1200 || strength < 12 || (hasLabor && prestige < 1800)) {
                    return 'poor'
                  }
                  return 'plebeian'
                },
        isSenatorialCharacter(character, state) {
                  if (!character) {
                    return false
                  }
                  let job = character.job || ''
                  let traits = character.traits || []
                  if (['senator', 'consul', 'praetor', 'pretor', 'quaestor', 'aedile'].indexOf(job) >= 0) {
                    return true
                  }
                  if (traits.indexOf('senator') >= 0 || traits.indexOf('formerQuaestor') >= 0 || traits.indexOf('formerPraetor') >= 0) {
                    return true
                  }
                  let senate = (state.current && state.current.senate) || {}
                  for (let office in senate) {
                    if (senate.hasOwnProperty(office) && (senate[office] || []).indexOf(character.id) >= 0) {
                      return true
                    }
                  }
                  return false
                },
        rankFromStrength(strength) {
                  if (strength >= 95) return 'Class I'
                  if (strength >= 65) return 'Class II'
                  if (strength >= 40) return 'Class III'
                  if (strength >= 22) return 'Class IV'
                  if (strength >= 10) return 'Class V'
                  return 'Capite censi'
                },
        characterScore(character, state) {
                  if (!character) return 0
                  let month = this.monthKey(state || daapi.getState())
                  if (character._scoreCache && character._scoreCache.month === month) {
                    return character._scoreCache.value
                  }
                  let age = this.age(character, state)
                  let score = (parseFloat(character.inheritance || 0) / 100) +
                    (parseFloat(character.jobLevel || 0) * 8) +
                    (((character.traits || []).length || 0) * 3) +
                    (age >= 16 ? 10 : 0) +
                    ((character.job || '') ? 12 : 0)
                  character._scoreCache = { month, value: score }
                  return score
                },
        houseName(dynasty, dynastyId) {
                  let nomen = dynasty.nomen || ''
                  let cognomen = dynasty.cognomen || ''
                  let name = (nomen + ' ' + cognomen).replace(/\s+/g, ' ').trim()
                  return name || String(dynastyId || 'Unknown House')
                },
        age(character, state) {
                  if (!character) return 0
                  let month = this.monthKey(state || daapi.getState())
                  if (character._ageCache && character._ageCache.month === month) {
                    return character._ageCache.value
                  }
                  let value = 0
                  try {
                    value = daapi.calculateAge({ month: character.birthMonth, year: character.birthYear })
                  } catch (err) {
                    value = ((state && state.year) || character.birthYear || 0) - (character.birthYear || 0)
                  }
                  character._ageCache = { month, value }
                  return value
                },
        formatAge(character, state) {
                  let age = this.age(character || {}, state || daapi.getState())
                  if (!isFinite(age)) {
                    return 'unknown'
                  }
                  if (age < 1) {
                    return Math.max(0, Math.round(age * 12)) + ' months'
                  }
                  return String(Math.floor(age))
                },
        countByStratum(society) {
                  let counts = {}
                  let dynasties = this.sortedDynasties(society)
                  if (dynasties.length) {
                    dynasties.forEach((dynasty) => {
                      let house = this.primaryHouseForDynasty(society, dynasty.id) || {}
                      let stratum = dynasty.stratum || house.stratum || 'plebeian'
                      counts[stratum] = (counts[stratum] || 0) + 1
                    })
                  } else {
                    for (let houseId in society.houses) {
                      if (!society.houses.hasOwnProperty(houseId)) {
                        continue
                      }
                      let stratum = society.houses[houseId].stratum || 'plebeian'
                      counts[stratum] = (counts[stratum] || 0) + 1
                    }
                  }
                  return counts
                }
      })
      window.corSociety._mixinCorSocietyPeopleGenerationVersion = '1.1.293'
    }
  }
}
