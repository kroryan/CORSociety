{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {
    try {
      let legacyGlobalKeys = [
        'cor_society',
        'cor_society_player_crest',
        'cor_society_wardrobe',
        'cor_society_bank_of_rome',
        'cor_society_household_slaves'
      ]
      legacyGlobalKeys.forEach((key) => {
        try {
          if (daapi.deleteGlobalAction) {
            daapi.deleteGlobalAction({ key })
            daapi.deleteGlobalAction(key)
          }
        } catch (err) {
          console.warn(err)
        }
      })
      let state = daapi.getState()
      let characterId = state && state.current && state.current.id
      if (characterId) {
        let addCharacterEntry = (key, title, tooltip, icon, method, context) => {
          daapi.addCharacterAction({
            characterId,
            key,
            action: {
              title,
              tooltip,
              icon,
              isAvailable: true,
              hideWhenBusy: false,
              process: {
                event: '/cor_society/engine',
                method,
                context: { characterId, ...(context || {}) }
              }
            }
          })
        }
        addCharacterEntry('cor_society', 'Roman Society', 'Opens the Society overview. Consequences: no stats change until you choose an action inside.', daapi.requireImage('/cor_society/icon.svg'), 'openHub')
        addCharacterEntry('cor_society_player_crest', 'House Shield', 'Opens player house shield settings. Consequences: visual shield changes only; no stats change.', daapi.requireImage('/cor_society/shield.svg'), 'openPlayerCrest')
        addCharacterEntry('cor_society_wardrobe', 'Family Wardrobe', 'Change Society portrait clothing for members of your household. Consequences: visual clothing changes only; no stats change.', daapi.requireImage('/cor_society/assets/wardrobe.svg'), 'openWardrobe')
        addCharacterEntry('cor_society_bank_of_rome', 'Bank of Rome', 'Open Society banking. Consequences happen only when taking or repaying a loan.', daapi.requireImage('/cor_society/bundled/bank_of_rome/money.svg'), 'openBankOfRome')
        addCharacterEntry('cor_society_household_slaves', 'Household Slaves', 'Open Society household slave management. Slaves are real generated characters.', daapi.requireImage('/cor_society/bundled/household_slaves/household.svg'), 'openHouseholdSlaves')
        addCharacterEntry('cor_society_player_tree', 'Player Dynasty Tree', 'Opens your Society-style dynasty tree. Consequences: no stat changes; missing ancestors are prepared by Roman Society in the background.', daapi.requireImage('/cor_society/assets/familyTree.svg'), 'openPlayerFamilyTree')
      }
    } catch (err) {
      console.warn(err)
    }
    try {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'boot'
      })
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'showInstallNoticeOnce'
      })
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'monthlyTick'
      })
    } catch (err) {
      console.warn(err)
      try {
        daapi.setGlobalFlag({
          flag: 'corSocietyLastError',
          data: err.name + ': ' + err.message
        })
        if (!daapi.getGlobalFlag({ flag: 'corSocietyStartupErrorShown' })) {
          daapi.setGlobalFlag({ flag: 'corSocietyStartupErrorShown', data: true })
          daapi.pushInteractionModalQueue({
            title: 'Roman Society startup error',
            message: 'The mod button was registered, but startup failed: ' + err.name + ': ' + err.message,
            image: daapi.requireImage('/cor_society/icon.svg')
          })
        }
      } catch (noticeErr) {
        console.warn(noticeErr)
      }
    }
  },
  methods: {
    boot() {
      if (window.corSociety && window.corSociety.version === '1.1.28') {
        window.corSociety.ensure()
        window.corSociety.installDebtSaleModalPatch()
        window.corSociety.registerPlayerEntryActions()
        window.corSociety.startPlayerCrestOverlay()
        window.corSociety.startPlayerStatusOverlay()
        return
      }

      window.corSociety = {
        version: '1.1.28',
        event: '/cor_society/engine',
        flag: 'corSocietyState',
        noticeFlag: 'corSocietyInstallNoticeSeen',
        logLimit: 240,
        historyPageSize: 8,
        wardrobeLookGroup: 'cor_society_wardrobe',
        vanillaPortraitAssets: {
          'icons/characters/female.svg': 'img/female.f707fe58.svg',
          'icons/characters/female_baby.svg': 'img/female_baby.80ac0b1b.svg',
          'icons/characters/female_old.svg': 'img/female_old.aeab9bd9.svg',
          'icons/characters/female_teen.svg': 'img/female_teen.94f13bb5.svg',
          'icons/characters/male.svg': 'img/male.9a3a017c.svg',
          'icons/characters/male_baby.svg': 'img/male_baby.32e231b9.svg',
          'icons/characters/male_old.svg': 'img/male_old.c89a5bac.svg',
          'icons/characters/male_teen.svg': 'img/male_teen.7ca5358d.svg',
          'icons/characters/roman/auburn/female/adult.svg': 'img/adult.eaeb7ef5.svg',
          'icons/characters/roman/auburn/female/baby.svg': 'img/baby.3774c082.svg',
          'icons/characters/roman/auburn/female/old.svg': 'img/old.f1172f25.svg',
          'icons/characters/roman/auburn/female/teen.svg': 'img/teen.ace18308.svg',
          'icons/characters/roman/auburn/male/adult.svg': 'img/adult.186b1435.svg',
          'icons/characters/roman/auburn/male/baby.svg': 'img/baby.dca7baee.svg',
          'icons/characters/roman/auburn/male/old.svg': 'img/old.98233ad6.svg',
          'icons/characters/roman/auburn/male/teen.svg': 'img/teen.2c3d4382.svg',
          'icons/characters/roman/black/female/adult.svg': 'img/adult.8bed277b.svg',
          'icons/characters/roman/black/female/baby.svg': 'img/baby.a0131621.svg',
          'icons/characters/roman/black/female/old.svg': 'img/old.5646bd45.svg',
          'icons/characters/roman/black/female/teen.svg': 'img/teen.bb5d18a0.svg',
          'icons/characters/roman/black/male/adult.svg': 'img/adult.a82907d8.svg',
          'icons/characters/roman/black/male/baby.svg': 'img/baby.b5d50f2b.svg',
          'icons/characters/roman/black/male/old.svg': 'img/old.192ba1c1.svg',
          'icons/characters/roman/black/male/teen.svg': 'img/teen.cc5a3167.svg',
          'icons/characters/roman/blonde/female/adult.svg': 'img/adult.f3b985c6.svg',
          'icons/characters/roman/blonde/female/baby.svg': 'img/baby.64dcb1f6.svg',
          'icons/characters/roman/blonde/female/old.svg': 'img/old.85bf0ff5.svg',
          'icons/characters/roman/blonde/female/teen.svg': 'img/teen.f8472117.svg',
          'icons/characters/roman/blonde/male/adult.svg': 'img/adult.8005b37d.svg',
          'icons/characters/roman/blonde/male/baby.svg': 'img/baby.6a7f3799.svg',
          'icons/characters/roman/blonde/male/old.svg': 'img/old.87edf76a.svg',
          'icons/characters/roman/blonde/male/teen.svg': 'img/teen.ee0167f6.svg',
          'icons/characters/roman/brown/female/adult.svg': 'img/adult.59b000f2.svg',
          'icons/characters/roman/brown/female/baby.svg': 'img/baby.9fbb91ff.svg',
          'icons/characters/roman/brown/female/old.svg': 'img/old.1c61dc78.svg',
          'icons/characters/roman/brown/female/teen.svg': 'img/teen.2e7738dc.svg',
          'icons/characters/roman/brown/male/adult.svg': 'img/adult.8a6ed9f9.svg',
          'icons/characters/roman/brown/male/baby.svg': 'img/baby.1d8786e8.svg',
          'icons/characters/roman/brown/male/old.svg': 'img/old.adb54f1d.svg',
          'icons/characters/roman/brown/male/teen.svg': 'img/teen.71ef4800.svg',
          'icons/characters/roman/brown_curly/female/adult.svg': 'img/adult.3b93dc6a.svg',
          'icons/characters/roman/brown_curly/female/baby.svg': 'img/baby.cc70ced5.svg',
          'icons/characters/roman/brown_curly/female/old.svg': 'img/old.9bcd6b91.svg',
          'icons/characters/roman/brown_curly/female/teen.svg': 'img/teen.cf57a6f7.svg',
          'icons/characters/roman/brown_curly/male/adult.svg': 'img/adult.87b4f6e9.svg',
          'icons/characters/roman/brown_curly/male/baby.svg': 'img/baby.fc4eb68f.svg',
          'icons/characters/roman/brown_curly/male/old.svg': 'img/old.46b580d0.svg',
          'icons/characters/roman/brown_curly/male/teen.svg': 'img/teen.ed01254f.svg',
          'icons/characters/roman/dusky/female/adult.svg': 'img/adult.126d7721.svg',
          'icons/characters/roman/dusky/female/baby.svg': 'img/baby.0a48ceaa.svg',
          'icons/characters/roman/dusky/female/old.svg': 'img/old.79d0435f.svg',
          'icons/characters/roman/dusky/female/teen.svg': 'img/teen.e082b316.svg',
          'icons/characters/roman/dusky/male/adult.svg': 'img/adult.f27497db.svg',
          'icons/characters/roman/dusky/male/baby.svg': 'img/baby.c7e78900.svg',
          'icons/characters/roman/dusky/male/old.svg': 'img/old.fb022009.svg',
          'icons/characters/roman/dusky/male/teen.svg': 'img/teen.21c5438d.svg',
          'icons/characters/roman/hazel/female/adult.svg': 'img/adult.bd668851.svg',
          'icons/characters/roman/hazel/female/baby.svg': 'img/baby.1a9b89b4.svg',
          'icons/characters/roman/hazel/female/old.svg': 'img/old.73d0e21f.svg',
          'icons/characters/roman/hazel/female/teen.svg': 'img/teen.69563d5c.svg',
          'icons/characters/roman/hazel/male/adult.svg': 'img/adult.a832d2ed.svg',
          'icons/characters/roman/hazel/male/baby.svg': 'img/baby.491b5337.svg',
          'icons/characters/roman/hazel/male/old.svg': 'img/old.2d782b29.svg',
          'icons/characters/roman/hazel/male/teen.svg': 'img/teen.fcd006f8.svg',
          'icons/characters/roman/olive/female/adult.svg': 'img/adult.3ed0c1b2.svg',
          'icons/characters/roman/olive/female/baby.svg': 'img/baby.429f032d.svg',
          'icons/characters/roman/olive/female/old.svg': 'img/old.408fef7d.svg',
          'icons/characters/roman/olive/female/teen.svg': 'img/teen.01310b64.svg',
          'icons/characters/roman/olive/male/adult.svg': 'img/adult.da4471a2.svg',
          'icons/characters/roman/olive/male/baby.svg': 'img/baby.b825b044.svg',
          'icons/characters/roman/olive/male/old.svg': 'img/old.89dedfc1.svg',
          'icons/characters/roman/olive/male/teen.svg': 'img/teen.e75b34c1.svg',
          'icons/characters/roman/red/female/adult.svg': 'img/adult.c3dbcbe6.svg',
          'icons/characters/roman/red/female/baby.svg': 'img/baby.100e8154.svg',
          'icons/characters/roman/red/female/old.svg': 'img/old.2d4a6287.svg',
          'icons/characters/roman/red/female/teen.svg': 'img/teen.79bc1ad5.svg',
          'icons/characters/roman/red/male/adult.svg': 'img/adult.e50e6182.svg',
          'icons/characters/roman/red/male/baby.svg': 'img/baby.3ce59ad9.svg',
          'icons/characters/roman/red/male/old.svg': 'img/old.eaebff03.svg',
          'icons/characters/roman/red/male/teen.svg': 'img/teen.ddc1b1e8.svg',
          'icons/characters/roman/tan/female/adult.svg': 'img/adult.3d0c21d8.svg',
          'icons/characters/roman/tan/female/baby.svg': 'img/baby.5a264e0c.svg',
          'icons/characters/roman/tan/female/old.svg': 'img/old.439bc75d.svg',
          'icons/characters/roman/tan/female/teen.svg': 'img/teen.c726315b.svg',
          'icons/characters/roman/tan/male/adult.svg': 'img/adult.87a69f29.svg',
          'icons/characters/roman/tan/male/baby.svg': 'img/baby.2bfbf42d.svg',
          'icons/characters/roman/tan/male/old.svg': 'img/old.aee50a51.svg',
          'icons/characters/roman/tan/male/teen.svg': 'img/teen.93a4a950.svg'
        },
        stratumOrder: ['senatorial', 'equestrian', 'civic', 'plebeian', 'freedmen', 'poor'],
        strata: {
          senatorial: {
            title: 'Senatorial Houses',
            singular: 'senatorial house',
            min: 4,
            basePrestige: [80000, 180000],
            heritage: ['roman_patrician', 'roman_novus_homo'],
            jobs: ['senator', 'lawyer', 'rhetor'],
            traits: ['senator', 'ambitious', 'oratorDeliberative'],
            cost: 2500,
            support: 400,
            revenue: 120
          },
          equestrian: {
            title: 'Equestrian Houses',
            singular: 'equestrian house',
            min: 5,
            basePrestige: [25000, 80000],
            heritage: ['roman_novus_homo', 'roman_plebian'],
            jobs: ['trader', 'lawyer', 'physician'],
            traits: ['educated', 'competitive', 'gregarious'],
            cost: 1400,
            support: 260,
            revenue: 90
          },
          civic: {
            title: 'Civic Citizens',
            singular: 'civic family',
            min: 5,
            basePrestige: [8000, 25000],
            heritage: ['roman_plebian', 'roman_novus_homo'],
            jobs: ['lawyer', 'physician', 'rhetor', 'painter'],
            traits: ['literate', 'content', 'trusting'],
            cost: 700,
            support: 150,
            revenue: 55
          },
          plebeian: {
            title: 'Plebeian Citizens',
            singular: 'plebeian family',
            min: 5,
            basePrestige: [1500, 8000],
            heritage: ['roman_plebian'],
            jobs: ['trader', 'painter', 'labourer'],
            traits: ['content', 'gregarious', 'charitable'],
            cost: 350,
            support: 85,
            revenue: 35
          },
          freedmen: {
            title: 'Freedmen',
            singular: 'freedman house',
            min: 4,
            basePrestige: [500, 5000],
            heritage: ['roman_freedman'],
            jobs: ['trader', 'painter', 'labourer'],
            traits: ['literate', 'greedy', 'trusting'],
            cost: 220,
            support: 55,
            revenue: 25
          },
          poor: {
            title: 'Slaves',
            singular: 'slave kin group',
            min: 4,
            basePrestige: [0, 1200],
            heritage: ['roman_plebian', 'roman_freedman'],
            jobs: ['labourer', null],
            traits: ['content', 'charitable', 'stubborn'],
            cost: 120,
            support: 30,
            revenue: 12
          }
        },
        nomina: ['Aelius', 'Aemilius', 'Antonius', 'Appius', 'Atilius', 'Calpurnius', 'Cassius', 'Claudius', 'Cornelius', 'Fabius', 'Flavius', 'Fulvius', 'Julius', 'Licinius', 'Livius', 'Marcius', 'Marius', 'Minucius', 'Octavius', 'Pompeius', 'Porcius', 'Quinctius', 'Sergius', 'Sulpicius', 'Valerius'],
        cognomina: ['Afer', 'Agricola', 'Balbus', 'Caldus', 'Cato', 'Corvus', 'Crispus', 'Felix', 'Flaccus', 'Longus', 'Magnus', 'Naso', 'Niger', 'Paullus', 'Rufus', 'Severus', 'Varro', 'Vetus'],
        maleNames: ['Aulus', 'Caeso', 'Decimus', 'Gaius', 'Gnaeus', 'Lucius', 'Manius', 'Marcus', 'Numerius', 'Publius', 'Quintus', 'Servius', 'Sextus', 'Spurius', 'Titus', 'Tiberius'],
        femaleNames: ['Aelia', 'Aemilia', 'Antonia', 'Appia', 'Atilia', 'Calpurnia', 'Cassia', 'Claudia', 'Cornelia', 'Fabia', 'Flavia', 'Fulvia', 'Julia', 'Licinia', 'Livia', 'Marcia', 'Octavia', 'Pompeia', 'Porcia', 'Valeria'],
        crestFields: ['crimson', 'vermilion', 'madder', 'purple', 'indigo', 'sea', 'cypress', 'black', 'umber', 'ochre', 'marble'],
        crestMetals: ['gold', 'bronze', 'silver', 'bone', 'copper'],
        crestAccents: ['gold', 'bronze', 'silver', 'bone', 'crimson', 'purple', 'indigo', 'cypress', 'black', 'ochre'],
        crestShapes: ['scutum', 'oval', 'round', 'vexillum', 'kite', 'hex'],
        crestDivisions: ['plain', 'pale', 'fess', 'bend', 'bendSinister', 'quartered', 'chief', 'chevron', 'saltire', 'orle'],
        crestPatterns: ['none', 'dots', 'bars', 'waves', 'rays', 'tiles'],
        crestCharges: ['spqr', 'aquila', 'laurel', 'thunderbolt', 'standard', 'column', 'sun', 'crescent', 'star', 'scales', 'ship', 'spear', 'tower', 'hand'],
        crestBorders: ['simple', 'double', 'bossed', 'laurel', 'rivets'],
        crestMarks: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'X', 'XII', 'SPQR'],
        crestPalette: {
          crimson: '#8f1f22',
          vermilion: '#b93a28',
          madder: '#6f1628',
          purple: '#5c2d63',
          indigo: '#263f73',
          sea: '#1f6771',
          cypress: '#2f5f45',
          black: '#202026',
          umber: '#6b3f24',
          ochre: '#b67b2d',
          marble: '#ded8c8',
          gold: '#d6aa3c',
          bronze: '#a56635',
          silver: '#d8dde1',
          bone: '#eee0c4',
          copper: '#c87545'
        },
        ensure(options) {
          let state = daapi.getState()
          if (!state || !state.current) {
            return this.createState()
          }
          this.repairUnsafeWardrobeLooks(state)
          let society = this.load()
          this.normalizeDynastyHouseModel(society, state)
          let ensureKey = this.ensureKey(society, state)
          if (!options || !options.force) {
            if (society.lastEnsureKey === ensureKey) {
              this.registerPlayerEntryActions(state)
              this.ensurePlayerDynastyTreeForCurrent(society, state)
              this.registerSocietyTraitDefinitions()
              this.ensureSlaveOrderPeople(society, state)
              state = daapi.getState()
              this.syncSocietyTraitsWithVanilla(society, state)
              this.syncFamilyRelationStatuses(society, state)
              this.syncSlaveStatuses(society, state)
              this.save(society)
              return society
            }
          }
          this.registerSocietyTraitDefinitions()
          this.registerPlayerEntryActions(state)
          this.syncWithGame(society, state)
          this.ensureVisibleHouseMembers(society, state)
          this.ensureSlaveOrderPeople(society, state)
          state = daapi.getState()
          this.normalizeGeneratedPeople(society, state)
          state = daapi.getState()
          this.ensureGeneratedParents(society, state)
          state = daapi.getState()
          this.ensureGeneratedDynastyTrees(society, state)
          state = daapi.getState()
          this.ensureGeneratedLooks(society, state)
          this.ensureCrests(society, state)
          this.syncPlayerSocietyStatus(society, state)
          this.ensurePlayerDynastyTreeForCurrent(society, state)
          state = daapi.getState()
          this.syncSocietyTraitsWithVanilla(society, state)
          this.syncFamilyRelationStatuses(society, state)
          this.syncSlaveStatuses(society, state)
          this.restoreSocietyPortraitLooks(state)
          this.allowAchievementsWithSociety(state)
          society.lastEnsureKey = this.ensureKey(society, state)
          this.save(society)
          return society
        },
        ensureKey(society, state) {
          let characterCount = state && state.characters ? Object.keys(state.characters).length : 0
          let dynastyCount = state && state.dynasties ? Object.keys(state.dynasties).length : 0
          let societyDynastyCount = society && society.dynasties ? Object.keys(society.dynasties).length : 0
          let houseCount = society && society.houses ? Object.keys(society.houses).length : 0
          return [
            this.monthKey(state || {}),
            characterCount,
            dynastyCount,
            societyDynastyCount,
            houseCount,
            this.version
          ].join(':')
        },
        legacyGlobalActionKeys() {
          return [
            'cor_society',
            'cor_society_player_crest',
            'cor_society_wardrobe',
            'cor_society_bank_of_rome',
            'cor_society_household_slaves'
          ]
        },
        cleanupLegacyGlobalActions() {
          try {
            if (!daapi.deleteGlobalAction) {
              return
            }
            this.legacyGlobalActionKeys().forEach((key) => {
              try {
                daapi.deleteGlobalAction({ key })
              } catch (err) {
              }
              try {
                daapi.deleteGlobalAction(key)
              } catch (err) {
              }
            })
          } catch (err) {
            console.warn(err)
          }
        },
        registerCurrentCharacterAction(state, key, title, tooltip, icon, method, context) {
          state = state || daapi.getState()
          let characterId = state && state.current && state.current.id
          if (!characterId) {
            return false
          }
          daapi.addCharacterAction({
            characterId,
            key,
            action: {
              title,
              tooltip,
              icon,
              isAvailable: true,
              hideWhenBusy: false,
              process: {
                event: this.event,
                method,
                context: { characterId, ...(context || {}) }
              }
            }
          })
          return true
        },
        registerPlayerEntryActions(state) {
          try {
            state = state || daapi.getState()
            this.cleanupLegacyGlobalActions()
            this.registerCurrentCharacterAction(state, 'cor_society', 'Roman Society', 'Opens the Society overview. Consequences: no stats change until you choose an action inside.', daapi.requireImage('/cor_society/icon.svg'), 'openHub')
            this.registerCurrentCharacterAction(state, 'cor_society_player_crest', 'House Shield', 'Opens player house shield settings. Consequences: visual shield changes only; no stats change.', daapi.requireImage('/cor_society/shield.svg'), 'openPlayerCrest')
            this.registerCurrentCharacterAction(state, 'cor_society_wardrobe', 'Family Wardrobe', 'Change Society portrait clothing for members of your household. Consequences: visual clothing changes only; no stats change.', daapi.requireImage('/cor_society/assets/wardrobe.svg'), 'openWardrobe')
            this.registerCurrentCharacterAction(state, 'cor_society_bank_of_rome', 'Bank of Rome', 'Open Society banking. Consequences happen only when taking or repaying a loan.', this.bundledIcon('bank_of_rome', 'money'), 'openBankOfRome')
            this.registerCurrentCharacterAction(state, 'cor_society_household_slaves', 'Household Slaves', 'Open Society household slave management. Slaves are real generated characters.', this.slaveTypeIcon('household'), 'openHouseholdSlaves')
            this.registerPlayerDynastyTreeAction(state)
            let currentId = this.currentCharacterId(state)
            let current = state && state.characters && state.characters[currentId]
            if (current && this.isSlaveCharacter(current)) {
              this.registerCurrentCharacterAction(state, 'cor_society_slave_path', 'Path to Freedom', 'Open slave-focused Society actions for earning or negotiating freedom.', this.slaveTypeIcon(current.corSocietySlaveType || 'labor'), 'openPlayerSlavePath')
            }
          } catch (err) {
            console.warn(err)
          }
        },
        registerPlayerDynastyTreeAction(state) {
          try {
            state = state || daapi.getState()
            let characterId = state && state.current && state.current.id
            if (!characterId) {
              return
            }
            daapi.addCharacterAction({
              characterId,
              key: 'cor_society_player_tree',
              action: {
                title: 'Player Dynasty Tree',
                tooltip: 'Opens your Society-style dynasty tree. Consequences: no stat changes; missing ancestors are prepared by Roman Society in the background.',
                icon: daapi.requireImage('/cor_society/assets/familyTree.svg'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: this.event,
                  method: 'openPlayerFamilyTree',
                  context: { characterId }
                }
              }
            })
          } catch (err) {
            console.warn(err)
          }
        },
        registerBundledBankActions() {
          try {
            this.cleanupLegacyGlobalActions()
            this.registerCurrentCharacterAction(daapi.getState(), 'cor_society_bank_of_rome', 'Bank of Rome', 'Open Society banking. Consequences happen only when taking or repaying a loan.', this.bundledIcon('bank_of_rome', 'money'), 'openBankOfRome')
          } catch (err) {
            console.warn(err)
          }
        },
        registerBundledSlaveActions() {
          try {
            this.cleanupLegacyGlobalActions()
            this.registerCurrentCharacterAction(daapi.getState(), 'cor_society_household_slaves', 'Household Slaves', 'Open Society household slave management. Slaves are real generated characters.', this.slaveTypeIcon('household'), 'openHouseholdSlaves')
          } catch (err) {
            console.warn(err)
          }
        },
        registerBundledMatchmakerAction({ characterId } = {}) {
          try {
            let state = daapi.getState()
            let character = state.characters && state.characters[characterId]
            if (!character || !this.isPlayerFamilyCharacter(state, characterId) || !this.isMarriageEligible({ ...character, id: characterId }, state)) {
              return
            }
            daapi.addCharacterAction({
              characterId,
              key: 'cor_society_coemptio_' + characterId,
              action: {
                title: 'Coemptio matchmaker',
                tooltip: 'Search Society houses for a real spouse candidate. Consequences: no stats change until a candidate is chosen.',
                icon: this.bundledIcon('coemptio', 'marriage'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: this.event,
                  method: 'openMatchmaker',
                  context: { characterId }
                }
              }
            })
          } catch (err) {
            console.warn(err)
          }
        },
        showInstallNoticeOnce() {
          let seen = false
          try {
            seen = !!daapi.getGlobalFlag({ flag: this.noticeFlag })
          } catch (err) {
            seen = false
          }
          if (seen) {
            return
          }
          daapi.setGlobalFlag({ flag: this.noticeFlag, data: true })
          this.pushModal({
            title: 'Roman Society loaded',
            message: 'Roman Society is active. It adds social orders, houses, virtual-player families, monthly family affairs, alliances, rivalries, patronage, trade, scandals, petitions, and political support.',
            image: daapi.requireImage('/cor_society/icon.svg'),
            options: [
              {
                variant: 'info',
                text: 'Open Roman Society',
                action: {
                  event: this.event,
                  method: 'openHub'
                }
              },
              {
                text: 'Later'
              }
            ]
          })
        },
        createState() {
          return {
            version: this.version,
            settings: {
              enabled: true,
              monthlyEvents: true,
              autoGenerate: true
            },
            dynasties: {},
            houses: {},
            generatedHouseIds: [],
            generatedCharacterIds: [],
            pendingVentures: [],
            crests: {},
            crestSettings: {
              playerOverlay: true
            },
            houseRelations: {},
            characterSocial: {},
            personalRelations: {},
            romances: {},
            pendingPaternities: [],
            discoveredPaternities: {},
            playerTreeGeneratedLivingIds: [],
            relationStatusCharacterIds: [],
            slaveStatusCharacterIds: [],
            pendingSteals: {},
            bank: {
              principal: 0,
              interestRate: 0.083,
              loansTaken: 0,
              lastPaymentYear: '',
              lastNoticeYear: ''
            },
            playerSlaves: [],
            slaveMarketOffers: [],
            lastProcessedMonth: '',
            log: []
          }
        },
        load() {
          let society = false
          try {
            society = daapi.getGlobalFlag({ flag: this.flag })
          } catch (err) {
            society = false
          }
          if (!society || typeof society !== 'object') {
            society = this.createState()
          }
          society.version = this.version
          society.settings = { enabled: true, monthlyEvents: true, autoGenerate: true, ...(society.settings || {}) }
          society.dynasties = society.dynasties || {}
          society.houses = society.houses || {}
          society.generatedHouseIds = society.generatedHouseIds || []
          society.generatedCharacterIds = society.generatedCharacterIds || []
          society.pendingVentures = society.pendingVentures || []
          society.crests = society.crests || {}
          society.crestSettings = { playerOverlay: true, ...(society.crestSettings || {}) }
          society.houseRelations = society.houseRelations || {}
          society.characterSocial = society.characterSocial || {}
          society.personalRelations = society.personalRelations || {}
          society.romances = society.romances || {}
          society.pendingPaternities = society.pendingPaternities || []
          society.discoveredPaternities = society.discoveredPaternities || {}
          society.playerTreeGeneratedLivingIds = society.playerTreeGeneratedLivingIds || []
          society.relationStatusCharacterIds = society.relationStatusCharacterIds || []
          society.slaveStatusCharacterIds = society.slaveStatusCharacterIds || []
          society.pendingSteals = society.pendingSteals || {}
          society.bank = {
            principal: 0,
            interestRate: 0.083,
            loansTaken: 0,
            lastPaymentYear: '',
            lastNoticeYear: '',
            ...(society.bank || {})
          }
          society.playerSlaves = society.playerSlaves || []
          society.slaveMarketOffers = society.slaveMarketOffers || []
          society.log = society.log || []
          return society
        },
        save(society) {
          daapi.setGlobalFlag({ flag: this.flag, data: society })
        },
        assetIcon(name) {
          try {
            return daapi.requireImage('/cor_society/assets/' + name + '.svg')
          } catch (err) {
            console.warn(err)
            return daapi.requireImage('/cor_society/icon.svg')
          }
        },
        bundledIcon(bundle, name) {
          try {
            return daapi.requireImage('/cor_society/bundled/' + bundle + '/' + name + '.svg')
          } catch (err) {
            console.warn(err)
            return daapi.requireImage('/cor_society/icon.svg')
          }
        },
        slaveTypeIcon(type) {
          let icons = {
            scribe: 'educator',
            tutor: 'educator',
            nurse: 'doctor',
            midwife: 'doctor',
            musician: 'entertainer',
            dancer: 'entertainer',
            cook: 'labor',
            artisan: 'labor',
            groom: 'labor',
            courier: 'manager',
            steward: 'manager',
            accountant: 'manager',
            bodyguard: 'warrior',
            gladiator: 'warrior',
            hunter: 'warrior'
          }
          return this.bundledIcon('household_slaves', icons[type] || type || 'household')
        },
        stratumIcon(stratum) {
          let icons = {
            senatorial: 'senate',
            equestrian: 'eques',
            civic: 'senator',
            plebeian: 'plebeian',
            freedmen: 'freedmen',
            poor: 'poor'
          }
          return this.assetIcon(icons[stratum] || 'familyTree')
        },
        affairIcon(kind) {
          let icons = {
            officeCampaign: 'senator',
            tradeVenture: 'trade',
            marriageAlliance: 'wedding',
            inheritanceDispute: 'familyTree',
            feud: 'influence',
            scandal: 'prestige',
            romance: 'marriage',
            lover: 'marriage',
            divorce: 'rivalry',
            slander: 'influence',
            petition: 'plebeian',
            invitation: 'familyTree',
            support: 'senate',
            marriage: 'marriage',
            birth: 'familyTree',
            gift: 'coins',
            coins: 'coins',
            prestige: 'prestige',
            trade: 'trade',
            bank: 'coins',
            slaves: 'familyTree',
            matchmaker: 'marriage',
            patronage: 'prestige',
            rivalry: 'influence',
            log: 'familyTree'
          }
          return this.assetIcon(icons[kind] || 'familyTree')
        },
        installDebtSaleModalPatch() {
          if (this.debtSaleModalPatchInstalled) {
            this.startDebtSaleModalObserver()
            return
          }
          this.debtSaleModalPatchInstalled = true
          ;['pushInteractionModalQueue', 'pushInteractionModalButtonQueue'].forEach((methodName) => {
            try {
              let original = daapi[methodName]
              if (typeof original !== 'function' || original.corSocietyDebtSalePatch) {
                return
              }
              let self = this
              let wrapped = function(payload) {
                return original.call(this, self.patchDebtSaleModalPayload(payload))
              }
              wrapped.corSocietyDebtSalePatch = true
              daapi[methodName] = wrapped
            } catch (err) {
              console.warn(err)
            }
          })
          this.startDebtSaleModalObserver()
        },
        patchDebtSaleModalPayload(payload) {
          if (!this.isDebtSaleModalPayload(payload)) {
            return payload
          }
          let amount = this.debtLoanAmount(daapi.getState())
          let patched = { ...(payload || {}) }
          let options = (patched.options || []).slice()
          options.unshift(this.debtLoanOption(amount))
          patched.options = options
          patched.corSocietyDebtLoanInjected = true
          return patched
        },
        isDebtSaleModalPayload(payload) {
          if (!payload || payload.corSocietyDebtLoanInjected || payload.societyMenu) {
            return false
          }
          let text = (String(payload.title || '') + ' ' + String(payload.message || '')).toLowerCase()
          if (!text || text.indexOf('bank of rome') >= 0) {
            return false
          }
          let options = payload.options || []
          if (options.some((option) => option && option.action && option.action.method === 'takeEmergencyDebtLoan')) {
            return false
          }
          let cash = parseFloat(((daapi.getState() || {}).current || {}).cash || 0)
          if (cash >= 0) {
            return false
          }
          let debtWords = ['debt', 'negative', 'owe', 'owed', 'bankrupt', 'bankruptcy', 'deuda', 'negativo']
          let saleWords = ['sell', 'sale', 'property', 'asset', 'properties', 'slavery', 'vender', 'venta', 'propiedad', 'propiedades']
          return debtWords.some((word) => text.indexOf(word) >= 0) && saleWords.some((word) => text.indexOf(word) >= 0)
        },
        debtLoanAmount(state) {
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          return Math.max(50, Math.ceil(Math.abs(Math.min(0, cash)) + 25))
        },
        debtLoanOption(amount) {
          return {
            variant: 'danger',
            text: 'Borrow from Bank of Rome (' + amount + ')',
            tooltip: 'Covers the current negative cash before selling property. Consequences: principal increases and annual interest applies.',
            statChanges: { cash: amount },
            icons: [this.bundledIcon('bank_of_rome', 'money')],
            action: {
              event: this.event,
              method: 'takeEmergencyDebtLoan',
              context: { amount }
            }
          }
        },
        startDebtSaleModalObserver() {
          if (this.debtSaleObserverStarted || typeof document === 'undefined') {
            return
          }
          this.debtSaleObserverStarted = true
          let sync = () => {
            try {
              if (window.corSociety) {
                window.corSociety.injectDebtLoanButtonIntoDebtModal()
              }
            } catch (err) {
              console.warn(err)
            }
          }
          if (typeof MutationObserver !== 'undefined' && document.body) {
            this.debtSaleObserver = new MutationObserver(sync)
            this.debtSaleObserver.observe(document.body, { childList: true, subtree: true })
          }
          if (typeof window !== 'undefined' && window.setInterval) {
            window.setInterval(sync, 1800)
          }
          sync()
        },
        injectDebtLoanButtonIntoDebtModal() {
          if (typeof document === 'undefined') {
            return false
          }
          let state = daapi.getState()
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          if (cash >= 0) {
            return false
          }
          let amount = this.debtLoanAmount(state)
          let modals = Array.prototype.slice.call(document.querySelectorAll('#interactionModal, .interaction-modal, .modal.show, .modal'))
          let modal = modals.find((node) => {
            if (!node || node.offsetParent === null || node.querySelector('[data-cor-society-bank-debt-option]')) {
              return false
            }
            let text = (node.textContent || '').toLowerCase()
            if (!text || text.indexOf('bank of rome') >= 0 || text.indexOf('roman society') >= 0) {
              return false
            }
            let hasDebt = ['debt', 'negative', 'owe', 'owed', 'bankrupt', 'bankruptcy', 'deuda', 'negativo'].some((word) => text.indexOf(word) >= 0)
            let hasSale = ['sell', 'sale', 'property', 'asset', 'properties', 'slavery', 'vender', 'venta', 'propiedad', 'propiedades'].some((word) => text.indexOf(word) >= 0)
            return hasDebt && hasSale
          })
          if (!modal) {
            return false
          }
          let target = modal.querySelector('.modal-footer, .interaction-modal-options, .interaction-modal-content-options, .interaction-modal-content-buttons, .modal-body') || modal
          let button = document.createElement('button')
          button.type = 'button'
          button.setAttribute('data-cor-society-bank-debt-option', '1')
          button.className = 'btn btn-info cor-society-bank-debt-option'
          button.textContent = 'Borrow from Bank of Rome (' + amount + ')'
          button.title = 'Covers negative cash with a Society bank loan before forced property sales.'
          button.style.margin = '6px'
          button.style.whiteSpace = 'normal'
          button.onclick = (event) => {
            event.preventDefault()
            event.stopPropagation()
            button.disabled = true
            button.textContent = 'Loan taken'
            this.takeEmergencyDebtLoan({ amount })
          }
          target.appendChild(button)
          return true
        },
        pushModal(payload) {
          payload = payload || {}
          if (!payload.corTranslatorPretranslateNow) {
            payload.corTranslatorSkipPretranslate = true
            payload.skipTranslatorPretranslate = true
          }
          let options = payload.options || []
          if (payload.societySummaryOptions && payload.societySummaryOptions.length) {
            options = payload.societySummaryOptions.concat(options)
          }
          payload.options = this.decorateModalOptions(this.addSocietyCloseOption(options, payload), payload)
          daapi.pushInteractionModalQueue(payload)
        },
        escapeHtml(value) {
          return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
        },
        summaryIcon(src, label) {
          if (!src) {
            return ''
          }
          return '<img class="cor-society-summary-icon" src="' + this.escapeHtml(src) + '" alt="' + this.escapeHtml(label || '') + '">'
        },
        summaryChip(label, value, icon, tone) {
          return '<span class="cor-society-summary-chip cor-society-tone-' + this.escapeHtml(tone || 'neutral') + '">' +
            this.summaryIcon(icon, label) +
            '<span class="cor-society-summary-chip-label">' + this.escapeHtml(label) + '</span>' +
            '<strong>' + this.escapeHtml(value) + '</strong>' +
            '</span>'
        },
        summaryTile(label, value, icon, tone, detail) {
          return '<div class="cor-society-summary-tile cor-society-tone-' + this.escapeHtml(tone || 'neutral') + '">' +
            this.summaryIcon(icon, label) +
            '<div class="cor-society-summary-tile-copy">' +
            '<span>' + this.escapeHtml(label) + '</span>' +
            '<strong>' + this.escapeHtml(value) + '</strong>' +
            (detail ? '<small>' + this.escapeHtml(detail) + '</small>' : '') +
            '</div>' +
            '</div>'
        },
        summaryMeter(label, value, min, max, icon, tone) {
          value = parseFloat(value || 0)
          min = parseFloat(min)
          max = parseFloat(max)
          let range = Math.max(1, max - min)
          let percent = this.clamp(Math.round(((value - min) / range) * 100), 0, 100)
          return '<div class="cor-society-summary-meter cor-society-tone-' + this.escapeHtml(tone || this.scoreTone(value)) + '">' +
            '<div class="cor-society-summary-meter-head">' +
            this.summaryIcon(icon, label) +
            '<span>' + this.escapeHtml(label) + '</span>' +
            '<strong>' + this.escapeHtml(Math.round(value)) + '</strong>' +
            '</div>' +
            '<div class="cor-society-summary-meter-track"><span style="width:' + percent + '%"></span></div>' +
            '</div>'
        },
        scoreTone(value) {
          value = parseFloat(value || 0)
          if (value >= 55) return 'good'
          if (value >= 15) return 'calm'
          if (value <= -45) return 'bad'
          if (value <= -12) return 'warn'
          return 'neutral'
        },
        summarySection(title, icon, body) {
          return '<section class="cor-society-summary-section">' +
            '<h4>' + this.summaryIcon(icon, title) + '<span>' + this.escapeHtml(title) + '</span></h4>' +
            body +
            '</section>'
        },
        summaryGrid(items) {
          return '<div class="cor-society-summary-grid">' + (items || []).join('') + '</div>'
        },
        summaryOption(title, value, icons, tooltip, variant) {
          let text = title ? (title + ': ' + value) : String(value || '')
          return {
            variant: variant || 'info',
            text,
            disabled: true,
            showDisabledWithTooltip: true,
            tooltip: tooltip || text,
            icons: (icons || []).filter(Boolean)
          }
        },
        hubSummaryOptions(state, society, counts, rivals, allies, playerStatus) {
          let houseCount = Object.keys((society && society.houses) || {}).length
          let orderText = this.stratumOrder
            .map((stratum) => this.strata[stratum].title + ' ' + (counts[stratum] || 0))
            .join(' | ')
          return [
            this.summaryOption(
              'Date and standing',
              'Year ' + state.year + ', month ' + ((state.month || 0) + 1) + ' - ' + playerStatus.title + (playerStatus.className ? ' (' + playerStatus.className + ')' : ''),
              [this.affairIcon('log'), this.stratumIcon(playerStatus.stratum)],
              'Your current Society order is derived from the same property ladder the base game uses.'
            ),
            this.summaryOption(
              'Known society',
              houseCount + ' houses in ' + this.stratumOrder.length + ' social orders; ' + allies + ' allies/patrons; ' + rivals + ' rivalries.',
              [this.affairIcon('familyTree'), this.affairIcon('support'), this.affairIcon('rivalry')],
              'This is the live map of Society houses currently simulated by the mod.'
            ),
            this.summaryOption(
              'Orders',
              orderText,
              this.stratumOrder.map((stratum) => this.stratumIcon(stratum)),
              'Counts by social order. Open an order to inspect its houses.'
            ),
            this.summaryOption(
              'Monthly life',
              'Houses pursue wealth, office, marriage, security, honor, or revenge. Effects can touch cash, prestige, influence, relations, favors, and revenue.',
              [this.affairIcon('trade'), this.affairIcon('prestige'), this.affairIcon('coins')],
              'These internal turns are simulated monthly and can create player-facing affairs.'
            )
          ]
        },
        houseSummaryOptions(society, state, house, profile, tradeActive) {
          let property = (house.ai && house.ai.property) || {}
          let status = house.rivalry ? 'Rivalry' : ((house.relation || 0) >= 55 ? 'Ally' : 'Neutral')
          let relationVisual = {
            icon: this.relationIcon(house.relation || 0, house.rivalry ? 'rival' : this.relationshipTypeFromScore(house.relation || 0))
          }
          return [
            this.summaryOption(
              'Order',
              profile.title + '; citizen rank ' + (house.citizenRank || 'unknown') + '; status ' + status + '.',
              [this.stratumIcon(house.stratum), status === 'Rivalry' ? this.affairIcon('rivalry') : this.affairIcon('support')],
              'Public position, citizen rank, and diplomatic status of this house.'
            ),
            this.summaryOption(
              'Power',
              'Prestige ' + Math.round(house.prestige || 0) + '; strength ' + Math.round(house.strength || 0) + '; wealth ' + Math.round(house.wealth || 0) + '; power ' + Math.round(house.power || 0) + '.',
              [this.affairIcon('prestige'), this.affairIcon('influence'), this.affairIcon('coins')],
              'These values drive how strongly the house can act in Society events.'
            ),
            this.summaryOption(
              'Estate',
              'AI cash ' + Math.round((house.ai && house.ai.cash) || 0) + '; influence ' + Math.round((house.ai && house.ai.influence) || 0) + '; property L' + Math.round(property.land || 0) + ' A' + Math.round(property.animals || 0) + ' T' + Math.round(property.trade || 0) + '.',
              [this.affairIcon('coins'), this.affairIcon('trade')],
              'Internal estate resources used by the house simulation.'
            ),
            this.summaryOption(
              'Relations',
              'House relation ' + this.signed(house.relation || 0) + '; stability ' + Math.round(house.stability || 0) + '; favors owed ' + (house.favor || 0) + '; trade ' + (tradeActive ? 'active' : 'none') + '.',
              [relationVisual.icon, this.affairIcon('familyTree'), this.affairIcon('gift')],
              'Relationship, stability, favors, and trade state. Trade does not stack.'
            ),
            this.summaryOption(
              'Current affairs',
              'Agenda ' + (house.agenda || 'unknown') + '; latest ' + (house.lastFamilyEvent || 'none') + '.',
              [this.affairIcon(house.lastFamilyKind || 'log')],
              'Recent and current house behavior used by monthly Society turns.'
            )
          ]
        },
        personSummaryOptions(society, state, house, character, relatives, social, romance, relationScore, relationRecord, currentId, characterId) {
          let skills = character.skills || {}
          let spouse = character.spouseId && state.characters[character.spouseId] ? this.characterName(state.characters[character.spouseId], state) : 'none'
          let relationText = currentId && !this.sameCharacterId(currentId, characterId)
            ? this.signed(relationScore) + ' ' + this.relationshipLabel(relationRecord ? relationRecord.type : this.relationshipTypeFromScore(relationScore))
            : 'controlled character'
          let relationVisual = currentId && !this.sameCharacterId(currentId, characterId) ? this.relationVisual(society, state, character) : false
          return [
            this.summaryOption(
              'Relation',
              relationText,
              [relationVisual ? relationVisual.icon : this.affairIcon('support')],
              relationVisual ? relationVisual.tooltip : 'This is the currently controlled character.'
            ),
            this.summaryOption(
              'Profile',
              'Age ' + this.formatAge(character, state) + '; job ' + ((character.job || 'none') + (character.jobLevel ? ' ' + character.jobLevel : '')) + '; spouse ' + spouse + '; children ' + relatives.children.length + '.',
              [this.affairIcon('familyTree'), this.affairIcon('marriage')],
              'Basic character facts from the game character record.'
            ),
            this.summaryOption(
              'Skills',
              'Int ' + Math.round(skills.intelligence || 0) + '; Steward ' + Math.round(skills.stewardship || 0) + '; Eloquence ' + Math.round(skills.eloquence || 0) + '; Combat ' + Math.round(skills.combat || 0) + '.',
              [this.affairIcon('prestige'), this.affairIcon('trade'), this.affairIcon('senator'), this.affairIcon('rivalry')],
              'Vanilla skill values used by Society decisions where relevant.'
            ),
            this.summaryOption(
              'Social state',
              'Introduced ' + (social.introduced ? 'yes' : 'no') + '; rapport ' + Math.round(social.bond || 0) + '; lover ' + (romance ? ('yes, intensity ' + Math.round(romance.intensity || 0)) : 'no') + '; house relation ' + this.signed(house.relation || 0) + '.',
              [this.affairIcon('invitation'), this.affairIcon('support'), this.affairIcon('lover')],
              'Society social state for introductions, visits, courtship, and house relations.'
            )
          ]
        },
        hubSummaryHtml(state, society, counts, rivals, allies, playerStatus) {
          let houseCount = Object.keys((society && society.houses) || {}).length
          let orderChips = this.stratumOrder.map((stratum) => {
            let profile = this.strata[stratum]
            return this.summaryChip(profile.title, counts[stratum] || 0, this.stratumIcon(stratum), stratum)
          }).join('')
          return '<div class="cor-society-summary cor-society-summary-hub">' +
            '<div class="cor-society-summary-ribbon">' +
            this.summaryChip('Date', 'Year ' + state.year + ', month ' + ((state.month || 0) + 1), this.affairIcon('log'), 'calm') +
            this.summaryChip('Standing', playerStatus.title + (playerStatus.className ? ' (' + playerStatus.className + ')' : ''), this.stratumIcon(playerStatus.stratum), playerStatus.stratum) +
            '</div>' +
            this.summaryGrid([
              this.summaryTile('Known houses', houseCount, this.affairIcon('familyTree'), 'calm', this.stratumOrder.length + ' social orders'),
              this.summaryTile('Allies / patrons', allies, this.affairIcon('support'), allies ? 'good' : 'neutral', 'Support, favors, and patrons'),
              this.summaryTile('Open rivalries', rivals, this.affairIcon('rivalry'), rivals ? 'bad' : 'good', 'Hostile houses watching you'),
              this.summaryTile('House turns', 'Monthly', this.affairIcon('trade'), 'calm', 'Wealth, office, marriage, security, honor, revenge')
            ]) +
            this.summarySection('Social orders', this.affairIcon('familyTree'), '<div class="cor-society-summary-chip-row">' + orderChips + '</div>') +
            this.summarySection('Possible effects', this.affairIcon('prestige'), '<div class="cor-society-summary-chip-row">' +
              this.summaryChip('Gifts', 'relations', this.affairIcon('gift'), 'good') +
              this.summaryChip('Ventures', 'cash / revenue', this.affairIcon('trade'), 'calm') +
              this.summaryChip('Scandals', 'prestige / heat', this.affairIcon('prestige'), 'warn') +
              this.summaryChip('Petitions', 'influence', this.affairIcon('petition'), 'calm') +
              '</div>') +
            '</div>'
        },
        houseSummaryHtml(society, state, house, profile, tradeActive) {
          let property = (house.ai && house.ai.property) || {}
          let relationTone = this.scoreTone(house.relation || 0)
          let status = house.rivalry ? 'Rivalry' : ((house.relation || 0) >= 55 ? 'Ally' : 'Neutral')
          return '<div class="cor-society-summary cor-society-summary-house">' +
            '<div class="cor-society-summary-ribbon">' +
            this.summaryChip('Order', profile.title, this.stratumIcon(house.stratum), house.stratum) +
            this.summaryChip('Citizen rank', house.citizenRank || 'Unknown', this.affairIcon('senator'), 'calm') +
            this.summaryChip('Status', status, house.rivalry ? this.affairIcon('rivalry') : this.affairIcon('support'), house.rivalry ? 'bad' : ((house.relation || 0) >= 55 ? 'good' : 'neutral')) +
            '</div>' +
            this.summaryGrid([
              this.summaryTile('Prestige', Math.round(house.prestige || 0), this.affairIcon('prestige'), 'calm'),
              this.summaryTile('Strength', Math.round(house.strength || 0), this.affairIcon('influence'), 'calm'),
              this.summaryTile('Wealth', Math.round(house.wealth || 0), this.affairIcon('coins'), 'good'),
              this.summaryTile('Power', Math.round(house.power || 0), this.affairIcon('senator'), 'calm'),
              this.summaryTile('AI cash', Math.round((house.ai && house.ai.cash) || 0), this.affairIcon('coins'), 'neutral'),
              this.summaryTile('AI influence', Math.round((house.ai && house.ai.influence) || 0), this.affairIcon('influence'), 'neutral')
            ]) +
            this.summaryMeter('Relation', house.relation || 0, -100, 100, this.affairIcon('support'), relationTone) +
            this.summaryMeter('Stability', house.stability || 0, 0, 100, this.affairIcon('familyTree'), (house.stability || 0) >= 55 ? 'good' : ((house.stability || 0) < 30 ? 'warn' : 'calm')) +
            this.summarySection('House economy', this.affairIcon('trade'), '<div class="cor-society-summary-chip-row">' +
              this.summaryChip('Property', 'L' + Math.round(property.land || 0) + ' A' + Math.round(property.animals || 0) + ' T' + Math.round(property.trade || 0), this.affairIcon('coins'), 'neutral') +
              this.summaryChip('Favors owed', house.favor || 0, this.affairIcon('gift'), (house.favor || 0) > 0 ? 'good' : 'neutral') +
              this.summaryChip('Trade compact', tradeActive ? 'active' : 'none', this.affairIcon('trade'), tradeActive ? 'good' : 'neutral') +
              '</div>') +
            this.summarySection('Current affairs', this.affairIcon(house.lastFamilyKind || 'log'), '<div class="cor-society-summary-note">' +
              '<strong>Agenda:</strong> ' + this.escapeHtml(house.agenda || 'unknown') + '<br>' +
              '<strong>Latest:</strong> ' + this.escapeHtml(house.lastFamilyEvent || 'none') +
              '</div>') +
            '</div>'
        },
        personSummaryHtml(society, state, house, character, relatives, social, romance, relationScore, relationRecord, currentId, characterId) {
          let skills = character.skills || {}
          let spouse = character.spouseId && state.characters[character.spouseId] ? this.characterName(state.characters[character.spouseId], state) : 'none'
          let relationText = currentId && !this.sameCharacterId(currentId, characterId)
            ? this.signed(relationScore) + ' (' + this.relationshipLabel(relationRecord ? relationRecord.type : this.relationshipTypeFromScore(relationScore)) + ')'
            : 'controlled character'
          let relationVisual = currentId && !this.sameCharacterId(currentId, characterId) ? this.relationVisual(society, state, character) : false
          let traitIcons = this.societyTraitIconList(society, character)
          let traitBody = traitIcons.length
            ? traitIcons.map((icon) => this.summaryIcon(icon, 'Trait')).join('') + '<span>' + this.escapeHtml(this.socialTraitSummary(society, character)) + '</span>'
            : '<span>none</span>'
          return '<div class="cor-society-summary cor-society-summary-person">' +
            '<div class="cor-society-summary-ribbon">' +
            this.summaryChip('Age', this.formatAge(character, state), this.affairIcon('familyTree'), 'calm') +
            this.summaryChip('Job', (character.job || 'none') + (character.jobLevel ? ' ' + character.jobLevel : ''), this.affairIcon('senator'), 'neutral') +
            this.summaryChip('Relation to you', relationText, relationVisual ? relationVisual.icon : this.affairIcon('support'), this.scoreTone(relationScore)) +
            '</div>' +
            this.summaryGrid([
              this.summaryTile('Intelligence', Math.round(skills.intelligence || 0), this.affairIcon('prestige'), 'calm'),
              this.summaryTile('Stewardship', Math.round(skills.stewardship || 0), this.affairIcon('trade'), 'calm'),
              this.summaryTile('Eloquence', Math.round(skills.eloquence || 0), this.affairIcon('senator'), 'calm'),
              this.summaryTile('Combat', Math.round(skills.combat || 0), this.affairIcon('rivalry'), 'neutral')
            ]) +
            this.summarySection('Family', this.affairIcon('familyTree'), '<div class="cor-society-summary-chip-row">' +
              this.summaryChip('Spouse', spouse, this.affairIcon('marriage'), spouse === 'none' ? 'neutral' : 'good') +
              this.summaryChip('Children', relatives.children.length, this.affairIcon('birth'), relatives.children.length ? 'good' : 'neutral') +
              this.summaryChip('House relation', this.signed(house.relation || 0), this.affairIcon('support'), this.scoreTone(house.relation || 0)) +
              this.summaryChip('House favors', house.favor || 0, this.affairIcon('gift'), (house.favor || 0) > 0 ? 'good' : 'neutral') +
              '</div>') +
            this.summarySection('Social state', this.affairIcon('prestige'), '<div class="cor-society-summary-chip-row">' +
              this.summaryChip('Introduced', social.introduced ? 'yes' : 'no', this.affairIcon('invitation'), social.introduced ? 'good' : 'neutral') +
              this.summaryChip('Rapport', Math.round(social.bond || 0), this.affairIcon('support'), this.scoreTone(social.bond || 0)) +
              this.summaryChip('Lover', romance ? ('yes, intensity ' + Math.round(romance.intensity || 0)) : 'no', this.affairIcon('lover'), romance ? 'warn' : 'neutral') +
              '</div>') +
            this.summarySection('Society traits', this.affairIcon('prestige'), '<div class="cor-society-summary-traits">' + traitBody + '</div>') +
            '</div>'
        },
        addSocietyCloseOption(options, payload) {
          options = (options || []).slice()
          if (payload && (payload.disableSocietyClose || payload.requireChoice || payload.isPriority || !payload.societyMenu)) {
            return options
          }
          let hasClose = options.some((option) => option && typeof option === 'object' && /^close( society)?$/i.test(String(option.text || '').trim()) && !option.action)
          if (!hasClose) {
            options.push({
              text: 'Close Society',
              tooltip: 'Consequences: closes this Society window; no stats change.'
            })
          }
          return options
        },
        decorateModalOptions(options, payload) {
          return (options || []).map((option) => this.decorateModalOption(option, payload)).filter(Boolean)
        },
        decorateModalOption(option, payload) {
          if (!option || typeof option !== 'object') {
            return option
          }
          if (option.options) {
            option.options = this.decorateModalOptions(option.options, payload)
          }
          let consequence = this.optionConsequence(option, payload)
          if (consequence) {
            option.tooltip = option.tooltip ? option.tooltip + '\n' + consequence : consequence
          } else if (!option.tooltip) {
            option.tooltip = this.defaultOptionTooltip(option)
          }
          if (option.disabled && option.tooltip) {
            option.showDisabledWithTooltip = true
          }
          return option
        },
        defaultOptionTooltip(option) {
          let text = String((option && option.text) || '')
          if (/close/i.test(text)) return 'Consequences: closes this Society window; no stats change.'
          if (/back|cancel|later|previous/i.test(text)) return 'Consequences: returns without changing stats.'
          if (/next page/i.test(text)) return 'Consequences: opens the next page; no stats change.'
          let method = option && option.action && option.action.method
          if (method && /^open/.test(method)) return 'Consequences: opens another Society view; no stats change.'
          return ''
        },
        optionConsequence(option, payload) {
          let action = option && option.action
          let method = action && action.method
          if (!method) {
            return ''
          }
          let context = action.context || {}
          let house = this.houseFromContext(context)
          let state = daapi.getState()
          let profile = house ? (this.strata[house.stratum] || this.strata.plebeian) : this.strata.plebeian
          if (method === 'openEstate') return 'Consequences: opens that social order; no stats change.'
          if (method === 'openRelations') return 'Consequences: opens allies and patrons; no stats change.'
          if (method === 'openAllies') return 'Consequences: opens allies and patrons; no stats change.'
          if (method === 'openRivals') return 'Consequences: opens rival houses; no stats change.'
          if (method === 'openWardrobe') return 'Consequences: opens the household wardrobe; no stats change.'
          if (method === 'openBankOfRome') return 'Consequences: opens Bank of Rome loans and payments; no stats change yet.'
          if (method === 'openHouseholdSlaves') return 'Consequences: opens household slave management; no stats change yet.'
          if (method === 'openMatchmaker') return 'Consequences: opens matchmaker offers for this character; no stats change yet.'
          if (method === 'openPlayerFamilyTree') return 'Consequences: opens your Society-style dynasty tree; may add missing dead ancestors and up to a few living kin if absent.'
          if (method === 'openWardrobeCharacter') return 'Consequences: opens clothing choices for this family member; no stats change.'
          if (method === 'applyWardrobeOutfit') return 'Consequences: changes Society portrait clothing only; no stats change.'
          if (method === 'openLog') return 'Consequences: opens past affairs; no stats change.'
          if (method === 'openLogEntry') return 'Consequences: opens this affair notice; no stats change.'
          if (method === 'openHub') return 'Consequences: returns to the Society overview; no stats change.'
          if (method === 'openHouse') return 'Consequences: opens the selected house; no stats change.'
          if (method === 'openPeople') return 'Consequences: opens member groups; no stats change.'
          if (method === 'openMemberGroups') return 'Consequences: opens member groups; no stats change.'
          if (method === 'openMemberGroup') return 'Consequences: opens one member category; no stats change.'
          if (method === 'openPerson') return 'Consequences: opens this character; no stats change.'
          if (method === 'openVanillaActions') return 'Consequences: opens this character\'s vanilla / other mods actions; no stats change yet.'
          if (method === 'openVanillaKnownFamily') return 'Consequences: opens the vanilla known-family screen if the game route is available; no stats change.'
          if (method === 'openVanillaFullFamilyTree') return 'Consequences: opens the vanilla full-family-tree screen if the game route is available; no stats change.'
          if (method === 'openFamilyTree') return 'Consequences: opens Society\'s graphical family-tree view; no stats change.'
          if (method === 'openMarriageHousehold') return 'Consequences: chooses one of your unmarried adult family members; no stats change yet.'
          if (method === 'openMarriageCandidates') return 'Consequences: chooses possible spouses from this house; no stats change yet.'
          if (method === 'confirmSocietyMarriage') return 'Consequences: opens the final wedding confirmation; no stats change yet.'
          if (method === 'randomizePlayerCrest') return 'Consequences: creates a new player shield; no stats change.'
          if (method === 'cyclePlayerCrest') return 'Consequences: changes this shield part only; no stats change.'
          if (method === 'togglePlayerCrestOverlay') return 'Consequences: toggles the floating player shield badge; no stats change.'
          if (method === 'sendGift') return this.effectLine([this.changeText('cash', -this.actionCost(house || {}, 'gift')), '+8 to +16 house relation', 'possible +1 favor'])
          if (method === 'hostDinner') return this.effectLine([this.changeText('cash', -this.actionCost(house || {}, 'dinner')), '+12 prestige', '+10 to +20 house relation', 'lowers house heat'])
          if (method === 'askSupport') {
            let support = Math.max(20, Math.round((profile.support || 50) + ((house && house.strength) || 0) * 2))
            return this.effectLine(['+' + support + ' influence', (house && house.favor > 0) ? '-1 favor, -4 house relation' : '-16 house relation', '+1 house heat'])
          }
          if (method === 'tradeDeal') {
            let amount = Math.max(8, Math.round((profile.revenue || 20) + ((house && house.strength) || 0) / 3))
            return this.effectLine(['+' + amount + ' monthly revenue for 12 months', '+5 house relation'])
          }
          if (method === 'takeBankLoan') return this.effectLine(['cash now', 'annual interest payment', 'loan principal remains until repaid'])
          if (method === 'takeEmergencyDebtLoan') return this.effectLine(['cash enough to cover current debt', 'annual interest payment', 'loan principal remains until repaid'])
          if (method === 'payBankLoan') return this.effectLine(['cash payment', 'reduces or clears loan principal'])
          if (method === 'buySlave') return this.effectLine(['cash cost', 'adds one household slave', 'monthly task may improve cash, prestige, influence, education, health, or labor output'])
          if (method === 'buyEnslavedCharacter') return this.effectLine(['cash cost', 'moves this real Society character into your household as a slave', 'origin and previous owner are preserved'])
          if (method === 'captureEnslavedCharacter') return this.effectLine(['cash and influence cost', 'captures this real Society character as a household slave', 'origin house relation worsens'])
          if (method === 'sellSlave') return this.effectLine(['cash gain', 'removes that slave and their bonuses'])
          if (method === 'freeSlave') return this.effectLine(['prestige and influence gain', 'removes that slave and their bonuses'])
          if (method === 'openSlaveMarket') return 'Consequences: opens available slaves; no stats change until purchase.'
          if (method === 'openManageSlave') return 'Consequences: opens this slave management view; no stats change yet.'
          if (method === 'openAssignSlaveTask') return 'Consequences: opens task choices; no stats change yet.'
          if (method === 'assignSlaveTask') return this.effectLine(['changes future household slave output', 'no immediate stats change'])
          if (method === 'openSlaveEducationTargets') return 'Consequences: selects a child under 13 for future education ticks; no immediate stats change.'
          if (method === 'setSlaveEducationTarget') return this.effectLine(['sets pupil for education task', 'future ticks improve skills and may add education traits'])
          if (method === 'privateCompanySlave') return this.effectLine(['+1 prestige', '+small personal relation', '+2 slave savings', 'risk of illegitimate child (female, age 10-42)', '5 month cooldown'])
          if (method === 'openSlaveMarriageCandidates') return 'Consequences: chooses another owned household slave; no stats change yet.'
          if (method === 'marryOwnedSlaves') return this.effectLine(['creates spouse link between two owned slaves', 'future slave-spouse pregnancy may occur', 'no family alliance'])
          if (method === 'acceptSlaveSelfPurchase') return this.effectLine(['cash payment to your household', 'manumits slave into their own Freedmen house'])
          if (method === 'legitimizeSlaveBastard') return this.effectLine(['cash, prestige, and influence cost', 'removes slave status', 'moves child into the non-slave father dynasty'])
          if (method === 'acceptMatchmakerCandidate') return this.effectLine(['cash fee', 'performs vanilla marriage if still valid', 'candidate remains a real Society character'])
          if (method === 'declineMatchmakerCandidates') return 'Consequences: returns without choosing; candidates remain real Society characters.'
          if (method === 'offerPatronage') {
            let stipend = Math.max(8, Math.round((profile.revenue || 20) / 2))
            return this.effectLine(['-' + stipend + ' monthly revenue for 12 months', '+8 prestige', '+22 house relation', '+1 favor'])
          }
          if (method === 'seekPatronage') {
            let amount = Math.max(60, Math.round(((house && house.strength) || 20) * 3))
            return this.effectLine(['+' + amount + ' influence', '-5 prestige', '-8 house relation', 'may spend 1 favor'])
          }
          if (method === 'startRivalry') return this.effectLine(['+10 prestige', '+25 influence', 'sets relation to -65 or worse', 'starts rivalry'])
          if (method === 'reconcile') return this.effectLine([this.changeText('cash', -this.actionCost(house || {}, 'reconcile')), '-20 influence', '+38 house relation', 'may end rivalry'])
          if (method === 'praisePerson') return this.effectLine(['+3 prestige', '+6 house relation'])
          if (method === 'requestIntroduction') return this.effectLine(['+35 influence', '-3 house relation', 'possible +1 favor', 'unlocks private visits and courtship'])
          if (method === 'inviteHomeTalk') return this.effectLine(['+4 to +12 personal rapport', '+2 to +8 house relation', '4 month cooldown', 'small chance of gossip'])
          if (method === 'courtCharacter') return this.effectLine(['may start or deepen a lover relationship', '+rapport on success', '6 month cooldown on failure', 'risk of scandal if either lover is married'])
          if (method === 'resolveCourtship') return this.effectLine(['success depends on choosing an approach that fits traits and situation', '+rapport and personal relation on success', 'cooldown after attempt', 'possible scandal if married'])
          if (method === 'treatFamilyMember') return this.effectLine(['cash cost', 'high chance to remove stress/illness/wounds', '+prestige and personal relation on success'])
          if (method === 'comfortFamilyMember') return this.effectLine(['no cash cost', 'moderate chance to remove stress/depression', '+personal relation'])
          if (method === 'ignoreFamilyDistress') return this.effectLine(['-2 prestige', '-personal relation'])
          if (method === 'spreadRumor') return this.effectLine(['usually +35 influence, +5 prestige, -22 house relation', 'if exposed: -15 prestige, -35 relation, rivalry'])
          if (method === 'answerSlander') return this.effectLine(['-35 influence', '+4 prestige', '-8 house relation', '+2 house heat'])
          if (method === 'ignoreSlander') return this.effectLine(['-10 prestige', 'lowers house heat'])
          if (method === 'acceptOpening') return this.effectLine(['+60 influence', '+8 house relation', '+1 favor'])
          if (method === 'declineOpening') return this.effectLine(['+3 prestige', '-4 house relation'])
          if (method === 'supportPetition') return this.effectLine([this.changeText('cash', -this.petitionCost(house || {})), '+7 prestige', '+18 house relation', 'possible +1 favor'])
          if (method === 'refusePetition') return this.effectLine(['-12 house relation'])
          if (method === 'attendFamilyInvitation') {
            let cost = this.invitationCost(house || {})
            return this.effectLine(['-' + cost + ' cash', '+10 prestige', '+14 house relation', 'possible +1 favor'])
          }
          if (method === 'declineFamilyInvitation') return this.effectLine(['-7 house relation', '+1 house heat'])
          if (method === 'endorseOffice') return this.effectLine(['-45 influence', '+10 prestige', '+14 house relation', '+10 house power', '+1 favor'])
          if (method === 'honorWedding') {
            let cost = this.actionCost(house || {}, 'wedding')
            return this.effectLine(['-' + cost + ' cash', '+5 prestige', '+16 house relation', '+5 house stability'])
          }
          if (method === 'judgeInheritance') return this.effectLine(['-30 influence', '70%: +12 prestige, +18 relation, +12 stability, +1 favor', 'failure: -8 prestige, -16 relation, -8 stability'])
          if (method === 'investVenture') {
            let offer = this.ventureOffer(house || {})
            let offerCost = context.cost || offer.cost
            let offerMonths = context.months || offer.months
            let offerExpected = context.expected || offer.expected
            return this.effectLine(['-' + offerCost + ' cash', 'result in ' + offerMonths + ' months', 'expected share about +' + offerExpected + ' cash', '+10 house relation'])
          }
          if (method === 'shieldScandal') return this.effectLine(['-35 influence', '-4 prestige', '+20 house relation', '+8 stability', '+1 favor'])
          if (method === 'exploitScandal') return this.effectLine(['+50 influence', '+6 prestige', '-35 house relation', '-8 house power', 'may start rivalry'])
          if (method === 'declineFamilyAffair') return this.effectLine(['-3 house relation'])
          if (method === 'performSocietyMarriage') {
            let effects = house ? this.marriageEffects(state, house) : false
            if (!effects) return 'Consequences: performs the vanilla marriage and refreshes Society.'
            let parts = [
              this.changeText('cash', effects.stats && effects.stats.cash),
              this.changeText('prestige', effects.stats && effects.stats.prestige),
              this.changeText('influence', effects.stats && effects.stats.influence),
              effects.revenue ? '+' + effects.revenue + ' monthly revenue for 24 months' : '',
              '+' + effects.relation + ' house relation',
              '+1 favor',
              'spouse link in vanilla family UI'
            ]
            return this.effectLine(parts)
          }
          return ''
        },
        houseFromContext(context) {
          context = context || {}
          if (context.houseId === undefined || context.houseId === null || context.houseId === '') {
            return false
          }
          let society = this.load()
          return society && society.houses ? society.houses[context.houseId] : false
        },
        effectLine(parts) {
          return 'Consequences: ' + (parts || []).filter(Boolean).join(', ') + '.'
        },
        gameDynastyIdForHouse(house) {
          if (!house) {
            return ''
          }
          return house.dynastyId || house.gameDynastyId || house.id || ''
        },
        originHouseIdForDynasty(dynastyId) {
          return String(dynastyId || '')
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
          for (let characterId in (state.characters || {})) {
            if (!state.characters.hasOwnProperty(characterId)) continue
            let character = state.characters[characterId]
            if (!character || character.isDead) continue
            if (this.sameCharacterId(character.fatherId, founder.id) || this.sameCharacterId(character.motherId, founder.id)) add(characterId)
            if (founder.spouseId && (this.sameCharacterId(character.fatherId, founder.spouseId) || this.sameCharacterId(character.motherId, founder.spouseId))) add(characterId)
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
            this.normalizeDynastyHouseModel(society, daapi.getState())
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
          for (let characterId in state.characters) {
            if (!state.characters.hasOwnProperty(characterId)) {
              continue
            }
            let character = state.characters[characterId]
            if (!character || character.isDead || !character.dynastyId || character.dynastyId === playerDynastyId) {
              continue
            }
            if (character.corSocietySlaveMarket && character.corSocietySlaveActive === false) {
              continue
            }
            if (household[characterId] && character.dynastyId === playerDynastyId) {
              continue
            }
            character.id = character.id || characterId
            let houseId = character.corSocietyHouseId && society && society.houses && society.houses[character.corSocietyHouseId]
              ? character.corSocietyHouseId
              : character.dynastyId
            result[houseId] = result[houseId] || []
            result[houseId].push(character)
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
        },
        ensureMinimumHouses(society, state) {
          let counts = this.countByStratum(society)
          this.stratumOrder.forEach((stratum) => {
            let needed = (this.strata[stratum].min || 0) - (counts[stratum] || 0)
            for (let i = 0; i < needed; i++) {
              this.generateHouse(society, state, stratum)
            }
          })
        },
        generateHouse(society, state, stratum) {
          let profile = this.strata[stratum]
          let isMale = Math.random() > 0.25
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
            dynastyFeatures: {}
          })
          this.applyGeneratedTraits(spouseId, traits)
          this.seedSocialTraitsForCharacter(society, spouseId, traits)
          society.generatedCharacterIds = society.generatedCharacterIds || []
          if (society.generatedCharacterIds.indexOf(spouseId) < 0) {
            society.generatedCharacterIds.push(spouseId)
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
            dynastyFeatures: {}
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
              look: canBeChild ? this.inheritedVanillaLook(isMale, head.isMale ? null : head, head.isMale ? head : null, stratum + '-' + house.id + '-' + head.id + '-' + relativeAge) : this.generatedVanillaLook(isMale, stratum + '-' + house.id + '-' + head.id + '-' + relativeAge),
              job,
              jobLevel: job ? this.randomInt(0, 5) : 0,
              traits,
              skills: this.skillsForStratum(stratum),
              corSocietyGenerated: true,
              flagDoNotCull: true,
              fatherId: canBeChild && head.isMale ? head.id : null,
              motherId: canBeChild && !head.isMale ? head.id : null,
              childrenIds: []
            },
            dynastyFeatures: {}
          })
          daapi.updateCharacter({
            characterId: relativeId,
            character: {
              dynastyId: this.gameDynastyIdForHouse(house),
              corSocietyHouseId: house.id,
              fatherId: canBeChild && head.isMale ? head.id : null,
              motherId: canBeChild && !head.isMale ? head.id : null
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
            try {
              return daapi.requireImage('/cor_society/assets/traits/' + trait + '.svg')
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
        },
        syncSocietyTraitsWithVanilla(society, state) {
          if (!society || !state || !state.characters) {
            return
          }
          let definitions = this.societyTraitDefinitions()
          Object.keys(state.characters).forEach((characterId) => {
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
          ids.forEach((characterId) => {
            let character = state.characters[characterId]
            if (!character || character.isDead || character.corSocietyGhostParent) {
              return
            }
            character.id = character.id || characterId
            let patch = {}
            if (!character.fatherId) {
              patch.fatherId = this.generateGhostParent(society, state, character, true)
            }
            if (!character.motherId) {
              patch.motherId = this.generateGhostParent(society, state, character, false)
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
            }
          })
        },
        ensureGeneratedDynastyTrees(society, state) {
          if (!society || !society.houses || !state || !state.characters) {
            return
          }
          for (let houseId in society.houses) {
            if (!society.houses.hasOwnProperty(houseId)) {
              continue
            }
            let house = society.houses[houseId]
            if (!house || !house.generated) {
              continue
            }
            this.ensureHouseCommonTree(society, state, house, { allowLivingExtras: true })
            state = daapi.getState()
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
              this.connectCharacterToParents(state, characterId, rootFatherId, rootMotherId)
            }
          })
          state = daapi.getState()
          this.refreshHouseMemberLists(society, state, house)
          house.treeIntegrityVersion = this.version
          house.livingExtrasAdded = Math.min(4, (house.livingExtrasAdded || 0) + livingAdded)
        },
        ensureDeadParentsAndGrandparents(society, state, character) {
          if (!character || !character.id) {
            return false
          }
          character.id = character.id || character.id
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
            dynastyFeatures: {}
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
          if (!state || !state.characters || !characterId || depthLimit <= 0 || seen[characterId]) {
            return seen
          }
          let character = state.characters[characterId]
          if (!character) {
            return seen
          }
          ;[character.fatherId, character.motherId].forEach((parentId) => {
            if (parentId && state.characters[parentId]) {
              seen[parentId] = true
              this.ancestorSet(state, parentId, depthLimit - 1, seen)
            }
          })
          return seen
        },
        normalizeGeneratedPeople(society, state) {
          if (society.generatedNormalizationVersion === this.version) {
            return
          }
          let ids = (society.generatedCharacterIds || []).slice()
          ids.forEach((characterId) => {
            let character = state.characters[characterId]
            if (!character || character.isDead || character.corSocietyGhostParent) {
              return
            }
            let patch = {
              corSocietyGenerated: true,
              flagDoNotCull: true
            }
            let age = this.age(character, state)
            let hasFamily = !!character.spouseId || ((character.childrenIds || []).length > 0)
            if (age > 38 && !hasFamily) {
              patch.birthYear = (state.year || character.birthYear || 0) - this.randomInt(20, 30)
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
            dynastyFeatures: {}
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
          let heritage = dynasty.heritage || ''
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
          if ((heritage === 'roman_plebian' || heritage === 'roman_plebeian') && prestige >= 1200) {
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
          let age = this.age(character, state)
          return (parseFloat(character.inheritance || 0) / 100) +
            (parseFloat(character.jobLevel || 0) * 8) +
            (((character.traits || []).length || 0) * 3) +
            (age >= 16 ? 10 : 0) +
            ((character.job || '') ? 12 : 0)
        },
        houseName(dynasty, dynastyId) {
          let nomen = dynasty.nomen || ''
          let cognomen = dynasty.cognomen || ''
          let name = (nomen + ' ' + cognomen).replace(/\s+/g, ' ').trim()
          return name || String(dynastyId || 'Unknown House')
        },
        age(character, state) {
          try {
            return daapi.calculateAge({ month: character.birthMonth, year: character.birthYear })
          } catch (err) {
            return (state.year || 0) - (character.birthYear || state.year || 0)
          }
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
        },
        monthlyTick() {
          let state = daapi.getState()
          let society = this.ensure()
          if (!society || !society.settings.enabled) {
            return
          }
          this.installDebtSaleModalPatch()
          let monthKey = this.monthKey(state)
          if (society.lastProcessedMonth === monthKey) {
            return
          }
          society.lastProcessedMonth = monthKey
          this.syncPlayerWorldEffects(society, state)
          this.processBankYear(society, state)
          this.processPlayerSlaves(society, state)
          this.simulateHouseTurns(society, state)
          this.maybeCreateNpcCadetHouses(society, state)
          this.updateDynastyHeadship(society, state)
          this.simulateInterHouseAffairs(society, state)
          this.maybeStartNpcRomance(society, state)
          this.simulateRomances(society, state)
          state = daapi.getState()
          this.resolvePendingPaternities(society, state)
          this.resolvePendingVentures(society, state)
          this.driftRelations(society)
          this.resolveTradeCompacts(society, state)
          this.applyNetworkModifiers(society)
          if (this.queueFamilyCareEvent(society, state)) {
            this.save(society)
            return
          }
          if (society.settings.monthlyEvents && Math.random() < 0.64) {
            this.queueMonthlyEvent(society, state)
          }
          this.save(society)
        },
        syncPlayerWorldEffects(society, state) {
          let current = (state && state.current) || {}
          let snapshot = {
            cash: parseFloat(current.cash || 0),
            influence: parseFloat(current.influence || 0),
            prestige: parseFloat(current.prestige || 0)
          }
          if (!society.playerSnapshot) {
            society.playerSnapshot = snapshot
            return
          }
          let previous = society.playerSnapshot || snapshot
          let prestigeDelta = snapshot.prestige - parseFloat(previous.prestige || 0)
          let influenceDelta = snapshot.influence - parseFloat(previous.influence || 0)
          let cashDelta = snapshot.cash - parseFloat(previous.cash || 0)
          society.playerSnapshot = snapshot
          let statusShift = this.clamp(Math.round(prestigeDelta / 250 + influenceDelta / 1200), -4, 4)
          let wealthShift = this.clamp(Math.round(cashDelta / 2500), -3, 3)
          if (!statusShift && !wealthShift) {
            return
          }
          let changed = 0
          this.sortedHouses(society).forEach((house) => {
            let elite = this.socialLevel(house.stratum) >= 4
            let lower = this.socialLevel(house.stratum) <= 2
            let delta = 0
            if (elite) {
              delta += statusShift
            } else if (lower) {
              delta += Math.round(statusShift / 2) + wealthShift
            } else {
              delta += Math.round((statusShift + wealthShift) / 2)
            }
            if (house.rivalry && statusShift > 0) {
              delta -= 1
              house.heat = (house.heat || 0) + 1
            }
            if (delta) {
              house.relation = this.clamp((house.relation || 0) + delta, -100, 100)
              changed += 1
            }
          })
          if (changed && (Math.abs(statusShift) >= 2 || Math.abs(wealthShift) >= 2)) {
            this.log(society, 'Your changing public fortune shifts the mood of ' + changed + ' houses.', statusShift >= 0 || wealthShift >= 0 ? 'support' : 'rivalry')
          }
        },
        simulateHouseTurns(society, state) {
          let houses = this.sortedHouses(society)
          houses.forEach((house) => {
            this.initHouseAI(house)
            this.runHouseEconomy(house)
            this.simulateHouseBanking(society, state, house)
            this.simulateHouseSlaves(society, state, house)
            this.simulateFreedmanRescueAttempts(society, state, house)
            let profile = this.strata[house.stratum] || this.strata.plebeian
            let event = ''
            if (house.agenda === 'office') {
              house.ai.influence = Math.max(0, house.ai.influence - this.randomInt(2, 10))
              house.ai.cash = Math.max(0, house.ai.cash - this.randomInt(0, Math.round((profile.cost || 100) / 10)))
              house.power += this.randomInt(1, 6)
              house.wealth -= this.randomInt(0, Math.round((profile.cost || 100) / 8))
              if (Math.random() < 0.14) {
                event = 'officeCampaign'
                house.power += 8
                house.ai.prestige += 12
                house.stability -= 2
              }
            } else if (house.agenda === 'wealth') {
              if (house.ai.cash > (profile.cost || 200) && Math.random() < 0.35) {
                this.aiBuyProperty(house)
              }
              house.wealth += this.randomInt(10, profile.revenue || 40)
              if (Math.random() < 0.12) {
                event = 'tradeVenture'
                house.wealth += profile.revenue || 20
                house.ai.property.trade += 1
              }
            } else if (house.agenda === 'marriage') {
              house.stability += this.randomInt(0, 4)
              if (Math.random() < 0.10) {
                event = 'marriageAlliance'
                house.power += 3
                if ((house.memberIds || []).length < 8 && society.generatedCharacterIds.length < 140) {
                  this.generateHouseMember(society, state, house)
                }
              }
            } else if (house.agenda === 'security') {
              house.ai.cash += this.randomInt(0, profile.revenue || 20)
              house.stability += this.randomInt(1, 5)
              house.wealth += this.randomInt(0, Math.round((profile.revenue || 20) / 2))
              if (Math.random() < 0.08) {
                event = 'inheritanceDispute'
                house.stability -= 8
              }
            } else if (house.agenda === 'revenge') {
              house.power += this.randomInt(0, 4)
              house.stability -= this.randomInt(0, 3)
              if (Math.random() < 0.13) {
                event = 'feud'
                house.heat = (house.heat || 0) + 1
              }
            } else {
              house.wealth += this.randomInt(0, profile.revenue || 20)
              house.stability += this.randomInt(-1, 2)
            }
            if (house.wealth < 0) {
              house.wealth = 0
              house.stability -= 4
            }
            house.stability = this.clamp(house.stability, 0, 100)
            if (house.stability < 18 && Math.random() < 0.25) {
              event = 'scandal'
              house.power = Math.max(0, house.power - 8)
            }
            if (event) {
              this.recordFamilyEvent(society, house, event)
            }
            this.simulateHouseFamilyLife(society, state, house, houses)
            this.simulateHouseHostileActions(society, state, house, houses)
            house.ai.cash = Math.max(0, Math.round(house.ai.cash))
            house.ai.influence = Math.max(0, Math.round(house.ai.influence))
            house.ai.prestige = Math.max(0, Math.round(house.ai.prestige))
            house.wealth = Math.max(house.wealth || 0, Math.round(house.ai.cash + house.ai.property.land * 60 + house.ai.property.animals * 20 + house.ai.property.trade * 140))
            house.power = Math.max(house.power || 0, Math.round(house.ai.influence / 18 + house.ai.prestige / 2500))
            house.strength = Math.max(1, Math.round((house.strength || 0) * 0.85 + (house.power || 0) * 0.25 + (house.wealth || 0) / 160 + (house.stability || 0) / 8))
            this.updateHouseStratumFromAI(society, house)
          })
        },
        maybeCreateNpcCadetHouses(society, state) {
          if (!society || !society.dynasties || !state || !state.characters) {
            return false
          }
          let created = false
          for (let dynastyId in society.dynasties) {
            if (!society.dynasties.hasOwnProperty(dynastyId)) continue
            let dynasty = society.dynasties[dynastyId]
            let originHouse = this.primaryHouseForDynasty(society, dynastyId)
            if (!originHouse || originHouse.stratum === 'poor') continue
            let houses = this.housesForDynasty(society, dynastyId)
            let limit = this.cadetHouseLimitForStratum(originHouse.stratum || dynasty.stratum)
            if (houses.length >= limit) continue
            let score = this.houseHeadshipScore(originHouse)
            let threshold = originHouse.stratum === 'senatorial' ? 180 : originHouse.stratum === 'equestrian' ? 135 : originHouse.stratum === 'civic' ? 95 : 70
            let chance = originHouse.stratum === 'senatorial' ? 0.018 : originHouse.stratum === 'equestrian' ? 0.014 : 0.008
            if (score < threshold || Math.random() >= chance) continue
            let founder = this.cadetFounderCandidate(society, state, dynastyId, false)
            if (!founder) continue
            if (this.createCadetHouse(society, state, dynastyId, founder, 'npc cadet foundation')) {
              created = true
              state = daapi.getState()
            }
          }
          return created
        },
        updateHouseStratumFromAI(society, house) {
          let previous = house.stratum || 'plebeian'
          let strength = house.strength || 0
          let next = previous
          if (strength >= 120 && previous !== 'senatorial') {
            next = 'senatorial'
          } else if (strength >= 72 && this.socialLevel(previous) < 4) {
            next = 'equestrian'
          } else if (strength >= 38 && this.socialLevel(previous) < 3) {
            next = 'civic'
          } else if (strength >= 18 && this.socialLevel(previous) < 2) {
            next = 'plebeian'
          } else if (strength < 8 && previous !== 'poor') {
            next = 'poor'
          } else if (strength < 15 && this.socialLevel(previous) > 1) {
            next = 'freedmen'
          }
          if (next !== previous) {
            house.stratum = next
            this.log(society, house.name + ' moves from ' + this.stratumTitle(previous) + ' to ' + this.stratumTitle(next) + '.', strength >= 18 ? 'support' : 'scandal', house.id)
          }
        },
        initHouseAI(house) {
          if (!house.agenda) {
            house.agenda = this.pick(['office', 'wealth', 'honor', 'marriage', 'security', 'revenge'])
          }
          if (house.wealth === undefined || house.wealth === null) {
            house.wealth = Math.max(20, Math.round((house.strength || 10) * 18))
          }
          if (house.power === undefined || house.power === null) {
            house.power = Math.max(5, Math.round((house.strength || 10) / 2))
          }
          if (house.stability === undefined || house.stability === null) {
            house.stability = this.randomInt(35, 75)
          }
          if (!house.ai) {
            house.ai = {
              cash: Math.max(50, Math.round((house.wealth || 100) * 0.8)),
              influence: Math.max(10, Math.round((house.power || 10) * 18)),
              prestige: Math.max(0, Math.round(house.prestige || 0)),
              property: {
                land: Math.max(0, Math.round((house.strength || 10) / 18)),
                animals: Math.max(0, Math.round((house.strength || 10) / 22)),
                trade: house.stratum === 'equestrian' || house.agenda === 'wealth' ? 1 : 0
              },
              focus: house.agenda,
              controlledBy: 'cor_society_ai'
            }
          }
          house.ai.property = house.ai.property || {
            land: Math.max(0, Math.round((house.strength || 10) / 18)),
            animals: Math.max(0, Math.round((house.strength || 10) / 22)),
            trade: house.stratum === 'equestrian' || house.agenda === 'wealth' ? 1 : 0
          }
          house.ai.focus = house.ai.focus || house.agenda
          house.ai.controlledBy = 'cor_society_ai'
        },
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
          let targets = this.visibleHousePeople(targetHouse, state)
            .map((id) => {
              let character = state.characters && state.characters[id]
              if (character) character.id = character.id || id
              return character
            })
            .filter((character) => character && !character.isDead && !character.corSocietySlave && this.age(character, state) >= 16)
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
            if (age < 16 || age > 42 || mother.flagCannotGetPregnant || father.flagCannotImpregnate === false) {
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
          for (let characterId in state.characters) {
            if (!state.characters.hasOwnProperty(characterId)) {
              continue
            }
            let child = state.characters[characterId]
            if (!child || child.isDead) {
              continue
            }
            let parents = [child.fatherId, child.motherId]
            if (parents.indexOf(firstId) >= 0 && parents.indexOf(secondId) >= 0) {
              count += 1
            }
          }
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
              delete society.romances[key]
              return
            }
            first.id = first.id || romance.firstId
            second.id = second.id || romance.secondId
            if (this.age(first, state) < 13 || this.age(second, state) < 13) {
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
          if (age < 16 || age > 42 || mother.startedPregnancyTime || mother.flagCannotGetPregnant || father.flagCannotImpregnate === false) {
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
          let best = false
          for (let characterId in state.characters) {
            if (!state.characters.hasOwnProperty(characterId)) {
              continue
            }
            let child = state.characters[characterId]
            if (!child || child.isDead || child.corSocietyPaternityId) {
              continue
            }
            child.id = child.id || characterId
            if (!this.sameCharacterId(child.motherId, record.motherId)) {
              continue
            }
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
            started: this.monthKey(daapi.getState()),
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
          let society = this.ensure()
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
          let society = this.ensure()
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
          let society = this.ensure()
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
          let society = this.ensure()
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
          let society = this.ensure()
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
            slave.monthsOwned = (slave.monthsOwned || 0) + 1
            slave.age = parseFloat(slave.age || 20) + (1 / 12)
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
              let character = state.characters && state.characters[slave.characterId]
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
              this.treatRandomHouseholdMember(state, gain, slave)
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
          for (let characterId in state.characters) {
            if (!state.characters.hasOwnProperty(characterId)) continue
            let character = state.characters[characterId]
            if (!character || character.isDead || character.corSocietySlave || !(parentIds[character.fatherId] || parentIds[character.motherId])) continue
            let parentRecord = parentIds[character.fatherId] || parentIds[character.motherId]
            let age = this.age(character, state)
            if (age > 16) continue
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
              continue
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
          }
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
          if (age < 10 || age > 42 || slave.flagCannotGetPregnant || slave.startedPregnancyTime) {
            return false
          }
          let owner = state.characters && state.characters[ownerId]
          if (!owner || owner.isDead || !this.characterIsMale(owner)) {
            return false
          }
          owner.id = owner.id || ownerId
          if (this.age(owner, state) < 16 || owner.corSocietySlave) {
            return false
          }
          let chance = this.clamp(0.12, 0.12, 0.12)
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
            if (age < 16 || age > 42 || mother.flagCannotGetPregnant || father.flagCannotImpregnate === false) return
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
            ...(society.bank || {})
          }
          let principal = Math.round(parseFloat(society.bank.principal || 0))
          let year = String((state && state.year) || '')
          if (!principal || (state && parseInt(state.month || 0, 10) !== 0) || !year) {
            return false
          }
          if (society.bank.lastPaymentYear === year || society.bank.lastNoticeYear === year) {
            return false
          }
          society.bank.lastNoticeYear = year
          let interest = this.bankInterest(society)
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
                text: 'Pay down principal (' + Math.min(principal, Math.max(50, Math.round(principal * 0.25))) + ')',
                disabled: parseFloat(((state || {}).current || {}).cash || 0) < (interest + Math.min(principal, Math.max(50, Math.round(principal * 0.25)))),
                showDisabledWithTooltip: true,
                tooltip: 'Pay interest plus a chunk of principal.',
                action: {
                  event: this.event,
                  method: 'payBankLoan',
                  context: { amount: Math.min(principal, Math.max(50, Math.round(principal * 0.25))) }
                }
              },
              {
                variant: 'danger',
                text: 'Defer payment',
                tooltip: 'Adds the interest to principal and hurts public standing.',
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
          return false
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
        educateRandomHouseholdChild(state, gain, slave) {
          return this.educateAssignedHouseholdChild(this.load(), state, gain, slave)
        },
        treatRandomHouseholdMember(state, gain, slave) {
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
              this.log(this.load(), slave.name + ' treats ' + this.characterName(character, state) + ' and relieves ' + trait + '.', 'slaves')
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
              let principalPay = Math.min(house.ai.bankPrincipal, Math.max(0, Math.round((house.ai.cash || 0) * 0.08)))
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
        simulateHouseSlaves(society, state, house) {
          if (!house || !house.ai) return
          house.slaveIds = (house.slaveIds || []).filter((characterId) => {
            let character = state.characters && state.characters[characterId]
            return character && !character.isDead && character.corSocietySlaveActive !== false
          })
          let slaves = this.activeSlavesForHouse(house, state)
          let maxSlaves = this.clamp(1 + this.socialLevel(house.stratum), 1, 6)
          if (slaves.length < maxSlaves && house.ai.cash > 180 && Math.random() < (house.agenda === 'wealth' ? 0.08 : 0.035)) {
            let marketCandidate = this.npcEnslavedCandidates(society, state, house)[0]
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
          if (!house || !house.manumittedHouse || house.stratum !== 'freedmen' || !house.ai || Math.random() > 0.045) {
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
          if (!buyerHouse) {
            return []
          }
          let candidates = []
          this.sortedHouses(society).forEach((house) => {
            if (!house || house.id === buyerHouse.id || house.stratum !== 'poor') {
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
        runHouseEconomy(house) {
          let profile = this.strata[house.stratum] || this.strata.plebeian
          let property = house.ai.property || { land: 0, animals: 0, trade: 0 }
          let members = (house.memberIds || []).length || 1
          let income = property.land * 5 + property.animals * 2 + property.trade * 12 + Math.round((profile.revenue || 20) / 4)
          let expenses = members * (house.stratum === 'senatorial' ? 10 : house.stratum === 'equestrian' ? 7 : 4)
          house.ai.cash += income - expenses
          if (house.ai.cash < 0) {
            house.ai.influence = Math.max(0, house.ai.influence - 8)
            house.stability -= 3
          }
          if (house.ai.cash > (profile.cost || 200) * 3 && Math.random() < 0.08) {
            house.agenda = this.pick(['office', 'wealth', 'marriage', 'security'])
            house.ai.focus = house.agenda
          }
        },
        aiBuyProperty(house) {
          let profile = this.strata[house.stratum] || this.strata.plebeian
          let cost = Math.max(100, Math.round((profile.cost || 200) * 0.7))
          if (house.ai.cash < cost) {
            return false
          }
          house.ai.cash -= cost
          let roll = Math.random()
          if (roll < 0.45) {
            house.ai.property.land += 1
          } else if (roll < 0.75) {
            house.ai.property.animals += 2
          } else {
            house.ai.property.trade += 1
          }
          house.stability = this.clamp((house.stability || 50) + 1, 0, 100)
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
          for (let houseId in society.houses) {
            if (!society.houses.hasOwnProperty(houseId)) {
              continue
            }
            let house = society.houses[houseId]
            this.refreshHouseMemberLists(society, state, house)
            let visible = this.visibleHousePeople(house, state)
            if (!visible.length) {
              this.generateHouseSeedMember(society, state, house)
              state = daapi.getState()
              this.refreshHouseMemberLists(society, state, house)
              visible = this.visibleHousePeople(house, state)
            }
            while (visible.length < this.minimumVisibleMembers(house) && (society.generatedCharacterIds || []).length < 260) {
              let head = state.characters[visible[0]]
              if (!head) {
                break
              }
              head.id = head.id || visible[0]
              if (!head.spouseId && this.age(head, state) >= 20 && Math.random() < 0.35) {
                this.generateHouseSpouse(society, state, house, house.stratum || 'plebeian', head)
              } else {
                this.generateRelative(society, state, house, house.stratum || 'plebeian', head)
              }
              state = daapi.getState()
              this.refreshHouseMemberLists(society, state, house)
              visible = this.visibleHousePeople(house, state)
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
          for (let characterId in state.characters) {
            if (state.characters.hasOwnProperty(characterId)) {
              add(characterId)
            }
          }
          house.memberIds = ids
          house.notableIds = ids
            .slice()
            .sort((a, b) => this.characterScore(state.characters[b], state) - this.characterScore(state.characters[a], state))
            .slice(0, 8)
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
            dynastyFeatures: {}
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
            dynastyFeatures: {}
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
                patch.praenomen = this.shortSlaveName(fullName)
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
        },
        simulateInterHouseAffairs(society, state) {
          if (Math.random() > 0.32) {
            return
          }
          let houses = this.sortedHouses(society).filter((house) => house.memberIds && house.memberIds.length)
          if (houses.length < 2) {
            return
          }
          let first = this.pick(houses)
          let second = this.pick(houses.filter((house) => house.id !== first.id))
          if (!first || !second) {
            return
          }
          let relation = this.getHouseRelation(society, first.id, second.id)
          let roll = Math.random()
          if (roll < 0.28) {
            relation = this.changeHouseRelation(society, first.id, second.id, this.randomInt(8, 18))
            first.stability += 2
            second.stability += 2
            this.log(society, first.name + ' and ' + second.name + ' arrange a useful family connection.')
          } else if (roll < 0.56) {
            relation = this.changeHouseRelation(society, first.id, second.id, this.randomInt(4, 12))
            first.wealth += 20
            second.wealth += 20
            this.log(society, first.name + ' and ' + second.name + ' share a profitable compact.')
          } else if (roll < 0.82 || relation < -20) {
            relation = this.changeHouseRelation(society, first.id, second.id, -this.randomInt(8, 20))
            first.stability -= 2
            second.stability -= 2
            this.log(society, first.name + ' clashes with ' + second.name + ' in public.')
          } else {
            first.agenda = 'revenge'
            second.agenda = 'security'
            this.changeHouseRelation(society, first.id, second.id, -25)
            this.log(society, 'A private insult starts a feud between ' + first.name + ' and ' + second.name + '.')
          }
        },
        relationKey(firstId, secondId) {
          return [String(firstId), String(secondId)].sort().join('::')
        },
        getHouseRelation(society, firstId, secondId) {
          let key = this.relationKey(firstId, secondId)
          if (society.houseRelations[key] === undefined) {
            society.houseRelations[key] = this.randomInt(-8, 8)
          }
          return society.houseRelations[key]
        },
        changeHouseRelation(society, firstId, secondId, delta) {
          let key = this.relationKey(firstId, secondId)
          let value = this.getHouseRelation(society, firstId, secondId)
          value = this.clamp(value + delta, -100, 100)
          society.houseRelations[key] = value
          return value
        },
        personalRelationRecord(society, firstId, secondId, create) {
          society.personalRelations = society.personalRelations || {}
          let key = this.relationKey(firstId, secondId)
          if (!society.personalRelations[key] && create !== false) {
            society.personalRelations[key] = {
              firstId,
              secondId,
              score: 0,
              type: 'neutral',
              started: this.monthKey(daapi.getState()),
              updated: this.monthKey(daapi.getState())
            }
          }
          return society.personalRelations[key] || false
        },
        personalRelationScore(society, state, firstId, secondId) {
          let record = this.personalRelationRecord(society, firstId, secondId, false)
          let score = record ? parseFloat(record.score || 0) : 0
          let first = state && state.characters ? state.characters[firstId] : false
          let second = state && state.characters ? state.characters[secondId] : false
          score += this.traitRelationshipModifier(society, first, second, state)
          score += this.traitRelationshipModifier(society, second, first, state)
          return this.clamp(Math.round(score), -100, 100)
        },
        changePersonalRelation(society, firstId, secondId, delta, type) {
          if (!firstId || !secondId || this.sameCharacterId(firstId, secondId)) {
            return 0
          }
          let record = this.personalRelationRecord(society, firstId, secondId, true)
          record.score = this.clamp((record.score || 0) + delta, -100, 100)
          record.type = type || this.relationshipTypeFromScore(record.score)
          record.updated = this.monthKey(daapi.getState())
          return record.score
        },
        relationshipTypeFromScore(score) {
          score = parseFloat(score || 0)
          if (score >= 85) return 'bestFriend'
          if (score >= 55) return 'friend'
          if (score >= 30) return 'admirer'
          if (score <= -80) return 'enemy'
          if (score <= -55) return 'rival'
          if (score <= -30) return 'resentful'
          return 'neutral'
        },
        relationshipLabel(type) {
          let labels = {
            bestFriend: 'Best friend',
            friend: 'Friend',
            mentor: 'Mentor',
            student: 'Student',
            protector: 'Protector',
            admirer: 'Admirer',
            lover: 'Lover',
            rival: 'Rival',
            enemy: 'Enemy',
            traitor: 'Traitor',
            resentful: 'Resentful',
            humiliated: 'Humiliated',
            neutral: 'Neutral'
          }
          return labels[type] || 'Neutral'
        },
        relationBadge(society, state, character) {
          let visual = this.relationVisual(society, state, character)
          return visual ? visual.text + ' ' + visual.label : ''
        },
        relationVisual(society, state, character, options) {
          if (!character || !character.id) {
            return false
          }
          state = state || daapi.getState()
          society = society || this.load()
          let currentId = this.currentCharacterId(state)
          if (!currentId || this.sameCharacterId(currentId, character.id)) {
            return false
          }
          let record = this.personalRelationRecord(society, currentId, character.id, false)
          let useLastKnown = options && options.lastKnownForDead && character.isDead
          let score = useLastKnown && record ? this.clamp(Math.round(record.score || 0), -100, 100) : this.personalRelationScore(society, state, currentId, character.id)
          let type = record && record.type ? record.type : this.relationshipTypeFromScore(score)
          let label = this.relationshipLabel(type)
          return {
            score,
            type,
            label,
            text: this.signed(score),
            tone: this.scoreTone(score),
            icon: this.relationIcon(score, type),
            tooltip: (character.isDead ? 'Last known relation' : 'Relation') + ': ' + this.signed(score) + ' - ' + label
          }
        },
        syncFamilyRelationStatuses(society, state) {
          if (!society || !state || !state.characters) {
            return
          }
          let currentId = this.currentCharacterId(state)
          let active = {}
          let previous = society.relationStatusCharacterIds || []
          this.familyRelationCandidateIds(state).forEach((characterId) => {
            let character = state.characters[characterId]
            if (!character || this.sameCharacterId(characterId, currentId)) {
              return
            }
            character.id = character.id || characterId
            let record = this.personalRelationRecord(society, currentId, characterId, false)
            let visual = this.relationVisual(society, state, character, { lastKnownForDead: true })
            if (!visual) {
              return
            }
            let meaningful = !!record || Math.abs(visual.score || 0) >= 15 || ['friend', 'bestFriend', 'mentor', 'student', 'protector', 'admirer', 'lover', 'rival', 'enemy', 'traitor', 'resentful', 'humiliated'].indexOf(visual.type) >= 0
            if (!meaningful) {
              return
            }
            active[characterId] = true
            try {
              daapi.addCharacterStatus({
                characterId,
                key: 'cor_society_relation',
                status: {
                  title: visual.tooltip,
                  icon: visual.icon,
                  active: true
                }
              })
            } catch (err) {
              console.warn(err)
            }
          })
          previous.forEach((characterId) => {
            if (!active[characterId]) {
              try {
                daapi.setCharacterStatusActive({ characterId, key: 'cor_society_relation', isActive: false })
              } catch (err) {
                try {
                  daapi.deleteCharacterStatus({ characterId, key: 'cor_society_relation' })
                } catch (innerErr) {
                  console.warn(innerErr)
                }
              }
            }
          })
          society.relationStatusCharacterIds = Object.keys(active)
        },
        syncSlaveStatuses(society, state) {
          if (!society || !state || !state.characters) {
            return
          }
          let active = {}
          this.sortedHouses(society).forEach((house) => {
            this.visibleHousePeople(house, state).forEach((characterId) => {
              let character = state.characters[characterId]
              if (!character || character.isDead) return
              if (!(character.corSocietySlave || character.corSocietySlaveMarket || character.corSocietyOrigin === 'enslaved_dependant' || house.stratum === 'poor')) return
              active[characterId] = true
              try {
                daapi.addCharacterStatus({
                  characterId,
                  key: 'cor_society_slave_status',
                  status: {
                    title: 'Society slave: ' + this.slaveOriginDescription(character.corSocietySlaveOrigin || 'unknown'),
                    icon: this.slaveStatusIcon(character.corSocietySlaveOrigin || 'unknown'),
                    active: true
                  }
                })
              } catch (err) {
                console.warn(err)
              }
            })
          })
          ;(society.playerSlaves || []).forEach((record) => {
            if (!record || !record.characterId || active[record.characterId]) return
            let character = state.characters[record.characterId]
            if (!character || character.isDead) return
            active[record.characterId] = true
            try {
              daapi.addCharacterStatus({
                characterId: record.characterId,
                key: 'cor_society_slave_status',
                status: {
                  title: 'Household slave: ' + this.slaveOriginDescription(record.origin || character.corSocietySlaveOrigin || 'unknown'),
                  icon: this.slaveStatusIcon(record.origin || character.corSocietySlaveOrigin || 'unknown'),
                  active: true
                }
              })
            } catch (err) {
              console.warn(err)
            }
          })
          ;(society.slaveStatusCharacterIds || []).forEach((characterId) => {
            if (active[characterId]) return
            try {
              daapi.setCharacterStatusActive({ characterId, key: 'cor_society_slave_status', isActive: false })
            } catch (err) {
              try {
                daapi.deleteCharacterStatus({ characterId, key: 'cor_society_slave_status' })
              } catch (innerErr) {
                console.warn(innerErr)
              }
            }
          })
          society.slaveStatusCharacterIds = Object.keys(active)
        },
        slaveStatusIcon(origin) {
          let short = String(origin || 'SL').slice(0, 2).toUpperCase()
          return this.svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">' +
            '<rect x="8" y="8" width="56" height="56" rx="14" fill="#242424" stroke="#b8b8b8" stroke-width="4"/>' +
            '<path d="M18 29 C24 20 34 20 40 29 M32 29 C38 20 48 20 54 29" fill="none" stroke="#d5d5d5" stroke-width="6" stroke-linecap="round"/>' +
            '<path d="M18 43 H54" stroke="#d5d5d5" stroke-width="6" stroke-linecap="round"/>' +
            '<circle cx="18" cy="29" r="5" fill="#777"/><circle cx="40" cy="29" r="5" fill="#777"/><circle cx="32" cy="29" r="5" fill="#777"/><circle cx="54" cy="29" r="5" fill="#777"/>' +
            '<text x="36" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#fff">' + this.escapeSvg(short) + '</text>' +
            '</svg>')
        },
        relationIcon(score, type) {
          score = parseFloat(score || 0)
          type = type || this.relationshipTypeFromScore(score)
          let tone = this.scoreTone(score)
          let colors = {
            good: ['#2f855a', '#9ae6b4'],
            calm: ['#2b6cb0', '#90cdf4'],
            neutral: ['#4a5568', '#cbd5e0'],
            warn: ['#b7791f', '#fbd38d'],
            bad: ['#9b2c2c', '#feb2b2']
          }
          let pair = colors[tone] || colors.neutral
          let glyph = '<path d="M20 38 C20 28 29 24 36 31 C43 24 52 28 52 38 C52 49 36 56 36 56 C36 56 20 49 20 38 Z" fill="' + pair[1] + '"/>'
          if (score <= -30 || type === 'enemy' || type === 'rival' || type === 'traitor') {
            glyph = '<path d="M22 17 L43 32 L31 32 L45 49 L20 31 L33 31 Z" fill="' + pair[1] + '"/>'
          } else if (score < 15 && score > -15) {
            glyph = '<path d="M20 35 H52" stroke="' + pair[1] + '" stroke-width="8" stroke-linecap="round"/>'
          } else if (type === 'mentor' || type === 'student' || type === 'protector') {
            glyph = '<path d="M18 45 C25 31 47 31 54 45" fill="none" stroke="' + pair[1] + '" stroke-width="7" stroke-linecap="round"/><circle cx="36" cy="26" r="8" fill="' + pair[1] + '"/>'
          }
          let scoreText = this.escapeSvg(this.signed(score))
          return this.svgDataUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="33" fill="' + pair[0] + '"/><circle cx="36" cy="36" r="29" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/><g transform="translate(0 -4)">' + glyph + '</g><rect x="16" y="52" width="40" height="15" rx="7.5" fill="rgba(0,0,0,.48)"/><text x="36" y="63.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="#fff">' + scoreText + '</text></svg>')
        },
        relationBadgeHtml(visual) {
          if (!visual) {
            return ''
          }
          return '<span class="cor-society-relation-badge cor-society-tone-' + this.escapeHtml(visual.tone) + '" title="' + this.escapeHtml(visual.tooltip) + '">' +
            this.summaryIcon(visual.icon, 'Relation') +
            '<strong>' + this.escapeHtml(visual.text) + '</strong>' +
            '<span>' + this.escapeHtml(visual.label) + '</span>' +
            '</span>'
        },
        traitRelationshipModifier(society, source, target, state) {
          if (!source || !target) {
            return 0
          }
          let sourceTraits = this.societyTraitsForCharacter(society, source.id)
          let targetTraits = this.societyTraitsForCharacter(society, target.id)
          let modifier = 0
          let spouse = source.spouseId && this.sameCharacterId(source.spouseId, target.id)
          if (sourceTraits.indexOf('adulterer') >= 0 && spouse) modifier -= 28
          if (sourceTraits.indexOf('faithful') >= 0 && spouse) modifier += 12
          if (sourceTraits.indexOf('liar') >= 0 && this.characterHasTrait(society, target, 'honorable')) modifier -= 10
          if (sourceTraits.indexOf('manipulator') >= 0 && this.characterHasTrait(society, target, 'trusting')) modifier -= 6
          if (sourceTraits.indexOf('charitable') >= 0) modifier += 4
          if (sourceTraits.indexOf('cruel') >= 0) modifier -= 8
          if (sourceTraits.indexOf('gossip') >= 0 && spouse) modifier -= 6
          if (sourceTraits.indexOf('ambitious') >= 0 && targetTraits.indexOf('ambitious') >= 0) modifier += 3
          return modifier
        },
        societyTraitIconList(society, character) {
          return this.societyTraitsForCharacter(society, character && character.id)
            .slice(0, 4)
            .map((trait) => this.traitIcon(trait))
        },
        driftRelations(society) {
          for (let houseId in society.houses) {
            if (!society.houses.hasOwnProperty(houseId)) {
              continue
            }
            let house = society.houses[houseId]
            if (house.relation > 4) {
              house.relation -= 1
            } else if (house.relation < -4) {
              house.relation += 1
            }
            house.heat = Math.max(0, (house.heat || 0) - 1)
            if (house.favor > 0 && Math.random() < 0.06) {
              house.favor -= 1
            }
          }
        },
        applyNetworkModifiers(society) {
          let allyIncome = 0
          for (let houseId in society.houses) {
            if (!society.houses.hasOwnProperty(houseId)) {
              continue
            }
            let house = society.houses[houseId]
            let profile = this.strata[house.stratum] || this.strata.plebeian
            if ((house.relation || 0) >= 55 || (house.favor || 0) >= 2) {
              allyIncome += Math.max(1, Math.round((profile.revenue || 20) * ((house.relation || 50) / 100)))
            }
          }
          try {
            daapi.removeAdditiveModifier({ key: 'revenue', id: 'cor_society_network_income' })
            daapi.removeAdditiveModifier({ key: 'revenue', id: 'cor_society_rival_pressure' })
          } catch (err) {
            console.warn(err)
          }
          if (allyIncome > 0) {
            daapi.addAdditiveModifier({
              key: 'revenue',
              id: 'cor_society_network_income',
              durationInMonths: 2,
              amount: allyIncome
            })
          }
        },
        resolvePendingVentures(society, state) {
          society.pendingVentures = society.pendingVentures || []
          let due = society.pendingVentures.find((venture) => {
            return venture && !venture.notified && this.monthKeyReached(venture.due, state)
          })
          if (!due) {
            return
          }
          due.notified = true
          let house = society.houses[due.houseId] || {}
          let success = due.roll >= 0.28
          let payout = success ? Math.max(1, Math.round(due.expected * (0.75 + due.roll))) : 0
          due.payout = payout
          due.success = success
          this.save(society)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            title: success ? 'Venture returns' : 'Venture fails',
            message: 'House: ' + (house.name || 'Unknown house') + '\nThe trade venture has reached its settlement month.\nResult: ' + (success ? 'your share is ready to collect.' : 'the opening failed and produced no profit.'),
            image: this.affairIcon('tradeVenture'),
            options: [
              {
                variant: success ? 'info' : 'warning',
                text: success ? 'Collect your share' : 'Accept the loss',
                statChanges: success ? { cash: payout } : {},
                action: {
                  event: this.event,
                  method: 'collectVentureResult',
                  context: { ventureId: due.id }
                }
              }
            ]
          })
        },
        queueFamilyCareEvent(society, state) {
          if (!society || !state || !state.characters) {
            return false
          }
          if (society.lastFamilyCareEventMonth && this.monthIndex(this.monthKey(state)) - this.monthIndex(society.lastFamilyCareEventMonth) < 4) {
            return false
          }
          let candidates = this.playerFamilyMembers(state).filter((character) => {
            return character && !character.isDead && this.distressTrait(character)
          })
          if (!candidates.length || Math.random() > 0.45) {
            return false
          }
          let character = this.pick(candidates)
          character.id = character.id || this.playerFamilyMemberIds(state).find((id) => state.characters[id] === character) || character.id
          let trait = this.distressTrait(character)
          let cost = this.familyCareCost(state, trait)
          society.lastFamilyCareEventMonth = this.monthKey(state)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            title: 'Family needs care',
            message: this.characterName(character, state) + ' is suffering from ' + this.distressTraitLabel(trait) + '. Your household can respond.',
            image: this.traitStatusIcon(trait),
            options: [
              {
                variant: 'info',
                text: 'Arrange treatment',
                tooltip: 'Spend cash for the best chance to remove the condition and improve family rapport.',
                statChanges: { cash: -cost, prestige: 3 },
                icons: [this.traitStatusIcon(trait), this.affairIcon('coins')],
                action: {
                  event: this.event,
                  method: 'treatFamilyMember',
                  context: { characterId: character.id, trait, cost }
                }
              },
              {
                text: 'Let them rest',
                tooltip: 'No cash cost. Moderate chance to improve stress or depression; less effective for illness.',
                icons: [this.affairIcon('support')],
                action: {
                  event: this.event,
                  method: 'comfortFamilyMember',
                  context: { characterId: character.id, trait }
                }
              },
              {
                variant: 'warning',
                text: 'Ignore it',
                tooltip: 'No immediate cost, but relation may worsen and prestige can suffer.',
                icons: [this.affairIcon('rivalry')],
                action: {
                  event: this.event,
                  method: 'ignoreFamilyDistress',
                  context: { characterId: character.id, trait }
                }
              }
            ]
          })
          return true
        },
        distressTrait(character) {
          let traits = (character && character.traits) || []
          let order = ['illness', 'sick', 'ill', 'wounded', 'depressed', 'highlyStress', 'stress']
          for (let i = 0; i < order.length; i++) {
            if (traits.indexOf(order[i]) >= 0) {
              return order[i]
            }
          }
          return ''
        },
        distressTraitLabel(trait) {
          let labels = {
            illness: 'illness',
            sick: 'sickness',
            ill: 'illness',
            wounded: 'wounds',
            depressed: 'depression',
            highlyStress: 'severe stress',
            stress: 'stress'
          }
          return labels[trait] || String(trait || 'trouble')
        },
        traitStatusIcon(trait) {
          try {
            if (trait === 'illness' || trait === 'sick' || trait === 'ill') return daapi.requireImage('icons/traits/illness.svg')
            if (trait === 'wounded') return daapi.requireImage('icons/traits/illness.svg')
            if (trait === 'depressed' || trait === 'stress' || trait === 'highlyStress') return daapi.requireImage('icons/traits/stress.svg')
            return daapi.requireImage('icons/traits/' + trait + '.svg')
          } catch (err) {
            return this.affairIcon('support')
          }
        },
        familyCareCost(state, trait) {
          let cash = Math.max(0, parseFloat((state.current && state.current.cash) || 0))
          let factor = trait === 'illness' || trait === 'sick' || trait === 'ill' || trait === 'wounded' ? 0.18 : 0.08
          return Math.max(2, Math.min(Math.max(2, Math.round(cash * factor)), trait === 'illness' ? 90 : 45))
        },
        treatFamilyMember({ characterId, trait, cost }) {
          let state = daapi.getState()
          let character = state.characters && state.characters[characterId]
          if (!character) {
            this.openHub()
            return
          }
          let success = Math.random() < (trait === 'illness' || trait === 'sick' || trait === 'ill' || trait === 'wounded' ? 0.62 : 0.78)
          this.applyStats({ cash: -parseInt(cost || this.familyCareCost(state, trait), 10), prestige: success ? 3 : 0 })
          if (success) {
            this.removeCharacterTrait(characterId, trait)
          }
          let society = this.ensure()
          this.changePersonalRelation(society, this.currentCharacterId(state), characterId, success ? 12 : 4, success ? 'protector' : 'neutral')
          this.save(society)
          this.pushModal({
            title: success ? 'Care succeeds' : 'Care helps a little',
            message: success ? this.characterName(character, state) + ' recovers from ' + this.distressTraitLabel(trait) + '.' : this.characterName(character, state) + ' is not fully recovered, but the household notices your care.',
            image: this.traitStatusIcon(trait),
            options: [{ text: 'Good' }]
          })
        },
        comfortFamilyMember({ characterId, trait }) {
          let state = daapi.getState()
          let character = state.characters && state.characters[characterId]
          if (!character) {
            this.openHub()
            return
          }
          let success = Math.random() < (trait === 'stress' || trait === 'highlyStress' || trait === 'depressed' ? 0.55 : 0.22)
          if (success) {
            this.removeCharacterTrait(characterId, trait)
          }
          let society = this.ensure()
          this.changePersonalRelation(society, this.currentCharacterId(state), characterId, success ? 10 : 5, 'protector')
          this.save(society)
          this.pushModal({
            title: success ? 'Rest restores them' : 'Rest is not enough',
            message: success ? this.characterName(character, state) + ' improves after rest and family attention.' : this.characterName(character, state) + ' appreciates the attention, but the problem remains.',
            image: this.traitStatusIcon(trait),
            options: [{ text: 'Continue' }]
          })
        },
        ignoreFamilyDistress({ characterId, trait }) {
          let state = daapi.getState()
          let character = state.characters && state.characters[characterId]
          let society = this.ensure()
          this.applyStats({ prestige: -2 })
          this.changePersonalRelation(society, this.currentCharacterId(state), characterId, -8, 'resentful')
          this.save(society)
          this.pushModal({
            title: 'Problem ignored',
            message: (character ? this.characterName(character, state) : 'A relative') + ' receives no help. Family feeling worsens.',
            image: this.affairIcon('rivalry'),
            options: [{ text: 'So be it' }]
          })
        },
        removeCharacterTrait(characterId, trait) {
          let state = daapi.getState()
          let character = state.characters && state.characters[characterId]
          if (!character || !trait) {
            return false
          }
          let traits = (character.traits || []).filter((item) => item !== trait)
          try {
            daapi.updateCharacter({ characterId, character: { traits } })
            character.traits = traits
            daapi.forceUpdateCharacterDisplay({ characterId })
            return true
          } catch (err) {
            console.warn(err)
            return false
          }
        },
        queueMonthlyEvent(society, state) {
          let houses = this.sortedHouses(society).filter((house) => house.memberIds && house.memberIds.length)
          if (!houses.length) {
            return
          }
          let pending = houses.filter((house) => house.pendingPlayerEvent)
          if (pending.length) {
            this.eventFamilyAffair(society, this.pick(pending))
            return
          }
          let hostile = houses.filter((house) => house.rivalry || house.relation <= -45)
          let friendly = houses.filter((house) => house.relation >= 35)
          let lower = houses.filter((house) => ['plebeian', 'freedmen', 'poor'].indexOf(house.stratum) >= 0)
          let capturable = this.knownEnslavedCandidates(society, state).filter((item) => item.house && item.house.stratum === 'poor' && item.info.visible)
          let roll = Math.random()
          if (hostile.length && roll < 0.35) {
            this.eventRivalSlander(society, this.pick(hostile))
          } else if (friendly.length && roll < 0.68) {
            this.eventFriendlyOpening(society, this.pick(friendly))
          } else if (capturable.length && roll < 0.82) {
            this.eventSlaveCaptureOpportunity(society, this.pick(capturable))
          } else if (lower.length) {
            this.eventPetition(society, this.pick(lower))
          } else {
            this.eventFamilyInvitation(society, this.pick(houses))
          }
        },
        eventFamilyAffair(society, house) {
          let event = house.pendingPlayerEvent
          let state = daapi.getState()
          let image = this.affairIcon(event)
          this.save(society)
          if (event === 'officeCampaign') {
            this.pushModal({
              corTranslatorPretranslateNow: true,
              disableSocietyClose: true,
              title: 'House seeks office',
              message: 'House: ' + house.name + '\nThis house is gathering support for a magistracy. They ask whether your household will be seen beside them.',
              image: image,
              options: [
                {
                  variant: 'info',
                  text: 'Endorse them',
                  statChanges: { influence: -45, prestige: 10 },
                  action: {
                    event: this.event,
                    method: 'endorseOffice',
                    context: { houseId: house.id }
                  }
                },
                {
                  text: 'Stay out of it',
                  action: {
                    event: this.event,
                    method: 'declineFamilyAffair',
                    context: { houseId: house.id }
                  }
                }
              ]
            })
          } else if (event === 'marriageAlliance') {
            let weddingCost = this.actionCost(house, 'wedding')
            this.pushModal({
              corTranslatorPretranslateNow: true,
              disableSocietyClose: true,
              title: 'Wedding politics',
              message: 'House: ' + house.name + '\nThis house invites your household to honor a marriage alliance. A gift would be noticed; absence would be noticed too.',
              image: image,
              options: [
                {
                  text: 'Send a wedding gift',
                  statChanges: { cash: -weddingCost, prestige: 5 },
                  action: {
                    event: this.event,
                    method: 'honorWedding',
                    context: { houseId: house.id }
                  }
                },
                {
                  text: 'Offer only words',
                  action: {
                    event: this.event,
                    method: 'declineFamilyAffair',
                    context: { houseId: house.id }
                  }
                }
              ]
            })
          } else if (event === 'inheritanceDispute') {
            this.pushModal({
              corTranslatorPretranslateNow: true,
              disableSocietyClose: true,
              title: 'Inheritance dispute',
              message: 'House: ' + house.name + '\nA dispute inside this house has become public. They ask you to lend judgment and pressure.',
              image: image,
              options: [
                {
                  variant: 'warning',
                  text: 'Intervene',
                  statChanges: { influence: -30 },
                  action: {
                    event: this.event,
                    method: 'judgeInheritance',
                    context: { houseId: house.id }
                  }
                },
                {
                  text: 'Let them quarrel',
                  action: {
                    event: this.event,
                    method: 'declineFamilyAffair',
                    context: { houseId: house.id }
                  }
                }
              ]
            })
          } else if (event === 'tradeVenture') {
            let offer = this.ventureOffer(house)
            this.pushModal({
              corTranslatorPretranslateNow: true,
              disableSocietyClose: true,
              title: 'Trade venture',
              message: 'House: ' + house.name + '\nThis house has found a profitable opening and offers you a place in the venture.\nCost: ' + offer.cost + ' cash.\nExpected result: about ' + offer.expected + ' cash in ' + offer.months + ' months if the venture succeeds.',
              image: image,
              options: [
                {
                  variant: 'info',
                  text: 'Invest with them',
                  statChanges: { cash: -offer.cost },
                  action: {
                    event: this.event,
                    method: 'investVenture',
                    context: { houseId: house.id, cost: offer.cost, expected: offer.expected, months: offer.months }
                  }
                },
                {
                  text: 'Decline',
                  action: {
                    event: this.event,
                    method: 'declineFamilyAffair',
                    context: { houseId: house.id, kind: 'tradeVenture' }
                  }
                }
              ]
            })
          } else if (event === 'scandal') {
            this.pushModal({
              corTranslatorPretranslateNow: true,
              disableSocietyClose: true,
              title: 'House scandal',
              message: 'House: ' + house.name + '\nThis house has been embarrassed by a scandal. You can shield them, exploit it, or let the city talk.',
              image: image,
              options: [
                {
                  text: 'Shield them',
                  statChanges: { influence: -35, prestige: -4 },
                  action: {
                    event: this.event,
                    method: 'shieldScandal',
                    context: { houseId: house.id }
                  }
                },
                {
                  variant: 'danger',
                  text: 'Exploit it',
                  statChanges: { influence: 50, prestige: 6 },
                  action: {
                    event: this.event,
                    method: 'exploitScandal',
                    context: { houseId: house.id }
                  }
                },
                {
                  text: 'Do nothing',
                  action: {
                    event: this.event,
                    method: 'declineFamilyAffair',
                    context: { houseId: house.id }
                  }
                }
              ]
            })
          } else {
            this.eventRivalSlander(society, house)
          }
        },
        eventRivalSlander(society, house) {
          let state = daapi.getState()
          this.save(society)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            disableSocietyClose: true,
            title: 'Rival rumor',
            message: 'House: ' + house.name + '\nYour rivals are whispering that your household has overreached its station. The rumor is small now, but it has teeth.',
            image: this.affairIcon('slander'),
            options: [
              {
                variant: 'warning',
                text: 'Answer publicly',
                tooltip: 'Spend influence to blunt the attack and make the rivalry hotter.',
                statChanges: { influence: -35, prestige: 4 },
                action: {
                  event: this.event,
                  method: 'answerSlander',
                  context: { houseId: house.id }
                }
              },
              {
                text: 'Ignore it',
                tooltip: 'Lose some prestige, but avoid making the quarrel worse.',
                statChanges: { prestige: -10 },
                action: {
                  event: this.event,
                  method: 'ignoreSlander',
                  context: { houseId: house.id }
                }
              }
            ]
          })
        },
        eventFriendlyOpening(society, house) {
          let state = daapi.getState()
          this.save(society)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            disableSocietyClose: true,
            title: 'Political opening',
            message: 'House: ' + house.name + '\nA friendly contact suggests a public exchange of support. It would strengthen your network, though it may bind you to their interests.',
            image: this.affairIcon('support'),
            options: [
              {
                variant: 'info',
                text: 'Accept their support',
                statChanges: { influence: 60 },
                action: {
                  event: this.event,
                  method: 'acceptOpening',
                  context: { houseId: house.id }
                }
              },
              {
                text: 'Stay independent',
                statChanges: { prestige: 3 },
                action: {
                  event: this.event,
                  method: 'declineOpening',
                  context: { houseId: house.id }
                }
              }
            ]
          })
        },
        eventSlaveCaptureOpportunity(society, item) {
          let state = daapi.getState()
          if (!item || !item.house || !item.character) {
            return false
          }
          let cost = Math.max(35, Math.round((item.info && item.info.cost ? item.info.cost : 120) * 0.45))
          this.save(society)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            disableSocietyClose: true,
            title: 'Slave capture opportunity',
            message: 'House: ' + item.house.name + '\nBrokers and retainers report that ' + this.slaveDisplayName(item.character, null, state) + ' can be seized from a vulnerable slave kin group.\nOrigin: ' + this.slaveOriginDescription(item.character.corSocietySlaveOrigin || 'unknown') + '\nThis is not a polite purchase; the origin house will resent it.',
            image: this.characterPortrait(item.character, state, item.house),
            options: [
              {
                variant: 'danger',
                text: 'Fund the capture (' + cost + ')',
                statChanges: { cash: -cost, influence: -10 },
                icons: [this.slaveTypeIcon(item.info.type), this.affairIcon('rivalry')],
                action: {
                  event: this.event,
                  method: 'captureEnslavedCharacter',
                  context: { houseId: item.house.id, characterId: item.character.id, cost }
                }
              },
              {
                text: 'Leave them',
                tooltip: 'No action. The person remains in their current Society house.',
                action: {
                  event: this.event,
                  method: 'declineFamilyAffair',
                  context: { houseId: item.house.id, kind: 'slaveCapture' }
                }
              }
            ]
          })
          return true
        },
        eventPetition(society, house) {
          let state = daapi.getState()
          this.save(society)
          let petitionCost = this.petitionCost(house)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            disableSocietyClose: true,
            title: 'Local petition',
            message: 'House: ' + house.name + '\nA lesser family connected to this house asks for your help in a local dispute. It is not glamorous politics, but gratitude from the lower orders can travel far.',
            image: this.affairIcon('petition'),
            options: [
              {
                variant: 'info',
                text: 'Hear their petition',
                statChanges: { cash: -petitionCost, prestige: 7 },
                action: {
                  event: this.event,
                  method: 'supportPetition',
                  context: { houseId: house.id }
                }
              },
              {
                text: 'Send them away',
                action: {
                  event: this.event,
                  method: 'refusePetition',
                  context: { houseId: house.id }
                }
              }
            ]
          })
        },
        eventFamilyInvitation(society, house) {
          let state = daapi.getState()
          this.save(society)
          let invitationCost = this.invitationCost(house)
          this.pushModal({
            corTranslatorPretranslateNow: true,
            disableSocietyClose: true,
            title: 'Family invitation',
            message: 'House: ' + house.name + '\nThis house invites your household to a public family occasion. Attending would cost time and gifts, but the city notices who stands beside whom.',
            image: this.affairIcon('invitation'),
            options: [
              {
                variant: 'info',
                text: 'Attend',
                tooltip: 'Spend a little cash for prestige and better relations.',
                statChanges: { cash: -invitationCost, prestige: 10 },
                action: {
                  event: this.event,
                  method: 'attendFamilyInvitation',
                  context: { houseId: house.id }
                }
              },
              {
                text: 'Decline',
                tooltip: 'Avoid the cost, but the house may feel slighted.',
                action: {
                  event: this.event,
                  method: 'declineFamilyInvitation',
                  context: { houseId: house.id }
                }
              }
            ]
          })
        },
        openHub() {
          let state = daapi.getState()
          let society = this.ensure()
          let counts = this.countByStratum(society)
          let rivals = this.rivalHouses(society).length
          let allies = this.alliedHouses(society).length
          let playerStatus = this.playerSocietyStatus(state)
          this.pushModal({
            societyMenu: true,
            title: 'Roman Society',
            message: 'Roman Society overview.',
            societySummaryOptions: this.hubSummaryOptions(state, society, counts, rivals, allies, playerStatus),
            image: daapi.requireImage('/cor_society/icon.svg'),
            options: [
              {
                variant: 'info',
                text: 'Bank of Rome',
                icons: [this.bundledIcon('bank_of_rome', 'money')],
                action: {
                  event: this.event,
                  method: 'openBankOfRome'
                }
              },
              {
                variant: 'info',
                text: 'Household Slaves (' + (society.playerSlaves || []).length + ')',
                icons: [this.slaveTypeIcon('household')],
                action: {
                  event: this.event,
                  method: 'openHouseholdSlaves'
                }
              },
              ...this.stratumOrder.map((stratum) => {
                return {
                  text: this.strata[stratum].title + ' (' + (counts[stratum] || 0) + ')',
                  icons: [this.stratumIcon(stratum)],
                  action: {
                    event: this.event,
                    method: 'openEstate',
                    context: { stratum, page: 0 }
                  }
                }
              }),
              {
                text: 'Allies and patrons (' + allies + ')',
                icons: [this.affairIcon('support')],
                action: {
                  event: this.event,
                  method: 'openAllies'
                }
              },
              {
                text: 'Rivals (' + rivals + ')',
                icons: [this.affairIcon('rivalry')],
                action: {
                  event: this.event,
                  method: 'openRivals'
                }
              },
              {
                text: 'Past affairs',
                icons: [this.affairIcon('log')],
                action: {
                  event: this.event,
                  method: 'openLog'
                }
              },
              {
                text: 'Close'
              }
            ]
          })
        },
        openEstate({ stratum, page }) {
          let society = this.ensure()
          let state = daapi.getState()
          page = parseInt(page || 0, 10)
          let dynasties = this.sortedDynasties(society).filter((dynasty) => {
            let house = this.primaryHouseForDynasty(society, dynasty.id) || {}
            return (dynasty.stratum || house.stratum || 'plebeian') === stratum
          })
          let pageSize = 8
          let start = page * pageSize
          let shown = dynasties.slice(start, start + pageSize)
          let options = shown.map((dynasty) => {
            let house = this.primaryHouseForDynasty(society, dynasty.id) || {}
            return {
              text: this.dynastyOptionText(society, dynasty),
              tooltip: this.dynastyTooltip(society, dynasty),
              icons: [this.houseCrestIcon(society, house), this.housePortrait(house, state)],
              action: {
                event: this.event,
                method: 'openDynasty',
                context: { dynastyId: dynasty.id, stratum, page }
              }
            }
          })
          if (start + pageSize < dynasties.length) {
            options.push({
              text: 'Next page',
              action: {
                event: this.event,
                method: 'openEstate',
                context: { stratum, page: page + 1 }
              }
            })
          }
          if (page > 0) {
            options.push({
              text: 'Previous page',
              action: {
                event: this.event,
                method: 'openEstate',
                context: { stratum, page: page - 1 }
              }
            })
          }
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHub'
            }
          })
          this.pushModal({
            societyMenu: true,
            title: this.strata[stratum].title,
            message: shown.length ? 'Choose a dynasty to inspect. Each dynasty can contain one or more houses.' : 'No dynasties are known in this order yet.',
            image: this.stratumIcon(stratum),
            options
          })
        },
        openDynasty({ dynastyId, stratum, page } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let dynasty = society.dynasties && society.dynasties[dynastyId]
          if (!dynasty) {
            this.openHub()
            return
          }
          let houses = this.housesForDynasty(society, dynastyId)
          let headHouse = society.houses[dynasty.headHouseId] || this.primaryHouseForDynasty(society, dynastyId)
          let originHouse = society.houses[dynasty.originHouseId] || this.primaryHouseForDynasty(society, dynastyId)
          let rootId = this.dynastyTreeFocusId(society, state, dynastyId)
          let options = []
          if (rootId) {
            options.push({
              variant: 'info',
              text: 'Full dynasty tree',
              tooltip: 'Opens the total graphical tree for this dynasty, across all known houses.',
              icons: [this.affairIcon('familyTree')],
              action: { event: this.event, method: 'openDynastyTree', context: { dynastyId, stratum, page: page || 0 } }
            })
          }
          options.push(...houses.map((house) => {
            let labels = []
            if (originHouse && house.id === originHouse.id) labels.push('origin')
            if (headHouse && house.id === headHouse.id) labels.push('dynasty head')
            return {
              text: house.name + (labels.length ? ' (' + labels.join(', ') + ')' : ''),
              tooltip: this.houseTooltip(house) + '\nBranch: ' + (house.branchName || 'House branch'),
              icons: [this.houseCrestIcon(society, house), this.housePortrait(house, state)],
              action: { event: this.event, method: 'openHouse', context: { houseId: house.id, returnTo: 'dynasty', returnPage: page || 0 } }
            }
          }))
          let createInfo = this.playerCadetHouseInfo(society, state, dynasty)
          if (createInfo.visible) {
            options.push({
              variant: 'info',
              text: 'Found cadet house' + (createInfo.available ? '' : ' (' + createInfo.reason + ')'),
              disabled: !createInfo.available,
              showDisabledWithTooltip: true,
              tooltip: createInfo.tooltip,
              icons: [this.affairIcon('familyTree'), this.affairIcon('prestige')],
              action: { event: this.event, method: 'createPlayerCadetHouse', context: { dynastyId } }
            })
          }
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openEstate', context: { stratum: stratum || (headHouse && headHouse.stratum) || dynasty.stratum || 'plebeian', page: page || 0 } }
          })
          this.pushModal({
            societyMenu: true,
            title: dynasty.name,
            message: 'Dynasty overview.',
            societySummaryOptions: this.dynastySummaryOptions(society, state, dynasty, houses, headHouse, originHouse),
            image: headHouse ? this.houseCrestIcon(society, headHouse) : this.affairIcon('familyTree'),
            options
          })
        },
        createPlayerCadetHouse({ dynastyId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let dynasty = society.dynasties && society.dynasties[dynastyId]
          let info = this.playerCadetHouseInfo(society, state, dynasty)
          if (!info.available) {
            this.pushModal({
              societyMenu: true,
              title: 'Cadet house unavailable',
              message: info.tooltip || 'This dynasty cannot create a cadet house right now.',
              image: this.affairIcon('familyTree'),
              options: [{ text: 'Back', action: { event: this.event, method: 'openDynasty', context: { dynastyId } } }]
            })
            return
          }
          this.applyStats({ cash: -info.cost.cash, prestige: -info.cost.prestige, influence: -info.cost.influence })
          let house = this.createCadetHouse(society, state, dynastyId, info.candidate, 'player branch foundation')
          this.save(society)
          if (house) {
            this.openHouse({ houseId: house.id, returnTo: 'dynasty' })
          } else {
            this.openDynasty({ dynastyId })
          }
        },
        openRelations() {
          this.openAllies()
        },
        openAllies({ page } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let houses = this.alliedHouses(society)
          page = parseInt(page || 0, 10)
          let pageSize = 10
          let start = page * pageSize
          let shown = houses.slice(start, start + pageSize)
          let options = shown.map((house) => {
            return {
              text: this.houseOptionText(house),
              tooltip: this.houseTooltip(house),
              icons: [this.houseCrestIcon(society, house), this.housePortrait(house, state)],
              action: {
                event: this.event,
                method: 'openHouse',
                context: { houseId: house.id, returnTo: 'allies', returnPage: page }
              }
            }
          })
          if (start + pageSize < houses.length) {
            options.push({
              text: 'Next page',
              action: {
                event: this.event,
                method: 'openAllies',
                context: { page: page + 1 }
              }
            })
          }
          if (page > 0) {
            options.push({
              text: 'Previous page',
              action: {
                event: this.event,
                method: 'openAllies',
                context: { page: page - 1 }
              }
            })
          }
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHub'
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Allies and Patrons',
            message: houses.length ? 'These houses currently support, favor, or owe your household.\nPage ' + (page + 1) + ' of ' + Math.max(1, Math.ceil(houses.length / pageSize)) + '.' : 'No allies, patrons, or favors yet.',
            image: this.affairIcon('support'),
            options
          })
        },
        openRivals({ page } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let houses = this.rivalHouses(society)
          page = parseInt(page || 0, 10)
          let pageSize = 10
          let start = page * pageSize
          let shown = houses.slice(start, start + pageSize)
          let options = shown.map((house) => {
            return {
              text: this.houseOptionText(house),
              tooltip: this.houseTooltip(house),
              icons: [this.houseCrestIcon(society, house), this.housePortrait(house, state)],
              action: {
                event: this.event,
                method: 'openHouse',
                context: { houseId: house.id, returnTo: 'rivals', returnPage: page }
              }
            }
          })
          if (start + pageSize < houses.length) {
            options.push({
              text: 'Next page',
              action: {
                event: this.event,
                method: 'openRivals',
                context: { page: page + 1 }
              }
            })
          }
          if (page > 0) {
            options.push({
              text: 'Previous page',
              action: {
                event: this.event,
                method: 'openRivals',
                context: { page: page - 1 }
              }
            })
          }
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHub'
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Rival Houses',
            message: houses.length ? 'These houses oppose, resent, or openly rival your household.\nPage ' + (page + 1) + ' of ' + Math.max(1, Math.ceil(houses.length / pageSize)) + '.' : 'No serious rivalries yet.',
            image: this.affairIcon('rivalry'),
            options
          })
        },
        openLog({ page } = {}) {
          let society = this.ensure()
          page = parseInt(page || 0, 10)
          let entries = (society.log || []).map((entry, index) => this.normalizeLogEntry(entry, index))
          let pageSize = this.historyPageSize || 8
          let start = page * pageSize
          let shown = entries.slice(start, start + pageSize)
          let options = shown.map((entry) => {
            return {
              text: this.shortText(entry.text, 68),
              tooltip: entry.text,
              icons: [this.affairIcon(entry.kind)],
              action: {
                event: this.event,
                method: 'openLogEntry',
                context: { index: entry.index, page }
              }
            }
          })
          if (start + pageSize < entries.length) {
            options.push({
              text: 'Next page',
              action: {
                event: this.event,
                method: 'openLog',
                context: { page: page + 1 }
              }
            })
          }
          if (page > 0) {
            options.push({
              text: 'Previous page',
              action: {
                event: this.event,
                method: 'openLog',
                context: { page: page - 1 }
              }
            })
          }
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHub'
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Past Affairs',
            message: entries.length ? 'Choose an affair to inspect. Page ' + (page + 1) + ' of ' + Math.max(1, Math.ceil(entries.length / pageSize)) + '.' : 'No public affairs recorded yet.',
            image: this.affairIcon('log'),
            options
          })
        },
        openLogEntry({ index, page }) {
          let society = this.ensure()
          let entry = this.normalizeLogEntry((society.log || [])[index], index)
          this.pushModal({
            societyMenu: true,
            title: 'Past Affair',
            message: entry.text || 'No details.',
            image: this.affairIcon(entry.kind),
            options: [
              {
                text: 'Back',
                action: {
                  event: this.event,
                  method: 'openLog',
                  context: { page: page || 0 }
                }
              }
            ]
          })
        },
        openPlayerCrest() {
          let society = this.ensure()
          let state = daapi.getState()
          let character = state.characters[this.currentCharacterId(state)] || {}
          let dynasty = state.dynasties[character.dynastyId] || {}
          let crest = this.ensurePlayerCrest(society, state)
          this.save(society)
          this.applyPlayerCrestOverlay()
          let houseName = this.houseName(dynasty, character.dynastyId || 'player')
          let overlayText = society.crestSettings.playerOverlay ? 'On' : 'Off'
          let message = [
            'Player house: ' + houseName,
            'Current character: ' + (character.praenomen || 'Unknown'),
            'Portrait badge: ' + overlayText,
            'This menu only edits the player house shield.'
          ].join('\n')
          let image = this.crestIcon(crest, 132)
          this.pushModal({
            societyMenu: true,
            title: 'House Shield',
            message,
            image,
            options: [
              {
                variant: 'info',
                text: 'Randomize',
                tooltip: 'Generate a fresh Roman-style shield for the player house.',
                icons: [image],
                action: {
                  event: this.event,
                  method: 'randomizePlayerCrest'
                }
              },
              this.crestCycleOption('Field', 'field', crest),
              this.crestCycleOption('Metal', 'metal', crest),
              this.crestCycleOption('Accent', 'accent', crest),
              this.crestCycleOption('Shape', 'shape', crest),
              this.crestCycleOption('Division', 'division', crest),
              this.crestCycleOption('Pattern', 'pattern', crest),
              this.crestCycleOption('Charge', 'charge', crest),
              this.crestCycleOption('Border', 'border', crest),
              {
                text: 'Portrait badge: ' + overlayText,
                tooltip: 'Show the player house shield above the current player portrait when the mod can find it in the UI.',
                action: {
                  event: this.event,
                  method: 'togglePlayerCrestOverlay'
                }
              },
              {
                text: 'Close'
              }
            ].filter(Boolean)
          })
        },
        randomizePlayerCrest() {
          let society = this.ensure()
          let state = daapi.getState()
          let crestId = this.playerCrestId(state)
          society.crests[crestId] = this.generateCrest(crestId + '-player-' + Date.now() + '-' + Math.random())
          society.crests[crestId].custom = true
          this.save(society)
          this.applyPlayerCrestOverlay()
          this.openPlayerCrest()
        },
        cyclePlayerCrest({ part }) {
          let society = this.ensure()
          let state = daapi.getState()
          let crest = this.ensurePlayerCrest(society, state)
          let list = this.crestList(part)
          if (list.length) {
            let index = list.indexOf(crest[part])
            crest[part] = list[(index + 1 + list.length) % list.length]
            crest.custom = true
            crest.seed = String(crest.seed || '') + '-' + part + '-' + crest[part]
          }
          this.save(society)
          this.applyPlayerCrestOverlay()
          this.openPlayerCrest()
        },
        togglePlayerCrestOverlay() {
          let society = this.ensure()
          society.crestSettings.playerOverlay = !society.crestSettings.playerOverlay
          this.save(society)
          if (society.crestSettings.playerOverlay) {
            this.applyPlayerCrestOverlay()
          } else {
            this.clearPlayerCrestOverlay()
          }
          this.openPlayerCrest()
        },
        openWardrobe() {
          let state = daapi.getState()
          let members = this.playerFamilyMembers(state).filter((character) => !character.isDead)
          let options = members.slice(0, 14).map((character) => {
            return {
              text: this.characterName(character, state),
              tooltip: this.characterTooltip(character, state) + '\nCurrent outfit: ' + this.outfitLabel(character.corSocietyOutfit || 'auto'),
              icons: [this.characterPortrait(character, state)],
              action: {
                event: this.event,
                method: 'openWardrobeCharacter',
                context: { characterId: character.id }
              }
            }
          })
          options.push({ text: 'Close' })
          this.pushModal({
            societyMenu: true,
            title: 'Family Wardrobe',
            message: 'Choose a household member. Available clothing follows your current Society order and the character age.',
            image: daapi.requireImage('/cor_society/assets/wardrobe.svg'),
            options
          })
        },
        openWardrobeCharacter({ characterId } = {}) {
          let state = daapi.getState()
          let character = (state.characters || {})[characterId]
          if (!character || this.playerFamilyMemberIds(state).indexOf(characterId) < 0) {
            this.openWardrobe()
            return
          }
          character.id = character.id || characterId
          let outfits = this.wardrobeOptionsForCharacter(character, state)
          let options = outfits.map((outfit) => {
            return {
              text: this.outfitLabel(outfit) + (character.corSocietyOutfit === outfit || (!character.corSocietyOutfit && outfit === 'auto') ? ' (current)' : ''),
              tooltip: 'Visual clothing only. Does not change stats, class, genetics, or vanilla look data.',
              icons: [this.characterPortraitWithOutfit(character, state, outfit)],
              action: {
                event: this.event,
                method: 'applyWardrobeOutfit',
                context: { characterId, outfit }
              }
            }
          })
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openWardrobe'
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Wardrobe: ' + this.characterName(character, state),
            message: 'Society order: ' + this.stratumTitle(this.playerStratum(state)) + '\nCurrent outfit: ' + this.outfitLabel(character.corSocietyOutfit || 'auto'),
            image: this.characterPortrait(character, state),
            options
          })
        },
        applyWardrobeOutfit({ characterId, outfit } = {}) {
          let state = daapi.getState()
          let character = (state.characters || {})[characterId]
          if (!character || this.playerFamilyMemberIds(state).indexOf(characterId) < 0) {
            this.openWardrobe()
            return
          }
          character.id = character.id || characterId
          if (outfit && outfit !== 'auto') {
            this.applyWardrobeLookToCharacter(character, outfit, state)
          } else {
            delete character.corSocietyOutfit
            this.restoreOriginalLookIfNeeded(character, true)
            try {
              daapi.updateCharacter({ characterId, character: { corSocietyOutfit: '' } })
            } catch (err) {
              console.warn(err)
            }
          }
          try {
            this.wardrobeOutfitCache = false
            this.applyPortraitOverlays()
          } catch (err) {
            console.warn(err)
          }
          this.openWardrobeCharacter({ characterId })
        },
        wardrobeOptionsForCharacter(character, state) {
          let ageStage = this.characterAgeStage(this.age(character, state))
          let gender = character.gender || ((character.look || {}).gender) || (character.isMale ? 'male' : 'female')
          let stratum = this.playerStratum(state)
          let role = this.characterPortraitRole(character, ageStage, stratum)
          let options = ['auto'].concat(this.clothingOptions(gender, ageStage, role, stratum))
          if (stratum === 'senatorial') {
            options = options.concat(gender === 'female' ? ['palla', 'purplePalla', 'whiteStola'] : ['senatorToga', 'togaPraetexta', 'togaCandida'])
          } else if (stratum === 'equestrian') {
            options = options.concat(['equestrianTunic', 'citizenToga', 'mantle'])
          } else if (stratum === 'poor' || stratum === 'freedmen') {
            options = options.concat(['simpleTunic', 'workerTunic', 'brownMantle'])
          } else {
            options = options.concat(gender === 'female' ? ['stola', 'palla', 'whiteStola'] : ['citizenToga', 'whiteToga', 'mantle', 'simpleTunic'])
          }
          return options.filter((item, index, list) => item && list.indexOf(item) === index)
        },
        outfitLabel(outfit) {
          let labels = {
            auto: 'Automatic',
            senatorToga: 'Senatorial toga',
            togaPraetexta: 'Toga praetexta',
            togaCandida: 'Toga candida',
            citizenToga: 'Citizen toga',
            whiteToga: 'Plain white toga',
            equestrianTunic: 'Equestrian tunic',
            mantle: 'Mantle',
            simpleTunic: 'Simple tunic',
            workerTunic: 'Worker tunic',
            brownMantle: 'Brown mantle',
            militaryCloak: 'Military cloak',
            armoredTunic: 'Armored tunic',
            redMantle: 'Red mantle',
            stola: 'Stola',
            whiteStola: 'White stola',
            palla: 'Palla',
            purplePalla: 'Purple palla',
            childStola: 'Child stola',
            childTunic: 'Child tunic'
          }
          return labels[outfit] || String(outfit || 'Automatic')
        },
        characterPortraitWithOutfit(character, state, outfit) {
          if (!outfit || outfit === 'auto') {
            let originalLook = this.originalLookForWardrobe(character)
            let clone = {
              ...character,
              corSocietyOutfit: '',
              look: originalLook && originalLook.group ? originalLook : (character.look || {})
            }
            return this.vanillaCharacterPortrait(clone, state) || this.genericVanillaCharacterPortrait(clone, state)
          }
          let clone = { ...character, corSocietyOutfit: outfit }
          return this.nativeCharacterPortraitWithOutfit(clone, state, false, outfit)
        },
        openHouse({ houseId, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (!house) {
            this.openHub()
            return
          }
          let profile = this.strata[house.stratum] || this.strata.plebeian
          let cash = parseFloat((state.current || {}).cash || 0)
          let giftCost = this.actionCost(house, 'gift')
          let dinnerCost = this.actionCost(house, 'dinner')
          let canAsk = (house.favor || 0) > 0 || (house.relation || 0) >= 28
          let marriageInfo = this.marriageOptionInfo(society, state, house)
          let tradeActive = this.houseTradeActive(house, state)
          let nav = this.navContext(returnTo, returnPage)
          this.pushModal({
            societyMenu: true,
            title: house.name,
            message: 'House summary.',
            societySummaryOptions: this.houseSummaryOptions(society, state, house, profile, tradeActive),
            image: this.houseCrestIcon(society, house),
            options: [
              {
                variant: 'info',
                text: 'Members',
                icons: [this.affairIcon('familyTree')],
                action: {
                  event: this.event,
                  method: 'openMemberGroups',
                  context: { houseId, ...nav }
                }
              },
              {
                variant: 'info',
                text: 'House tree',
                tooltip: 'Open the graphical tree for this house branch only.',
                icons: [this.affairIcon('familyTree'), this.houseCrestIcon(society, house)],
                action: {
                  event: this.event,
                  method: 'openHouseFamilyTree',
                  context: { houseId, ...nav }
                }
              },
              {
                variant: 'info',
                text: 'Full dynasty tree',
                tooltip: 'Open the total graphical tree for the whole dynasty.',
                icons: [this.affairIcon('familyTree')],
                action: {
                  event: this.event,
                  method: 'openDynastyTree',
                  context: { dynastyId: this.gameDynastyIdForHouse(house), ...nav }
                }
              },
              {
                variant: 'info',
                text: 'Arrange marriage' + (marriageInfo.note ? ' (' + marriageInfo.note + ')' : ''),
                disabled: !marriageInfo.available,
                showDisabledWithTooltip: true,
                tooltip: marriageInfo.tooltip,
                icons: [this.affairIcon('marriage')],
                action: {
                  event: this.event,
                  method: 'openMarriageHousehold',
                  context: { houseId, ...nav }
                }
              },
              {
                text: 'Send gift (' + giftCost + ')',
                disabled: cash < giftCost,
                showDisabledWithTooltip: true,
                tooltip: 'Spend cash to improve relations and possibly earn a favor.',
                icons: [this.affairIcon('gift')],
                action: {
                  event: this.event,
                  method: 'sendGift',
                  context: { houseId, ...nav }
                }
              },
              {
                text: 'Host dinner (' + dinnerCost + ')',
                disabled: cash < dinnerCost,
                showDisabledWithTooltip: true,
                tooltip: 'A wider social gesture. Improves relations and prestige.',
                icons: [this.affairIcon('prestige')],
                action: {
                  event: this.event,
                  method: 'hostDinner',
                  context: { houseId, ...nav }
                }
              },
              {
                variant: 'info',
                text: 'Ask for support',
                disabled: !canAsk,
                showDisabledWithTooltip: true,
                tooltip: 'Requires a favor or a warm relationship. Grants influence.',
                icons: [this.affairIcon('support')],
                action: {
                  event: this.event,
                  method: 'askSupport',
                  context: { houseId, ...nav }
                }
              },
              {
                text: tradeActive ? 'Trade active until ' + house.tradeUntil : 'Negotiate trade',
                disabled: (house.relation || 0) < 5 || tradeActive,
                showDisabledWithTooltip: true,
                tooltip: tradeActive ? 'This house already has one active trade compact with you. It cannot stack.' : 'Build one temporary revenue tie with this house. It breaks if relations collapse.',
                icons: [this.affairIcon('tradeVenture')],
                action: {
                  event: this.event,
                  method: 'tradeDeal',
                  context: { houseId, ...nav }
                }
              },
              this.patronageOption(house),
              {
                variant: house.rivalry ? 'info' : 'danger',
                text: house.rivalry ? 'Seek reconciliation' : 'Declare rivalry',
                icons: [this.affairIcon(house.rivalry ? 'support' : 'rivalry')],
                action: {
                  event: this.event,
                  method: house.rivalry ? 'reconcile' : 'startRivalry',
                  context: { houseId, ...nav }
                }
              },
              {
                text: 'Back',
                action: this.houseBackAction(house, returnTo, returnPage)
              }
            ].filter(Boolean)
          })
        },
        navContext(returnTo, returnPage) {
          let nav = {}
          if (returnTo) nav.returnTo = returnTo
          if (returnPage !== undefined && returnPage !== null) nav.returnPage = returnPage
          return nav
        },
        houseBackAction(house, returnTo, returnPage) {
          if (returnTo === 'allies') {
            return { event: this.event, method: 'openAllies', context: { page: returnPage || 0 } }
          }
          if (returnTo === 'rivals') {
            return { event: this.event, method: 'openRivals', context: { page: returnPage || 0 } }
          }
          if (returnTo === 'hub') {
            return { event: this.event, method: 'openHub' }
          }
          if (returnTo === 'dynasty') {
            return { event: this.event, method: 'openDynasty', context: { dynastyId: this.gameDynastyIdForHouse(house), stratum: house.stratum, page: returnPage || 0 } }
          }
          return { event: this.event, method: 'openEstate', context: { stratum: house.stratum, page: 0 } }
        },
        openPeople({ houseId, returnTo, returnPage } = {}) {
          this.openMemberGroups({ houseId, returnTo, returnPage })
        },
        openMemberGroups({ houseId, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (!house) {
            this.openHub()
            return
          }
          this.refreshHouseMemberLists(society, state, house)
          let groups = this.houseMemberGroups(house, state)
          let order = ['notable', 'established', 'common', 'slaves']
          let nav = this.navContext(returnTo, returnPage)
          let options = order.map((group) => {
            let count = (groups[group] || []).length
            return {
              variant: 'info',
              text: this.memberGroupLabel(group) + ' (' + count + ')',
              tooltip: count ? this.memberGroupDescription(group) : 'No living members are currently known in this category.',
              disabled: !count,
              showDisabledWithTooltip: true,
              icons: [this.memberGroupIcon(group)],
              action: {
                event: this.event,
                method: 'openMemberGroup',
                context: { houseId, group, page: 0, ...nav }
              }
            }
          })
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHouse',
              context: { houseId, ...nav }
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Members of ' + house.name,
            message: 'Every known living member of this dynasty is grouped by public standing, household role, and career.',
            image: this.houseCrestIcon(society, house),
            options
          })
        },
        openMemberGroup({ houseId, group, page, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (!house) {
            this.openHub()
            return
          }
          this.refreshHouseMemberLists(society, state, house)
          group = group || 'notable'
          page = parseInt(page || 0, 10)
          let groups = this.houseMemberGroups(house, state)
          let peopleIds = groups[group] || []
          let pageSize = 8
          let start = page * pageSize
          let shown = peopleIds.slice(start, start + pageSize)
          let nav = this.navContext(returnTo, returnPage)
          let options = shown.map((characterId) => {
            let character = state.characters[characterId]
            let relationVisual = character ? this.relationVisual(society, state, character) : false
            let traitIcons = character ? this.societyTraitIconList(society, character) : []
            return {
              text: character ? this.characterName(character, state) : characterId,
              tooltip: character ? this.characterTooltip(character, state) + '\nCategory: ' + this.memberGroupLabel(group) + (relationVisual ? '\n' + relationVisual.tooltip : '') + '\nSociety traits: ' + this.socialTraitSummary(society, character) : '',
              icons: character ? [this.characterPortrait(character, state, house)].concat(relationVisual ? [relationVisual.icon] : []).concat([this.houseCrestIcon(society, house)]).concat(traitIcons) : [this.houseCrestIcon(society, house)],
              action: {
                event: this.event,
                method: 'openPerson',
                context: { houseId, characterId, group, page, ...nav }
              }
            }
          })
          if (start + pageSize < peopleIds.length) {
            options.push({
              text: 'Next page',
              action: {
                event: this.event,
                method: 'openMemberGroup',
                context: { houseId, group, page: page + 1, ...nav }
              }
            })
          }
          if (page > 0) {
            options.push({
              text: 'Previous page',
              action: {
                event: this.event,
                method: 'openMemberGroup',
                context: { houseId, group, page: page - 1, ...nav }
              }
            })
          }
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openMemberGroups',
              context: { houseId, ...nav }
            }
          })
          this.pushModal({
            societyMenu: true,
            title: this.memberGroupLabel(group) + ' of ' + house.name,
            message: peopleIds.length ? this.memberGroupDescription(group) + '\nPage ' + (page + 1) + ' of ' + Math.max(1, Math.ceil(peopleIds.length / pageSize)) + '.' : 'No living members are currently known in this category.',
            image: this.memberGroupIcon(group),
            options
          })
        },
        characterSocialRecord(society, characterId, create) {
          society.characterSocial = society.characterSocial || {}
          let key = String(characterId || '')
          if (!key) {
            return {}
          }
          if (!society.characterSocial[key] && create !== false) {
            society.characterSocial[key] = {
              introduced: false,
              bond: 0,
              nextInviteMonth: '',
              nextCourtMonth: '',
              lastVisitMonth: ''
            }
          }
          return society.characterSocial[key] || {}
        },
        socialVisitOption(society, state, house, character, nav) {
          let characterId = character && character.id
          let social = this.characterSocialRecord(society, characterId, false)
          if (!social.introduced) {
            return {
              variant: 'info',
              text: 'Request introduction',
              disabled: (house.relation || 0) < 10,
              showDisabledWithTooltip: true,
              tooltip: 'Warm relations let this person introduce you to useful contacts. This can only be used once for this character.',
              icons: [this.affairIcon('support')],
              action: {
                event: this.event,
                method: 'requestIntroduction',
                context: { houseId: house.id, characterId }
              }
            }
          }
          let cooldown = social.nextInviteMonth && !this.monthKeyReached(social.nextInviteMonth, state)
          return {
            variant: 'info',
            text: 'Invite home to talk',
            disabled: !!cooldown,
            showDisabledWithTooltip: true,
            tooltip: cooldown ? 'This person recently visited. Available again after ' + social.nextInviteMonth + '.' : 'A private household visit can build rapport, improve house relation, and sometimes start a small social event.',
            icons: [this.affairIcon('invitation')],
            action: {
              event: this.event,
              method: 'inviteHomeTalk',
              context: { houseId: house.id, characterId }
            }
          }
        },
        romanceOption(society, state, house, character) {
          let currentId = this.currentCharacterId(state)
          let player = state.characters[currentId] || state.current || {}
          let characterId = character && character.id
          let social = this.characterSocialRecord(society, characterId, false)
          let romance = this.getRomance(society, currentId, characterId)
          let playerAge = this.age(player, state)
          let targetAge = this.age(character, state)
          let disabled = false
          let tooltip = ''
          if (!currentId || this.sameCharacterId(currentId, characterId)) {
            disabled = true
            tooltip = 'You cannot court yourself.'
          } else if (playerAge < 13 || targetAge < 13) {
            disabled = true
            tooltip = 'Characters younger than 13 cannot become lovers or be courted.'
          } else if (!social.introduced) {
            disabled = true
            tooltip = 'Request an introduction first.'
          } else if (social.nextCourtMonth && !this.monthKeyReached(social.nextCourtMonth, state)) {
            disabled = true
            tooltip = 'Courtship is cooling down until ' + social.nextCourtMonth + '.'
          } else {
            let risk = this.romanceBaseRisk(player, character, state)
            tooltip = romance ? 'Meet your lover privately. Higher intensity improves the bond but increases scandal risk.' : 'Attempt to turn rapport into a lover relationship. Works regardless of gender; pregnancy only applies when the couple can conceive.'
            tooltip += '\nScandal risk: ' + (risk >= 55 ? 'high' : risk >= 30 ? 'moderate' : 'low') + '.'
          }
          return {
            variant: romance ? 'info' : 'danger',
            text: romance ? 'Meet lover' : 'Court privately',
            disabled,
            showDisabledWithTooltip: true,
            tooltip,
            icons: [this.affairIcon('romance')],
            action: {
              event: this.event,
              method: 'courtCharacter',
              context: { houseId: house.id, characterId }
            }
          }
        },
        matchmakerOption(state, character) {
          let characterId = character && character.id
          let eligible = characterId && this.isPlayerFamilyCharacter(state, characterId) && this.isMarriageEligible(character, state)
          return {
            variant: 'info',
            text: 'Coemptio matchmaker',
            disabled: !eligible,
            showDisabledWithTooltip: true,
            tooltip: eligible ? 'Search Society houses for compatible real spouse candidates.' : 'Only unmarried adult members of your household can use Coemptio.',
            icons: [this.bundledIcon('coemptio', 'marriage')],
            action: {
              event: this.event,
              method: 'openMatchmaker',
              context: { characterId }
            }
          }
        },
        buyEnslavedPersonOption(society, state, house, character, nav) {
          if (!house || !character || !character.id) {
            return false
          }
          let info = this.enslavedPurchaseInfo(society, state, house, character)
          if (!info.available && !info.visible) {
            return false
          }
          return {
            variant: info.available ? 'info' : 'danger',
            text: info.available ? 'Negotiate purchase (' + info.cost + ')' : 'Purchase unavailable (' + info.reason + ')',
            disabled: !info.available,
            showDisabledWithTooltip: true,
            tooltip: info.tooltip,
            icons: [this.slaveTypeIcon(info.type), this.affairIcon('coins')],
            action: {
              event: this.event,
              method: 'buyEnslavedCharacter',
              context: { houseId: house.id, characterId: character.id, cost: info.cost, ...nav }
            }
          }
        },
        openPerson({ houseId, characterId, group, page, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let character = state.characters[characterId]
          if (!house || !character) {
            this.openHouse({ houseId, returnTo, returnPage })
            return
          }
          character.id = character.id || characterId
          let nav = this.navContext(returnTo, returnPage)
          let vanillaActions = this.vanillaCharacterActions(character)
          let relatives = this.familyTreeRelatives(character, state)
          let currentId = this.currentCharacterId(state)
          let social = this.characterSocialRecord(society, characterId, false)
          let romance = this.getRomance(society, currentId, characterId)
          let relationScore = currentId && !this.sameCharacterId(currentId, characterId) ? this.personalRelationScore(society, state, currentId, characterId) : 0
          let relationRecord = currentId && !this.sameCharacterId(currentId, characterId) ? this.personalRelationRecord(society, currentId, characterId, false) : false
          let backAction = group ? {
            event: this.event,
            method: 'openMemberGroup',
            context: { houseId, group, page: page || 0, ...nav }
          } : {
            event: this.event,
            method: 'openMemberGroups',
            context: { houseId, ...nav }
          }
          this.pushModal({
            societyMenu: true,
            title: this.characterName(character, state),
            message: 'Character summary.',
            societySummaryOptions: this.personSummaryOptions(society, state, house, character, relatives, social, romance, relationScore, relationRecord, currentId, characterId),
            image: this.characterPortrait(character, state, house),
            options: [
              ...this.societyTraitOptions(society, character),
              this.matchmakerOption(state, character),
              {
                variant: 'info',
                text: 'Vanilla / other mods actions (' + vanillaActions.length + ')',
                disabled: !vanillaActions.length,
                showDisabledWithTooltip: true,
                tooltip: vanillaActions.length ? 'Open actions currently exposed by the base game or other mods for this character.' : 'No vanilla or other mod character action is currently exposed for this character.',
                icons: vanillaActions.length && vanillaActions[0].icon ? [vanillaActions[0].icon] : [this.affairIcon('support')],
                action: {
                  event: this.event,
                  method: 'openVanillaActions',
                  context: { houseId, characterId, group, page: page || 0, ...nav }
                }
              },
              {
                variant: 'info',
                text: 'Full family tree',
                tooltip: 'Open the full Society family tree using real spouse, parent, and child IDs.',
                icons: [this.affairIcon('familyTree')],
                action: {
                  event: this.event,
                  method: 'openFamilyTree',
                  context: { houseId, characterId, group, page: page || 0, mode: 'full', ...nav }
                }
              },
              {
                text: 'Praise in public',
                icons: [this.affairIcon('prestige')],
                action: {
                  event: this.event,
                  method: 'praisePerson',
                  context: { houseId, characterId }
                }
              },
              this.socialVisitOption(society, state, house, character, nav),
              this.romanceOption(society, state, house, character),
              this.buyEnslavedPersonOption(society, state, house, character, nav),
              {
                variant: 'danger',
                text: 'Spread rumor',
                icons: [this.affairIcon('rivalry')],
                action: {
                  event: this.event,
                  method: 'spreadRumor',
                  context: { houseId, characterId }
                }
              },
              {
                text: 'Back',
                action: backAction
              }
            ].filter(Boolean)
          })
        },
        openVanillaActions({ houseId, characterId, group, page, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let character = state.characters[characterId]
          if (!house || !character) {
            this.openHouse({ houseId, returnTo, returnPage })
            return
          }
          character.id = character.id || characterId
          let nav = this.navContext(returnTo, returnPage)
          let actions = this.vanillaCharacterActions(character)
          let options = actions.map((item) => {
            let action = item.action || {}
            let process = action.process || action.action || false
            let disabled = action.isAvailable === false || !process
            return {
              text: action.title || item.key,
              tooltip: action.tooltip || (disabled ? 'This vanilla / other mod action is not currently available.' : 'Runs this vanilla / other mod character action.'),
              disabled,
              showDisabledWithTooltip: true,
              icons: action.icon ? [action.icon] : [this.characterPortrait(character, state, house)],
              action: process || {
                event: this.event,
                method: 'openPerson',
                context: { houseId, characterId, group, page: page || 0, ...nav }
              }
            }
          })
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openPerson',
              context: { houseId, characterId, group, page: page || 0, ...nav }
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Vanilla / other mods actions',
            message: actions.length ? 'Actions currently exposed by the base game or other mods for ' + this.characterName(character, state) + '.' : 'No vanilla or other mod action is currently exposed for this character.',
            image: this.characterPortrait(character, state, house),
            options
          })
        },
        openVanillaKnownFamily({ houseId, characterId, group, page, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (this.preferSocietyTree(characterId, society, house, state)) {
            this.openFamilyTree({ houseId, characterId, group, page, mode: 'known', returnTo, returnPage })
            return
          }
          if (!this.openVanillaFamilyRoute(characterId, '#/knownFamily')) {
            this.openFamilyTree({ houseId, characterId, group, page, mode: 'known', returnTo, returnPage })
          }
        },
        openVanillaFullFamilyTree({ houseId, characterId, group, page, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (this.preferSocietyTree(characterId, society, house, state)) {
            this.openFamilyTree({ houseId, characterId, group, page, mode: 'full', returnTo, returnPage })
            return
          }
          if (!this.openVanillaFamilyRoute(characterId, '#/fullFamilyTree')) {
            this.openFamilyTree({ houseId, characterId, group, page, mode: 'full', returnTo, returnPage })
          }
        },
        dynastyTreeFocusId(society, state, dynastyId) {
          let ids = this.memberIdsForDynasty(society, state, dynastyId)
          if (!ids.length) {
            return ''
          }
          return ids.slice().sort((a, b) => {
            let first = state.characters[a] || {}
            let second = state.characters[b] || {}
            return this.characterScore(second, state) - this.characterScore(first, state)
          })[0]
        },
        openDynastyTree({ dynastyId, stratum, page, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let dynasty = society.dynasties && society.dynasties[dynastyId]
          let house = this.primaryHouseForDynasty(society, dynastyId)
          let characterId = this.dynastyTreeFocusId(society, state, dynastyId)
          if (!dynasty || !house || !characterId) {
            this.openDynasty({ dynastyId, stratum, page })
            return
          }
          this.openGraphicalFamilyTree({
            society,
            state,
            house,
            houseId: house.id,
            characterId,
            group: '',
            page: 0,
            mode: 'dynasty',
            returnTo: returnTo || 'dynasty',
            returnPage: returnPage !== undefined ? returnPage : (page || 0)
          })
        },
        openHouseFamilyTree({ houseId, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (!house) {
            this.openHub()
            return
          }
          this.refreshHouseMemberLists(society, state, house)
          let characterId = (house.notableIds || house.memberIds || []).find((id) => state.characters && state.characters[id])
          if (!characterId) {
            this.openHouse({ houseId, returnTo, returnPage })
            return
          }
          this.openGraphicalFamilyTree({
            society,
            state,
            house,
            houseId,
            characterId,
            group: '',
            page: 0,
            mode: 'house',
            returnTo: returnTo || 'dynasty',
            returnPage
          })
        },
        ensurePlayerDynastyTreeForCurrent(society, state) {
          try {
            society = society || this.load()
            state = state || daapi.getState()
            let characterId = this.currentCharacterId(state)
            let character = state.characters && state.characters[characterId]
            if (!character) {
              return false
            }
            character.id = character.id || characterId
            let ok = this.ensurePlayerDynastyTree(society, state, character)
            state = daapi.getState()
            character = state.characters[characterId] || character
            let houseId = this.houseIdForCharacter(character, state, society)
            let house = society.houses[houseId]
            if (house) {
              this.refreshHouseMemberLists(society, state, house)
            }
            return ok
          } catch (err) {
            console.warn(err)
            return false
          }
        },
        openPlayerFamilyTree() {
          let society = this.ensure({ force: true })
          let state = daapi.getState()
          let characterId = this.currentCharacterId(state)
          let character = state.characters && state.characters[characterId]
          if (!character) {
            this.openHub()
            return
          }
          character.id = character.id || characterId
          this.ensurePlayerDynastyTreeForCurrent(society, state)
          state = daapi.getState()
          character = state.characters[characterId] || character
          let houseId = this.houseIdForCharacter(character, state, society)
          let house = society.houses[houseId]
          if (house) {
            this.refreshHouseMemberLists(society, state, house)
          }
          this.save(society)
          this.openFamilyTree({ houseId, characterId, mode: 'full', returnTo: 'hub' })
        },
        ensurePlayerDynastyTree(society, state, character) {
          if (!society || !state || !state.characters || !character || !character.id) {
            return false
          }
          character.id = character.id || this.currentCharacterId(state)
          this.ensureDeadParentsAndGrandparents(society, state, character)
          state = daapi.getState()
          character = state.characters[character.id] || character
          let currentAge = this.age(character, state)
          society.playerTreeGeneratedLivingIds = (society.playerTreeGeneratedLivingIds || []).filter((id) => state.characters[id] && !state.characters[id].isDead)
          let canAddLiving = society.playerTreeGeneratedLivingIds.length < 4
          let hasLivingAuntOrUncle = society.playerTreeGeneratedLivingIds.some((id) => {
            let kin = state.characters[id]
            return kin && kin.corSocietyPlayerTreeRole === 'auntUncle' && !kin.isDead
          })
          if (canAddLiving && !hasLivingAuntOrUncle && character.fatherId && state.characters[character.fatherId]) {
            let parent = state.characters[character.fatherId]
            parent.id = parent.id || character.fatherId
            this.ensureDeadParentsAndGrandparents(society, state, parent)
            state = daapi.getState()
            parent = state.characters[character.fatherId] || parent
            if (parent.fatherId && parent.motherId) {
              let auntUncleId = this.generatePlayerAuntUncle(society, state, character, parent)
              if (auntUncleId) {
                society.playerTreeGeneratedLivingIds.push(auntUncleId)
              }
            }
          }
          state = daapi.getState()
          if (society.playerTreeGeneratedLivingIds.length < 4 && currentAge >= 13) {
            let auntUncleId = society.playerTreeGeneratedLivingIds.find((id) => {
              let kin = state.characters[id]
              return kin && kin.corSocietyPlayerTreeRole === 'auntUncle' && !kin.isDead
            })
            let auntUncle = auntUncleId && state.characters[auntUncleId]
            let hasCousin = society.playerTreeGeneratedLivingIds.some((id) => {
              let kin = state.characters[id]
              return kin && kin.corSocietyPlayerTreeRole === 'cousin' && !kin.isDead
            })
            if (auntUncle && !hasCousin) {
              let cousinId = this.generatePlayerCousin(society, state, character, auntUncle)
              if (cousinId) {
                society.playerTreeGeneratedLivingIds.push(cousinId)
              }
            }
          }
          return true
        },
        generatePlayerAuntUncle(society, state, player, parent) {
          let isMale = Math.random() > 0.5
          let playerAge = this.age(player, state)
          let age = this.clamp(playerAge + this.randomInt(15, 30), 24, 62)
          let stratum = this.playerStratum(state)
          let profile = this.strata[stratum] || this.strata.plebeian
          let job = this.pick(profile.jobs)
          let traits = this.generatedTraitsForStratum(stratum, job)
          let father = state.characters[parent.fatherId] || {}
          let mother = state.characters[parent.motherId] || {}
          let id = daapi.generateCharacter({
            characterFeatures: {
              gender: isMale ? 'male' : 'female',
              isMale,
              praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
              birthMonth: this.randomInt(0, 11),
              birthYear: state.year - age,
              look: this.inheritedVanillaLook(isMale, mother, father, 'player-aunt-uncle-' + player.id),
              job,
              jobLevel: this.randomInt(0, stratum === 'senatorial' ? 7 : stratum === 'equestrian' ? 5 : 3),
              traits,
              skills: this.skillsForStratum(stratum),
              corSocietyGenerated: true,
              corSocietyPlayerTreeGenerated: true,
              corSocietyPlayerTreeRole: 'auntUncle',
              flagDoNotCull: true,
              fatherId: parent.fatherId,
              motherId: parent.motherId,
              childrenIds: []
            },
            dynastyFeatures: {}
          })
          daapi.updateCharacter({
            characterId: id,
            character: {
              dynastyId: player.dynastyId,
              fatherId: parent.fatherId,
              motherId: parent.motherId,
              corSocietyGenerated: true,
              corSocietyPlayerTreeGenerated: true,
              corSocietyPlayerTreeRole: 'auntUncle',
              flagDoNotCull: true
            }
          })
          this.addChildToParent(state, parent.fatherId, id)
          this.addChildToParent(state, parent.motherId, id)
          society.generatedCharacterIds = society.generatedCharacterIds || []
          if (society.generatedCharacterIds.indexOf(id) < 0) society.generatedCharacterIds.push(id)
          this.applyGeneratedTraits(id, traits)
          this.seedSocialTraitsForCharacter(society, id, traits)
          return id
        },
        generatePlayerCousin(society, state, player, auntUncle) {
          let isMale = Math.random() > 0.5
          let playerAge = this.age(player, state)
          let age = this.clamp(playerAge + this.randomInt(-6, 6), 13, 36)
          let stratum = this.playerStratum(state)
          let traits = age >= 12 ? this.generatedTraitsForStratum(stratum, '') : []
          let mother = this.characterIsMale(auntUncle) ? {} : auntUncle
          let father = this.characterIsMale(auntUncle) ? auntUncle : {}
          let id = daapi.generateCharacter({
            characterFeatures: {
              gender: isMale ? 'male' : 'female',
              isMale,
              praenomen: isMale ? this.pick(this.maleNames) : this.pick(this.femaleNames),
              birthMonth: this.randomInt(0, 11),
              birthYear: state.year - age,
              look: this.inheritedVanillaLook(isMale, mother, father, 'player-cousin-' + player.id + '-' + auntUncle.id),
              traits,
              skills: this.skillsForStratum(stratum),
              corSocietyGenerated: true,
              corSocietyPlayerTreeGenerated: true,
              corSocietyPlayerTreeRole: 'cousin',
              flagDoNotCull: true,
              fatherId: this.characterIsMale(auntUncle) ? auntUncle.id : null,
              motherId: this.characterIsMale(auntUncle) ? null : auntUncle.id,
              childrenIds: []
            },
            dynastyFeatures: {}
          })
          daapi.updateCharacter({
            characterId: id,
            character: {
              dynastyId: player.dynastyId,
              fatherId: this.characterIsMale(auntUncle) ? auntUncle.id : null,
              motherId: this.characterIsMale(auntUncle) ? null : auntUncle.id,
              corSocietyGenerated: true,
              corSocietyPlayerTreeGenerated: true,
              corSocietyPlayerTreeRole: 'cousin',
              flagDoNotCull: true
            }
          })
          this.addChildToParent(state, auntUncle.id, id)
          society.generatedCharacterIds = society.generatedCharacterIds || []
          if (society.generatedCharacterIds.indexOf(id) < 0) society.generatedCharacterIds.push(id)
          this.applyGeneratedTraits(id, traits)
          this.seedSocialTraitsForCharacter(society, id, traits)
          return id
        },
        preferSocietyTree(characterId, society, house, state) {
          let character = state && state.characters ? state.characters[characterId] : false
          return !!(
            character &&
            (
              character.corSocietyGenerated ||
              (house && house.generated) ||
              (society.generatedCharacterIds || []).some((id) => this.sameCharacterId(id, characterId))
            )
          )
        },
        openVanillaFamilyRoute(characterId, route) {
          let state = daapi.getState()
          if (!state || !state.characters || !state.characters[characterId]) {
            return false
          }
          let path = route === '#/fullFamilyTree' || route === '/fullFamilyTree' ? '/fullFamilyTree' : '/knownFamily'
          try {
            let vueRoot = this.findGameVueRoot()
            if (vueRoot && vueRoot.$store) {
              let store = vueRoot.$store
              if (typeof store.commit === 'function') {
                store.commit('setSelectedCharacterId', characterId)
              } else if (store.state && store.state.current) {
                store.state.current.selectedCharacterId = characterId
              }
              if (typeof store.dispatch === 'function') {
                store.dispatch('forceUpdateStore')
              }
              if (vueRoot.$router && typeof vueRoot.$router.push === 'function') {
                let result = vueRoot.$router.push({ path })
                if (result && typeof result.catch === 'function') {
                  result.catch(() => {})
                }
                return true
              }
              if (typeof window !== 'undefined' && window.location) {
                window.location.hash = '#' + path
                return true
              }
            }
          } catch (err) {
            console.warn(err)
          }
          return false
        },
        findGameVueRoot() {
          if (this.cachedGameVueRoot && this.isGameVueRoot(this.cachedGameVueRoot)) {
            return this.cachedGameVueRoot
          }
          if (typeof document === 'undefined') {
            return false
          }
          let nodes = []
          let app = document.getElementById('app')
          if (app) {
            nodes.push(app)
          }
          if (document.body) {
            nodes.push(document.body)
          }
          try {
            let allNodes = document.querySelectorAll('*')
            for (let i = 0; i < allNodes.length; i++) {
              nodes.push(allNodes[i])
            }
          } catch (err) {
            console.warn(err)
          }
          for (let i = 0; i < nodes.length; i++) {
            let vm = nodes[i] && nodes[i].__vue__
            if (!vm) {
              continue
            }
            let root = this.vueRootFromComponent(vm)
            if (this.isGameVueRoot(root)) {
              this.cachedGameVueRoot = root
              return root
            }
          }
          return false
        },
        vueRootFromComponent(vm) {
          let root = vm && (vm.$root || vm)
          let guard = 0
          while (root && root.$parent && guard < 50) {
            root = root.$parent
            guard += 1
          }
          return root || vm
        },
        isGameVueRoot(root) {
          return !!(
            root &&
            root.$store &&
            root.$router &&
            root.$store.state &&
            root.$store.state.current &&
            root.$store.state.characters
          )
        },
        openFamilyTree({ houseId, characterId, group, page, mode, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let character = state.characters[characterId]
          if (!character) {
            this.openHouse({ houseId, returnTo, returnPage })
            return
          }
          character.id = character.id || characterId
          if (!house) {
            houseId = this.houseIdForCharacter(character, state, society) || houseId
            house = society.houses[houseId]
          }
          if (house) {
            this.refreshHouseMemberLists(society, state, house)
          }
          this.openGraphicalFamilyTree({ society, state, house, houseId, characterId, group, page, mode, returnTo, returnPage })
        },
        openGraphicalFamilyTree({ society, state, house, houseId, characterId, group, page, mode, returnTo, returnPage }) {
          if (typeof document === 'undefined' || !document.body) {
            this.openTextFamilyTreeFallback({ society, state, house, houseId, characterId, group, page, mode, returnTo, returnPage })
            return
          }
          let character = state.characters[characterId]
          if (!character) {
            this.openHouse({ houseId, returnTo, returnPage })
            return
          }
          character.id = character.id || characterId
          this.closeFamilyTreeOverlay()
          let overlay = document.createElement('div')
          overlay.id = 'corSocietyFamilyTreeOverlay'
          overlay.className = 'cor-society-family-tree-overlay'
          overlay.setAttribute('data-cor-society-ui', 'family-tree')
          this.applyFamilyTreeTheme(overlay, state)

          let panel = document.createElement('div')
          panel.className = 'cor-society-family-tree-panel container-main break-word'
          overlay.appendChild(panel)

          let header = document.createElement('div')
          header.className = 'cor-society-family-tree-header'
          panel.appendChild(header)

          let backButton = document.createElement('button')
          backButton.type = 'button'
          backButton.className = 'btn btn-sm btn-dark cor-society-tree-toolbar-button'
          backButton.textContent = 'Back'
          backButton.title = 'Return to the selected Society character.'
          backButton.addEventListener('click', () => {
            this.closeFamilyTreeOverlay()
            if (mode === 'dynasty' && house) {
              this.openDynasty({ dynastyId: this.gameDynastyIdForHouse(house), stratum: house.stratum, page: returnPage || 0 })
            } else if (mode === 'house') {
              this.openHouse({ houseId, returnTo, returnPage })
            } else {
              this.openPerson({ houseId, characterId, group, page: page || 0, returnTo, returnPage })
            }
          })
          header.appendChild(backButton)

          let heading = document.createElement('div')
          heading.className = 'cor-society-family-tree-heading'
          let title = document.createElement('h3')
          title.textContent = this.familyTreeTitle(mode)
          heading.appendChild(title)
          let subtitle = document.createElement('div')
          subtitle.className = 'cor-society-family-tree-subtitle'
          subtitle.textContent = this.characterName(character, state)
          heading.appendChild(subtitle)
          header.appendChild(heading)

          let closeButton = document.createElement('button')
          closeButton.type = 'button'
          closeButton.className = 'btn btn-sm btn-dark cor-society-tree-toolbar-button'
          closeButton.textContent = 'Close'
          closeButton.title = 'Close the family tree.'
          closeButton.addEventListener('click', () => this.closeFamilyTreeOverlay())
          header.appendChild(closeButton)

          let toolbar = document.createElement('div')
          toolbar.className = 'cor-society-family-tree-toolbar'
          panel.appendChild(toolbar)

          let zoomLabel = document.createElement('label')
          zoomLabel.className = 'cor-society-tree-zoom-label'
          zoomLabel.textContent = 'Zoom'
          toolbar.appendChild(zoomLabel)

          let zoomInput = document.createElement('input')
          zoomInput.type = 'range'
          zoomInput.min = '0.45'
          zoomInput.max = '1.25'
          zoomInput.step = '0.05'
          zoomInput.value = '0.9'
          zoomInput.setAttribute('aria-label', 'Zoom level')
          toolbar.appendChild(zoomInput)

          let focusButton = document.createElement('button')
          focusButton.type = 'button'
          focusButton.className = 'btn btn-sm btn-light cor-society-tree-toolbar-button'
          focusButton.textContent = 'Center'
          focusButton.title = 'Pan back to the selected character.'
          toolbar.appendChild(focusButton)

          let canvas = document.createElement('div')
          canvas.className = 'cor-society-family-tree-canvas'
          panel.appendChild(canvas)

          let tree = document.createElement('div')
          tree.id = 'fullFamilyTree'
          tree.className = 'cor-society-family-tree vue-family-tree'
          canvas.appendChild(tree)

          let zoomTarget = document.createElement('div')
          zoomTarget.className = 'cor-society-family-tree-zoom-target'
          zoomTarget.style.transform = 'scale(' + parseFloat(zoomInput.value) + ')'
          tree.appendChild(zoomTarget)

          let startId = this.familyTreeStartId(character.id, state, mode)
          let depthLimit = mode === 'known' ? 2 : 7
          let branch = this.createFamilyTreeBranch({
            rootId: startId,
            focusId: character.id,
            state,
            society,
            fallbackHouse: house,
            depth: 0,
            depthLimit,
            mode,
            visited: {},
            returnTo,
            returnPage
          })
          zoomTarget.appendChild(branch)

          let note = document.createElement('div')
          note.className = 'cor-society-family-tree-note'
          note.textContent = mode === 'known'
            ? 'Known family view: parents, siblings, spouse, and near descendants.'
            : mode === 'house'
              ? 'House tree view: this branch follows members assigned to the same Society house.'
              : mode === 'dynasty'
                ? 'Full dynasty view: all known houses share the same larger lineage.'
                : 'Full tree view: the branch starts from the oldest known ancestor Society can resolve.'
          zoomTarget.appendChild(note)

          let setZoom = () => {
            zoomTarget.style.transform = 'scale(' + parseFloat(zoomInput.value || 1) + ')'
          }
          zoomInput.addEventListener('input', setZoom)
          zoomInput.addEventListener('change', setZoom)

          let panToFocus = () => {
            let selected = document.getElementById('familyTreeCharacterBox_' + character.id)
            if (selected && typeof selected.scrollIntoView === 'function') {
              selected.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
            }
          }
          focusButton.addEventListener('click', panToFocus)

          document.body.appendChild(overlay)
          setTimeout(panToFocus, 120)
        },
        closeFamilyTreeOverlay() {
          if (typeof document === 'undefined') {
            return
          }
          let overlay = document.getElementById('corSocietyFamilyTreeOverlay')
          if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay)
          }
        },
        applyFamilyTreeTheme(overlay, state) {
          let dark = this.isGameDarkTheme(state)
          overlay.classList.toggle('cor-society-theme-dark', dark)
          overlay.classList.toggle('cor-society-theme-light', !dark)
          overlay.setAttribute('data-cor-society-theme', dark ? 'dark' : 'light')
        },
        isGameDarkTheme(state) {
          state = state || daapi.getState()
          if (state && state.settings && typeof state.settings.darkMode === 'boolean') {
            return state.settings.darkMode
          }
          if (typeof document !== 'undefined') {
            let probes = [document.documentElement, document.body, document.getElementById('app')].filter(Boolean)
            for (let i = 0; i < probes.length; i += 1) {
              let probe = probes[i]
              let marker = ((probe.getAttribute('data-bs-theme') || '') + ' ' + (probe.className || '')).toLowerCase()
              if (marker.indexOf('dark') >= 0 || marker.indexOf('night') >= 0) return true
              if (marker.indexOf('light') >= 0) return false
            }
            let bg = this.firstOpaqueBackground(probes)
            if (bg) {
              return this.colorLuminance(bg) < 0.45
            }
          }
          if (typeof window !== 'undefined' && window.matchMedia) {
            try {
              return !!window.matchMedia('(prefers-color-scheme: dark)').matches
            } catch (err) {
              return false
            }
          }
          return false
        },
        firstOpaqueBackground(elements) {
          for (let i = 0; i < elements.length; i += 1) {
            let style = window.getComputedStyle(elements[i])
            let bg = style && style.backgroundColor
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
              return bg
            }
          }
          return ''
        },
        familyTreeTitle(mode) {
          if (mode === 'known') return 'Known Family Tree'
          if (mode === 'house') return 'House Family Tree'
          if (mode === 'dynasty') return 'Full Dynasty Tree'
          if (mode === 'full') return 'Full Family Tree'
          return 'Society Family Tree'
        },
        familyTreeStartId(characterId, state, mode) {
          let character = state.characters[characterId]
          if (!character) {
            return characterId
          }
          character.id = character.id || characterId
          if (mode === 'known') {
            if (character.fatherId && state.characters[character.fatherId]) return character.fatherId
            if (character.motherId && state.characters[character.motherId]) return character.motherId
            return character.id
          }
          return this.familyTreeRootId(character.id, state)
        },
        familyTreeRootId(characterId, state) {
          let current = state.characters[characterId]
          let guard = 0
          while (current && guard < 24) {
            current.id = current.id || characterId
            let parents = [current.fatherId, current.motherId].filter((id) => id && state.characters[id])
            if (!parents.length) {
              break
            }
            let sameDynastyParent = parents.find((id) => state.characters[id].dynastyId && state.characters[id].dynastyId === current.dynastyId)
            let nextId = sameDynastyParent || parents[0]
            if (!nextId || this.sameCharacterId(nextId, current.id)) {
              break
            }
            current = state.characters[nextId]
            characterId = nextId
            guard += 1
          }
          return current && current.id ? current.id : characterId
        },
        createFamilyTreeBranch({ rootId, focusId, state, society, fallbackHouse, depth, depthLimit, mode, visited, returnTo, returnPage }) {
          let character = state.characters[rootId]
          let branch = document.createElement('div')
          branch.className = 'cor-society-tree-family'
          if (!character) {
            branch.appendChild(this.createFamilyTreeEmptyCard('Unknown'))
            return branch
          }
          character.id = character.id || rootId
          let key = String(character.id)
          let alreadyVisited = visited[key]
          visited = { ...visited, [key]: true }

          let spouseId = this.treeSpouseId(character, state)
          let spouse = spouseId && state.characters[spouseId] ? state.characters[spouseId] : false
          if (spouse) {
            spouse.id = spouse.id || spouseId
          }
          let children = alreadyVisited ? [] : this.treeChildrenIds(character, state)
          if (mode === 'house' && fallbackHouse) {
            children = children.filter((childId) => this.characterBelongsToHouse(state.characters[childId], fallbackHouse))
          }
          if (depth >= depthLimit) {
            children = []
          }

          let couple = document.createElement('div')
          couple.className = 'cor-society-tree-couple' + (children.length ? ' has-children' : '')
          couple.appendChild(this.createFamilyTreeCharacterCard(character, state, society, fallbackHouse, this.treeRoleLabel(character, focusId, depth, false), focusId, returnTo, returnPage))
          if (spouse && !this.sameCharacterId(spouse.id, character.id)) {
            couple.appendChild(this.createFamilyTreeCharacterCard(spouse, state, society, fallbackHouse, this.treeRoleLabel(spouse, focusId, depth, true), focusId, returnTo, returnPage))
          }
          branch.appendChild(couple)

          if (children.length) {
            let childrenWrap = document.createElement('div')
            childrenWrap.className = 'cor-society-tree-children'
            children.forEach((childId) => {
              childrenWrap.appendChild(this.createFamilyTreeBranch({
                rootId: childId,
                focusId,
                state,
                society,
                fallbackHouse,
                depth: depth + 1,
                depthLimit,
                mode,
                visited,
                returnTo,
                returnPage
              }))
            })
            branch.appendChild(childrenWrap)
          }
          return branch
        },
        createFamilyTreeCharacterCard(character, state, society, fallbackHouse, role, focusId, returnTo, returnPage) {
          let house = this.treeHouseForCharacter(character, society, fallbackHouse)
          let card = document.createElement('button')
          card.type = 'button'
          card.id = 'familyTreeCharacterBox_' + character.id
          card.className = 'btn btn-sm btn-outline-secondary btn-family-tree-card cor-society-tree-card'
          if (this.sameCharacterId(character.id, focusId)) {
            card.className += ' active'
          }
          if (character.isDead) {
            card.className += ' is-dead'
          }
          card.title = this.characterTooltip(character, state)
          card.addEventListener('click', () => {
            let nextHouseId = this.houseIdForCharacter(character, state, society) || (house && house.id) || ''
            this.openGraphicalFamilyTree({
              society,
              state: daapi.getState(),
              house: society.houses[nextHouseId] || house || fallbackHouse,
              houseId: nextHouseId,
              characterId: character.id,
              group: '',
              page: 0,
              mode: 'full',
              returnTo,
              returnPage
            })
          })

          let portrait = document.createElement('img')
          portrait.className = 'img-fluid icon-character-small cor-society-tree-card-portrait'
          portrait.src = this.characterPortrait(character, state, house)
          portrait.alt = ''
          card.appendChild(portrait)

          let text = document.createElement('span')
          text.className = 'cor-society-tree-card-text'
          card.appendChild(text)

          let roleEl = document.createElement('span')
          roleEl.className = 'cor-society-tree-card-role'
          roleEl.textContent = role
          text.appendChild(roleEl)

          let nameEl = document.createElement('span')
          nameEl.className = 'cor-society-tree-card-name'
          nameEl.textContent = this.characterName(character, state)
          text.appendChild(nameEl)

          let metaEl = document.createElement('span')
          metaEl.className = 'cor-society-tree-card-meta'
          metaEl.textContent = this.treeCharacterMeta(character, state)
          text.appendChild(metaEl)
          return card
        },
        createFamilyTreeEmptyCard(label) {
          let card = document.createElement('div')
          card.className = 'cor-society-tree-card cor-society-tree-empty-card'
          card.textContent = label
          return card
        },
        treeHouseForCharacter(character, society, fallbackHouse) {
          if (character && character.corSocietyHouseId && society.houses[character.corSocietyHouseId]) {
            return society.houses[character.corSocietyHouseId]
          }
          if (character && character.dynastyId && society.houses[character.dynastyId]) {
            return society.houses[character.dynastyId]
          }
          return fallbackHouse || false
        },
        treeRoleLabel(character, focusId, depth, isSpouse) {
          if (this.sameCharacterId(character.id, focusId)) return 'Selected'
          if (isSpouse) return 'Spouse'
          if (depth === 0) return character.isDead ? 'Ancestor' : 'Root'
          return character.isDead ? 'Ancestor' : 'Kin'
        },
        treeCharacterMeta(character, state) {
          if (character.isDead) {
            return 'Died ' + (character.deathYear || 'unknown')
          }
          return 'Age ' + this.age(character, state)
        },
        treeSpouseId(character, state) {
          if (character.spouseId && state.characters[character.spouseId]) {
            return character.spouseId
          }
          let children = this.treeChildrenIds(character, state)
          for (let i = 0; i < children.length; i++) {
            let child = state.characters[children[i]]
            if (!child) {
              continue
            }
            if (this.sameCharacterId(child.fatherId, character.id) && child.motherId && state.characters[child.motherId]) {
              return child.motherId
            }
            if (this.sameCharacterId(child.motherId, character.id) && child.fatherId && state.characters[child.fatherId]) {
              return child.fatherId
            }
          }
          return ''
        },
        treeChildrenIds(character, state) {
          let ids = []
          let seen = {}
          let add = (id) => {
            if (!id || seen[id] || !state.characters[id] || this.sameCharacterId(id, character.id)) {
              return
            }
            seen[id] = true
            ids.push(id)
          }
          ;(character.childrenIds || []).forEach(add)
          for (let id in state.characters) {
            if (!state.characters.hasOwnProperty(id)) {
              continue
            }
            let other = state.characters[id]
            if (!other) {
              continue
            }
            other.id = other.id || id
            if (this.sameCharacterId(other.fatherId, character.id) || this.sameCharacterId(other.motherId, character.id)) {
              add(other.id)
            }
          }
          return ids.sort((a, b) => {
            let first = state.characters[a] || {}
            let second = state.characters[b] || {}
            return (first.birthYear || 0) - (second.birthYear || 0)
          })
        },
        openTextFamilyTreeFallback({ society, state, house, houseId, characterId, group, page, mode, returnTo, returnPage }) {
          let character = state.characters[characterId]
          if (!character) {
            this.openHouse({ houseId, returnTo, returnPage })
            return
          }
          character.id = character.id || characterId
          let relatives = this.familyTreeRelatives(character, state)
          let message = [
            this.characterLink(character.id, state),
            'Father: ' + this.characterLink(character.fatherId, state),
            'Mother: ' + this.characterLink(character.motherId, state),
            'Spouse: ' + this.characterLink(character.spouseId, state),
            'Children: ' + (relatives.children.length ? relatives.children.map((id) => this.characterLink(id, state)).join(', ') : 'none'),
            'Siblings: ' + (relatives.siblings.length ? relatives.siblings.map((id) => this.characterLink(id, state)).join(', ') : 'none')
          ].join('\n')
          let relativeOptions = []
          ;[
            { label: 'Father', id: character.fatherId },
            { label: 'Mother', id: character.motherId },
            { label: 'Spouse', id: character.spouseId }
          ].forEach((relative) => {
            if (relative.id && state.characters[relative.id]) {
              relativeOptions.push(this.familyRelativeOption(relative.label, relative.id, state, society, houseId, returnTo, returnPage))
            }
          })
          relatives.children.slice(0, 8).forEach((relativeId) => {
            relativeOptions.push(this.familyRelativeOption('Child', relativeId, state, society, houseId, returnTo, returnPage))
          })
          relatives.siblings.slice(0, 4).forEach((relativeId) => {
            relativeOptions.push(this.familyRelativeOption('Sibling', relativeId, state, society, houseId, returnTo, returnPage))
          })
          let nav = this.navContext(returnTo, returnPage)
          let backAction = group ? {
            event: this.event,
            method: 'openPerson',
            context: { houseId, characterId, group, page: page || 0, ...nav }
          } : {
            event: this.event,
            method: 'openPerson',
            context: { houseId, characterId, ...nav }
          }
          relativeOptions.push({
            text: 'Back',
            action: backAction
          })
          this.pushModal({
            societyMenu: true,
            title: mode === 'known' ? 'Known Family' : mode === 'full' ? 'Full Family Tree' : 'Family Tree',
            message,
            image: this.characterPortrait(character, state, house),
            options: relativeOptions
          })
        },
        openMarriageHousehold({ houseId }) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          if (!house) {
            this.openHub()
            return
          }
          let access = this.marriageOptionInfo(society, state, house)
          if (!access.available) {
            this.pushModal({
              title: 'Marriage unavailable',
              message: access.tooltip,
              image: this.houseCrestIcon(society, house),
              options: [
                {
                  text: 'Back',
                  action: {
                    event: this.event,
                    method: 'openHouse',
                    context: { houseId }
                  }
                }
              ]
            })
            return
          }
          let candidates = this.playerMarriageCandidates(state)
          let options = candidates.slice(0, 12).map((character) => {
            return {
              text: this.characterName(character, state),
              tooltip: this.characterTooltip(character, state),
              icons: [this.characterPortrait(character, state)],
              action: {
                event: this.event,
                method: 'openMarriageCandidates',
                context: { houseId, playerCharacterId: character.id }
              }
            }
          })
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHouse',
              context: { houseId }
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Arrange marriage',
            message: candidates.length ? 'Choose one of your unmarried adult family members.' : 'No unmarried adult in your family is available.',
            image: this.houseCrestIcon(society, house),
            options
          })
        },
        openMarriageCandidates({ houseId, playerCharacterId }) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let playerCharacter = state.characters[playerCharacterId]
          if (!house || !playerCharacter) {
            this.openHouse({ houseId })
            return
          }
          let access = this.marriageOptionInfo(society, state, house)
          if (!access.available) {
            this.pushModal({
              title: 'Marriage unavailable',
              message: access.tooltip,
              image: this.houseCrestIcon(society, house),
              options: [
                {
                  text: 'Back',
                  action: {
                    event: this.event,
                    method: 'openHouse',
                    context: { houseId }
                  }
                }
              ]
            })
            return
          }
          let candidates = this.houseMarriageCandidates(house, state, playerCharacter)
          if (!candidates.length && (society.generatedCharacterIds || []).length < 180) {
            let prospectId = this.generateMarriageProspect(society, state, house, playerCharacter)
            if (!prospectId) {
              candidates = []
            } else {
              this.save(society)
              state = daapi.getState()
              try {
                let prospect = daapi.getCharacter({ characterId: prospectId })
                if (prospect && state.characters) {
                  state.characters[prospectId] = prospect
                }
              } catch (err) {
                console.warn(err)
              }
              house = society.houses[houseId]
              playerCharacter = state.characters[playerCharacterId]
              candidates = this.houseMarriageCandidates(house, state, playerCharacter)
            }
          }
          let options = candidates.slice(0, 12).map((character) => {
            return {
              text: this.characterName(character, state),
              tooltip: this.characterTooltip(character, state),
              icons: [this.characterPortrait(character, state, house), this.houseCrestIcon(society, house)],
              action: {
                event: this.event,
                method: 'confirmSocietyMarriage',
                context: { houseId, playerCharacterId, spouseId: character.id }
              }
            }
          })
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openMarriageHousehold',
              context: { houseId }
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Marriage with ' + house.name,
            message: candidates.length ? 'Choose a spouse for ' + this.characterName(playerCharacter, state) + '.' : 'No compatible unmarried adult is available in this house.',
            image: this.characterPortrait(playerCharacter, state),
            options
          })
        },
        confirmSocietyMarriage({ houseId, playerCharacterId, spouseId }) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let playerCharacter = state.characters[playerCharacterId]
          let spouse = state.characters[spouseId]
          if (!house || !playerCharacter || !spouse) {
            this.openHouse({ houseId })
            return
          }
          if (house.stratum === 'poor' || this.isSlaveCharacter(spouse, house)) {
            this.pushModal({
              title: 'Marriage unavailable',
              message: 'Your family cannot arrange a marriage with an enslaved character. Use Household Slaves for slave-to-slave household marriages.',
              image: this.affairIcon('marriage'),
              options: [{ text: 'Back', action: { event: this.event, method: 'openHouse', context: { houseId } } }]
            })
            return
          }
          let matrilineal = !this.characterIsMale(playerCharacter)
          let message = [
            this.characterName(playerCharacter, state),
            'and',
            this.characterName(spouse, state),
            '',
            matrilineal ? 'The marriage will be matrilineal, keeping your household line central.' : 'The marriage will follow the usual household line.'
          ].join('\n')
          this.pushModal({
            societyMenu: true,
            title: 'Confirm marriage?',
            message,
            image: this.characterPortrait(spouse, state, house),
            options: [
              {
                variant: 'info',
                text: 'Arrange wedding',
                icons: [this.characterPortrait(playerCharacter, state), this.characterPortrait(spouse, state, house)],
                action: {
                  event: this.event,
                  method: 'performSocietyMarriage',
                  context: { houseId, playerCharacterId, spouseId, isMatrilineal: matrilineal }
                }
              },
              {
                text: 'Cancel',
                action: {
                  event: this.event,
                  method: 'openMarriageCandidates',
                  context: { houseId, playerCharacterId }
                }
              }
            ]
          })
        },
        performSocietyMarriage({ houseId, playerCharacterId, spouseId, isMatrilineal }) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let playerCharacter = state.characters[playerCharacterId]
          let spouse = state.characters[spouseId]
          if (!house || !playerCharacter || !spouse) {
            this.openHouse({ houseId })
            return
          }
          playerCharacter.id = playerCharacter.id || playerCharacterId
          spouse.id = spouse.id || spouseId
          if (house.stratum === 'poor' || this.isSlaveCharacter(spouse, house) || !this.isMarriageEligible(playerCharacter, state) || !this.isMarriageEligible(spouse, state) || !this.isMarriageCompatible(playerCharacter, spouse)) {
            this.pushModal({
              title: 'Marriage no longer valid',
              message: 'The selected marriage is no longer available. One character may already be married, too young, too old, dead, enslaved, blocked from marriage, from the same dynasty, or incompatible.',
              image: this.affairIcon('marriage'),
              options: [
                {
                  text: 'Choose again',
                  action: {
                    event: this.event,
                    method: 'openMarriageHousehold',
                    context: { houseId }
                  }
                },
                {
                  text: 'Back to house',
                  action: {
                    event: this.event,
                    method: 'openHouse',
                    context: { houseId }
                  }
                }
              ]
            })
            return
          }
          try {
            daapi.performMarriage({ characterId: playerCharacterId, spouseId, isMatrilineal: !!isMatrilineal })
          } catch (err) {
            console.warn(err)
            this.pushModal({
              title: 'Marriage failed',
              message: 'The vanilla marriage API rejected this wedding: ' + err.name + ': ' + err.message + '\nNo Society marriage effects were applied.',
              image: this.affairIcon('marriage'),
              options: [
                {
                  text: 'Choose again',
                  action: {
                    event: this.event,
                    method: 'openMarriageHousehold',
                    context: { houseId }
                  }
                },
                {
                  text: 'Back to house',
                  action: {
                    event: this.event,
                    method: 'openHouse',
                    context: { houseId }
                  }
                }
              ]
            })
            return
          }
          try {
            daapi.forceUpdateCharacterDisplay({ characterId: playerCharacterId })
            daapi.forceUpdateCharacterDisplay({ characterId: spouseId })
          } catch (err) {
            console.warn(err)
          }
          state = daapi.getState()
          playerCharacter = (state.characters && state.characters[playerCharacterId]) || playerCharacter
          spouse = (state.characters && state.characters[spouseId]) || spouse
          let effects = this.marriageEffects(state, house)
          this.applyStats(effects.stats)
          if (effects.revenue) {
            try {
              daapi.addAdditiveModifier({
                key: 'revenue',
                id: 'cor_society_marriage_' + this.safeId(house.id),
                durationInMonths: 24,
                amount: effects.revenue
              })
            } catch (err) {
              console.warn(err)
            }
          }
          house.relation = this.clamp((house.relation || 0) + effects.relation, -100, 100)
          house.favor = (house.favor || 0) + 1
          this.changePersonalRelation(society, playerCharacterId, spouseId, 45, 'friend')
          house.lastFamilyEvent = 'Marriage alliance with your household.'
          this.log(society, 'A marriage joins your household with ' + house.name + ': ' + this.characterName(playerCharacter, state) + ' and ' + this.characterName(spouse, state) + '.', 'marriage', house.id)
          this.save(society)
          this.pushModal({
            title: 'Marriage arranged',
            message: [
              this.characterName(spouse, state) + ' is now married to ' + this.characterName(playerCharacter, state) + '.',
              effects.summary,
              'The vanilla family screen should show the spouse link after the game refreshes.'
            ].join('\n'),
            image: this.characterPortrait(spouse, state, house),
            options: [
              {
                text: 'Back to house',
                action: {
                  event: this.event,
                  method: 'openHouse',
                  context: { houseId }
                }
              }
            ]
          })
        },
        openBankOfRome() {
          let society = this.ensure()
          let state = daapi.getState()
          let bank = society.bank || {}
          let principal = Math.round(parseFloat(bank.principal || 0))
          let interest = principal ? this.bankInterest(society) : 0
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          let debtRelief = cash < 0 ? Math.max(50, Math.ceil(Math.abs(cash) + 25)) : 0
          let loanAmounts = [250, 600, 1200, 2500].map((amount) => {
            return {
              text: 'Borrow ' + amount,
              tooltip: 'Receive cash now. The Bank of Rome will expect yearly interest until principal is repaid.',
              statChanges: { cash: amount },
              icons: [this.bundledIcon('bank_of_rome', 'money')],
              action: {
                event: this.event,
                method: 'takeBankLoan',
                context: { amount }
              }
            }
          })
          let options = []
          if (debtRelief) {
            options.push({
              variant: 'danger',
              text: 'Borrow to cover debt (' + debtRelief + ')',
              tooltip: 'Emergency loan sized around your current negative cash. This can help before the game forces sales, but annual interest still applies.',
              statChanges: { cash: debtRelief },
              icons: [this.bundledIcon('bank_of_rome', 'money'), this.affairIcon('coins')],
              action: {
                event: this.event,
                method: 'takeEmergencyDebtLoan',
                context: { amount: debtRelief }
              }
            })
          }
          if (principal) {
            let payChunk = Math.min(principal, Math.max(50, Math.round(principal * 0.25)))
            options.push({
              variant: 'info',
              text: 'Pay yearly interest (' + interest + ')',
              disabled: cash < interest,
              showDisabledWithTooltip: true,
              tooltip: 'Pays this year\'s interest only. Principal remains at ' + principal + '.',
              statChanges: { cash: -interest },
              icons: [this.bundledIcon('bank_of_rome', 'money')],
              action: {
                event: this.event,
                method: 'payBankLoan',
                context: { amount: 0, interestOnly: true }
              }
            })
            options.push({
              text: 'Pay principal (' + payChunk + ')',
              disabled: cash < (interest + payChunk),
              showDisabledWithTooltip: true,
              tooltip: 'Pays interest plus ' + payChunk + ' principal.',
              statChanges: { cash: -(interest + payChunk) },
              icons: [this.affairIcon('coins')],
              action: {
                event: this.event,
                method: 'payBankLoan',
                context: { amount: payChunk }
              }
            })
            options.push({
              text: 'Clear loan (' + (interest + principal) + ')',
              disabled: cash < (interest + principal),
              showDisabledWithTooltip: true,
              tooltip: 'Pays all interest and clears the full principal.',
              statChanges: { cash: -(interest + principal) },
              icons: [this.affairIcon('coins')],
              action: {
                event: this.event,
                method: 'payBankLoan',
                context: { amount: principal }
              }
            })
          }
          options = options.concat(loanAmounts)
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'openHub'
            }
          })
          let summaryOptions = [
            this.summaryOption('Principal', principal + ' cash owed', [this.bundledIcon('bank_of_rome', 'money')], 'Outstanding loan principal.'),
            this.summaryOption('Annual interest', interest + ' cash', [this.affairIcon('coins')], 'Interest is checked at the start of each year.'),
            this.summaryOption('Payments', 'Loans taken ' + Math.round(bank.loansTaken || 0) + '; last paid ' + (bank.lastPaymentYear || 'never') + '.', [this.affairIcon('log')], 'Bank memory kept inside Society state.')
          ]
          if (cash < 0) {
            summaryOptions.push(this.summaryOption('Debt pressure', Math.round(cash) + ' cash', [this.affairIcon('rivalry')], 'Emergency borrowing is available while your household is in negative cash.'))
          }
          this.pushModal({
            societyMenu: true,
            title: 'Bank of Rome',
            message: 'Bank summary.',
            societySummaryOptions: summaryOptions,
            image: this.bundledIcon('bank_of_rome', 'money'),
            options
          })
        },
        takeBankLoan({ amount } = {}) {
          let society = this.ensure()
          amount = Math.max(1, Math.round(parseFloat(amount || 0)))
          society.bank = society.bank || {}
          society.bank.principal = Math.max(0, Math.round(parseFloat(society.bank.principal || 0) + amount))
          society.bank.loansTaken = Math.round(parseFloat(society.bank.loansTaken || 0) + 1)
          this.applyStats({ cash: amount })
          this.log(society, 'You borrow ' + amount + ' from the Bank of Rome.', 'bank')
          this.save(society)
          this.openBankOfRome()
        },
        takeEmergencyDebtLoan({ amount } = {}) {
          let state = daapi.getState()
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          amount = Math.max(Math.ceil(Math.abs(Math.min(0, cash)) + 25), Math.round(parseFloat(amount || 0)), 50)
          this.takeBankLoan({ amount })
        },
        payBankLoan({ amount, interestOnly } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let principal = Math.max(0, Math.round(parseFloat((society.bank && society.bank.principal) || 0)))
          let interest = principal ? this.bankInterest(society) : 0
          amount = Math.max(0, Math.round(parseFloat(amount || 0)))
          if (interestOnly) {
            amount = 0
          }
          amount = Math.min(principal, amount)
          let total = interest + amount
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          if (total <= 0 || cash < total) {
            this.pushModal({
              societyMenu: true,
              title: 'Bank payment unavailable',
              message: 'You do not have enough cash for that payment.',
              image: this.bundledIcon('bank_of_rome', 'money'),
              options: [
                {
                  text: 'Back',
                  action: { event: this.event, method: 'openBankOfRome' }
                }
              ]
            })
            return
          }
          this.applyStats({ cash: -total })
          society.bank.principal = Math.max(0, principal - amount)
          society.bank.lastPaymentYear = String(state.year || '')
          society.bank.lastNoticeYear = String(state.year || '')
          this.log(society, 'Bank payment made: ' + total + ' cash, principal now ' + society.bank.principal + '.', 'bank')
          this.save(society)
          this.openBankOfRome()
        },
        deferBankPayment() {
          let society = this.ensure()
          let state = daapi.getState()
          let interest = this.bankInterest(society)
          society.bank.principal = Math.max(0, Math.round(parseFloat(society.bank.principal || 0) + interest))
          society.bank.lastNoticeYear = String(state.year || '')
          this.applyStats({ prestige: -8, influence: -20 })
          this.log(society, 'You defer Bank of Rome interest; debt grows by ' + interest + ' and standing suffers.', 'bank')
          this.save(society)
        },
        openHouseholdSlaves() {
          let society = this.ensure()
          let state = daapi.getState()
          let slaves = this.playerSlaveRecords(society, state)
          let options = slaves.map((slave) => {
            let character = slave.characterId && state.characters && state.characters[slave.characterId]
            let fullName = character ? this.slaveDisplayName({ ...character, id: slave.characterId }, slave, state) : slave.name
            return {
              text: fullName + ' - ' + this.slaveTypeLabel(slave.type) + ' L' + Math.round(slave.level || 1),
              tooltip: 'Owned household slave.\nOrigin: ' + this.slaveOriginDescription(slave.origin || (character && character.corSocietySlaveOrigin) || 'unknown') + '\nOpen for full name, origin, house links, sale, or manumission.',
              icons: [character ? this.characterPortrait({ ...character, id: slave.characterId }, state) : this.slaveTypeIcon(slave.type), this.slaveTypeIcon(slave.type)],
              action: {
                event: this.event,
                method: 'openManageSlave',
                context: { slaveKey: slave.key, characterId: slave.characterId }
              }
            }
          })
          options.push({
            variant: 'info',
            text: 'Slave market',
            tooltip: 'Browse known enslaved Society characters and new market offers.',
            icons: [this.slaveTypeIcon('money')],
            action: {
              event: this.event,
              method: 'openSlaveMarket'
            }
          })
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openHub' }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Household Slaves',
            message: 'Household slave management.',
            societySummaryOptions: [
              this.summaryOption('Owned', slaves.length + ' active household slaves', [this.slaveTypeIcon('household')], 'Each owned slave is backed by a real game character.'),
              this.summaryOption('Access', 'Open a slave to see full name, origin house, and management actions.', [this.affairIcon('familyTree')], 'Known origin/owner houses can be opened directly.'),
              this.summaryOption('Work', 'Tasks give modest owner benefits: cash, prestige, influence, education, health care, or labor.', this.slaveTypes().map((type) => this.slaveTypeIcon(type)), 'Effects are intentionally capped for balance.')
            ],
            image: this.slaveTypeIcon('household'),
            options
          })
        },
        knownEnslavedCandidates(society, state) {
          let currentId = this.currentCharacterId(state)
          let current = state.characters && state.characters[currentId]
          let playerDynastyId = current && current.dynastyId
          let candidates = []
          this.sortedHouses(society).forEach((house) => {
            this.refreshHouseMemberLists(society, state, house)
            this.visibleHousePeople(house, state).forEach((characterId) => {
              let character = state.characters && state.characters[characterId]
              if (!character || character.isDead || (playerDynastyId && character.dynastyId === playerDynastyId)) return
              character.id = character.id || characterId
              let info = this.enslavedPurchaseInfo(society, state, house, character)
              if (info.available || info.visible) {
                candidates.push({ house, character, info })
              }
            })
          })
          return candidates.sort((a, b) => a.info.cost - b.info.cost)
        },
        ensureSlaveMarketOffers(society, state, count) {
          count = count || 6
          society.slaveMarketOffers = society.slaveMarketOffers || []
          let active = []
          society.slaveMarketOffers.forEach((offer) => {
            let character = offer && offer.characterId && state.characters && state.characters[offer.characterId]
            if (!offer || offer.active === false || !character || character.isDead) {
              return
            }
            if (character.corSocietySlaveActive && !character.corSocietySlaveMarket) {
              return
            }
            active.push(offer)
          })
          society.slaveMarketOffers = active.slice(-count)
          let biases = [0, 0, 1, 1, 2, 3]
          while (society.slaveMarketOffers.length < count) {
            let template = this.randomSlaveTemplate(false, biases[society.slaveMarketOffers.length] || 0)
            template.market = true
            template.ownerHouseId = ''
            let record = this.generateSlaveCharacter(society, state, false, template)
            state = daapi.getState()
            let character = record.characterId && state.characters && state.characters[record.characterId]
            if (!character) {
              break
            }
            let cost = this.slaveCost(record)
            let offerId = 'market_' + this.safeId(record.characterId)
            try {
              daapi.updateCharacter({
                characterId: record.characterId,
                character: {
                  dynastyId: '',
                  corSocietySlaveMarket: true,
                  corSocietySlaveActive: false,
                  corSocietyMarketOfferId: offerId,
                  corSocietySlaveFullName: record.fullName,
                  corSocietySlaveOrigin: record.origin,
                  flagDoNotCull: true,
                  flagCannotMarry: true
                }
              })
            } catch (err) {
              console.warn(err)
            }
            society.slaveMarketOffers.push({
              offerId,
              characterId: record.characterId,
              template: record,
              cost,
              createdMonth: this.monthKey(state),
              active: true
            })
          }
          return society.slaveMarketOffers.slice(0, count)
        },
        transferMarketSlaveToPlayer(society, state, offer, template, cost) {
          template = template || {}
          let characterId = template.characterId || (offer && offer.characterId)
          let character = characterId && state.characters && state.characters[characterId]
          if (!character) {
            return false
          }
          let playerDynastyId = this.currentCharacterDynastyId(state)
          let type = template.type || character.corSocietySlaveType || 'labor'
          let level = Math.max(1, Math.round(template.level || character.corSocietySlaveLevel || 1))
          let task = template.task || character.corSocietySlaveTask || this.slaveTypeProfile(type).task || type
          let origin = template.origin || character.corSocietySlaveOrigin || this.randomSlaveOrigin()
          let fullName = template.fullName || character.corSocietySlaveFullName || this.slaveDisplayName(character, template, state)
          try {
            daapi.updateCharacter({
              characterId,
              character: {
                dynastyId: playerDynastyId || character.dynastyId,
                corSocietySlave: true,
                corSocietySlaveActive: true,
                corSocietySlaveMarket: false,
                corSocietySlaveType: type,
                corSocietySlaveLevel: level,
                corSocietySlaveOwnerHouseId: playerDynastyId || '',
                corSocietySlaveOrigin: origin,
                corSocietySlaveFullName: fullName,
                corSocietySlaveTask: task,
                corSocietySlaveSavings: Math.max(0, parseFloat(template.savings || character.corSocietySlaveSavings || 0)),
                corSocietyOrigin: 'enslaved_dependant',
                flagCannotMarry: true,
                flagDoNotCull: true
              }
            })
            daapi.forceUpdateCharacterDisplay({ characterId })
          } catch (err) {
            console.warn(err)
          }
          state = daapi.getState()
          let updated = (state.characters && state.characters[characterId]) || character
          return this.playerSlaveRecordFromCharacter({
            key: template.key || ('slave_' + this.safeId(characterId)),
            characterId,
            name: fullName,
            fullName,
            type,
            level,
            age: this.age(updated, state),
            origin,
            task,
            savings: Math.max(0, parseFloat(template.savings || updated.corSocietySlaveSavings || 0))
          }, updated, state)
        },
        openSlaveMarket({ page } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          page = parseInt(page || 0, 10)
          let known = this.knownEnslavedCandidates(society, state)
          let pageSize = 7
          let shown = known.slice(page * pageSize, page * pageSize + pageSize)
          let options = shown.map((item) => {
            let name = this.slaveDisplayName(item.character, null, state)
            let houseName = item.house && item.house.name || ''
            let suffix = !item.character.corSocietySlaveFullName && houseName && name.toLowerCase().indexOf(houseName.toLowerCase()) < 0 ? ' of ' + houseName : ''
            return {
              text: name + suffix + ' (' + item.info.cost + ')',
              disabled: !item.info.available,
              showDisabledWithTooltip: true,
              tooltip: item.info.tooltip,
              icons: [this.characterPortrait(item.character, state, item.house), this.houseCrestIcon(society, item.house), this.slaveTypeIcon(item.info.type)],
              action: {
                event: this.event,
                method: 'buyEnslavedCharacter',
                context: { houseId: item.house.id, characterId: item.character.id, cost: item.info.cost }
              }
            }
          })
          if (page * pageSize + pageSize < known.length) {
            options.push({
              text: 'Next known people',
              action: { event: this.event, method: 'openSlaveMarket', context: { page: page + 1 } }
            })
          }
          if (page > 0) {
            options.push({
              text: 'Previous known people',
              action: { event: this.event, method: 'openSlaveMarket', context: { page: page - 1 } }
            })
          }
          if (page === 0) {
            let offers = this.ensureSlaveMarketOffers(society, state, 6)
            state = daapi.getState()
            offers.forEach((offer) => {
              let template = offer.template || {}
              let character = offer.characterId && state.characters && state.characters[offer.characterId]
              let cost = Math.max(1, Math.round(parseFloat(offer.cost || this.slaveCost(template))))
              if (!character) {
                return
              }
              character.id = character.id || offer.characterId
              let label = this.slaveTypeLabel(template.type || character.corSocietySlaveType)
              let level = Math.max(1, Math.round(template.level || character.corSocietySlaveLevel || 1))
              options.push({
                text: this.slaveDisplayName(character, template, state) + ' - ' + label + ' L' + level + ' (' + cost + ')',
                tooltip: 'Market slave already generated as a real character.\nOrigin: ' + this.slaveOriginDescription(template.origin || character.corSocietySlaveOrigin) + '\nDefault work: ' + this.slaveTaskInfo(template).label + '.\nBuying transfers this character into your household.',
                disabled: parseFloat(((state || {}).current || {}).cash || 0) < cost,
                showDisabledWithTooltip: true,
                icons: [this.characterPortrait(character, state), this.slaveTypeIcon(template.type || character.corSocietySlaveType), this.affairIcon('coins')],
                action: {
                  event: this.event,
                  method: 'buySlave',
                  context: { offerId: offer.offerId, template, cost }
                }
              })
            })
            this.save(society)
          }
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openHouseholdSlaves' }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Slave market',
            message: 'Known enslaved dependants appear first; generated market offers appear after them.',
            image: this.slaveTypeIcon('money'),
            options
          })
        },
        buySlave({ offerId, template, cost } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let offer = offerId && (society.slaveMarketOffers || []).find((item) => item && item.offerId === offerId)
          if (offer) {
            template = { ...(offer.template || {}), ...(template || {}), characterId: offer.characterId }
            cost = offer.cost || cost
          }
          template = template || this.randomSlaveTemplate(false)
          cost = Math.max(1, Math.round(parseFloat(cost || this.slaveCost(template))))
          if (parseFloat(((state || {}).current || {}).cash || 0) < cost) {
            this.openSlaveMarket()
            return
          }
          this.applyStats({ cash: -cost })
          let playerRecord = false
          if (template.characterId && state.characters && state.characters[template.characterId]) {
            playerRecord = this.transferMarketSlaveToPlayer(society, state, offer, template, cost)
          }
          let record = playerRecord ? template : this.generateSlaveCharacter(society, state, false, template)
          state = daapi.getState()
          let character = state.characters && state.characters[record.characterId]
          if (!playerRecord) {
            playerRecord = this.playerSlaveRecordFromCharacter(record, character, state)
          }
          society.playerSlaves = society.playerSlaves || []
          society.playerSlaves = society.playerSlaves.filter((slave) => !this.sameCharacterId(slave.characterId, playerRecord.characterId))
          society.playerSlaves.push(playerRecord)
          if (offerId) {
            society.slaveMarketOffers = (society.slaveMarketOffers || []).filter((item) => item && item.offerId !== offerId)
          }
          this.log(society, 'You purchase ' + playerRecord.name + ', an enslaved ' + this.slaveTypeLabel(playerRecord.type).toLowerCase() + '.', 'slaves')
          this.save(society)
          this.openManageSlave({ slaveKey: playerRecord.key, characterId: playerRecord.characterId })
        },
        openManageSlave({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => {
            return (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId))
          })
          if (!record) {
            this.openHouseholdSlaves()
            return
          }
          let character = record.characterId && state.characters && state.characters[record.characterId]
          let fullName = character ? this.slaveDisplayName({ ...character, id: record.characterId }, record, state) : record.name
          let originHouseId = record.originHouseId || (character && character.corSocietyOriginHouseId) || ''
          let previousOwnerHouseId = record.previousOwnerHouseId || (character && character.corSocietyPreviousOwnerHouseId) || ''
          let origin = record.origin || (character && character.corSocietySlaveOrigin) || 'unknown'
          let marriageCandidates = this.ownedSlaveMarriageCandidates(society, state, record)
          let childrenUnder13 = this.householdChildrenUnder13(state)
          let freedomPrice = this.slaveFreedomPrice(record)
          let savings = Math.round(parseFloat(record.savings || 0))
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          let currentDynastyId = this.currentCharacterDynastyId(state)
          let currentCharacterId = this.currentCharacterId(state)
          let currentCharacter = currentCharacterId && state.characters && state.characters[currentCharacterId]
          let fatherId = character && (character.corSocietyTrueFatherId || character.fatherId)
          let father = fatherId && state.characters && state.characters[fatherId]
          if (father) father.id = father.id || fatherId
          let isPrivateCompanyBastard = !!(character && character.corSocietyOrigin === 'private_company_bastard')
          let canLegitimize = !!(isPrivateCompanyBastard && father && !father.corSocietySlave && father.dynastyId && father.dynastyId === currentDynastyId)
          let legitimizeCost = Math.max(25, Math.round(freedomPrice * 0.6))
          let slaveAge = character ? this.age(character, state) : parseFloat(record.age || 0)
          let privateCompanyCooldown = record.nextCompanionMonth && !this.monthKeyReached(record.nextCompanionMonth, state)
          let privateCompanyDisabled = !!privateCompanyCooldown || !character || slaveAge < 10 || (currentCharacter && this.age(currentCharacter, state) < 16)
          let privateCompanyTooltip = privateCompanyCooldown ? 'Available again after ' + record.nextCompanionMonth + '.' :
            !character ? 'No linked character record is available.' :
              slaveAge < 10 ? 'Slave must be at least 10 years old.' :
                currentCharacter && this.age(currentCharacter, state) < 16 ? 'The current household head is not an adult.' :
                  'Private company action. Consequences: prestige effect, relation softening, risk of illegitimate child if female and fertile.'
          let options = []
          if (originHouseId && society.houses[originHouseId]) {
            options.push({
              variant: 'info',
              text: 'Open origin house',
              tooltip: 'Open the Society house this person came from.',
              icons: [this.houseCrestIcon(society, society.houses[originHouseId])],
              action: { event: this.event, method: 'openHouse', context: { houseId: originHouseId, returnTo: 'hub' } }
            })
          }
          if (previousOwnerHouseId && society.houses[previousOwnerHouseId] && previousOwnerHouseId !== originHouseId) {
            options.push({
              variant: 'info',
              text: 'Open previous owner',
              tooltip: 'Open the house that sold this person.',
              icons: [this.houseCrestIcon(society, society.houses[previousOwnerHouseId])],
              action: { event: this.event, method: 'openHouse', context: { houseId: previousOwnerHouseId, returnTo: 'hub' } }
            })
          }
          options.push({
            variant: 'info',
            text: 'Assign task',
            disabled: this.slaveTaskCooldownActive(record, state),
            showDisabledWithTooltip: true,
            tooltip: this.slaveTaskCooldownActive(record, state) ? 'Task changes are cooling down until ' + record.nextTaskChangeMonth + '.' : 'Choose this slave\'s household task. Tasks affect modest periodic outputs and savings.',
            icons: [this.slaveTypeIcon(this.slaveTaskInfo(record).icon)],
            action: { event: this.event, method: 'openAssignSlaveTask', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          options.push({
            variant: 'info',
            text: 'Choose pupil' + (childrenUnder13.length ? '' : ' (no child)'),
            disabled: !childrenUnder13.length || this.slaveTaskInfo(record).type !== 'educator',
            showDisabledWithTooltip: true,
            tooltip: !childrenUnder13.length ? 'No household child under 13 is available.' : this.slaveTaskInfo(record).type !== 'educator' ? 'Assign this slave to Educate children before selecting a pupil.' : 'Choose which household child under 13 this slave will teach.',
            icons: [this.slaveTypeIcon('educator')],
            action: { event: this.event, method: 'openSlaveEducationTargets', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          options.push({
            variant: 'info',
            text: 'Private company',
            disabled: privateCompanyDisabled,
            showDisabledWithTooltip: true,
            tooltip: privateCompanyTooltip,
            icons: [this.slaveTypeIcon('entertainer')],
            action: { event: this.event, method: 'privateCompanySlave', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          if (isPrivateCompanyBastard) {
            options.push({
              variant: 'info',
              text: 'Legitimize bastard (' + legitimizeCost + ')',
              disabled: !canLegitimize || cash < legitimizeCost,
              showDisabledWithTooltip: true,
              tooltip: !canLegitimize ? 'Only the free father from your dynasty can legitimize this child.' : cash < legitimizeCost ? 'Need ' + legitimizeCost + ' cash.' : 'Acknowledge the child through the free parent. Consequences: removes slave status, joins the father dynasty, costs cash and standing.',
              statChanges: canLegitimize && cash >= legitimizeCost ? { cash: -legitimizeCost, prestige: -6, influence: -8 } : undefined,
              icons: [this.affairIcon('birth'), this.affairIcon('familyTree')],
              action: { event: this.event, method: 'legitimizeSlaveBastard', context: { slaveKey: record.key, characterId: record.characterId, cost: legitimizeCost } }
            })
          }
          options.push({
            variant: 'info',
            text: 'Marry to household slave' + (marriageCandidates.length ? '' : ' (none)'),
            disabled: !marriageCandidates.length,
            showDisabledWithTooltip: true,
            tooltip: marriageCandidates.length ? 'Choose another unmarried adult household slave of different gender.' : 'No compatible unmarried adult slave of different gender is owned by your household.',
            icons: [this.affairIcon('marriage')],
            action: { event: this.event, method: 'openSlaveMarriageCandidates', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          options.push({
            variant: 'info',
            text: 'Accept self-purchase (' + freedomPrice + ')',
            disabled: savings < freedomPrice,
            showDisabledWithTooltip: true,
            tooltip: savings >= freedomPrice ? 'Accept this slave\'s saved payment and manumit them into their own Freedmen house.' : 'Savings ' + savings + '/' + freedomPrice + '. This slave is still trying to buy freedom.',
            statChanges: savings >= freedomPrice ? { cash: freedomPrice, prestige: 8, influence: 10 } : undefined,
            icons: [this.affairIcon('coins'), this.affairIcon('prestige')],
            action: { event: this.event, method: 'acceptSlaveSelfPurchase', context: { slaveKey: record.key, characterId: record.characterId, price: freedomPrice } }
          })
          options.push({
            text: 'Sell (' + Math.round(this.slaveCost(record) * 0.55) + ')',
            tooltip: 'Sell this slave out of your household. The character remains in the game but no longer gives household effects.',
            icons: [this.affairIcon('coins')],
            action: { event: this.event, method: 'sellSlave', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          options.push({
            variant: 'info',
            text: 'Manumit',
            tooltip: 'Free this slave. They keep existing as a real character, but leave the household slave list.',
            icons: [this.affairIcon('prestige')],
            action: { event: this.event, method: 'freeSlave', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openHouseholdSlaves' }
          })
          this.pushModal({
            societyMenu: true,
            title: fullName,
            message: 'Household slave record.',
            societySummaryOptions: [
              this.summaryOption('Identity', fullName + '; ' + this.slaveTypeLabel(record.type) + ' level ' + Math.round(record.level || 1) + '; age ' + Math.round(record.age || (character ? this.age(character, state) : 0)) + '.', [this.slaveTypeIcon(record.type)], 'This is a real character record, not a loose modifier.'),
              this.summaryOption('Origin', this.slaveOriginDescription(origin), [this.affairIcon('log')], 'Slave origin is stored by Society. Roman slaves here are treated as renegades/outcasts, not normal citizens.'),
              this.summaryOption('Freedom fund', savings + '/' + freedomPrice + ' saved; task: ' + this.slaveTaskLabel(record) + '.', [this.affairIcon('coins'), this.slaveTypeIcon(this.slaveTaskInfo(record).icon)], 'Owned slaves slowly save toward buying freedom. Task changes cool down for ' + this.slaveTaskCooldownMonths() + ' months.'),
              this.summaryOption('Education', this.slaveTaskInfo(record).type === 'educator' ? (record.educationTargetId && state.characters[record.educationTargetId] ? 'Teaching ' + this.characterName({ ...state.characters[record.educationTargetId], id: record.educationTargetId }, state) + '.' : 'No pupil selected.') : 'Not assigned to education.', [this.slaveTypeIcon('educator')], 'Only children under 13 can be selected as pupils.'),
              this.summaryOption('Family / origin', 'Origin ' + (originHouseId && society.houses[originHouseId] ? society.houses[originHouseId].name : 'unknown') + '; previous owner ' + (previousOwnerHouseId && society.houses[previousOwnerHouseId] ? society.houses[previousOwnerHouseId].name : 'none') + '.', [this.affairIcon('familyTree')], 'Use the house buttons to navigate when origin data is known.'),
              this.summaryOption('Work', this.slaveTypeLabel(record.type) + ' effects are checked periodically and capped for balance.', [this.slaveTypeIcon(record.type)], 'Owned slaves do not stack infinite modifiers.')
            ],
            image: character ? this.characterPortrait({ ...character, id: record.characterId }, state) : this.slaveTypeIcon(record.type),
            options
          })
        },
        openAssignSlaveTask({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record) {
            this.openHouseholdSlaves()
            return
          }
          if (this.slaveTaskCooldownActive(record, state)) {
            this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          let hasChild = this.householdChildrenUnder13(state).length > 0
          let options = Object.keys(this.slaveTasks()).map((taskKey) => {
            let task = this.slaveTasks()[taskKey]
            return {
              text: task.label,
              disabled: taskKey === 'educator' && !hasChild,
              showDisabledWithTooltip: true,
              tooltip: 'Assign this household task. ' + task.effect,
              icons: [this.slaveTypeIcon(task.icon)],
              action: {
                event: this.event,
                method: 'assignSlaveTask',
                context: { slaveKey: record.key, characterId: record.characterId, task: taskKey }
              }
            }
          })
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openManageSlave', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Assign task',
            message: 'Choose the household work for this slave.',
            image: this.slaveTypeIcon(this.slaveTaskInfo(record).icon),
            options
          })
        },
        assignSlaveTask({ slaveKey, characterId, task } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          let taskInfo = this.slaveTasks()[task]
          if (!record || !taskInfo || this.slaveTaskCooldownActive(record, state)) {
            this.openHouseholdSlaves()
            return
          }
          if (task === 'educator' && !this.householdChildrenUnder13(state).length) {
            this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          record.task = task
          record.nextTaskChangeMonth = this.futureMonthKey(this.slaveTaskCooldownMonths())
          if (task !== 'educator') {
            record.educationTargetId = ''
          } else if (!record.educationTargetId) {
            let children = this.householdChildrenUnder13(state)
            record.educationTargetId = children[0] && children[0].id
          }
          try {
            if (record.characterId) {
              daapi.updateCharacter({
                characterId: record.characterId,
                character: {
                  corSocietySlaveTask: task,
                  corSocietySlaveNextTaskChangeMonth: record.nextTaskChangeMonth,
                  corSocietySlaveEducationTargetId: record.educationTargetId || ''
                }
              })
            }
          } catch (err) {
            console.warn(err)
          }
          this.log(society, record.name + ' is assigned to ' + taskInfo.label.toLowerCase() + '.', 'slaves')
          this.save(society)
          if (task === 'educator') {
            this.openSlaveEducationTargets({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
        },
        openSlaveEducationTargets({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record || this.slaveTaskInfo(record).type !== 'educator') {
            this.openHouseholdSlaves()
            return
          }
          let children = this.householdChildrenUnder13(state)
          let options = children.map((child) => {
            let skill = this.educationSkillForSlave(record)
            return {
              text: this.characterName(child, state),
              tooltip: 'Set as pupil. Consequences: future education ticks improve ' + skill + ' and may add an education-related trait.',
              icons: [this.characterPortrait(child, state), this.slaveTypeIcon('educator')],
              action: {
                event: this.event,
                method: 'setSlaveEducationTarget',
                context: { slaveKey: record.key, characterId: record.characterId, targetId: child.id }
              }
            }
          })
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openManageSlave', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Choose pupil',
            message: children.length ? 'Select a household child under 13.' : 'No household child under 13 is available.',
            image: this.slaveTypeIcon('educator'),
            options
          })
        },
        setSlaveEducationTarget({ slaveKey, characterId, targetId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          let target = targetId && state.characters && state.characters[targetId]
          if (!record || !target || target.isDead || this.age(target, state) >= 13 || this.slaveTaskInfo(record).type !== 'educator') {
            this.openManageSlave({ slaveKey, characterId })
            return
          }
          record.educationTargetId = targetId
          try {
            daapi.updateCharacter({
              characterId: record.characterId,
              character: {
                corSocietySlaveEducationTargetId: targetId
              }
            })
          } catch (err) {
            console.warn(err)
          }
          this.log(society, record.name + ' will educate ' + this.characterName({ ...target, id: targetId }, state) + '.', 'slaves')
          this.save(society)
          this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
        },
        privateCompanySlave({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record || (record.nextCompanionMonth && !this.monthKeyReached(record.nextCompanionMonth, state))) {
            this.openHouseholdSlaves()
            return
          }
          let character = record.characterId && state.characters && state.characters[record.characterId]
          let currentId = this.currentCharacterId(state)
          let currentCharacter = currentId && state.characters && state.characters[currentId]
          if (!character || character.isDead || this.age(character, state) < 16 || (currentCharacter && this.age(currentCharacter, state) < 16)) {
            this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          record.savings = Math.max(0, parseFloat(record.savings || 0) + 2)
          record.nextCompanionMonth = this.futureMonthKey(5)
          this.applyStats({ prestige: 1 })
          if (record.characterId) {
            this.changePersonalRelation(society, currentId, record.characterId, 4, 'admirer')
            try {
              daapi.updateCharacter({
                characterId: record.characterId,
                character: {
                  corSocietySlaveSavings: record.savings,
                  corSocietySlaveNextCompanionMonth: record.nextCompanionMonth
                }
              })
            } catch (err) {
              console.warn(err)
            }
          }
          let hadPregnancy = this.tryPrivateCompanyPregnancy(society, state, record, currentId)
          if (!hadPregnancy) {
            this.log(society, record.name + ' provides private company; household mood improves slightly.', 'slaves')
          } else {
            this.log(society, record.name + ' becomes pregnant; a bastard child will join the household.', 'slaves')
          }
          this.save(society)
          this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
        },
        legitimizeSlaveBastard({ slaveKey, characterId, cost } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          let character = record && record.characterId && state.characters && state.characters[record.characterId]
          if (!record || !character || character.corSocietyOrigin !== 'private_company_bastard') {
            this.openHouseholdSlaves()
            return
          }
          character.id = character.id || record.characterId
          let currentDynastyId = this.currentCharacterDynastyId(state)
          let fatherId = character.corSocietyTrueFatherId || character.fatherId
          let father = fatherId && state.characters && state.characters[fatherId]
          if (!father || father.corSocietySlave || father.dynastyId !== currentDynastyId) {
            this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          father.id = father.id || fatherId
          cost = Math.max(0, Math.round(parseFloat(cost || Math.max(25, this.slaveFreedomPrice(record) * 0.6))))
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          if (cash < cost) {
            this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          this.applyStats({ cash: -cost, prestige: -6, influence: -8 })
          let patch = {
            dynastyId: father.dynastyId,
            fatherId: father.id,
            corSocietySlave: false,
            corSocietySlaveActive: false,
            corSocietySlaveMarket: false,
            corSocietySlaveOrigin: '',
            corSocietyFreedman: false,
            corSocietyLegitimizedBastard: true,
            corSocietyIllegitimate: false,
            corSocietyOrigin: 'legitimized_bastard',
            corSocietySlaveOwnerHouseId: '',
            flagCannotMarry: false,
            flagDoNotCull: true
          }
          try {
            daapi.updateCharacter({ characterId: character.id, character: patch })
            Object.assign(character, patch)
            this.addChildToParent(state, father.id, character.id)
            try {
              daapi.setCharacterStatusActive({ characterId: character.id, key: 'cor_society_slave_status', isActive: false })
            } catch (statusErr) {
              console.warn(statusErr)
            }
            daapi.forceUpdateCharacterDisplay({ characterId: character.id })
          } catch (err) {
            console.warn(err)
          }
          let house = society.houses[father.dynastyId]
          if (!house) {
            house = this.createHouseRecord(father.dynastyId)
            house.name = this.houseName((state.dynasties && state.dynasties[father.dynastyId]) || {}, father.dynastyId)
            society.houses[father.dynastyId] = house
          }
          house.memberIds = house.memberIds || []
          if (house.memberIds.indexOf(character.id) < 0) house.memberIds.push(character.id)
          if (this.age(character, state) >= 16) {
            house.notableIds = house.notableIds || []
            if (house.notableIds.indexOf(character.id) < 0) house.notableIds.push(character.id)
          }
          society.playerSlaves = (society.playerSlaves || []).filter((slave) => slave !== record)
          this.log(society, this.characterName(character, state) + ' is legitimized and joins the free father dynasty.', 'birth', father.dynastyId)
          this.save(society)
          this.openHouseholdSlaves()
        },
        ownedSlaveMarriageCandidates(society, state, record) {
          let character = record && record.characterId && state.characters && state.characters[record.characterId]
          if (!record || !character || character.isDead || character.spouseId || this.age(character, state) < 16 || this.age(character, state) > 60) {
            return []
          }
          character.id = character.id || record.characterId
          return (society.playerSlaves || [])
            .filter((candidateRecord) => {
              if (!candidateRecord || candidateRecord.active === false || !candidateRecord.characterId || this.sameCharacterId(candidateRecord.characterId, record.characterId)) return false
              let candidate = state.characters && state.characters[candidateRecord.characterId]
              if (!candidate || candidate.isDead || candidate.spouseId || this.age(candidate, state) < 16 || this.age(candidate, state) > 60) return false
              candidate.id = candidate.id || candidateRecord.characterId
              return this.isMarriageCompatibleForSlaves(character, candidate)
            })
        },
        openSlaveMarriageCandidates({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record) {
            this.openHouseholdSlaves()
            return
          }
          let candidates = this.ownedSlaveMarriageCandidates(society, state, record)
          let options = candidates.map((candidateRecord) => {
            let candidate = state.characters[candidateRecord.characterId]
            candidate.id = candidate.id || candidateRecord.characterId
            return {
              text: this.characterName(candidate, state),
              tooltip: 'Household slave marriage. Consequences: creates a spouse link between two owned slaves; no family marriage alliance is created.',
              icons: [this.characterPortrait(candidate, state), this.affairIcon('marriage')],
              action: {
                event: this.event,
                method: 'marryOwnedSlaves',
                context: { slaveKey: record.key, characterId: record.characterId, spouseSlaveKey: candidateRecord.key, spouseId: candidateRecord.characterId }
              }
            }
          })
          options.push({
            text: 'Back',
            action: { event: this.event, method: 'openManageSlave', context: { slaveKey: record.key, characterId: record.characterId } }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Slave household marriage',
            message: candidates.length ? 'Choose a spouse from your household slaves.' : 'No compatible unmarried adult household slave is available.',
            image: this.affairIcon('marriage'),
            options
          })
        },
        marryOwnedSlaves({ slaveKey, characterId, spouseSlaveKey, spouseId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let firstRecord = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          let secondRecord = (society.playerSlaves || []).find((slave) => (spouseSlaveKey && slave.key === spouseSlaveKey) || (spouseId && this.sameCharacterId(slave.characterId, spouseId)))
          let first = firstRecord && firstRecord.characterId && state.characters && state.characters[firstRecord.characterId]
          let second = secondRecord && secondRecord.characterId && state.characters && state.characters[secondRecord.characterId]
          if (!firstRecord || !secondRecord || !first || !second || first.spouseId || second.spouseId) {
            this.openManageSlave({ slaveKey, characterId })
            return
          }
          first.id = first.id || firstRecord.characterId
          second.id = second.id || secondRecord.characterId
          if (this.age(first, state) < 16 || this.age(second, state) < 16 || !this.isMarriageCompatibleForSlaves(first, second)) {
            this.openManageSlave({ slaveKey, characterId })
            return
          }
          try {
            daapi.updateCharacter({ characterId: first.id, character: { flagCannotMarry: false } })
            daapi.updateCharacter({ characterId: second.id, character: { flagCannotMarry: false } })
            daapi.performMarriage({ characterId: first.id, spouseId: second.id, isMatrilineal: !this.characterIsMale(first) })
          } catch (err) {
            console.warn(err)
            try {
              daapi.updateCharacter({ characterId: first.id, character: { spouseId: second.id } })
              daapi.updateCharacter({ characterId: second.id, character: { spouseId: first.id } })
            } catch (fallbackErr) {
              console.warn(fallbackErr)
            }
          }
          try {
            daapi.updateCharacter({ characterId: first.id, character: { flagCannotMarry: true } })
            daapi.updateCharacter({ characterId: second.id, character: { flagCannotMarry: true } })
            daapi.forceUpdateCharacterDisplay({ characterId: first.id })
            daapi.forceUpdateCharacterDisplay({ characterId: second.id })
          } catch (err) {
            console.warn(err)
          }
          this.changePersonalRelation(society, first.id, second.id, 35, 'friend')
          this.log(society, firstRecord.name + ' and ' + secondRecord.name + ' are joined as household slaves.', 'marriage')
          this.save(society)
          this.openManageSlave({ slaveKey: firstRecord.key, characterId: firstRecord.characterId })
        },
        acceptSlaveSelfPurchase({ slaveKey, characterId, price } = {}) {
          let society = this.ensure()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record) {
            this.openHouseholdSlaves()
            return
          }
          let freedomPrice = Math.max(1, Math.round(parseFloat(price || this.slaveFreedomPrice(record))))
          if (parseFloat(record.savings || 0) < freedomPrice) {
            this.openManageSlave({ slaveKey: record.key, characterId: record.characterId })
            return
          }
          record.savings = Math.max(0, parseFloat(record.savings || 0) - freedomPrice)
          this.applyStats({ cash: freedomPrice })
          this.log(society, record.name + ' pays ' + freedomPrice + ' to buy freedom.', 'slaves')
          this.save(society)
          this.freeSlave({ slaveKey: record.key, characterId: record.characterId })
        },
        sellSlave({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record) {
            this.openHouseholdSlaves()
            return
          }
          let value = Math.round(this.slaveCost(record) * 0.55)
          record.active = false
          this.applyStats({ cash: value })
          try {
            if (record.characterId) {
              daapi.updateCharacter({
                characterId: record.characterId,
                character: {
                  corSocietySlaveActive: false,
                  corSocietySlaveSold: true,
                  corSocietyPreviousOwnerHouseId: this.currentCharacterDynastyId(state) || ''
                }
              })
            }
          } catch (err) {
            console.warn(err)
          }
          society.playerSlaves = (society.playerSlaves || []).filter((slave) => slave !== record)
          this.log(society, 'You sell ' + record.name + ' for ' + value + ' cash.', 'slaves')
          this.save(society)
          this.openHouseholdSlaves()
        },
        freeSlave({ slaveKey, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let record = (society.playerSlaves || []).find((slave) => (slaveKey && slave.key === slaveKey) || (characterId && this.sameCharacterId(slave.characterId, characterId)))
          if (!record) {
            this.openHouseholdSlaves()
            return
          }
          record.active = false
          let sourceCharacter = record.characterId && state.characters && state.characters[record.characterId]
          let freedHouse = this.freedmanHouseForCharacter(society, state, record, sourceCharacter)
          this.applyStats({ prestige: 8, influence: 10 })
          try {
            if (record.characterId) {
              daapi.updateCharacter({
                characterId: record.characterId,
                character: {
                  dynastyId: freedHouse ? this.gameDynastyIdForHouse(freedHouse) : undefined,
                  corSocietyHouseId: freedHouse ? freedHouse.id : '',
                  corSocietySlave: false,
                  corSocietySlaveActive: false,
                  corSocietySlaveMarket: false,
                  corSocietySlaveOrigin: '',
                  corSocietyFreedman: true,
                  corSocietyOrigin: 'manumitted_freedman',
                  corSocietyFreedFromHouseId: this.currentCharacterDynastyId(state) || '',
                  flagCannotMarry: false
                }
              })
              if (freedHouse) {
                freedHouse.memberIds = freedHouse.memberIds || []
                if (freedHouse.memberIds.indexOf(record.characterId) < 0) freedHouse.memberIds.push(record.characterId)
              }
              try {
                daapi.setCharacterStatusActive({ characterId: record.characterId, key: 'cor_society_slave_status', isActive: false })
              } catch (statusErr) {
                console.warn(statusErr)
              }
              daapi.forceUpdateCharacterDisplay({ characterId: record.characterId })
            }
          } catch (err) {
            console.warn(err)
          }
          society.playerSlaves = (society.playerSlaves || []).filter((slave) => slave !== record)
          state = daapi.getState()
          if (freedHouse) {
            this.refreshHouseMemberLists(society, state, freedHouse)
          }
          this.log(society, 'You manumit ' + record.name + '; they enter the Freedmen order in their own free citizen house.', 'slaves', freedHouse ? freedHouse.id : '')
          this.save(society)
          this.openHouseholdSlaves()
        },
        currentCharacterDynastyId(state) {
          state = state || daapi.getState()
          let current = state.characters && state.characters[this.currentCharacterId(state)]
          return (current && current.dynastyId) || ((state.current || {}).dynastyId) || ''
        },
        freedmanHouseForCharacter(society, state, record, character) {
          state = state || daapi.getState()
          let baseName = (record && record.name) || (character && this.characterName(character, state)) || 'Manumitted Freedman'
          let nomen = this.pick(this.nomina)
          let cognomen = this.pick(['Liberatus', 'Felix', 'Novus', 'Afer', 'Rufus', 'Varro', 'Crispus'])
          let founderId = ''
          let house = false
          try {
            founderId = daapi.generateCharacter({
              characterFeatures: {
                gender: 'male',
                isMale: true,
                praenomen: this.pick(this.maleNames),
                birthMonth: this.randomInt(0, 11),
                birthYear: state.year - this.randomInt(58, 78),
                look: this.generatedVanillaLook(true, 'freedman-founder-' + this.safeId(baseName) + '-' + Date.now()),
                job: 'labourer',
                jobLevel: 0,
                traits: ['content'],
                skills: this.skillsForStratum('freedmen'),
                corSocietyGenerated: true,
                corSocietyFreedmanFounder: true,
                flagDoNotCull: true
              },
              dynastyFeatures: {
                nomen,
                cognomen,
                prestige: this.randomInt(450, 1200),
                heritage: 'roman_freedman'
              }
            })
            let founder = daapi.getCharacter({ characterId: founderId }) || {}
            if (founder && founder.dynastyId) {
              try {
                daapi.kill({ characterId: founderId, deathCause: 'old age' })
              } catch (killErr) {
                daapi.updateCharacter({
                  characterId: founderId,
                  character: {
                    isDead: true,
                    deathYear: state.year,
                    deathMonth: state.month
                  }
                })
              }
              house = society.houses[founder.dynastyId] || this.createHouseRecord(founder.dynastyId)
              house.name = this.shortText(baseName, 30) + ' Free House'
              house.stratum = 'freedmen'
              house.generated = true
              house.manumittedHouse = true
              house.freedFromPlayerHouse = true
              house.memberIds = []
              house.notableIds = []
              house.slaveIds = []
              house.relation = this.clamp((house.relation || 0) + 10, -100, 100)
              house.strength = Math.max(10, Math.round((house.strength || 0) + 12))
              house.prestige = Math.max(500, Math.round(house.prestige || 0))
              house.heritage = 'roman_freedman'
              house.citizenRank = this.rankFromStrength(house.strength)
              house.agenda = 'security'
              society.houses[founder.dynastyId] = house
              society.generatedHouseIds = society.generatedHouseIds || []
              if (society.generatedHouseIds.indexOf(founder.dynastyId) < 0) society.generatedHouseIds.push(founder.dynastyId)
              society.generatedCharacterIds = society.generatedCharacterIds || []
              if (society.generatedCharacterIds.indexOf(founderId) < 0) society.generatedCharacterIds.push(founderId)
            }
          } catch (err) {
            console.warn(err)
          }
          if (!house) {
            house = this.generateHouse(society, state, 'freedmen')
          }
          if (house) {
            house.name = this.shortText(baseName, 30) + ' Free House'
            house.agenda = 'security'
            house.relation = this.clamp((house.relation || 0) + 10, -100, 100)
            house.manumittedHouse = true
            house.freedFromPlayerHouse = true
          }
          return house
        },
        playerSlaveRecordFromCharacter(record, character, state) {
          character = character || {}
          let characterId = record.characterId || character.id || ''
          return {
            key: record.key || ('slave_' + this.safeId(characterId || Date.now())),
            characterId,
            name: characterId && state && state.characters && state.characters[characterId] ? this.slaveDisplayName({ ...state.characters[characterId], id: characterId }, record, state) : (record.fullName || record.name || character.corSocietySlaveFullName || character.praenomen || 'Servus'),
            fullName: record.fullName || character.corSocietySlaveFullName || '',
            type: record.type || character.corSocietySlaveType || 'manager',
            level: Math.max(1, Math.round(record.level || character.corSocietySlaveLevel || 1)),
            age: record.age || (character.birthYear !== undefined && state ? this.age(character, state) : 20),
            acquired: record.acquired || this.monthKey(state || daapi.getState()),
            active: true,
            originHouseId: record.originHouseId || character.corSocietyOriginHouseId || '',
            previousOwnerHouseId: record.previousOwnerHouseId || character.corSocietyPreviousOwnerHouseId || '',
            origin: record.origin || character.corSocietySlaveOrigin || this.randomSlaveOrigin(),
            task: record.task || character.corSocietySlaveTask || record.type || character.corSocietySlaveType || 'labor',
            savings: Math.max(0, parseFloat(record.savings || character.corSocietySlaveSavings || 0)),
            nextTaskChangeMonth: record.nextTaskChangeMonth || character.corSocietySlaveNextTaskChangeMonth || '',
            educationTargetId: record.educationTargetId || character.corSocietySlaveEducationTargetId || '',
            nextCompanionMonth: record.nextCompanionMonth || character.corSocietySlaveNextCompanionMonth || ''
          }
        },
        enslavedPurchaseInfo(society, state, house, character) {
          let currentDynastyId = this.currentCharacterDynastyId(state)
          let type = this.slaveTypeFromCharacter(character)
          let visible = !!(character && (character.corSocietySlave || character.corSocietyOrigin === 'enslaved_dependant' || (house && house.stratum === 'poor')))
          let cost = this.enslavedCharacterCost(society, state, house, character)
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          let reason = ''
          if (!visible) reason = 'not enslaved'
          else if (character.isDead) reason = 'dead'
          else if (currentDynastyId && character.dynastyId === currentDynastyId) reason = 'already household'
          else if (this.age(character, state) < 5) reason = 'too young'
          else if (cash < cost) reason = 'need ' + cost + ' cash'
          return {
            visible,
            available: visible && !reason,
            reason,
            cost,
            type,
            tooltip: [
              'Negotiates purchase of ' + this.slaveDisplayName(character, null, state) + '.',
              'Origin: ' + this.slaveOriginDescription(character.corSocietySlaveOrigin || 'unknown') + '.',
              'Current house: ' + ((house && house.name) || 'unknown') + '.',
              'Cost: ' + cost + '.',
              reason ? 'Unavailable: ' + reason + '.' : 'On purchase, this real character becomes a household slave in your dynasty; origin data is preserved for navigation.'
            ].join('\n')
          }
        },
        slaveTypeFromCharacter(character) {
          if (!character) return 'manager'
          if (character.corSocietySlaveType) return character.corSocietySlaveType
          let job = String(character.job || '').toLowerCase()
          let skills = character.skills || {}
          if (job.indexOf('physician') >= 0 || job.indexOf('doctor') >= 0) return parseFloat(skills.intelligence || 0) >= 14 ? 'doctor' : 'nurse'
          if (job.indexOf('rhetor') >= 0 || job.indexOf('teacher') >= 0) return parseFloat(skills.intelligence || 0) >= 14 ? 'tutor' : 'educator'
          if (job.indexOf('trader') >= 0 || job.indexOf('merchant') >= 0) return parseFloat(skills.stewardship || 0) >= 14 ? 'accountant' : 'steward'
          if (job.indexOf('soldier') >= 0 || parseFloat(skills.combat || 0) >= 16) return parseFloat(skills.combat || 0) >= 20 ? 'gladiator' : 'warrior'
          if (parseFloat(skills.combat || 0) >= 13) return 'bodyguard'
          if (parseFloat(skills.eloquence || 0) >= 16) return 'musician'
          if (parseFloat(skills.eloquence || 0) >= 13) return 'entertainer'
          if (parseFloat(skills.stewardship || 0) >= 15) return 'scribe'
          if (job.indexOf('labour') >= 0 || job.indexOf('labor') >= 0) return 'labor'
          return 'manager'
        },
        enslavedCharacterCost(society, state, house, character) {
          let level = Math.max(1, Math.round(parseFloat((character && character.corSocietySlaveLevel) || 1) + this.characterScore(character || {}, state) / 22))
          let base = this.slaveCost({ type: this.slaveTypeFromCharacter(character), level })
          let relationPenalty = house ? Math.max(0, Math.round((house.relation || 0) * -1.5)) : 0
          return Math.max(60, Math.round(base + relationPenalty))
        },
        buyEnslavedCharacter({ houseId, characterId, cost, returnTo, returnPage } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let character = state.characters && state.characters[characterId]
          if (!house || !character) {
            this.openSlaveMarket()
            return
          }
          character.id = character.id || characterId
          let info = this.enslavedPurchaseInfo(society, state, house, character)
          cost = Math.max(1, Math.round(parseFloat(cost || info.cost)))
          if (!info.available || parseFloat(((state || {}).current || {}).cash || 0) < cost) {
            this.pushModal({
              societyMenu: true,
              title: 'Purchase unavailable',
              message: info.tooltip,
              image: this.characterPortrait(character, state, house),
              options: [
                { text: 'Back', action: { event: this.event, method: 'openPerson', context: { houseId, characterId, returnTo, returnPage } } }
              ]
            })
            return
          }
          let playerDynastyId = this.currentCharacterDynastyId(state)
          let previousOwnerHouseId = character.corSocietySlaveOwnerHouseId || house.id
          this.applyStats({ cash: -cost })
          if (society.houses[previousOwnerHouseId]) {
            let owner = society.houses[previousOwnerHouseId]
            owner.ai = owner.ai || {}
            owner.ai.cash = Math.max(0, Math.round(parseFloat(owner.ai.cash || 0) + cost))
            owner.relation = this.clamp((owner.relation || 0) + 3, -100, 100)
            owner.slaveIds = (owner.slaveIds || []).filter((id) => !this.sameCharacterId(id, characterId))
          }
          let type = info.type
          let level = Math.max(1, Math.round(character.corSocietySlaveLevel || this.characterScore(character, state) / 22 || 1))
          let task = character.corSocietySlaveTask || type || 'labor'
          let savings = Math.max(0, parseFloat(character.corSocietySlaveSavings || 0))
          try {
            daapi.updateCharacter({
              characterId,
              character: {
                dynastyId: playerDynastyId || character.dynastyId,
                corSocietySlave: true,
                corSocietySlaveActive: true,
                corSocietySlaveType: type,
                corSocietySlaveLevel: level,
                corSocietySlaveOwnerHouseId: playerDynastyId || '',
                corSocietySlaveOrigin: character.corSocietySlaveOrigin || this.randomSlaveOrigin(),
                corSocietySlaveTask: task,
                corSocietySlaveSavings: savings,
                corSocietyOriginHouseId: character.corSocietyOriginHouseId || house.id,
                corSocietyPreviousOwnerHouseId: previousOwnerHouseId,
                flagCannotMarry: true,
                flagDoNotCull: true
              }
            })
            daapi.forceUpdateCharacterDisplay({ characterId })
          } catch (err) {
            console.warn(err)
          }
          state = daapi.getState()
          let updated = (state.characters && state.characters[characterId]) || character
          let record = this.playerSlaveRecordFromCharacter({
            key: 'slave_' + this.safeId(characterId),
            characterId,
            type,
            level,
            age: this.age(updated, state),
            originHouseId: character.corSocietyOriginHouseId || house.id,
            previousOwnerHouseId,
            origin: character.corSocietySlaveOrigin || updated.corSocietySlaveOrigin || this.randomSlaveOrigin(),
            task,
            savings
          }, updated, state)
          society.playerSlaves = (society.playerSlaves || []).filter((slave) => !this.sameCharacterId(slave.characterId, characterId))
          society.playerSlaves.push(record)
          this.refreshHouseMemberLists(society, state, house)
          if (society.houses[previousOwnerHouseId] && previousOwnerHouseId !== house.id) {
            this.refreshHouseMemberLists(society, state, society.houses[previousOwnerHouseId])
          }
          this.log(society, 'You purchase ' + record.name + ' from ' + house.name + ' for ' + cost + ' cash.', 'slaves', house.id)
          this.save(society)
          this.openManageSlave({ slaveKey: record.key, characterId })
        },
        captureEnslavedCharacter({ houseId, characterId, cost } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let character = state.characters && state.characters[characterId]
          if (!house || !character) {
            this.openHub()
            return
          }
          character.id = character.id || characterId
          let info = this.enslavedPurchaseInfo(society, state, house, character)
          cost = Math.max(1, Math.round(parseFloat(cost || Math.max(35, info.cost * 0.45))))
          if (!info.visible || parseFloat(((state || {}).current || {}).cash || 0) < cost) {
            this.pushModal({
              societyMenu: true,
              title: 'Capture unavailable',
              message: info.visible ? 'You lack the cash to fund this capture.' : 'This person is no longer capturable.',
              image: this.characterPortrait(character, state, house),
              options: [{ text: 'Back', action: { event: this.event, method: 'openHub' } }]
            })
            return
          }
          let playerDynastyId = this.currentCharacterDynastyId(state)
          let type = info.type
          let level = Math.max(1, Math.round(character.corSocietySlaveLevel || this.characterScore(character, state) / 24 || 1))
          let task = character.corSocietySlaveTask || type || 'labor'
          let savings = Math.max(0, parseFloat(character.corSocietySlaveSavings || 0))
          this.applyStats({ cash: -cost, influence: -10 })
          house.relation = this.clamp((house.relation || 0) - 22, -100, 100)
          house.heat = (house.heat || 0) + 2
          house.memberIds = (house.memberIds || []).filter((id) => !this.sameCharacterId(id, characterId))
          house.notableIds = (house.notableIds || []).filter((id) => !this.sameCharacterId(id, characterId))
          try {
            daapi.updateCharacter({
              characterId,
              character: {
                dynastyId: playerDynastyId || character.dynastyId,
                corSocietySlave: true,
                corSocietySlaveActive: true,
                corSocietySlaveMarket: false,
                corSocietySlaveType: type,
                corSocietySlaveLevel: level,
                corSocietySlaveOwnerHouseId: playerDynastyId || '',
                corSocietySlaveOrigin: character.corSocietySlaveOrigin || this.randomSlaveOrigin(),
                corSocietySlaveTask: task,
                corSocietySlaveSavings: savings,
                corSocietyOriginHouseId: character.corSocietyOriginHouseId || house.id,
                corSocietyPreviousOwnerHouseId: house.id,
                flagCannotMarry: true,
                flagDoNotCull: true
              }
            })
            daapi.forceUpdateCharacterDisplay({ characterId })
          } catch (err) {
            console.warn(err)
          }
          state = daapi.getState()
          let updated = (state.characters && state.characters[characterId]) || character
          let record = this.playerSlaveRecordFromCharacter({
            key: 'slave_' + this.safeId(characterId),
            characterId,
            type,
            level,
            age: this.age(updated, state),
            originHouseId: character.corSocietyOriginHouseId || house.id,
            previousOwnerHouseId: house.id,
            origin: character.corSocietySlaveOrigin || updated.corSocietySlaveOrigin || this.randomSlaveOrigin(),
            task,
            savings
          }, updated, state)
          society.playerSlaves = (society.playerSlaves || []).filter((slave) => !this.sameCharacterId(slave.characterId, characterId))
          society.playerSlaves.push(record)
          this.refreshHouseMemberLists(society, state, house)
          this.log(society, 'You capture ' + record.name + ' from ' + house.name + '; relations with that slave kin group worsen.', 'slaves', house.id)
          this.save(society)
          this.openManageSlave({ slaveKey: record.key, characterId })
        },
        matchmakerCandidates(society, state, character) {
          let candidates = []
          let playerStratum = this.playerStratum(state)
          this.sortedHouses(society).forEach((house) => {
            if (!house || house.stratum === 'poor') return
            if (!house || Math.abs(this.socialLevel(house.stratum) - this.socialLevel(playerStratum)) > 2) return
            if ((house.relation || 0) < -65) return
            this.visibleHousePeople(house, state).forEach((characterId) => {
              let candidate = state.characters && state.characters[characterId]
              if (!candidate) return
              candidate.id = candidate.id || characterId
              if (this.isSlaveCharacter(candidate, house) || !this.isMarriageEligible(candidate, state) || !this.isMarriageCompatible(character, candidate)) return
              candidates.push({ house, character: candidate })
            })
          })
          return candidates.sort((a, b) => this.characterScore(b.character, state) - this.characterScore(a.character, state))
        },
        ensureMatchmakerCandidates(society, state, character) {
          let candidates = this.matchmakerCandidates(society, state, character)
          let houses = this.sortedHouses(society).filter((house) => {
            return house && house.stratum !== 'poor' && house.id !== character.dynastyId && Math.abs(this.socialLevel(house.stratum) - this.socialLevel(this.playerStratum(state))) <= 2
          })
          while (candidates.length < 4 && houses.length && (society.generatedCharacterIds || []).length < 320) {
            let house = this.pick(houses)
            let id = this.generateMarriageProspect(society, state, house, character)
            state = daapi.getState()
            let generated = state.characters && state.characters[id]
            if (generated) {
              generated.id = id
              candidates.push({ house, character: generated })
            } else {
              break
            }
          }
          return candidates
        },
        matchmakerCandidateCost(candidate, house, state) {
          let score = this.characterScore(candidate, state)
          let level = this.socialLevel((house && house.stratum) || 'plebeian')
          let relationDiscount = Math.max(-40, Math.min(40, (house && house.relation) || 0))
          return Math.max(80, Math.round(80 + score * 5 + level * 70 - relationDiscount))
        },
        matchmakerCandidateDescription(candidate, house, state) {
          let skills = candidate.skills || {}
          let traits = (candidate.traits || []).slice(0, 4).join(', ') || 'no notable vanilla traits'
          return [
            this.characterName(candidate, state) + ' of ' + house.name,
            'Age ' + this.formatAge(candidate, state) + '; ' + (candidate.job || 'no job') + '.',
            'Skills: Int ' + Math.round(skills.intelligence || 0) + ', Stw ' + Math.round(skills.stewardship || 0) + ', Elo ' + Math.round(skills.eloquence || 0) + ', Cmb ' + Math.round(skills.combat || 0) + '.',
            'Traits: ' + traits + '.'
          ].join('\n')
        },
        openMatchmaker({ characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          characterId = characterId || this.currentCharacterId(state)
          let character = state.characters && state.characters[characterId]
          if (!character) {
            this.openHub()
            return
          }
          character.id = character.id || characterId
          if (!this.isPlayerFamilyCharacter(state, characterId) || !this.isMarriageEligible(character, state)) {
            this.pushModal({
              societyMenu: true,
              title: 'Coemptio unavailable',
              message: 'Only unmarried adult members of your household can use the Society matchmaker.',
              image: this.bundledIcon('coemptio', 'marriage'),
              options: [{ text: 'Back' }]
            })
            return
          }
          let candidates = this.ensureMatchmakerCandidates(society, state, character).slice(0, 8)
          this.save(society)
          let cash = parseFloat(((state || {}).current || {}).cash || 0)
          let options = candidates.map((item) => {
            let cost = this.matchmakerCandidateCost(item.character, item.house, state)
            return {
              text: this.characterName(item.character, state) + ' (' + cost + ')',
              disabled: cash < cost,
              showDisabledWithTooltip: true,
              tooltip: this.matchmakerCandidateDescription(item.character, item.house, state),
              statChanges: { cash: -cost },
              icons: [this.characterPortrait(item.character, state, item.house), this.houseCrestIcon(society, item.house)],
              action: {
                event: this.event,
                method: 'acceptMatchmakerCandidate',
                context: { characterId, spouseId: item.character.id, houseId: item.house.id, cost }
              }
            }
          })
          options.push({
            text: 'Back',
            action: {
              event: this.event,
              method: 'declineMatchmakerCandidates',
              context: { characterId }
            }
          })
          this.pushModal({
            societyMenu: true,
            title: 'Coemptio matchmaker',
            message: 'The matchmaker presents real Society candidates. Those not chosen remain in their houses.',
            image: this.bundledIcon('coemptio', 'marriage'),
            options
          })
        },
        acceptMatchmakerCandidate({ characterId, spouseId, houseId, cost } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let character = state.characters && state.characters[characterId]
          let spouse = state.characters && state.characters[spouseId]
          let house = society.houses[houseId] || (spouse && spouse.dynastyId && society.houses[spouse.dynastyId])
          if (!character || !spouse || !house) {
            this.openMatchmaker({ characterId })
            return
          }
          character.id = character.id || characterId
          spouse.id = spouse.id || spouseId
          cost = Math.max(0, Math.round(parseFloat(cost || this.matchmakerCandidateCost(spouse, house, state))))
          if (house.stratum === 'poor' || this.isSlaveCharacter(spouse, house) || !this.isMarriageEligible(character, state) || !this.isMarriageEligible(spouse, state) || !this.isMarriageCompatible(character, spouse) || parseFloat(((state || {}).current || {}).cash || 0) < cost) {
            this.pushModal({
              societyMenu: true,
              title: 'Match no longer valid',
              message: 'The chosen candidate is no longer available or the fee cannot be paid.',
              image: this.bundledIcon('coemptio', 'marriage'),
              options: [{ text: 'Back', action: { event: this.event, method: 'openMatchmaker', context: { characterId } } }]
            })
            return
          }
          this.applyStats({ cash: -cost })
          try {
            daapi.performMarriage({ characterId, spouseId, isMatrilineal: !this.characterIsMale(character) })
            daapi.forceUpdateCharacterDisplay({ characterId })
            daapi.forceUpdateCharacterDisplay({ characterId: spouseId })
          } catch (err) {
            console.warn(err)
            this.pushModal({
              societyMenu: true,
              title: 'Marriage failed',
              message: 'The vanilla marriage API rejected this Coemptio match: ' + err.name + ': ' + err.message,
              image: this.bundledIcon('coemptio', 'marriage'),
              options: [{ text: 'Back', action: { event: this.event, method: 'openMatchmaker', context: { characterId } } }]
            })
            return
          }
          house.relation = this.clamp((house.relation || 0) + 10, -100, 100)
          house.favor = (house.favor || 0) + (Math.random() < 0.25 ? 1 : 0)
          house.lastFamilyEvent = 'Coemptio marriage with your household.'
          this.changePersonalRelation(society, characterId, spouseId, 38, 'friend')
          state = daapi.getState()
          this.refreshHouseMemberLists(society, state, house)
          this.log(society, 'Coemptio arranges a marriage between ' + this.characterName(character, state) + ' and ' + this.characterName(spouse, state) + ' of ' + house.name + '.', 'marriage', house.id)
          this.save(society)
          this.pushModal({
            title: 'Coemptio marriage arranged',
            message: this.characterName(spouse, state) + ' is now married to ' + this.characterName(character, state) + '. The candidate remains a real character and should appear through vanilla family links after refresh.',
            image: this.characterPortrait(spouse, state, house),
            options: [
              { text: 'Back to Society', action: { event: this.event, method: 'openHub' } }
            ]
          })
        },
        declineMatchmakerCandidates({ characterId } = {}) {
          let state = daapi.getState()
          if (characterId && this.isPlayerFamilyCharacter(state, characterId)) {
            this.openHub()
            return
          }
          this.openHub()
        },
        patronageOption(house) {
          if (['plebeian', 'freedmen', 'poor'].indexOf(house.stratum) >= 0) {
            return {
              text: 'Offer patronage',
              tooltip: 'Costs monthly revenue for a year, but builds loyalty and favor among lower orders.',
              icons: [this.affairIcon('patronage')],
              action: {
                event: this.event,
                method: 'offerPatronage',
                context: { houseId: house.id }
              }
            }
          }
          return {
            text: 'Seek patronage',
            disabled: (house.relation || 0) < 20,
            showDisabledWithTooltip: true,
            tooltip: 'Powerful houses may lend standing when relations are good.',
            icons: [this.affairIcon('patronage')],
            action: {
              event: this.event,
              method: 'seekPatronage',
              context: { houseId: house.id }
            }
          }
        },
        sendGift({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let cost = this.actionCost(house, 'gift')
            this.applyStats({ cash: -cost })
            house.relation = this.clamp((house.relation || 0) + this.randomInt(8, 16), -100, 100)
            if (Math.random() < 0.25) {
              house.favor = (house.favor || 0) + 1
            }
            house.lastInteraction = this.monthKey(daapi.getState())
            this.log(society, 'Gift sent to ' + house.name + ': relation ' + this.signed(house.relation) + '.')
          })
          this.openHouse({ houseId })
        },
        hostDinner({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let cost = this.actionCost(house, 'dinner')
            this.applyStats({ cash: -cost, prestige: 12 })
            house.relation = this.clamp((house.relation || 0) + this.randomInt(10, 20), -100, 100)
            house.heat = Math.max(0, (house.heat || 0) - 1)
            this.log(society, 'Dinner hosted for ' + house.name + ': prestige rises, relation ' + this.signed(house.relation) + '.')
          })
          this.openHouse({ houseId })
        },
        askSupport({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let profile = this.strata[house.stratum] || this.strata.plebeian
            let amount = Math.max(20, Math.round((profile.support || 50) + (house.strength || 0) * 2))
            this.applyStats({ influence: amount })
            if ((house.favor || 0) > 0) {
              house.favor -= 1
              house.relation = this.clamp((house.relation || 0) - 4, -100, 100)
            } else {
              house.relation = this.clamp((house.relation || 0) - 16, -100, 100)
            }
            house.heat = (house.heat || 0) + 1
            this.log(society, house.name + ' backs you publicly: +' + amount + ' influence.')
          })
          this.openHouse({ houseId })
        },
        tradeDeal({ houseId }) {
          let handled = false
          this.withHouse(houseId, (society, house) => {
            let state = daapi.getState()
            if (this.houseTradeActive(house, state)) {
              handled = true
              this.pushModal({
                title: 'Trade already active',
                message: house.name + ' already has a trade compact with your household until ' + house.tradeUntil + '. It cannot be stacked.',
                image: this.affairIcon('tradeVenture'),
                options: [
                  {
                    text: 'Back',
                    action: {
                      event: this.event,
                      method: 'openHouse',
                      context: { houseId }
                    }
                  }
                ]
              })
              return
            }
            let profile = this.strata[house.stratum] || this.strata.plebeian
            let traitBonus = this.houseTradeTraitBonus(society, state, house)
            let amount = Math.max(8, Math.round((profile.revenue || 20) + (house.strength || 0) / 3 + traitBonus))
            daapi.addAdditiveModifier({
              key: 'revenue',
              id: 'cor_society_trade_' + this.safeId(house.id),
              durationInMonths: 12,
              amount
            })
            house.tradeUntil = this.futureMonthKey(12)
            house.tradeAmount = amount
            house.relation = this.clamp((house.relation || 0) + 5, -100, 100)
            this.log(society, 'Trade deal with ' + house.name + ': +' + amount + ' monthly revenue for one year.')
          })
          if (!handled) {
            this.openHouse({ houseId })
          }
        },
        houseTradeActive(house, state) {
          return !!(house && house.tradeUntil && !this.monthKeyReached(house.tradeUntil, state || daapi.getState()))
        },
        houseTradeTraitBonus(society, state, house) {
          let bonus = 0
          this.visibleHousePeople(house, state).forEach((characterId) => {
            let character = state.characters[characterId]
            if (!character) return
            if (this.characterHasTrait(society, character, 'greedy') || this.characterHasTrait(society, character, 'ambitious')) bonus += 1
            if (this.characterHasTrait(society, character, 'charitable') || this.characterHasTrait(society, character, 'honorable')) bonus += 1
            if (this.characterHasTrait(society, character, 'liar') || this.characterHasTrait(society, character, 'manipulator')) bonus -= 1
          })
          return this.clamp(bonus, -4, 8)
        },
        resolveTradeCompacts(society, state) {
          let broken = []
          this.sortedHouses(society).forEach((house) => {
            if (!house || !house.tradeUntil) {
              return
            }
            let active = this.houseTradeActive(house, state)
            if (!active) {
              house.tradeUntil = ''
              house.tradeAmount = 0
              return
            }
            if ((house.relation || 0) <= -25 || house.rivalry) {
              try {
                daapi.removeAdditiveModifier({ key: 'revenue', id: 'cor_society_trade_' + this.safeId(house.id) })
              } catch (err) {
                console.warn(err)
              }
              house.tradeUntil = ''
              house.tradeAmount = 0
              broken.push(house)
              this.log(society, 'Trade compact with ' + house.name + ' breaks after relations collapse.', 'tradeVenture', house.id)
            }
          })
          if (broken.length) {
            this.pushModal({
              corTranslatorPretranslateNow: true,
              title: 'Trade compact broken',
              message: broken.map((house) => house.name + ' ended trade after relations fell too low.').join('\n'),
              image: this.affairIcon('tradeVenture'),
              options: [
                {
                  text: 'Noted'
                }
              ]
            })
          }
        },
        offerPatronage({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let stipend = Math.max(8, Math.round((this.strata[house.stratum].revenue || 20) / 2))
            daapi.addAdditiveModifier({
              key: 'revenue',
              id: 'cor_society_patronage_' + this.safeId(house.id),
              durationInMonths: 12,
              amount: -stipend
            })
            house.patronageUntil = this.futureMonthKey(12)
            house.relation = this.clamp((house.relation || 0) + 22, -100, 100)
            house.favor = (house.favor || 0) + 1
            this.applyStats({ prestige: 8 })
            this.log(society, 'You take ' + house.name + ' under patronage. They owe you a favor.')
          })
          this.openHouse({ houseId })
        },
        seekPatronage({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let amount = Math.max(60, Math.round((house.strength || 20) * 3))
            this.applyStats({ influence: amount, prestige: -5 })
            house.favor = Math.max(0, (house.favor || 0) - 1)
            house.relation = this.clamp((house.relation || 0) - 8, -100, 100)
            this.log(society, house.name + ' lends you standing: +' + amount + ' influence.')
          })
          this.openHouse({ houseId })
        },
        startRivalry({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            house.rivalry = true
            house.relation = Math.min(house.relation || 0, -65)
            house.heat = 3
            this.applyStats({ prestige: 10, influence: 25 })
            this.log(society, 'Open rivalry declared against ' + house.name + '.')
          })
          this.openHouse({ houseId })
        },
        reconcile({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let cost = this.actionCost(house, 'reconcile')
            this.applyStats({ cash: -cost, influence: -20 })
            house.relation = this.clamp((house.relation || 0) + 38, -100, 100)
            if (house.relation > -25) {
              house.rivalry = false
            }
            house.heat = 0
            this.log(society, 'Reconciliation attempted with ' + house.name + ': relation ' + this.signed(house.relation) + '.')
          })
          this.openHouse({ houseId })
        },
        praisePerson({ houseId, characterId }) {
          this.withHouse(houseId, (society, house) => {
            let state = daapi.getState()
            let character = state.characters[characterId]
            house.relation = this.clamp((house.relation || 0) + 6, -100, 100)
            this.changePersonalRelation(society, this.currentCharacterId(state), characterId, 8, 'admirer')
            this.applyStats({ prestige: 3 })
            this.log(society, 'You praise ' + (character ? character.praenomen : 'a notable') + ' of ' + house.name + ' in public.')
          })
          this.openPerson({ houseId, characterId })
        },
        requestIntroduction({ houseId, characterId }) {
          let alreadyIntroduced = false
          this.withHouse(houseId, (society, house) => {
            let social = this.characterSocialRecord(society, characterId, true)
            if (social.introduced) {
              alreadyIntroduced = true
              return
            }
            social.introduced = true
            social.introductionMonth = this.monthKey(daapi.getState())
            social.nextInviteMonth = this.futureMonthKey(2)
            social.bond = this.clamp((social.bond || 0) + this.randomInt(8, 16), -100, 100)
            house.relation = this.clamp((house.relation || 0) - 3, -100, 100)
            house.favor = (house.favor || 0) + (Math.random() < 0.45 ? 1 : 0)
            this.changePersonalRelation(society, this.currentCharacterId(daapi.getState()), characterId, this.randomInt(6, 12), 'admirer')
            this.applyStats({ influence: 35 })
            this.log(society, house.name + ' introduces you to useful contacts.')
          })
          if (alreadyIntroduced) {
            this.inviteHomeTalk({ houseId, characterId })
          } else {
            this.openPerson({ houseId, characterId })
          }
        },
        inviteHomeTalk({ houseId, characterId }) {
          let result = false
          this.withHouse(houseId, (society, house) => {
            let state = daapi.getState()
            let character = state.characters[characterId]
            if (!character) {
              return
            }
            character.id = character.id || characterId
            let social = this.characterSocialRecord(society, characterId, true)
            if (!social.introduced) {
              social.introduced = true
              social.introductionMonth = this.monthKey(state)
            }
            if (social.nextInviteMonth && !this.monthKeyReached(social.nextInviteMonth, state)) {
              result = {
                title: 'Visit unavailable',
                message: this.characterName(character, state) + ' recently visited. Try again after ' + social.nextInviteMonth + '.',
                image: this.characterPortrait(character, state, house)
              }
              return
            }
            let rapport = this.randomInt(4, 12)
            let relation = this.randomInt(2, 8)
            let gossip = Math.random() < 0.08 + Math.max(0, (house.heat || 0)) * 0.015
            social.bond = this.clamp((social.bond || 0) + rapport, -100, 100)
            social.lastVisitMonth = this.monthKey(state)
            social.nextInviteMonth = this.futureMonthKey(4)
            house.relation = this.clamp((house.relation || 0) + relation, -100, 100)
            let currentId = this.currentCharacterId(state)
            let player = state.characters[currentId] || state.current || {}
            let personalType = this.visitRelationshipType(society, state, player, character, social)
            this.changePersonalRelation(society, currentId, characterId, rapport, personalType)
            if (gossip) {
              house.heat = (house.heat || 0) + 1
              house.relation = this.clamp((house.relation || 0) - 4, -100, 100)
              result = {
                title: 'Household gossip',
                message: this.characterName(character, state) + ' accepts your hospitality, but servants talk. Rapport improves, though the house becomes warmer with gossip.',
                image: this.affairIcon('romance')
              }
              this.log(society, 'A private visit with ' + this.characterName(character, state) + ' creates gossip around ' + house.name + '.', 'romance', house.id)
            } else {
              result = {
                title: 'Private conversation',
                message: this.characterName(character, state) + ' spends an evening in conversation. Rapport and house relation improve.',
                image: this.characterPortrait(character, state, house)
              }
              this.log(society, 'You invite ' + this.characterName(character, state) + ' of ' + house.name + ' home to talk.')
            }
          })
          if (result) {
            this.pushModal({
              title: result.title,
              message: result.message,
              image: result.image,
              options: [
                {
                  text: 'Back',
                  action: {
                    event: this.event,
                    method: 'openPerson',
                    context: { houseId, characterId }
                  }
                }
              ]
            })
          } else {
            this.openPerson({ houseId, characterId })
          }
        },
        visitRelationshipType(society, state, player, character, social) {
          let scoreType = this.relationshipTypeFromScore(social.bond || 0)
          let playerAge = this.age(player || {}, state)
          let targetAge = this.age(character || {}, state)
          if (targetAge >= playerAge + 12 && (this.characterHasTrait(society, character, 'educated') || this.characterHasTrait(society, character, 'literate') || this.characterHasTrait(society, character, 'erudite'))) {
            return 'mentor'
          }
          if (playerAge >= targetAge + 12 && (this.characterHasTrait(society, player, 'educated') || this.characterHasTrait(society, player, 'literate') || this.characterHasTrait(society, player, 'erudite'))) {
            return 'student'
          }
          return scoreType
        },
        courtCharacter({ houseId, characterId }) {
          let result = false
          this.withHouse(houseId, (society, house) => {
            let state = daapi.getState()
            let currentId = this.currentCharacterId(state)
            let player = state.characters[currentId] || state.current
            let character = state.characters[characterId]
            if (!player || !character || this.sameCharacterId(currentId, characterId)) {
              return
            }
            player.id = player.id || currentId
            character.id = character.id || characterId
            if (this.age(player, state) < 13 || this.age(character, state) < 13) {
              result = {
                title: 'Courtship unavailable',
                message: 'Characters younger than 13 cannot become lovers or be courted.',
                image: this.characterPortrait(character, state, house)
              }
              return
            }
            let social = this.characterSocialRecord(society, characterId, true)
            if (!social.introduced) {
              result = {
                title: 'Introduction needed',
                message: 'You need a proper introduction before attempting something so private.',
                image: this.characterPortrait(character, state, house)
              }
              return
            }
            if (social.nextCourtMonth && !this.monthKeyReached(social.nextCourtMonth, state)) {
              result = {
                title: 'Courtship cooling down',
                message: 'This needs time. Try again after ' + social.nextCourtMonth + '.',
                image: this.characterPortrait(character, state, house)
              }
              return
            }
            let romance = this.getRomance(society, currentId, characterId)
            let approaches = this.courtshipApproaches(society, state, house, player, character, social, romance)
            result = {
              societyMenu: true,
              title: romance ? 'Meet lover' : 'Court privately',
              message: [
                this.characterName(character, state) + ' will respond according to personality, traits, and situation.',
                'Known Society traits: ' + this.socialTraitSummary(society, character),
                'Rapport: ' + Math.round(social.bond || 0) + '. House relation: ' + this.signed(house.relation || 0) + '.'
              ].join('\n'),
              image: this.characterPortrait(character, state, house),
              options: approaches.map((approach) => {
                return {
                  text: approach.label,
                  tooltip: approach.hint,
                  icons: [this.affairIcon(approach.icon || 'romance')],
                  action: {
                    event: this.event,
                    method: 'resolveCourtship',
                    context: { houseId, characterId, approach: approach.key }
                  }
                }
              }).concat([{
                text: 'Back',
                action: {
                  event: this.event,
                  method: 'openPerson',
                  context: { houseId, characterId }
                }
              }])
            }
          })
          if (result) {
            this.pushModal({
              societyMenu: !!result.societyMenu,
              title: result.title,
              message: result.message,
              image: result.image,
              options: result.options || [
                {
                  text: 'Back',
                  action: {
                    event: this.event,
                    method: 'openPerson',
                    context: { houseId, characterId }
                  }
                }
              ]
            })
          } else {
            this.openPerson({ houseId, characterId })
          }
        },
        courtshipApproaches(society, state, house, player, character, social, romance) {
          return [
            {
              key: 'verse',
              label: 'Offer poetry and wit',
              icon: 'prestige',
              hint: 'Best for educated, literate, erudite, fashionable, or eloquent characters. Consequences: success greatly improves rapport; failure is mild.'
            },
            {
              key: 'family',
              label: 'Speak of family honor',
              icon: 'marriage',
              hint: 'Best for honorable, faithful, charitable, trusting, or status-conscious characters. Consequences: success improves relation and keeps scandal risk lower.'
            },
            {
              key: 'ambition',
              label: 'Promise advancement',
              icon: 'senate',
              hint: 'Best for ambitious, competitive, senatorial, equestrian, or office-minded characters. Consequences: success improves house ties; failure can offend.'
            },
            {
              key: 'gift',
              label: 'Bring a tasteful gift',
              icon: 'gift',
              hint: 'Best for fashionable, greedy, poor, freedmen, merchant, or practical characters. Consequences: costs no direct cash here, but failure hurts trust.'
            },
            {
              key: 'discretion',
              label: 'Keep everything discreet',
              icon: 'romance',
              hint: 'Best when either person is married, sly, manipulative, a gossip, or afraid of scandal. Consequences: success lowers immediate scandal risk.'
            }
          ]
        },
        courtshipIdealApproaches(society, state, house, player, character) {
          let ideals = []
          let add = (key) => {
            if (ideals.indexOf(key) < 0) ideals.push(key)
          }
          let traits = (character.traits || []).concat(this.societyTraitsForCharacter(society, character.id))
          let has = (trait) => traits.indexOf(trait) >= 0
          if (has('educated') || has('literate') || has('erudite') || has('oratorDeliberative') || has('oratorJudicial') || has('fashionable')) add('verse')
          if (has('honorable') || has('faithful') || has('charitable') || has('trusting') || has('content')) add('family')
          if (has('ambitious') || has('competitive') || has('senator') || house.stratum === 'senatorial' || house.stratum === 'equestrian') add('ambition')
          if (has('greedy') || has('fashionable') || house.stratum === 'poor' || house.stratum === 'freedmen' || character.job === 'trader') add('gift')
          if (has('sly') || has('manipulator') || has('liar') || has('gossip') || character.spouseId || player.spouseId) add('discretion')
          if (!ideals.length) add('family')
          return ideals
        },
        resolveCourtship({ houseId, characterId, approach }) {
          let result = false
          this.withHouse(houseId, (society, house) => {
            let state = daapi.getState()
            let currentId = this.currentCharacterId(state)
            let player = state.characters[currentId] || state.current
            let character = state.characters[characterId]
            if (!player || !character || this.sameCharacterId(currentId, characterId)) {
              return
            }
            player.id = player.id || currentId
            character.id = character.id || characterId
            if (this.age(player, state) < 13 || this.age(character, state) < 13) {
              result = {
                title: 'Courtship unavailable',
                message: 'Characters younger than 13 cannot become lovers or be courted.',
                image: this.characterPortrait(character, state, house)
              }
              return
            }
            let social = this.characterSocialRecord(society, characterId, true)
            let romance = this.getRomance(society, currentId, characterId)
            let ideals = this.courtshipIdealApproaches(society, state, house, player, character)
            let ideal = ideals.indexOf(approach) >= 0
            let risk = this.romanceBaseRisk(player, character, state)
            let playerEloquence = player.skills && player.skills.eloquence ? parseFloat(player.skills.eloquence) : 0
            let base = romance ? 0.58 : 0.24
            let chance = base + (house.relation || 0) / 320 + (social.bond || 0) / 170 + playerEloquence / 300
            chance += ideal ? 0.30 : -0.08
            if (approach === 'discretion' && (player.spouseId || character.spouseId)) chance += 0.10
            if (approach === 'ambition' && this.characterHasTrait(society, character, 'ambitious')) chance += 0.10
            if (approach === 'family' && this.characterHasTrait(society, character, 'faithful')) chance += 0.08
            if (approach === 'gift' && this.characterHasTrait(society, character, 'greedy')) chance += 0.08
            if (approach === 'verse' && this.characterHasTrait(society, character, 'educated')) chance += 0.08
            chance = this.clamp(chance, 0.06, 0.92)
            let success = Math.random() < chance
            social.nextCourtMonth = this.futureMonthKey(success ? 3 : 6)
            if (success) {
              if (romance) {
                romance.intensity = this.clamp((romance.intensity || 25) + (ideal ? this.randomInt(10, 18) : this.randomInt(5, 12)), 1, 100)
                romance.secrecy = this.clamp((romance.secrecy || risk) + (approach === 'discretion' ? -4 : this.randomInt(1, 7)), 0, 100)
              } else {
                romance = this.createRomance(society, currentId, characterId, {
                  source: 'player',
                  intensity: this.randomInt(24, 42) + Math.max(0, Math.round((social.bond || 0) / 5)) + (ideal ? 8 : 0),
                  secrecy: approach === 'discretion' ? Math.max(5, risk - 12) : risk
                })
              }
              social.bond = this.clamp((social.bond || 0) + (ideal ? this.randomInt(12, 22) : this.randomInt(6, 14)), -100, 100)
              house.relation = this.clamp((house.relation || 0) + (ideal ? 5 : 2), -100, 100)
              this.changePersonalRelation(society, currentId, characterId, ideal ? 18 : 10, 'lover')
              result = {
                title: romance && romance.months ? 'Secret meeting' : 'A private attachment begins',
                message: ideal
                  ? this.characterName(character, state) + ' responds warmly. Your choice suited their character, and the bond deepens.'
                  : this.characterName(character, state) + ' accepts the approach, though not perfectly. The relationship grows.',
                image: this.characterPortrait(character, state, house)
              }
              this.log(society, 'A private attachment grows with ' + this.characterName(character, state) + ' of ' + house.name + '.', 'romance', house.id)
              if (romance && Math.random() < this.romanceScandalChance(romance, player, character, state) * (approach === 'discretion' ? 0.7 : 1.25)) {
                this.revealRomanceScandal(society, state, romance, player, character, { quietPlayerModal: true })
                result.title = 'The meeting is discovered'
                result.message += '\nServants talk, and the affair becomes dangerous gossip.'
                result.image = this.affairIcon('scandal')
              }
            } else {
              let loss = ideal ? this.randomInt(2, 6) : this.randomInt(7, 16)
              social.bond = this.clamp((social.bond || 0) - loss, -100, 100)
              house.relation = this.clamp((house.relation || 0) - Math.max(2, Math.round(loss / 2)), -100, 100)
              this.changePersonalRelation(society, currentId, characterId, -loss, loss >= 10 ? 'resentful' : 'neutral')
              result = {
                title: ideal ? 'Bad timing' : 'Courtship fails',
                message: ideal
                  ? this.characterName(character, state) + ' might have welcomed the approach another day, but the timing fails. Rapport slips a little.'
                  : this.characterName(character, state) + ' rejects the approach. The choice did not fit their personality or situation.',
                image: this.affairIcon('rivalry')
              }
              this.log(society, 'A private advance toward ' + this.characterName(character, state) + ' fails.', 'romance', house.id)
              if ((player.spouseId || character.spouseId) && Math.random() < 0.18) {
                house.heat = (house.heat || 0) + 1
              }
            }
          })
          if (result) {
            this.pushModal({
              title: result.title,
              message: result.message,
              image: result.image,
              options: [
                {
                  text: 'Back',
                  action: {
                    event: this.event,
                    method: 'openPerson',
                    context: { houseId, characterId }
                  }
                }
              ]
            })
          } else {
            this.openPerson({ houseId, characterId })
          }
        },
        spreadRumor({ houseId, characterId }) {
          this.withHouse(houseId, (society, house) => {
            let state = daapi.getState()
            let success = Math.random() > 0.28
            if (success) {
              house.relation = this.clamp((house.relation || 0) - 22, -100, 100)
              this.changePersonalRelation(society, this.currentCharacterId(state), characterId, -18, 'humiliated')
              this.applyStats({ influence: 35, prestige: 5 })
              this.log(society, 'A rumor harms ' + house.name + ', and your faction enjoys the advantage.')
            } else {
              house.relation = this.clamp((house.relation || 0) - 35, -100, 100)
              house.rivalry = true
              this.changePersonalRelation(society, this.currentCharacterId(state), characterId, -30, 'enemy')
              this.applyStats({ prestige: -15 })
              this.log(society, 'A rumor against ' + house.name + ' is traced back to your circle.')
            }
          })
          this.openPerson({ houseId, characterId })
        },
        answerSlander({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            this.applyStats({ influence: -35, prestige: 4 })
            house.pendingPlayerEvent = false
            house.heat = (house.heat || 0) + 2
            house.relation = this.clamp((house.relation || 0) - 8, -100, 100)
            this.log(society, 'You answer ' + house.name + '\'s slander in public.')
          })
        },
        ignoreSlander({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            this.applyStats({ prestige: -10 })
            house.pendingPlayerEvent = false
            house.heat = Math.max(0, (house.heat || 0) - 1)
            this.log(society, 'You ignore slander from ' + house.name + '.')
          })
        },
        acceptOpening({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            house.favor = (house.favor || 0) + 1
            house.relation = this.clamp((house.relation || 0) + 8, -100, 100)
            this.applyStats({ influence: 60 })
            this.log(society, house.name + ' exchanges public support with your household.')
          })
        },
        declineOpening({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            house.relation = this.clamp((house.relation || 0) - 4, -100, 100)
            this.applyStats({ prestige: 3 })
            this.log(society, 'You decline a political opening from ' + house.name + '.')
          })
        },
        supportPetition({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let cost = this.petitionCost(house)
            this.applyStats({ cash: -cost, prestige: 7 })
            house.relation = this.clamp((house.relation || 0) + 18, -100, 100)
            if (Math.random() < 0.35) {
              house.favor = (house.favor || 0) + 1
            }
            this.log(society, 'You hear a petition from ' + house.name + '.')
          })
        },
        refusePetition({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            house.relation = this.clamp((house.relation || 0) - 12, -100, 100)
            this.log(society, 'You refuse a petition from ' + house.name + '.')
          })
        },
        attendFamilyInvitation({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let cost = this.invitationCost(house)
            this.applyStats({ cash: -cost, prestige: 10 })
            house.relation = this.clamp((house.relation || 0) + 14, -100, 100)
            if (Math.random() < 0.18) {
              house.favor = (house.favor || 0) + 1
            }
            house.lastFamilyEvent = 'Your household attends a public occasion with ' + house.name + '.'
            this.log(society, 'You attend a family occasion with ' + house.name + ': relation ' + this.signed(house.relation) + '.')
          })
        },
        declineFamilyInvitation({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            house.relation = this.clamp((house.relation || 0) - 7, -100, 100)
            house.heat = (house.heat || 0) + 1
            house.lastFamilyEvent = 'Your household declines an invitation from ' + house.name + '.'
            this.log(society, 'You decline an invitation from ' + house.name + ': relation ' + this.signed(house.relation) + '.')
          })
        },
        endorseOffice({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            this.applyStats({ influence: -45, prestige: 10 })
            house.pendingPlayerEvent = false
            house.relation = this.clamp((house.relation || 0) + 14, -100, 100)
            house.power = (house.power || 0) + 10
            house.favor = (house.favor || 0) + 1
            this.log(society, 'You endorse ' + house.name + ' in their campaign for office.')
          })
        },
        honorWedding({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let cost = this.actionCost(house, 'wedding')
            this.applyStats({ cash: -cost, prestige: 5 })
            house.pendingPlayerEvent = false
            house.relation = this.clamp((house.relation || 0) + 16, -100, 100)
            house.stability = this.clamp((house.stability || 50) + 5, 0, 100)
            this.log(society, 'Your gift honors a wedding alliance in ' + house.name + '.')
          })
        },
        judgeInheritance({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            let success = Math.random() < 0.7
            this.applyStats({ influence: -30, prestige: success ? 12 : -8 })
            house.pendingPlayerEvent = false
            if (success) {
              house.relation = this.clamp((house.relation || 0) + 18, -100, 100)
              house.stability = this.clamp((house.stability || 50) + 12, 0, 100)
              house.favor = (house.favor || 0) + 1
              this.log(society, 'You settle an inheritance dispute inside ' + house.name + '.')
            } else {
              house.relation = this.clamp((house.relation || 0) - 16, -100, 100)
              house.stability = this.clamp((house.stability || 50) - 8, 0, 100)
              this.log(society, 'Your intervention in ' + house.name + '\'s inheritance dispute backfires.')
            }
          })
        },
        investVenture({ houseId, cost, expected, months }) {
          this.withHouse(houseId, (society, house) => {
            let offer = this.ventureOffer(house)
            cost = parseInt(cost || offer.cost, 10)
            expected = parseInt(expected || offer.expected, 10)
            months = parseInt(months || offer.months, 10)
            this.applyStats({ cash: -cost })
            society.pendingVentures = society.pendingVentures || []
            society.pendingVentures.push({
              id: 'venture_' + this.safeId(house.id) + '_' + Date.now() + '_' + this.randomInt(1000, 9999),
              houseId: house.id,
              invested: cost,
              expected,
              due: this.futureMonthKey(months),
              roll: Math.random(),
              notified: false
            })
            house.pendingPlayerEvent = false
            house.relation = this.clamp((house.relation || 0) + 10, -100, 100)
            house.wealth = (house.wealth || 0) + cost
            this.log(society, 'You invest with ' + house.name + ': expected settlement in ' + months + ' months.')
          })
        },
        collectVentureResult({ ventureId }) {
          let society = this.ensure()
          society.pendingVentures = society.pendingVentures || []
          let index = society.pendingVentures.findIndex((venture) => venture && venture.id === ventureId)
          if (index < 0) {
            this.openHub()
            return
          }
          let venture = society.pendingVentures[index]
          let house = society.houses[venture.houseId]
          let title = 'Venture settled'
          let message = ''
          if (venture.success && venture.payout) {
            this.applyStats({ cash: venture.payout })
            if (house) {
              house.relation = this.clamp((house.relation || 0) + 4, -100, 100)
              house.wealth = (house.wealth || 0) + Math.round(venture.payout / 2)
            }
            this.log(society, 'A trade venture pays your household ' + venture.payout + ' cash.', 'tradeVenture', venture.houseId)
            message = 'The trade venture pays your household ' + venture.payout + ' cash.'
          } else {
            if (house) {
              house.stability = this.clamp((house.stability || 50) - 2, 0, 100)
            }
            this.log(society, 'A trade venture closes without profit.', 'tradeVenture', venture.houseId)
            message = 'The trade venture closes without profit.'
          }
          society.pendingVentures.splice(index, 1)
          this.save(society)
          this.pushModal({
            societyMenu: true,
            title,
            message: message + (house ? '\nHouse: ' + house.name + '.' : ''),
            image: this.affairIcon('tradeVenture'),
            options: [
              house ? {
                variant: 'info',
                text: 'View house',
                icons: [this.houseCrestIcon(society, house)],
                action: { event: this.event, method: 'openHouse', context: { houseId: house.id, returnTo: 'hub' } }
              } : false,
              {
                text: 'Back to Society',
                action: { event: this.event, method: 'openHub' }
              },
              {
                text: 'Close'
              }
            ].filter(Boolean)
          })
        },
        shieldScandal({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            this.applyStats({ influence: -35, prestige: -4 })
            house.pendingPlayerEvent = false
            house.relation = this.clamp((house.relation || 0) + 20, -100, 100)
            house.stability = this.clamp((house.stability || 50) + 8, 0, 100)
            house.favor = (house.favor || 0) + 1
            this.log(society, 'You shield ' + house.name + ' from scandal.')
          })
        },
        exploitScandal({ houseId }) {
          this.withHouse(houseId, (society, house) => {
            this.applyStats({ influence: 50, prestige: 6 })
            house.pendingPlayerEvent = false
            house.relation = this.clamp((house.relation || 0) - 35, -100, 100)
            house.rivalry = house.relation < -45 || house.rivalry
            house.power = Math.max(0, (house.power || 0) - 8)
            this.log(society, 'You exploit scandal in ' + house.name + ' for political advantage.')
          })
        },
        declineFamilyAffair({ houseId, kind }) {
          this.withHouse(houseId, (society, house) => {
            house.pendingPlayerEvent = false
            if (kind === 'tradeVenture') {
              this.log(society, 'You decline a trade venture from ' + house.name + ' without offense.', 'tradeVenture', house.id)
              return
            }
            house.relation = this.clamp((house.relation || 0) - 3, -100, 100)
            this.log(society, 'You avoid becoming involved in ' + house.name + '\'s family affairs.')
          })
        },
        withHouse(houseId, fn) {
          let society = this.ensure()
          let house = society.houses[houseId]
          if (!house) {
            return
          }
          fn(society, house)
          this.save(society)
        },
        actionCost(house, type) {
          let profile = this.strata[house.stratum] || this.strata.plebeian
          let state = daapi.getState()
          let cash = Math.max(0, parseFloat((state.current && state.current.cash) || 0))
          let level = this.socialLevel(house.stratum)
          let floors = [8, 12, 18, 32, 55, 90]
          let baseFloor = floors[level] || 18
          let floor = cash > 0 ? Math.max(1, Math.min(baseFloor, Math.round(cash * 0.25))) : 1
          let base = profile.cost || 200
          let typeFactor = 0.16
          let cashFactor = 0.08
          if (type === 'dinner') {
            typeFactor = 0.34
            cashFactor = 0.16
          }
          if (type === 'reconcile') {
            typeFactor = 0.24
            cashFactor = 0.14
          }
          if (type === 'wedding') {
            typeFactor = 0.12
            cashFactor = 0.10
          }
          if (type === 'venture') {
            typeFactor = 0.22
            cashFactor = 0.18
          }
          let scaled = Math.max(floor, Math.round(base * typeFactor))
          let affordable = cash > 0 ? Math.max(1, Math.round(cash * cashFactor)) : 1
          return Math.max(1, Math.round(Math.min(scaled, affordable, cash > 0 ? Math.max(1, Math.floor(cash)) : 1)))
        },
        petitionCost(house) {
          return Math.max(4, Math.round(this.actionCost(house || {}, 'gift') * 0.45))
        },
        invitationCost(house) {
          return Math.max(5, Math.round(this.actionCost(house || {}, 'gift') * 0.55))
        },
        ventureOffer(house) {
          let profile = this.strata[house.stratum] || this.strata.plebeian
          let cost = this.actionCost(house, 'venture')
          let expected = Math.max(8, Math.round(cost * (0.35 + Math.min(0.65, (profile.revenue || 20) / 120))))
          return {
            cost,
            expected,
            months: this.randomInt(1, 2)
          }
        },
        applyStats(stats) {
          stats = stats || {}
          try {
            if (stats.cash) daapi.addCash({ cash: stats.cash })
            if (stats.influence) daapi.addInfluence({ influence: stats.influence })
            if (stats.prestige) daapi.addPrestige({ prestige: stats.prestige })
          } catch (err) {
            console.warn(err)
            daapi.applyStatChanges({
              cash: stats.cash || 0,
              influence: stats.influence || 0,
              prestige: stats.prestige || 0
            })
          }
        },
        sortedHouses(society) {
          let houses = []
          for (let houseId in society.houses) {
            if (society.houses.hasOwnProperty(houseId)) {
              houses.push(society.houses[houseId])
            }
          }
          return houses.sort((a, b) => {
            if ((b.strength || 0) !== (a.strength || 0)) {
              return (b.strength || 0) - (a.strength || 0)
            }
            return String(a.name || '').localeCompare(String(b.name || ''))
          })
        },
        alliedHouses(society) {
          return this.sortedHouses(society).filter((house) => this.isAlliedHouse(house))
        },
        rivalHouses(society) {
          return this.sortedHouses(society).filter((house) => this.isRivalHouse(house))
        },
        isAlliedHouse(house) {
          return !!(house && ((house.relation || 0) >= 45 || (house.favor || 0) > 0))
        },
        isRivalHouse(house) {
          return !!(house && ((house.relation || 0) <= -35 || house.rivalry))
        },
        dynastyOptionText(society, dynasty) {
          let houses = this.housesForDynasty(society, dynasty.id)
          let head = society.houses && society.houses[dynasty.headHouseId]
          return (dynasty.name || 'Unknown Dynasty') + ' (' + houses.length + ' ' + (houses.length === 1 ? 'house' : 'houses') + (head ? ', head: ' + head.name : '') + ')'
        },
        dynastyTooltip(society, dynasty) {
          let houses = this.housesForDynasty(society, dynasty.id)
          let head = society.houses && society.houses[dynasty.headHouseId]
          let origin = society.houses && society.houses[dynasty.originHouseId]
          let totalStrength = houses.reduce((sum, house) => sum + Math.round(house.strength || 0), 0)
          let totalWealth = houses.reduce((sum, house) => sum + Math.round(house.wealth || 0), 0)
          return [
            'Dynasty: ' + (dynasty.name || dynasty.id),
            'Head house: ' + ((head && head.name) || 'unknown'),
            'Origin house: ' + ((origin && origin.name) || 'unknown'),
            'Houses: ' + houses.length,
            'Total strength: ' + totalStrength,
            'Total wealth: ' + totalWealth,
            'Heritage: ' + (dynasty.heritage || 'unknown')
          ].join('\n')
        },
        dynastySummaryOptions(society, state, dynasty, houses, headHouse, originHouse) {
          houses = houses || this.housesForDynasty(society, dynasty.id)
          let members = this.memberIdsForDynasty(society, state, dynasty.id)
          let totalStrength = houses.reduce((sum, house) => sum + Math.round(house.strength || 0), 0)
          let totalWealth = houses.reduce((sum, house) => sum + Math.round(house.wealth || 0), 0)
          let totalPower = houses.reduce((sum, house) => sum + Math.round(house.power || 0), 0)
          let rivals = houses.filter((house) => this.isRivalHouse(house)).length
          return [
            this.summaryOption('Dynasty', dynasty.name || dynasty.id, [this.affairIcon('familyTree')], 'A dynasty can contain multiple houses. The name does not change when leadership changes.'),
            this.summaryOption('Head house', headHouse ? headHouse.name : 'unknown', [headHouse ? this.houseCrestIcon(society, headHouse) : this.affairIcon('prestige')], 'The current leading house of the dynasty. Cadet houses can usurp this role without renaming any house.'),
            this.summaryOption('Origin house', originHouse ? originHouse.name : 'unknown', [originHouse ? this.houseCrestIcon(society, originHouse) : this.affairIcon('familyTree')], 'The original house of the dynasty. It keeps its name even if it loses leadership.'),
            this.summaryOption('Branches', houses.length + ' houses, ' + members.length + ' visible members', [this.affairIcon('support')], 'Known living members are connected to houses through Society house IDs.'),
            this.summaryOption('Power bloc', 'Strength ' + totalStrength + ', wealth ' + totalWealth + ', power ' + totalPower, [this.affairIcon('senator'), this.affairIcon('coins')], 'Aggregated dynasty position across all houses.'),
            this.summaryOption('Tension', rivals + ' hostile branches / relations', [this.affairIcon(rivals ? 'rivalry' : 'support')], 'Internal and external hostility can let a cadet house become dynasty head.')
          ]
        },
        houseOptionText(house) {
          let marker = house.rivalry ? 'Rival ' : (house.relation >= 55 ? 'Ally ' : '')
          return marker + house.name + ' (' + this.signed(house.relation || 0) + ')'
        },
        houseTooltip(house) {
          return [
            'Rank: ' + (house.citizenRank || 'Unknown'),
            'Strength: ' + Math.round(house.strength || 0),
            'Wealth: ' + Math.round(house.wealth || 0),
            'Power: ' + Math.round(house.power || 0),
            'Stability: ' + Math.round(house.stability || 0),
            'Favors: ' + (house.favor || 0),
            'Agenda: ' + (house.agenda || 'unknown')
          ].join('\n')
        },
        currentCharacterId(state) {
          let current = (state && state.current) || {}
          if (current.id !== undefined && current.id !== null) return current.id
          if (current.characterId !== undefined && current.characterId !== null) return current.characterId
          if (current.currentCharacterId !== undefined && current.currentCharacterId !== null) return current.currentCharacterId
          if (current.playerCharacterId !== undefined && current.playerCharacterId !== null) return current.playerCharacterId
          return null
        },
        isPlayerFamilyCharacter(state, characterId) {
          if (characterId === undefined || characterId === null) {
            return false
          }
          return this.playerFamilyMemberIds(state || daapi.getState())
            .map((id) => String(id))
            .indexOf(String(characterId)) >= 0
        },
        playerFamilyMemberIds(state) {
          state = state || daapi.getState()
          let characters = state.characters || {}
          let current = state.current || {}
          let currentId = this.currentCharacterId(state)
          let player = characters[currentId] || {}
          let dynastyId = player.dynastyId
          let seen = {}
          let ids = []
          let add = (characterId) => {
            if (characterId === undefined || characterId === null || characterId === '' || seen[characterId]) {
              return
            }
            seen[characterId] = true
            ids.push(characterId)
          }
          add(currentId)
          ;[
            current.householdCharacterIds,
            current.formerHouseholdCharacterIds,
            current.familyCharacterIds,
            current.dependantCharacterIds,
            current.dependentCharacterIds
          ].forEach((list) => {
            ;(list || []).forEach(add)
          })
          let addRelations = (character) => {
            if (!character) {
              return
            }
            add(character.fatherId)
            add(character.motherId)
            add(character.spouseId)
            ;(character.childrenIds || []).forEach(add)
            ;(character.siblingIds || []).forEach(add)
            ;(character.dependantIds || []).forEach(add)
            ;(character.dependentIds || []).forEach(add)
          }
          addRelations(player)
          for (let characterId in characters) {
            if (!characters.hasOwnProperty(characterId)) {
              continue
            }
            let character = characters[characterId]
            if (!character || character.isDead) {
              continue
            }
            if (dynastyId && character.dynastyId === dynastyId) {
              add(character.id || characterId)
              addRelations(character)
            } else if (
              character.fatherId === currentId ||
              character.motherId === currentId ||
              (player.childrenIds || []).indexOf(character.id || characterId) >= 0
            ) {
              add(character.id || characterId)
              addRelations(character)
            }
          }
          return ids.filter((characterId) => {
            let character = characters[characterId]
            return character && !character.isDead
          })
        },
        playerFamilyMembers(state) {
          state = state || daapi.getState()
          let characters = state.characters || {}
          return this.playerFamilyMemberIds(state)
            .map((characterId) => characters[characterId])
            .filter((character) => character && !character.isDead)
        },
        playerMarriageCandidates(state) {
          state = state || daapi.getState()
          let candidates = []
          this.playerFamilyMemberIds(state).forEach((characterId) => {
            let character = state.characters[characterId]
            if (this.isMarriageEligible(character, state)) {
              if (character.id === undefined || character.id === null) {
                character.id = characterId
              }
              candidates.push(character)
            }
          })
          return candidates.sort((a, b) => this.age(a, state) - this.age(b, state))
        },
        marriageOptionInfo(society, state, house) {
          let playerStratum = this.playerStratum(state)
          let diff = this.socialLevel(house.stratum) - this.socialLevel(playerStratum)
          let candidates = this.playerMarriageCandidates(state)
          let required = this.marriageRelationRequirement(diff)
          let relation = house.relation || 0
          let notes = []
          let tooltip = [
            'Player order: ' + this.stratumTitle(playerStratum),
            'Target order: ' + this.stratumTitle(house.stratum),
            'Relation: ' + this.signed(relation),
            'Unmarried adult family members: ' + candidates.length
          ]
          if (house.stratum === 'poor') {
            notes.push('slaves')
            tooltip.push('Your family cannot arrange marriages with enslaved characters. Use Household Slaves for slave-to-slave household marriages only.')
          }
          if (!candidates.length) {
            notes.push('no adult')
            tooltip.push('No unmarried adult in your family was found.')
          }
          if (diff < -1) {
            notes.push('too low')
            tooltip.push('This house is more than one order below you.')
          }
          if (diff > 2) {
            notes.push('too high')
            tooltip.push('This house is more than two orders above you.')
          }
          if (diff <= 2 && diff >= -1 && relation < required) {
            notes.push('need ' + required + ' rel')
            tooltip.push('This rank gap requires relation ' + required + ' or higher.')
          }
          if (!notes.length) {
            tooltip.push('If this house lacks a visible eligible spouse, Society can introduce one.')
          }
          return {
            available: notes.length === 0,
            note: notes.slice(0, 2).join(', '),
            tooltip: tooltip.join('\n'),
            playerStratum,
            diff,
            required
          }
        },
        houseMarriageCandidates(house, state, matchCharacter) {
          let candidates = []
          if (!house || house.stratum === 'poor') {
            return candidates
          }
          this.visibleHousePeople(house, state).forEach((characterId) => {
            let character = state.characters[characterId]
            if (!this.isMarriageEligible(character, state) || this.isSlaveCharacter(character, house)) {
              return
            }
            if (character.id === undefined || character.id === null) {
              character.id = characterId
            }
            if (matchCharacter && !this.isMarriageCompatible(matchCharacter, character)) {
              return
            }
            candidates.push(character)
          })
          return candidates.sort((a, b) => this.characterScore(b, state) - this.characterScore(a, state))
        },
        playerStratum(state) {
          return this.playerSocietyStatus(state).stratum
        },
        syncPlayerSocietyStatus(society, state) {
          society.playerStatus = this.playerSocietyStatus(state)
        },
        playerSocietyStatus(state) {
          state = state || daapi.getState()
          let currentId = this.currentCharacterId(state)
          let player = (state.characters && state.characters[currentId]) || {}
          let dynastyId = player.dynastyId || (state.current && state.current.dynastyId)
          let dynasty = (state.dynasties && state.dynasties[dynastyId]) || {}
          let members = this.playerFamilyMembers(state)
          let heritage = this.normalizedHeritage(dynasty.heritage || player.heritage || '')
          let currentClass = this.safeCurrentClass(state)
          let wealth = this.playerWealthValue(state)
          let hasSenate = members.some((character) => this.isSenatorialCharacter(character, state))
          let stratum = this.stratumFromPlayerClass(currentClass, heritage, hasSenate, state)
          return {
            stratum,
            title: this.playerStatusTitle(stratum, heritage),
            heritage,
            currentClass,
            className: this.currentClassName(currentClass),
            wealth
          }
        },
        stratumFromPlayerClass(currentClass, heritage, hasSenate, state) {
          let senatorialFlag = !!(state && state.current && state.current.flagIsSenetorialClass)
          if (senatorialFlag || hasSenate || currentClass >= 7) {
            return 'senatorial'
          }
          if (currentClass >= 6) {
            return 'equestrian'
          }
          if (currentClass >= 4) {
            return 'civic'
          }
          if (currentClass >= 1) {
            if (heritage === 'roman_freedman') {
              return 'freedmen'
            }
            if (heritage === 'roman_novus_homo' && currentClass >= 3) {
              return 'civic'
            }
            return 'plebeian'
          }
          if (heritage === 'roman_freedman') {
            return 'freedmen'
          }
          if (heritage === 'roman_novus_homo' && currentClass >= 3) {
            return 'civic'
          }
          return 'poor'
        },
        playerStatusTitle(stratum, heritage) {
          if (stratum === 'senatorial') return 'Senatorial Roman Citizen'
          if (stratum === 'equestrian') return 'Equestrian Roman Citizen'
          if (stratum === 'civic') return heritage === 'roman_novus_homo' ? 'Novus Homo Civic Roman Citizen' : 'Civic Roman Citizen'
          if (stratum === 'plebeian') return heritage === 'roman_novus_homo' ? 'Novus Homo Plebeian Roman Citizen' : 'Plebeian Roman Citizen'
          if (stratum === 'freedmen') return 'Freedman Roman Citizen'
          return 'Proletarii Roman Citizen'
        },
        playerStatusText(state) {
          let status = this.playerSocietyStatus(state)
          let classText = status.className ? ' (' + status.className + ')' : ''
          return status.title + classText
        },
        playerStatusKey(state) {
          let status = this.playerSocietyStatus(state)
          return [
            status.stratum,
            status.heritage,
            status.currentClass === null ? 'none' : status.currentClass,
            status.className || '',
            !!(state && state.current && state.current.flagIsSenetorialClass)
          ].join(':')
        },
        currentClassName(currentClass) {
          let names = ['Proletarii', 'Class V', 'Class IV', 'Class III', 'Class II', 'Class I', 'Equites', 'Senatores']
          return names[currentClass] || ''
        },
        normalizedHeritage(heritage) {
          return String(heritage || '').toLowerCase()
        },
        safeCurrentClass(state) {
          state = state || daapi.getState()
          if (state && state.current && state.current.flagIsSenetorialClass) {
            return 7
          }
          try {
            if (typeof daapi !== 'undefined' && daapi.calculateCurrentClass) {
              let currentClass = parseInt(daapi.calculateCurrentClass(), 10)
              return isNaN(currentClass) ? null : currentClass
            }
          } catch (err) {
            console.warn(err)
          }
          let wealth = this.playerWealthValue(state)
          if (wealth < 1100) return 0
          if (wealth < 2500) return 1
          if (wealth < 5000) return 2
          if (wealth < 7500) return 3
          if (wealth < 10000) return 4
          if (wealth < 25000) return 5
          return 6
        },
        playerWealthValue(state) {
          let current = (state && state.current) || {}
          let wealth = parseFloat(current.cash || 0)
          let details = current.propertyDetails || current.property || {}
          return wealth + this.propertyValue(details)
        },
        propertyValue(details) {
          let values = {
            farmland: 250,
            vinyard: 360,
            vineyard: 360,
            orchard: 420,
            primeFarmland: 2700,
            primeVinyard: 3300,
            primeVineyard: 3300,
            primeOrchard: 3900,
            latifundiumFood: 11000,
            latifundiumAnimal: 14000,
            latifundiumFish: 17000,
            latifundiumOil: 21000,
            insulae: 4500,
            fishingBoat: 41,
            tradeships: 630,
            seafaringTradeships: 7500,
            horse: 125,
            donkey: 28,
            pig: 26,
            goat: 32,
            sheep: 36,
            cattle: 40,
            duck: 15,
            chicken: 10
          }
          let total = 0
          Object.keys(values).forEach((key) => {
            total += parseFloat(details[key] || 0) * values[key]
          })
          return total
        },
        socialLevel(stratum) {
          let levels = {
            poor: 0,
            freedmen: 1,
            plebeian: 2,
            civic: 3,
            equestrian: 4,
            senatorial: 5
          }
          return levels[stratum] === undefined ? 2 : levels[stratum]
        },
        stratumTitle(stratum) {
          return (this.strata[stratum] && this.strata[stratum].title) || stratum || 'Unknown'
        },
        marriageRelationRequirement(diff) {
          if (diff >= 2) return 80
          if (diff === 1) return 35
          if (diff === 0) return 0
          return -10
        },
        marriageEffects(state, house) {
          let diff = this.socialLevel(house.stratum) - this.socialLevel(this.playerStratum(state))
          let profile = this.strata[house.stratum] || this.strata.plebeian
          let cost = this.actionCost(house, 'wedding')
          if (diff >= 2) {
            return {
              stats: { cash: -Math.round(cost * 2.2), prestige: 70, influence: 150 },
              revenue: Math.max(8, Math.round((profile.revenue || 30) * 0.35)),
              relation: 32,
              summary: 'Marriage far above your station: prestige and influence rise sharply, but the wedding is expensive.'
            }
          }
          if (diff === 1) {
            return {
              stats: { cash: -Math.round(cost * 1.45), prestige: 38, influence: 85 },
              revenue: Math.max(5, Math.round((profile.revenue || 30) * 0.25)),
              relation: 26,
              summary: 'Marriage upward: your standing improves and the alliance opens useful doors.'
            }
          }
          if (diff === 0) {
            return {
              stats: { cash: -cost, prestige: 16, influence: 35 },
              revenue: Math.max(3, Math.round((profile.revenue || 30) * 0.15)),
              relation: 22,
              summary: 'Marriage within your order: a stable alliance strengthens both households.'
            }
          }
          return {
            stats: { cash: -Math.round(cost * 0.55), prestige: -8, influence: 18 },
            revenue: Math.max(2, Math.round((profile.revenue || 20) * 0.18)),
            relation: 30,
            summary: 'Marriage downward: some elite standing is lost, but local loyalty and practical support improve.'
          }
        },
        isMarriageEligible(character, state) {
          if (!character || character.isDead || character.spouseId) {
            return false
          }
          if (this.isSlaveCharacter(character)) {
            return false
          }
          let age = this.age(character, state)
          if (age < 16 || age > 60) {
            return false
          }
          if (character.flagCannotMarry) {
            return false
          }
          return true
        },
        isMarriageCompatible(first, second) {
          if (!first || !second || first.id === second.id || first.dynastyId === second.dynastyId) {
            return false
          }
          return this.characterIsMale(first) !== this.characterIsMale(second)
        },
        isMarriageCompatibleForSlaves(first, second) {
          if (!first || !second || first.id === second.id) {
            return false
          }
          return this.characterIsMale(first) !== this.characterIsMale(second)
        },
        characterIsMale(character) {
          if (!character) {
            return false
          }
          if (character.gender) {
            return character.gender === 'male'
          }
          return !!character.isMale
        },
        ensureCrests(society, state) {
          society.crests = society.crests || {}
          society.crestSettings = { playerOverlay: true, ...(society.crestSettings || {}) }
          this.ensurePlayerCrest(society, state)
          for (let houseId in society.houses) {
            if (society.houses.hasOwnProperty(houseId)) {
              this.ensureHouseCrest(society, society.houses[houseId])
            }
          }
        },
        playerCrestId(state) {
          let currentId = this.currentCharacterId(state)
          let character = state.characters[currentId] || {}
          return 'player_' + this.safeId(character.dynastyId || currentId || 'house')
        },
        ensurePlayerCrest(society, state) {
          society.crests = society.crests || {}
          let crestId = this.playerCrestId(state)
          let character = state.characters[this.currentCharacterId(state)] || {}
          let dynasty = state.dynasties[character.dynastyId] || {}
          if (!society.crests[crestId]) {
            society.crests[crestId] = this.generateCrest('player-' + crestId + '-' + this.houseName(dynasty, character.dynastyId || crestId))
          }
          society.playerCrestId = crestId
          return society.crests[crestId]
        },
        ensureHouseCrest(society, house) {
          society.crests = society.crests || {}
          let crestId = 'house_' + this.safeId((house && house.id) || (house && house.name) || 'unknown')
          if (!society.crests[crestId]) {
            society.crests[crestId] = this.generateCrest(crestId + '-' + ((house && house.name) || '') + '-' + ((house && house.stratum) || ''))
          }
          if (house) {
            house.crestId = crestId
          }
          return society.crests[crestId]
        },
        houseCrestIcon(society, house) {
          let crest = this.ensureHouseCrest(society, house)
          return this.crestIcon(crest, 112)
        },
        crestCycleOption(label, part, crest) {
          return {
            text: label + ': ' + this.crestLabel(part, crest[part]),
            tooltip: 'Cycle ' + label.toLowerCase() + '.',
            action: {
              event: this.event,
              method: 'cyclePlayerCrest',
              context: { part }
            }
          }
        },
        crestLabel(part, value) {
          if (!value) {
            return 'none'
          }
          return String(value)
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (letter) => letter.toUpperCase())
        },
        crestList(part) {
          if (part === 'field') return this.crestFields
          if (part === 'metal') return this.crestMetals
          if (part === 'accent') return this.crestAccents
          if (part === 'shape') return this.crestShapes
          if (part === 'division') return this.crestDivisions
          if (part === 'pattern') return this.crestPatterns
          if (part === 'charge') return this.crestCharges
          if (part === 'border') return this.crestBorders
          return []
        },
        generateCrest(seedText) {
          let random = this.seededRandom(seedText)
          let pickSeeded = (list) => {
            return list[Math.floor(random() * list.length) % list.length]
          }
          let field = pickSeeded(this.crestFields)
          let metal = pickSeeded(this.crestMetals)
          let accent = pickSeeded(this.crestAccents.filter((color) => color !== field))
          let charge = pickSeeded(this.crestCharges)
          return {
            version: 1,
            seed: String(seedText || ''),
            shape: pickSeeded(this.crestShapes),
            field,
            metal,
            accent,
            division: pickSeeded(this.crestDivisions),
            pattern: pickSeeded(this.crestPatterns),
            charge,
            border: pickSeeded(this.crestBorders),
            mark: pickSeeded(this.crestMarks)
          }
        },
        crestIcon(crest, size) {
          return this.svgDataUri(this.crestSvg(crest, size || 112))
        },
        crestColor(name) {
          return this.crestPalette[name] || this.crestPalette.crimson
        },
        crestSvg(crest, size) {
          crest = crest || this.generateCrest('fallback')
          let field = this.crestColor(crest.field)
          let metal = this.crestColor(crest.metal)
          let accent = this.crestColor(crest.accent)
          let edge = '#151316'
          let path = this.crestShapePath(crest.shape)
          let svg = ''
          svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + Math.round(size * 1.15) + '" viewBox="0 0 96 112">'
          svg += '<defs><clipPath id="shieldClip"><path d="' + path + '"/></clipPath>'
          svg += '<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".35"/></filter></defs>'
          svg += '<rect width="96" height="112" fill="none"/>'
          svg += '<g filter="url(#shadow)">'
          svg += '<path d="' + path + '" fill="' + field + '" stroke="' + edge + '" stroke-width="3"/>'
          svg += '<g clip-path="url(#shieldClip)">'
          svg += this.crestDivisionSvg(crest.division, field, metal, accent)
          svg += this.crestPatternSvg(crest.pattern, metal, accent)
          svg += '</g>'
          svg += this.crestChargeSvg(crest.charge, metal, accent, crest.mark)
          svg += this.crestBorderSvg(crest.border, path, metal, accent)
          svg += '</g></svg>'
          return svg
        },
        crestShapePath(shape) {
          if (shape === 'oval') return 'M48 8 C70 10 84 26 84 50 C84 80 66 101 48 106 C30 101 12 80 12 50 C12 26 26 10 48 8 Z'
          if (shape === 'round') return 'M48 10 C70 10 86 27 86 51 C86 77 69 96 48 104 C27 96 10 77 10 51 C10 27 26 10 48 10 Z'
          if (shape === 'vexillum') return 'M14 12 H82 V82 L66 74 L48 90 L30 74 L14 82 Z'
          if (shape === 'kite') return 'M48 6 L82 22 V58 C82 80 62 98 48 108 C34 98 14 80 14 58 V22 Z'
          if (shape === 'hex') return 'M30 10 H66 L86 30 V74 L48 106 L10 74 V30 Z'
          return 'M16 10 H80 C84 22 86 36 84 52 C82 78 66 98 48 106 C30 98 14 78 12 52 C10 36 12 22 16 10 Z'
        },
        crestDivisionSvg(division, field, metal, accent) {
          if (division === 'pale') return '<rect x="48" y="0" width="48" height="112" fill="' + metal + '"/>'
          if (division === 'fess') return '<rect x="0" y="50" width="96" height="62" fill="' + metal + '"/>'
          if (division === 'bend') return '<path d="M-8 88 L78 2 H106 L18 112 Z" fill="' + metal + '"/>'
          if (division === 'bendSinister') return '<path d="M-10 4 H20 L106 90 V116 Z" fill="' + metal + '"/>'
          if (division === 'quartered') return '<rect x="48" y="0" width="48" height="56" fill="' + metal + '"/><rect x="0" y="56" width="48" height="56" fill="' + metal + '"/>'
          if (division === 'chief') return '<rect x="0" y="0" width="96" height="30" fill="' + metal + '"/>'
          if (division === 'chevron') return '<path d="M0 76 L48 28 L96 76 L96 96 L48 48 L0 96 Z" fill="' + metal + '"/>'
          if (division === 'saltire') return '<path d="M-6 8 L8 -6 L102 98 L88 112 Z M88 -6 L102 8 L8 112 L-6 98 Z" fill="' + metal + '"/>'
          if (division === 'orle') return '<path d="M22 20 H74 C78 32 78 45 76 56 C73 78 60 91 48 97 C36 91 23 78 20 56 C18 45 18 32 22 20 Z" fill="none" stroke="' + metal + '" stroke-width="9"/>'
          return '<path d="M0 0 H96 V112 H0 Z" fill="' + field + '"/><path d="M12 20 H84" stroke="' + accent + '" stroke-opacity=".35" stroke-width="2"/>'
        },
        crestPatternSvg(pattern, metal, accent) {
          if (pattern === 'dots') {
            let dots = ''
            for (let y = 22; y < 92; y += 18) {
              for (let x = 24; x < 78; x += 18) {
                dots += '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="' + accent + '" opacity=".65"/>'
              }
            }
            return dots
          }
          if (pattern === 'bars') return '<path d="M10 28 H86 M8 48 H88 M8 68 H88 M12 88 H84" stroke="' + accent + '" stroke-width="4" opacity=".5"/>'
          if (pattern === 'waves') return '<path d="M4 36 C18 25 30 47 44 36 C58 25 70 47 92 34 M4 60 C18 49 30 71 44 60 C58 49 70 71 92 58 M4 84 C18 73 30 95 44 84 C58 73 70 95 92 82" fill="none" stroke="' + accent + '" stroke-width="3" opacity=".55"/>'
          if (pattern === 'rays') return '<path d="M48 56 L48 -10 M48 56 L104 10 M48 56 L108 56 M48 56 L102 104 M48 56 L48 122 M48 56 L-6 104 M48 56 L-12 56 M48 56 L-8 10" stroke="' + accent + '" stroke-width="4" opacity=".35"/>'
          if (pattern === 'tiles') return '<path d="M0 30 H96 M0 54 H96 M0 78 H96 M24 0 V112 M48 0 V112 M72 0 V112" stroke="' + accent + '" stroke-width="2" opacity=".35"/>'
          return ''
        },
        crestChargeSvg(charge, metal, accent, mark) {
          let stroke = ' stroke="' + accent + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"'
          if (charge === 'spqr') return '<text x="48" y="61" text-anchor="middle" font-family="serif" font-size="22" font-weight="700" fill="' + metal + '" stroke="' + accent + '" stroke-width="1">SPQR</text>'
          if (charge === 'aquila') return '<path d="M48 26 L56 44 L78 36 L62 55 L76 68 L55 65 L48 86 L41 65 L20 68 L34 55 L18 36 L40 44 Z" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/><circle cx="48" cy="40" r="5" fill="' + accent + '"/>'
          if (charge === 'laurel') return '<path d="M35 78 C22 58 25 36 42 24 M61 78 C74 58 71 36 54 24" fill="none"' + stroke + '/><path d="M33 68 L23 65 M31 58 L21 54 M31 47 L22 42 M38 34 L30 28 M63 68 L73 65 M65 58 L75 54 M65 47 L74 42 M58 34 L66 28" fill="none"' + stroke + '/><text x="48" y="61" text-anchor="middle" font-family="serif" font-size="15" font-weight="700" fill="' + metal + '">' + this.escapeSvg(mark || 'I') + '</text>'
          if (charge === 'thunderbolt') return '<path d="M55 20 L30 58 H47 L39 92 L68 48 H50 Z" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/>'
          if (charge === 'standard') return '<path d="M48 22 V88 M35 30 H68 V48 H35 Z M31 68 H65" fill="none"' + stroke + '/><circle cx="48" cy="20" r="6" fill="' + metal + '" stroke="' + accent + '" stroke-width="3"/>'
          if (charge === 'column') return '<path d="M35 34 H61 M32 78 H64 M38 34 V78 M48 34 V78 M58 34 V78 M30 28 H66 L60 20 H36 Z M28 86 H68 L62 78 H34 Z" fill="none"' + stroke + '/>'
          if (charge === 'sun') return '<circle cx="48" cy="56" r="16" fill="' + metal + '" stroke="' + accent + '" stroke-width="3"/><path d="M48 23 V33 M48 79 V91 M15 56 H28 M68 56 H81 M25 33 L34 42 M62 70 L71 79 M71 33 L62 42 M34 70 L25 79" fill="none"' + stroke + '/>'
          if (charge === 'crescent') return '<path d="M58 26 C40 35 34 58 46 78 C34 74 24 62 24 48 C24 32 39 20 58 26 Z" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/>'
          if (charge === 'star') return '<path d="M48 22 L56 45 L80 45 L60 59 L68 84 L48 69 L28 84 L36 59 L16 45 L40 45 Z" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/>'
          if (charge === 'scales') return '<path d="M48 28 V78 M30 40 H66 M36 40 L25 63 H47 Z M60 40 L49 63 H71 Z M36 82 H60" fill="none"' + stroke + '/>'
          if (charge === 'ship') return '<path d="M22 68 C32 82 64 82 76 68 Z M34 68 V30 L62 48 H34" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/><path d="M31 74 H66" fill="none"' + stroke + '/>'
          if (charge === 'spear') return '<path d="M48 22 V88 M48 20 L39 38 H57 Z M34 62 H62" fill="none"' + stroke + '/>'
          if (charge === 'tower') return '<path d="M31 82 V41 H38 V31 H45 V41 H52 V31 H59 V41 H66 V82 Z M41 82 V65 C41 55 55 55 55 65 V82" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/>'
          if (charge === 'hand') return '<path d="M37 76 V44 C37 39 44 39 44 44 V58 V36 C44 31 51 31 51 36 V58 V42 C51 37 58 37 58 42 V60 L63 52 C66 47 72 51 69 57 L58 81 C54 89 40 87 37 76 Z" fill="' + metal + '" stroke="' + accent + '" stroke-width="3" stroke-linejoin="round"/>'
          return '<circle cx="48" cy="56" r="20" fill="' + metal + '" stroke="' + accent + '" stroke-width="4"/>'
        },
        crestBorderSvg(border, path, metal, accent) {
          if (border === 'double') return '<path d="' + path + '" fill="none" stroke="' + metal + '" stroke-width="7"/><path d="' + path + '" fill="none" stroke="' + accent + '" stroke-width="3"/>'
          if (border === 'bossed') return '<path d="' + path + '" fill="none" stroke="' + metal + '" stroke-width="5"/><circle cx="24" cy="23" r="3" fill="' + accent + '"/><circle cx="72" cy="23" r="3" fill="' + accent + '"/><circle cx="18" cy="57" r="3" fill="' + accent + '"/><circle cx="78" cy="57" r="3" fill="' + accent + '"/><circle cx="48" cy="98" r="3" fill="' + accent + '"/>'
          if (border === 'laurel') return '<path d="' + path + '" fill="none" stroke="' + metal + '" stroke-width="4"/><path d="M20 30 C31 43 31 72 47 96 M76 30 C65 43 65 72 49 96" fill="none" stroke="' + accent + '" stroke-width="3" opacity=".8"/>'
          if (border === 'rivets') return '<path d="' + path + '" fill="none" stroke="' + metal + '" stroke-width="4"/><circle cx="28" cy="19" r="2.4" fill="' + metal + '"/><circle cx="48" cy="16" r="2.4" fill="' + metal + '"/><circle cx="68" cy="19" r="2.4" fill="' + metal + '"/><circle cx="22" cy="50" r="2.4" fill="' + metal + '"/><circle cx="74" cy="50" r="2.4" fill="' + metal + '"/><circle cx="48" cy="94" r="2.4" fill="' + metal + '"/>'
          return '<path d="' + path + '" fill="none" stroke="' + metal + '" stroke-width="5"/>'
        },
        svgDataUri(svg) {
          try {
            if (typeof window !== 'undefined' && window.btoa) {
              return 'data:image/svg+xml;base64,' + window.btoa(svg)
            }
          } catch (err) {
            console.warn(err)
          }
          return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
        },
        hashString(value) {
          let hash = 2166136261
          value = String(value || '')
          for (let i = 0; i < value.length; i++) {
            hash ^= value.charCodeAt(i)
            hash = Math.imul(hash, 16777619)
          }
          return hash >>> 0
        },
        seededRandom(seedText) {
          let seed = this.hashString(seedText) || 1
          return () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
            return seed / 4294967296
          }
        },
        escapeSvg(value) {
          return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        },
        characterName(character, state) {
          let dynasty = state.dynasties[character.dynastyId] || {}
          return (character.praenomen || 'Unknown') + ', ' + this.houseName(dynasty, character.dynastyId)
        },
        slaveDisplayName(character, record, state) {
          let name = (record && record.fullName) ||
            (character && (character.corSocietySlaveFullName || character.corSocietyForeignName)) ||
            (record && record.name) ||
            ''
          if (name) {
            return name
          }
          if (character) {
            return this.characterName(character, state || daapi.getState())
          }
          return 'Servus'
        },
        characterTooltip(character, state) {
          let skills = character.skills || {}
          let lines = [
            'Age: ' + this.formatAge(character, state),
            'Job: ' + (character.job || 'none') + ' ' + (character.jobLevel || 0),
            'Skills: I ' + Math.round(skills.intelligence || 0) + ', S ' + Math.round(skills.stewardship || 0) + ', E ' + Math.round(skills.eloquence || 0) + ', C ' + Math.round(skills.combat || 0)
          ]
          if (character.corSocietyOrigin === 'enslaved_dependant' || character.corSocietySlave || character.corSocietySlaveMarket) {
            lines.push('Origin: ' + this.slaveOriginDescription(character.corSocietySlaveOrigin || 'unknown'))
          }
          return lines.join('\n')
        },
        vanillaPortraitAsset(path) {
          path = String(path || '').replace(/^\.\//, '').replace(/^\/+/, '')
          return this.vanillaPortraitAssets[path] || ''
        },
        characterPortrait(character, state, house) {
          if (character && character.corSocietyOutfit) {
            return this.characterPortraitWithOutfit(character, state, character.corSocietyOutfit)
          }
          let portrait = this.vanillaCharacterPortrait(character, state)
          if (this.isImageData(portrait)) {
            return portrait
          }
          return this.genericVanillaCharacterPortrait(character, state)
        },
        isSlaveCharacter(character, house) {
          return !!(
            character &&
            (
              character.corSocietySlave ||
              character.corSocietySlaveMarket ||
              character.corSocietyOrigin === 'enslaved_dependant' ||
              (house && house.stratum === 'poor')
            )
          )
        },
        isSocietyGeneratedCharacter(character, house) {
          return !!(
            character &&
            (character.corSocietyGenerated || (house && house.generated))
          )
        },
        vanillaCharacterPortrait(character, state) {
          try {
            character = character || {}
            let look = character.look || {}
            if ((look.group === 'cor_society' || look.group === this.wardrobeLookGroup) && character.corSocietyOriginalLook) {
              look = character.corSocietyOriginalLook
            }
            let age = this.age(character, state || daapi.getState())
            let gender = character.gender || look.gender || (character.isMale ? 'male' : 'female')
            let ageStage = look.ageStage || this.characterAgeStage(age)
            let group = look.group || 'roman'
            let type = look.type || 'brown'
            let portrait = false
            if (look.isDAAPI && daapi.getCharacterIcon) {
              portrait = daapi.getCharacterIcon({
                group,
                gender,
                type,
                ageStage
              })
            } else {
              portrait = this.vanillaPortraitAsset('icons/characters/' + group + '/' + type + '/' + gender + '/' + ageStage + '.svg')
            }
            if (this.isImageData(portrait)) {
              return portrait
            }
          } catch (err) {
            console.warn(err)
          }
          return false
        },
        genericVanillaCharacterPortrait(character, state) {
          try {
            character = character || {}
            let look = character.look || {}
            let age = this.age(character, state || daapi.getState())
            let gender = character.gender || look.gender || (character.isMale ? 'male' : 'female')
            gender = gender === 'female' ? 'female' : 'male'
            let ageStage = look.ageStage || this.characterAgeStage(age)
            let suffix = ageStage === 'adult' ? '' : '_' + ageStage
            return this.vanillaPortraitAsset('icons/characters/' + gender + suffix + '.svg')
          } catch (err) {
            console.warn(err)
          }
          return ''
        },
        nativeCharacterPortraitWithOutfit(character, state, house, outfit) {
          state = state || daapi.getState()
          character = character || {}
          let baseLook = character.corSocietyOriginalLook || character.look || {}
          if (baseLook.group === 'cor_society' || baseLook.group === this.wardrobeLookGroup) {
            baseLook = character.corSocietyOriginalLook || {}
          }
          if (!outfit || outfit === 'auto') {
            let baseCharacter = { ...character, corSocietyOutfit: '', look: baseLook }
            return this.vanillaCharacterPortrait(baseCharacter, state) || this.genericVanillaCharacterPortrait(baseCharacter, state)
          }
          let gender = (character.gender || baseLook.gender || (character.isMale ? 'male' : 'female')) === 'female' ? 'female' : 'male'
          let ageStage = baseLook.ageStage || this.characterAgeStage(this.age(character, state))
          return this.wardrobePortraitDataUri(character, state, outfit, baseLook, gender, ageStage)
        },
        inlineImageHref(value) {
          value = this.imageHref(value)
          if (!value) {
            return ''
          }
          if (value.indexOf('data:image/') === 0) {
            return value
          }
          this.inlineImageCache = this.inlineImageCache || {}
          if (this.inlineImageCache[value]) {
            return this.inlineImageCache[value]
          }
          this.preloadInlineImage(value)
          return ''
        },
        preloadInlineImage(value) {
          if (!value || typeof fetch === 'undefined') {
            return
          }
          let requestUrl = this.absoluteImageHref(value)
          if (!requestUrl) {
            return
          }
          this.inlineImagePending = this.inlineImagePending || {}
          if (this.inlineImagePending[value]) {
            return
          }
          this.inlineImagePending[value] = true
          fetch(requestUrl)
            .then((response) => response.text())
            .then((text) => {
              this.inlineImageCache = this.inlineImageCache || {}
              this.inlineImageCache[value] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text)
              delete this.inlineImagePending[value]
              if (typeof window !== 'undefined' && window.corSociety) {
                window.setTimeout(() => {
                  try {
                    window.corSociety.applyPortraitOverlays()
                  } catch (err) {
                    console.warn(err)
                  }
                }, 50)
              }
            })
            .catch((err) => {
              delete this.inlineImagePending[value]
              console.warn(err)
            })
        },
        imageHref(value) {
          value = String(value || '')
          if (/^[A-Za-z0-9+/=]+$/.test(value.slice(0, 160)) && value.length > 120) {
            return 'data:image/svg+xml;base64,' + value
          }
          return value
        },
        absoluteImageHref(value) {
          value = this.imageHref(value)
          if (!value || value.indexOf('data:image/') === 0 || value.indexOf('http') === 0 || value.indexOf('blob:') === 0) {
            return value
          }
          try {
            if (typeof document !== 'undefined' && document.baseURI) {
              return new URL(value, document.baseURI).href
            }
            if (typeof window !== 'undefined' && window.location && window.location.href) {
              return new URL(value, window.location.href).href
            }
          } catch (err) {
            return value
          }
          return value
        },
        svgTextFromDataUri(value) {
          value = String(value || '')
          if (value.indexOf('data:image/svg+xml') !== 0) {
            return ''
          }
          let commaIndex = value.indexOf(',')
          if (commaIndex < 0) {
            return ''
          }
          let meta = value.slice(0, commaIndex)
          let body = value.slice(commaIndex + 1)
          try {
            if (meta.indexOf(';base64') > -1 && typeof atob !== 'undefined') {
              return atob(body)
            }
            return decodeURIComponent(body)
          } catch (err) {
            console.warn(err)
            return ''
          }
        },
        wardrobePalette(outfit, gender, ageStage, role) {
          let palettes = {
            senatorToga: { base: '#f6efe3', shade: '#d7cab6', highlight: '#fffaf0', accent: '#8b1f35' },
            togaPraetexta: { base: '#f4ead9', shade: '#d2c1a8', highlight: '#fff8eb', accent: '#7b2140' },
            togaCandida: { base: '#fff9ee', shade: '#e4d7c2', highlight: '#ffffff', accent: '#c7b38e' },
            whiteToga: { base: '#f5eadb', shade: '#d8c9b2', highlight: '#fffaf2', accent: '#b99964' },
            citizenToga: { base: '#e7d8bf', shade: '#c3a879', highlight: '#f4ead8', accent: '#a57937' },
            equestrianTunic: { base: '#efe1cb', shade: '#c7a66f', highlight: '#f8eddb', accent: '#263f73' },
            mantle: { base: '#c3924a', shade: '#8b5d2f', highlight: '#d8af62', accent: '#6b3f24' },
            simpleTunic: { base: '#d0b17b', shade: '#9b7243', highlight: '#dfc58f', accent: '#6e4d30' },
            workerTunic: { base: '#a47a4b', shade: '#6e472c', highlight: '#bc9061', accent: '#4f2e1f' },
            brownMantle: { base: '#7e5736', shade: '#553420', highlight: '#9b7048', accent: '#3f2a1f' },
            militaryCloak: { base: '#9f2525', shade: '#68191b', highlight: '#bd4938', accent: '#d6aa3c' },
            armoredTunic: { base: '#9fa3a2', shade: '#6d7173', highlight: '#d2d0c9', accent: '#8f7c59' },
            redMantle: { base: '#a62624', shade: '#65161a', highlight: '#c74d3b', accent: '#cfa35b' },
            stola: { base: '#d9bf87', shade: '#aa7f4d', highlight: '#ead3a0', accent: '#8f5f35' },
            whiteStola: { base: '#f3ead8', shade: '#d4c3a7', highlight: '#fff8ec', accent: '#b99359' },
            palla: { base: '#bd8d4b', shade: '#86562f', highlight: '#d4aa67', accent: '#744d2b' },
            purplePalla: { base: '#6e345d', shade: '#3f1f3c', highlight: '#926f9f', accent: '#d6aa3c' },
            childStola: { base: '#dec58f', shade: '#b28a58', highlight: '#ead9ad', accent: '#9d7340' },
            childTunic: { base: '#d0b17b', shade: '#9b7243', highlight: '#dfc58f', accent: '#836038' }
          }
          if (ageStage === 'baby') {
            return { base: '#efe7d5', shade: '#d6c7aa', highlight: '#fff7e8', accent: '#b9945d' }
          }
          return palettes[outfit] || (role === 'senatorial' ? palettes.senatorToga : role === 'worker' ? palettes.workerTunic : palettes.citizenToga)
        },
        recolorWardrobeSvgText(svg, outfit, gender, ageStage, role) {
          let palette = this.wardrobePalette(outfit, gender, ageStage, role)
          let viewBox = this.svgViewBoxSize(svg)
          let protectedSkinColors = this.svgProtectedSkinColors(svg, viewBox)
          Object.assign(protectedSkinColors, this.svgProtectedIdentityColors(svg, viewBox))
          let colorMap = {}
          let elementIndex = 0
          return String(svg || '').replace(/<(path|rect|ellipse|circle|polygon|polyline|line)\b[^>]*(?:fill|stroke)="#[0-9a-fA-F]{3,6}"[^>]*>/g, (tag) => {
            let bounds = this.svgPaintElementBounds(tag)
            if (!this.isWardrobePaintRegion(bounds, viewBox)) {
              return tag
            }
            return this.recolorWardrobePaintTag(tag, bounds, viewBox, palette, colorMap, elementIndex++, protectedSkinColors)
          })
        },
        recolorWardrobePaintTag(tag, bounds, viewBox, palette, colorMap, elementIndex, protectedSkinColors) {
          return String(tag || '').replace(/\b(fill|stroke)="(#[0-9a-fA-F]{3,6})"/g, (match, attr, color) => {
            if (color.toLowerCase() === '#000' || color.toLowerCase() === '#000000') {
              return match
            }
            if (attr === 'fill' && this.isProtectedSkinPaintColor(color, protectedSkinColors)) {
              return match
            }
            if (this.isProtectedAdornmentPaintColor(color, bounds, viewBox, attr)) {
              return match
            }
            let key = attr + ':' + color.toLowerCase()
            if (!colorMap[key]) {
              colorMap[key] = this.wardrobePaintReplacement(color, palette, attr === 'stroke', elementIndex)
            }
            return attr + '="' + colorMap[key] + '"'
          })
        },
        svgViewBoxSize(svg) {
          let match = String(svg || '').match(/viewBox="([^"]+)"/i)
          if (!match) {
            return { width: 512, height: 512 }
          }
          let nums = this.numberList(match[1])
          return {
            x: nums[0] || 0,
            y: nums[1] || 0,
            width: nums[2] || 512,
            height: nums[3] || 512
          }
        },
        svgPaintElementBounds(tag) {
          tag = String(tag || '')
          let values = []
          let element = (tag.match(/^<([a-zA-Z]+)/) || [])[1]
          if (element === 'rect') {
            let x = this.svgAttributeNumber(tag, 'x', 0)
            let y = this.svgAttributeNumber(tag, 'y', 0)
            let width = this.svgAttributeNumber(tag, 'width', 0)
            let height = this.svgAttributeNumber(tag, 'height', 0)
            return this.svgBoundsFromPoints([[x, y], [x + width, y + height]])
          }
          if (element === 'circle') {
            let cx = this.svgAttributeNumber(tag, 'cx', 0)
            let cy = this.svgAttributeNumber(tag, 'cy', 0)
            let r = this.svgAttributeNumber(tag, 'r', 0)
            return this.svgBoundsFromPoints([[cx - r, cy - r], [cx + r, cy + r], [cx, cy]])
          }
          if (element === 'ellipse') {
            let cx = this.svgAttributeNumber(tag, 'cx', 0)
            let cy = this.svgAttributeNumber(tag, 'cy', 0)
            let rx = this.svgAttributeNumber(tag, 'rx', 0)
            let ry = this.svgAttributeNumber(tag, 'ry', 0)
            return this.svgBoundsFromPoints([[cx - rx, cy - ry], [cx + rx, cy + ry], [cx, cy]])
          }
          if (element === 'line') {
            return this.svgBoundsFromPoints([
              [this.svgAttributeNumber(tag, 'x1', 0), this.svgAttributeNumber(tag, 'y1', 0)],
              [this.svgAttributeNumber(tag, 'x2', 0), this.svgAttributeNumber(tag, 'y2', 0)]
            ])
          }
          if (element === 'polygon' || element === 'polyline') {
            let points = (tag.match(/\spoints="([^"]+)"/i) || [])[1]
            let nums = this.numberList(points)
            let pairs = []
            for (let i = 0; i + 1 < nums.length; i += 2) {
              pairs.push([nums[i], nums[i + 1]])
            }
            return this.svgBoundsFromPoints(pairs)
          }
          let d = tag.match(/\sd="([^"]+)"/i)
          if (d) {
            let pathBounds = this.svgPathBounds(d[1])
            if (pathBounds) {
              return pathBounds
            }
            values = this.numberList(d[1])
          } else {
            values = this.numberList(tag)
          }
          let ys = []
          let xs = []
          for (let i = 0; i + 1 < values.length; i += 2) {
            if (isFinite(values[i]) && isFinite(values[i + 1])) {
              xs.push(values[i])
              ys.push(values[i + 1])
            }
          }
          return this.svgBoundsFromPoints(xs.map((x, index) => [x, ys[index]]))
        },
        svgPathBounds(pathData) {
          let tokens = String(pathData || '').match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []
          let index = 0
          let command = ''
          let x = 0
          let y = 0
          let startX = 0
          let startY = 0
          let xs = []
          let ys = []
          let hasNumber = () => index < tokens.length && !/^[a-zA-Z]$/.test(tokens[index])
          let nextNumber = () => parseFloat(tokens[index++])
          let addPoint = (px, py) => {
            if (!isFinite(px) || !isFinite(py)) {
              return
            }
            x = px
            y = py
            xs.push(px)
            ys.push(py)
          }
          let safety = 0
          while (index < tokens.length && safety < 10000) {
            safety += 1
            let previousIndex = index
            if (/^[a-zA-Z]$/.test(tokens[index])) {
              command = tokens[index++]
            }
            if (!command) {
              break
            }
            let relative = command === command.toLowerCase()
            let cmd = command.toUpperCase()
            if (cmd === 'Z') {
              addPoint(startX, startY)
              command = ''
              continue
            }
            if (cmd === 'M' || cmd === 'L' || cmd === 'T') {
              while (hasNumber()) {
                let nx = nextNumber()
                if (!hasNumber()) break
                let ny = nextNumber()
                nx = relative ? x + nx : nx
                ny = relative ? y + ny : ny
                addPoint(nx, ny)
                if (cmd === 'M') {
                  startX = x
                  startY = y
                  cmd = 'L'
                  command = relative ? 'l' : 'L'
                }
              }
            } else if (cmd === 'H') {
              while (hasNumber()) {
                let nx = nextNumber()
                addPoint(relative ? x + nx : nx, y)
              }
            } else if (cmd === 'V') {
              while (hasNumber()) {
                let ny = nextNumber()
                addPoint(x, relative ? y + ny : ny)
              }
            } else if (cmd === 'C') {
              while (hasNumber()) {
                let baseX = x
                let baseY = y
                let lastX = x
                let lastY = y
                for (let pair = 0; pair < 3; pair += 1) {
                  if (!hasNumber()) break
                  let nx = nextNumber()
                  if (!hasNumber()) break
                  let ny = nextNumber()
                  nx = relative ? baseX + nx : nx
                  ny = relative ? baseY + ny : ny
                  if (isFinite(nx) && isFinite(ny)) {
                    xs.push(nx)
                    ys.push(ny)
                    lastX = nx
                    lastY = ny
                  }
                }
                x = lastX
                y = lastY
              }
            } else if (cmd === 'S' || cmd === 'Q') {
              while (hasNumber()) {
                let baseX = x
                let baseY = y
                let lastX = x
                let lastY = y
                for (let pair = 0; pair < 2; pair += 1) {
                  if (!hasNumber()) break
                  let nx = nextNumber()
                  if (!hasNumber()) break
                  let ny = nextNumber()
                  nx = relative ? baseX + nx : nx
                  ny = relative ? baseY + ny : ny
                  if (isFinite(nx) && isFinite(ny)) {
                    xs.push(nx)
                    ys.push(ny)
                    lastX = nx
                    lastY = ny
                  }
                }
                x = lastX
                y = lastY
              }
            } else if (cmd === 'A') {
              while (hasNumber()) {
                if (index + 6 >= tokens.length) {
                  break
                }
                index += 5
                let nx = nextNumber()
                let ny = nextNumber()
                nx = relative ? x + nx : nx
                ny = relative ? y + ny : ny
                addPoint(nx, ny)
              }
            } else {
              while (hasNumber()) {
                index += 1
              }
            }
            if (index === previousIndex) {
              index += 1
            }
          }
          if (!ys.length) {
            return false
          }
          return this.svgBoundsFromPoints(xs.map((px, pointIndex) => [px, ys[pointIndex]]))
        },
        isWardrobePaintRegion(bounds, viewBox) {
          if (!bounds) {
            return false
          }
          if (!this.isVisibleSvgPaintRegion(bounds, viewBox)) {
            return false
          }
          let top = (viewBox && viewBox.y) || 0
          let height = (viewBox && viewBox.height) || 512
          if (bounds.pointCount <= 1) {
            return bounds.maxY >= top + height * 0.62
          }
          return bounds.maxY >= top + height * 0.66 && (bounds.avgY >= top + height * 0.54 || bounds.firstY >= top + height * 0.54 || bounds.minY >= top + height * 0.50)
        },
        svgProtectedSkinColors(svg, viewBox) {
          let protectedColors = {}
          String(svg || '').replace(/<(path|rect|ellipse|circle|polygon|polyline|line)\b[^>]*\bfill="#[0-9a-fA-F]{3,6}"[^>]*>/g, (tag) => {
            let bounds = this.svgPaintElementBounds(tag)
            if (!this.isVisibleSvgPaintRegion(bounds, viewBox)) {
              return tag
            }
            let fill = (tag.match(/\bfill="(#[0-9a-fA-F]{3,6})"/i) || [])[1]
            if (fill && this.isSkinPaintSample(bounds, viewBox, fill)) {
              protectedColors[fill.toLowerCase()] = true
            }
            return tag
          })
          return protectedColors
        },
        svgProtectedIdentityColors(svg, viewBox) {
          let protectedColors = {}
          String(svg || '').replace(/<(path|rect|ellipse|circle|polygon|polyline|line)\b[^>]*\bfill="#[0-9a-fA-F]{3,6}"[^>]*>/g, (tag) => {
            let bounds = this.svgPaintElementBounds(tag)
            if (!this.isVisibleSvgPaintRegion(bounds, viewBox)) {
              return tag
            }
            let fill = (tag.match(/\bfill="(#[0-9a-fA-F]{3,6})"/i) || [])[1]
            if (fill && this.isUpperIdentityPaintSample(bounds, viewBox, fill)) {
              protectedColors[fill.toLowerCase()] = true
            }
            return tag
          })
          return protectedColors
        },
        isUpperIdentityPaintSample(bounds, viewBox, color) {
          if (!bounds || !color) {
            return false
          }
          let top = (viewBox && viewBox.y) || 0
          let height = (viewBox && viewBox.height) || 512
          let upperRegion = bounds.minY <= top + height * 0.58 && bounds.avgY <= top + height * 0.62
          if (!upperRegion) {
            return false
          }
          return this.isLikelyHairPaintColor(color, bounds, viewBox)
        },
        isLikelyHairPaintColor(color, bounds, viewBox) {
          color = String(color || '').toLowerCase()
          if (!color || this.isKnownVanillaSkinPaintColor(color) || this.isLikelySkinPaintColor(color)) {
            return false
          }
          let rgb = this.hexToRgb(color)
          if (!rgb) {
            return false
          }
          let r = rgb.r / 255
          let g = rgb.g / 255
          let b = rgb.b / 255
          let max = Math.max(r, g, b)
          let min = Math.min(r, g, b)
          let delta = max - min
          let hue = 0
          if (delta > 0) {
            if (max === r) hue = ((g - b) / delta) % 6
            else if (max === g) hue = (b - r) / delta + 2
            else hue = (r - g) / delta + 4
            hue *= 60
            if (hue < 0) hue += 360
          }
          let saturation = max === 0 ? 0 : delta / max
          let luminance = this.colorLuminance(color)
          let top = (viewBox && viewBox.y) || 0
          let height = (viewBox && viewBox.height) || 512
          let touchesHead = bounds.minY <= top + height * 0.40
          if (luminance <= 0.26 && saturation <= 0.80) return true
          if (hue >= 12 && hue <= 48 && saturation >= 0.18 && saturation <= 0.90 && luminance >= 0.08 && luminance <= 0.58) return true
          if (hue >= 38 && hue <= 62 && saturation >= 0.16 && saturation <= 0.72 && luminance >= 0.42 && luminance <= 0.82 && touchesHead) return true
          if (saturation <= 0.18 && luminance >= 0.20 && luminance <= 0.78 && touchesHead) return true
          return false
        },
        isSkinPaintSample(bounds, viewBox, color) {
          if (!bounds || !this.isPossibleHumanSkinPaintColor(color)) {
            return false
          }
          let top = (viewBox && viewBox.y) || 0
          let height = (viewBox && viewBox.height) || 512
          return bounds.maxY >= top + height * 0.18 &&
            bounds.minY <= top + height * 0.76 &&
            bounds.avgY >= top + height * 0.14 &&
            bounds.avgY <= top + height * 0.74
        },
        isVisibleSvgPaintRegion(bounds, viewBox) {
          if (!bounds) {
            return false
          }
          let left = (viewBox && viewBox.x) || 0
          let top = (viewBox && viewBox.y) || 0
          let right = left + ((viewBox && viewBox.width) || 512)
          let bottom = top + ((viewBox && viewBox.height) || 512)
          return bounds.maxY >= top &&
            bounds.minY <= bottom &&
            (bounds.maxX === undefined || bounds.maxX >= left) &&
            (bounds.minX === undefined || bounds.minX <= right)
        },
        svgAttributeNumber(tag, name, fallback) {
          let match = String(tag || '').match(new RegExp('\\b' + name + '="([^"]+)"', 'i'))
          if (!match) {
            return fallback
          }
          let value = parseFloat(match[1])
          return isFinite(value) ? value : fallback
        },
        svgBoundsFromPoints(points) {
          points = (points || []).filter((point) => point && isFinite(point[0]) && isFinite(point[1]))
          if (!points.length) {
            return false
          }
          let xs = points.map((point) => point[0])
          let ys = points.map((point) => point[1])
          let sumX = xs.reduce((sum, value) => sum + value, 0)
          let sumY = ys.reduce((sum, value) => sum + value, 0)
          return {
            minX: Math.min.apply(Math, xs),
            maxX: Math.max.apply(Math, xs),
            avgX: sumX / xs.length,
            firstX: xs[0],
            minY: Math.min.apply(Math, ys),
            maxY: Math.max.apply(Math, ys),
            avgY: sumY / ys.length,
            firstY: ys[0],
            width: Math.max.apply(Math, xs) - Math.min.apply(Math, xs),
            height: Math.max.apply(Math, ys) - Math.min.apply(Math, ys),
            area: (Math.max.apply(Math, xs) - Math.min.apply(Math, xs)) * (Math.max.apply(Math, ys) - Math.min.apply(Math, ys)),
            pointCount: ys.length
          }
        },
        wardrobePaintReplacement(color, palette, isStroke, elementIndex) {
          if (isStroke) {
            return palette.accent || palette.shade || palette.base
          }
          let luminance = this.colorLuminance(color)
          if (luminance >= 0.78) {
            return palette.highlight || palette.base
          }
          if (luminance >= 0.56) {
            return elementIndex % 3 === 0 ? (palette.highlight || palette.base) : palette.base
          }
          if (luminance <= 0.28) {
            return palette.shade || palette.base
          }
          return elementIndex % 2 === 0 ? palette.base : (palette.shade || palette.base)
        },
        isProtectedAdornmentPaintColor(color, bounds, viewBox, attr) {
          color = String(color || '').toLowerCase()
          if (!bounds || !this.isVisibleSvgPaintRegion(bounds, viewBox)) {
            return false
          }
          let width = Math.abs(bounds.width || ((bounds.maxX || 0) - (bounds.minX || 0)))
          let height = Math.abs(bounds.height || ((bounds.maxY || 0) - (bounds.minY || 0)))
          let viewWidth = Math.max(1, (viewBox && viewBox.width) || 512)
          let viewHeight = Math.max(1, (viewBox && viewBox.height) || 512)
          let relativeArea = Math.max(0, width * height) / Math.max(1, viewWidth * viewHeight)
          let small = (width <= viewWidth * 0.18 && height <= viewHeight * 0.18) || relativeArea <= 0.018
          let trim = (width <= viewWidth * 0.45 && height <= viewHeight * 0.09) || (width <= viewWidth * 0.12 && height <= viewHeight * 0.38)
          let tinyDetail = (width <= viewWidth * 0.14 && height <= viewHeight * 0.14) || relativeArea <= 0.010
          let mediumAdornment = width <= viewWidth * 0.36 && height <= viewHeight * 0.28 && relativeArea <= 0.055
          let brightGold = {
            '#f8a814': true,
            '#f8b53c': true,
            '#f9cd45': true,
            '#c98441': true,
            '#e5aa17': true,
            '#db9d12': true,
            '#ffb000': true,
            '#efac06': true,
            '#f7b93e': true,
            '#e0a632': true,
            '#eac734': true,
            '#d6aa3c': true,
            '#c9a24a': true,
            '#c99a3c': true
          }
          let darkGoldDetail = {
            '#aa6b07': true,
            '#825308': true,
            '#4c350c': true,
            '#9e793c': true,
            '#c6943c': true,
            '#cc902f': true
          }
          let metalDetail = {
            '#7f8585': true,
            '#8f7c59': true,
            '#8e9293': true,
            '#979797': true,
            '#b8a072': true,
            '#c7bda7': true,
            '#d0d5d5': true,
            '#d6d2c7': true
          }
          if (brightGold[color]) {
            return small || trim || mediumAdornment
          }
          if (darkGoldDetail[color]) {
            return small || trim
          }
          if (metalDetail[color]) {
            return small || trim
          }
          let rgb = this.hexToRgb(color)
          if (!rgb) {
            return false
          }
          let r = rgb.r / 255
          let g = rgb.g / 255
          let b = rgb.b / 255
          let max = Math.max(r, g, b)
          let min = Math.min(r, g, b)
          let delta = max - min
          let hue = 0
          if (delta > 0) {
            if (max === r) {
              hue = ((g - b) / delta) % 6
            } else if (max === g) {
              hue = (b - r) / delta + 2
            } else {
              hue = (r - g) / delta + 4
            }
            hue *= 60
            if (hue < 0) {
              hue += 360
            }
          }
          let saturation = max === 0 ? 0 : delta / max
          let luminance = this.colorLuminance(color)
          let goldHue = hue >= 28 && hue <= 58 && saturation >= 0.48 && luminance >= 0.32 && luminance <= 0.86
          let bronzeHue = hue >= 18 && hue <= 45 && saturation >= 0.40 && luminance >= 0.24 && luminance <= 0.62
          let gemHue = saturation >= 0.45 &&
            luminance >= 0.18 &&
            luminance <= 0.72 &&
            ((hue >= 190 && hue <= 265) || (hue >= 280 && hue <= 345) || hue <= 15 || (hue >= 95 && hue <= 170))
          let metalHue = saturation <= 0.14 && luminance >= 0.38 && luminance <= 0.86
          if (goldHue && (tinyDetail || trim)) {
            return true
          }
          if (bronzeHue && tinyDetail) {
            return true
          }
          if ((gemHue || metalHue) && (tinyDetail || trim)) {
            return true
          }
          return false
        },
        isProtectedSkinPaintColor(color, protectedSkinColors) {
          color = String(color || '').toLowerCase()
          return !!(protectedSkinColors && protectedSkinColors[color]) || this.isKnownVanillaSkinPaintColor(color) || this.isLikelySkinPaintColor(color)
        },
        isKnownVanillaSkinPaintColor(color) {
          let known = {
            '#f0bca6': true,
            '#e6b09a': true,
            '#e2a58a': true,
            '#bc8e79': true,
            '#b38978': true,
            '#b28776': true,
            '#b18675': true,
            '#bc8169': true,
            '#c9a594': true,
            '#c6a89c': true,
            '#c1a194': true,
            '#c3a397': true,
            '#cbad9e': true,
            '#b38b7b': true,
            '#b09685': true,
            '#ae9484': true,
            '#675f5b': true,
            '#655f5b': true,
            '#897f79': true,
            '#867878': true,
            '#7c736e': true,
            '#756e6a': true,
            '#c2b4b4': true,
            '#b2a1a1': true
          }
          return !!known[String(color || '').toLowerCase()]
        },
        isLikelySkinPaintColor(color) {
          if (this.isKnownVanillaSkinPaintColor(color)) {
            return true
          }
          let rgb = this.hexToRgb(color)
          if (!rgb) {
            return false
          }
          let max = Math.max(rgb.r, rgb.g, rgb.b)
          let min = Math.min(rgb.r, rgb.g, rgb.b)
          let luminance = (max + min) / 510
          return rgb.r > rgb.g &&
            rgb.g >= rgb.b &&
            luminance > 0.40 &&
            luminance < 0.90 &&
            (rgb.r - rgb.b) > 18 &&
            (rgb.r - rgb.g) < 90 &&
            (rgb.g - rgb.b) < 72
        },
        isPossibleHumanSkinPaintColor(color) {
          if (this.isKnownVanillaSkinPaintColor(color)) {
            return true
          }
          let rgb = this.hexToRgb(color)
          if (!rgb) {
            return false
          }
          let max = Math.max(rgb.r, rgb.g, rgb.b)
          let min = Math.min(rgb.r, rgb.g, rgb.b)
          let chroma = max - min
          let luminance = this.colorLuminance(color)
          if (luminance < 0.30 || luminance > 0.92) {
            return false
          }
          if (rgb.r + 6 < rgb.g || rgb.g + 10 < rgb.b) {
            return false
          }
          if (rgb.r - rgb.b < 10) {
            return false
          }
          if (luminance < 0.45 && chroma > 60) {
            return false
          }
          if (chroma >= 90) {
            return false
          }
          if (rgb.r - rgb.g < 120 && rgb.g - rgb.b < 105) {
            return true
          }
          return luminance > 0.42 && chroma < 44 && rgb.r - rgb.b >= 10 && rgb.r >= rgb.g && rgb.g >= rgb.b
        },
        colorLuminance(color) {
          let rgbMatch = String(color || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
          let rgb = rgbMatch
            ? { r: parseInt(rgbMatch[1], 10), g: parseInt(rgbMatch[2], 10), b: parseInt(rgbMatch[3], 10) }
            : this.hexToRgb(color)
          if (!rgb) {
            return 0.5
          }
          return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
        },
        hexToRgb(color) {
          color = String(color || '').replace('#', '').trim()
          if (color.length === 3) {
            color = color.split('').map((part) => part + part).join('')
          }
          if (!/^[0-9a-fA-F]{6}$/.test(color)) {
            return false
          }
          return {
            r: parseInt(color.slice(0, 2), 16),
            g: parseInt(color.slice(2, 4), 16),
            b: parseInt(color.slice(4, 6), 16)
          }
        },
        numberList(text) {
          let matches = String(text || '').match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []
          return matches.map((value) => parseFloat(value)).filter((value) => isFinite(value))
        },
        replaceSvgColor(svg, from, to) {
          let escaped = String(from || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return String(svg || '').replace(new RegExp(escaped, 'gi'), to)
        },
        isImageData(value) {
          if (!value || typeof value !== 'string') {
            return false
          }
          if (
            value.indexOf('data:image/') === 0 ||
            value.indexOf('http') === 0 ||
            value.indexOf('blob:') === 0 ||
            value.indexOf('img/') === 0 ||
            value.indexOf('/img/') === 0 ||
            /\.(svg|png|jpg|jpeg|webp)(\?|#|$)/i.test(value)
          ) {
            return true
          }
          return value.length > 120 && /^[A-Za-z0-9+/=]+$/.test(value.slice(0, 160))
        },
        characterAgeStage(age) {
          if (age < 4) return 'baby'
          if (age < 16) return 'teen'
          if (age >= 55) return 'old'
          return 'adult'
        },
        characterPortraitRole(character, ageStage, stratum) {
          if (ageStage === 'baby') return 'baby'
          if (stratum === 'senatorial') return 'senatorial'
          if (stratum === 'equestrian') return 'equestrian'
          if (stratum === 'poor') return 'worker'
          let job = character.job || ''
          let traits = character.traits || []
          if (job === 'senator' || traits.indexOf('senator') >= 0 || traits.indexOf('formerPraetor') >= 0 || traits.indexOf('formerQuaestor') >= 0) return 'senatorial'
          if (['lawyer', 'rhetor', 'physician'].indexOf(job) >= 0) return 'learned'
          if (['trader'].indexOf(job) >= 0) return 'merchant'
          if (['soldier', 'gladiator'].indexOf(job) >= 0 || traits.indexOf('veteran') >= 0 || traits.indexOf('gladiator') >= 0) return 'martial'
          if (job === 'labourer') return 'worker'
          return 'citizen'
        },
        clothingOptions(gender, ageStage, role, stratum) {
          if (ageStage === 'teen') return gender === 'female' ? ['childStola', 'palla', 'simpleTunic'] : ['childTunic', 'simpleTunic', 'mantle']
          if (stratum === 'senatorial') return gender === 'female' ? ['palla', 'purplePalla', 'whiteStola'] : ['senatorToga', 'togaPraetexta', 'togaCandida']
          if (stratum === 'equestrian') return ['equestrianTunic', 'mantle', 'citizenToga']
          if (stratum === 'poor') return ['workerTunic', 'brownMantle', 'simpleTunic']
          if (stratum === 'freedmen') return ['simpleTunic', 'brownMantle', 'mantle']
          if (role === 'senatorial') return ['senatorToga', 'togaPraetexta', 'togaCandida']
          if (role === 'equestrian') return ['equestrianTunic', 'mantle', 'citizenToga']
          if (role === 'martial') return ['militaryCloak', 'armoredTunic', 'redMantle']
          if (role === 'merchant') return ['mantle', 'equestrianTunic', 'simpleTunic']
          if (role === 'worker') return ['workerTunic', 'simpleTunic', 'brownMantle']
          if (gender === 'female') return ['stola', 'palla', 'whiteStola', 'purplePalla']
          return ['citizenToga', 'mantle', 'simpleTunic', 'whiteToga']
        },
        pickByRandom(list, random) {
          return list[Math.floor(random() * list.length) % list.length]
        },
        houseMemberGroups(house, state) {
          let groups = {
            notable: [],
            established: [],
            common: [],
            slaves: []
          }
          let ids = this.visibleHousePeople(house, state)
            .filter((characterId, index, list) => list.indexOf(characterId) === index && state.characters[characterId])
            .sort((a, b) => this.characterScore(state.characters[b], state) - this.characterScore(state.characters[a], state))
          ids.forEach((characterId, index) => {
            let character = state.characters[characterId]
            character.id = character.id || characterId
            groups[this.memberCategoryFor(character, state, house, index)].push(characterId)
          })
          if (!groups.notable.length && ids.length) {
            let source = groups.established.length ? groups.established : groups.common
            if (source.length) {
              groups.notable.push(source.shift())
            }
          }
          return groups
        },
        memberCategoryFor(character, state, house, index) {
          if (character && (character.corSocietySlave || character.corSocietySlaveMarket || character.corSocietyOrigin === 'enslaved_dependant' || (house && house.stratum === 'poor'))) {
            return 'slaves'
          }
          let age = this.age(character, state)
          let traits = character.traits || []
          let score = this.characterScore(character, state)
          let jobLevel = parseFloat(character.jobLevel || 0)
          let notableTraits = ['senator', 'formerQuaestor', 'formerPraetor', 'formerConsul', 'erudite', 'oratorDeliberative', 'oratorJudicial', 'authoritative', 'ambitious']
          if (
            index === 0 ||
            this.isSenatorialCharacter(character, state) ||
            score >= 65 ||
            jobLevel >= 6 ||
            notableTraits.some((trait) => traits.indexOf(trait) >= 0)
          ) {
            return 'notable'
          }
          if (
            age >= 16 &&
            (score >= 25 || character.job || jobLevel >= 2 || character.spouseId || (character.childrenIds || []).length)
          ) {
            return 'established'
          }
          return 'common'
        },
        memberGroupLabel(group) {
          if (group === 'notable') return 'Notables'
          if (group === 'established') return 'Established members'
          if (group === 'slaves') return 'Enslaved dependants'
          return 'Common kin'
        },
        memberGroupDescription(group) {
          if (group === 'notable') return 'Heads, senators, office-holders, patrons, and high-skill public figures.'
          if (group === 'established') return 'Adult relatives with work, marriage ties, property weight, or household standing.'
          if (group === 'slaves') return 'Real generated household slaves and poor dependants attached to this house. They can work, age, die, be freed, or affect household fortunes.'
          return 'Children, young dependants, laboring relatives, and low-profile members of the dynasty.'
        },
        memberGroupIcon(group) {
          if (group === 'notable') return this.affairIcon('prestige')
          if (group === 'established') return this.affairIcon('support')
          if (group === 'slaves') return this.slaveTypeIcon('manager')
          return this.affairIcon('familyTree')
        },
        vanillaCharacterActions(character) {
          let actions = { ...((character && character.actions) || {}) }
          this.bundledCharacterActions(character).forEach((item) => {
            if (item && item.key && item.action && !actions[item.key]) {
              actions[item.key] = item.action
            }
          })
          return Object.keys(actions).map((key) => {
            return { key, action: actions[key] }
          }).filter((item) => item.action && typeof item.action === 'object' && !item.action.hideInCharacterActions)
        },
        bundledCharacterActions(character) {
          let state = daapi.getState()
          let currentId = state && state.current && state.current.id
          let characterId = character && character.id
          if (!character || !characterId) {
            return []
          }
          let items = []
          let isCurrent = characterId === currentId
          let age = this.age(character, state)
          if (!isCurrent && !character.isDead) {
            items.push({
              key: 'play_as',
              action: {
                title: 'Play As',
                icon: daapi.requireImage('/cor_society/bundled/play_as/switch.svg'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: '/cor_society/bundled/play_as/main',
                  method: 'process',
                  context: { characterId }
                }
              }
            })
          }
          let currentPlotTarget = currentId ? this.safeCharacterFlag(currentId, 'mod_murder_startedPlotOnTarget') : false
          if (!isCurrent && !character.isDead && age > 15 && !currentPlotTarget && !this.safeCharacterFlag(characterId, 'mod_murder_plotTarget')) {
            items.push({
              key: 'mod_murder_startPlot',
              action: {
                title: 'Attempt Murder',
                icon: daapi.requireImage('/cor_society/bundled/murder/plot.svg'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: '/cor_society/bundled/murder/main',
                  method: 'process',
                  context: { characterId }
                }
              }
            })
          }
          if (!isCurrent && !character.isDead) {
            let society = this.load()
            this.normalizeDynastyHouseModel(society, state)
            let stealInfo = this.stealingFromInfo(society, state, character)
            items.push({
              key: 'cor_society_stealing_from',
              action: {
                title: 'Steal from household',
                tooltip: stealInfo.tooltip,
                icon: daapi.requireImage('/cor_society/bundled/stealingFrom/animalPen.svg'),
                isAvailable: stealInfo.available,
                hideWhenBusy: false,
                process: {
                  event: this.event,
                  method: 'startStealingFromCharacter',
                  context: { characterId, houseId: stealInfo.houseId }
                }
              }
            })
          }
          if (isCurrent && currentPlotTarget) {
            items.push({
              key: 'mod_murder_cancelPlot',
              action: {
                title: 'Stop Plotting Murder',
                icon: daapi.requireImage('/cor_society/bundled/murder/cancelPlot.svg'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: '/cor_society/bundled/murder/main',
                  method: 'cancelPlot'
                }
              }
            })
          }
          let householdIds = (state && state.current && state.current.householdCharacterIds) || []
          let isHousehold = householdIds.indexOf(characterId) >= 0
          if (isHousehold && !isCurrent && !character.isDead && !character.flagWasGivenInheritance) {
            items.push({
              key: 'Disinherit',
              action: {
                title: 'Disinherit',
                icon: daapi.requireImage('/cor_society/bundled/disinheritance/icon.svg'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: '/cor_society/bundled/disinheritance/main',
                  method: 'process',
                  context: { characterId }
                }
              }
            })
          }
          if (isHousehold && !isCurrent && !character.isDead && character.flagWasGivenInheritance) {
            items.push({
              key: 'RestoreInheritance',
              action: {
                title: 'Restore Inheritance',
                icon: daapi.requireImage('/cor_society/bundled/restoreInheritance/icon.svg'),
                isAvailable: true,
                hideWhenBusy: false,
                process: {
                  event: '/cor_society/bundled/restoreInheritance/main',
                  method: 'process',
                  context: { characterId }
                }
              }
            })
          }
          return items
        },
        stealingCooldownKey(firstId, secondId) {
          return 'steal_' + this.relationKey(firstId, secondId)
        },
        stealingFromInfo(society, state, target) {
          let currentId = this.currentCharacterId(state)
          let current = state.characters && state.characters[currentId]
          let targetId = target && target.id
          let houseId = target ? this.houseIdForCharacter(target, state, society) : ''
          let house = society.houses && society.houses[houseId]
          let reason = ''
          if (!current || !target || !targetId) reason = 'missing character'
          else if (this.age(current, state) < 16) reason = 'too young'
          else if (this.sameCharacterId(currentId, targetId)) reason = 'same character'
          else if (target.isDead) reason = 'dead'
          else if (!house) reason = 'no target house'
          else if (target.corSocietySlave || target.corSocietySlaveActive) reason = 'target enslaved'
          else if (current.dynastyId && target.dynastyId && String(current.dynastyId) === String(target.dynastyId)) reason = 'same dynasty'
          let cooldown = society.pendingSteals && society.pendingSteals[this.stealingCooldownKey(currentId, targetId)]
          if (!reason && cooldown && !this.monthKeyReached(cooldown, state)) {
            reason = 'cooldown until ' + cooldown
          }
          let loot = house ? this.stealingLootEstimate(house, target, state) : { label: 'small goods', value: 0 }
          return {
            available: !reason,
            reason,
            houseId,
            loot,
            tooltip: [
              'Attempt to steal from this character\'s household.',
              house ? 'Target house: ' + house.name + '.' : '',
              'Possible gain: ' + loot.label + ', about ' + loot.value + ' cash value.',
              'If caught: personal relation, house relation, prestige, and influence suffer.',
              reason ? 'Unavailable: ' + reason + '.' : 'Success depends on stealth, stewardship, combat, target house power, and chosen approach.'
            ].filter(Boolean).join('\n')
          }
        },
        stealingLootEstimate(house, target, state) {
          let property = (house && house.ai && house.ai.property) || {}
          let score = Math.max(1, Math.round(this.characterScore(target || {}, state) / 12))
          if ((property.animals || 0) > 0) return { label: 'livestock and tack', value: Math.max(12, Math.round((property.animals || 1) * 18 + score * 4)) }
          if ((property.trade || 0) > 0) return { label: 'trade goods', value: Math.max(18, Math.round((property.trade || 1) * 45 + score * 5)) }
          if ((property.land || 0) > 0) return { label: 'estate stores', value: Math.max(15, Math.round((property.land || 1) * 28 + score * 4)) }
          return { label: 'portable valuables', value: Math.max(8, Math.round((house.wealth || 20) / 20 + score * 4)) }
        },
        startStealingFromCharacter({ houseId, characterId } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let character = state.characters && state.characters[characterId]
          if (character) character.id = character.id || characterId
          let info = this.stealingFromInfo(society, state, character)
          let house = society.houses[houseId || info.houseId]
          if (!info.available || !house) {
            this.pushModal({
              societyMenu: true,
              title: 'Steal unavailable',
              message: info.tooltip || 'This target is not available.',
              image: this.bundledIcon('stealingFrom', 'animalPen'),
              options: [{ text: 'Back', action: { event: this.event, method: 'openPerson', context: { houseId: houseId || info.houseId, characterId } } }]
            })
            return
          }
          this.pushModal({
            societyMenu: true,
            title: 'Steal from ' + house.name + '?',
            message: 'Target: ' + this.characterName(character, state) + '\nPossible gain: ' + info.loot.label + ' worth about ' + info.loot.value + ' cash.\nIf you are caught, both the person and the house will remember it.',
            image: this.bundledIcon('stealingFrom', 'animalPen'),
            options: [
              {
                variant: 'info',
                text: 'Sneak into stores',
                tooltip: 'Balanced risk. Better with stewardship and a quiet target house.',
                icons: [this.affairIcon('trade')],
                action: { event: this.event, method: 'resolveStealingFromCharacter', context: { houseId: house.id, characterId, approach: 'stores' } }
              },
              {
                variant: 'info',
                text: 'Take livestock',
                tooltip: 'Higher gain if the house has animals, but easier to notice.',
                icons: [this.bundledIcon('stealingFrom', 'animalPen')],
                action: { event: this.event, method: 'resolveStealingFromCharacter', context: { houseId: house.id, characterId, approach: 'livestock' } }
              },
              {
                variant: 'info',
                text: 'Bribe a worker',
                tooltip: 'Lower gain, lower risk, small cash preparation cost.',
                icons: [this.affairIcon('coins')],
                action: { event: this.event, method: 'resolveStealingFromCharacter', context: { houseId: house.id, characterId, approach: 'bribe' } }
              },
              {
                text: 'Leave it',
                action: { event: this.event, method: 'openPerson', context: { houseId: house.id, characterId } }
              }
            ]
          })
        },
        resolveStealingFromCharacter({ houseId, characterId, approach } = {}) {
          let society = this.ensure()
          let state = daapi.getState()
          let house = society.houses[houseId]
          let target = state.characters && state.characters[characterId]
          if (target) target.id = target.id || characterId
          let info = this.stealingFromInfo(society, state, target)
          if (!house || !info.available) {
            this.openPerson({ houseId, characterId })
            return
          }
          let currentId = this.currentCharacterId(state)
          let current = state.characters && state.characters[currentId]
          let skills = (current && current.skills) || {}
          let stealth = parseFloat(skills.stewardship || 0) + parseFloat(skills.combat || 0) * 0.6 + parseFloat(skills.intelligence || 0) * 0.4
          let difficulty = 28 + Math.max(0, house.power || 0) * 0.35 + Math.max(0, house.stability || 0) * 0.12
          let value = info.loot.value
          if (approach === 'livestock') {
            value = Math.round(value * 1.25)
            difficulty += 10
          } else if (approach === 'bribe') {
            value = Math.round(value * 0.70)
            difficulty -= 9
            this.applyStats({ cash: -Math.max(3, Math.round(value * 0.18)) })
          }
          let successChance = this.clamp(0.48 + (stealth - difficulty) / 120, 0.12, 0.82)
          let success = Math.random() < successChance
          society.pendingSteals[this.stealingCooldownKey(currentId, characterId)] = this.futureMonthKey(success ? 6 : 9)
          let caught = !success || Math.random() < (approach === 'livestock' ? 0.28 : approach === 'bribe' ? 0.12 : 0.20)
          if (success && !caught) {
            this.applyStats({ cash: value })
            house.wealth = Math.max(0, (house.wealth || 0) - Math.round(value * 0.45))
            this.log(society, 'You steal ' + info.loot.label + ' from ' + house.name + ' without being caught.', 'rivalry', house.id)
            this.save(society)
            this.pushModal({
              societyMenu: true,
              title: 'Theft succeeds',
              message: 'You get away with ' + info.loot.label + ' worth ' + value + ' cash. No one can prove it was you.',
              image: this.bundledIcon('stealingFrom', 'animalPen'),
              options: [{ text: 'Close' }]
            })
            return
          }
          let personalLoss = caught ? this.randomInt(18, 34) : this.randomInt(8, 16)
          let houseLoss = caught ? this.randomInt(14, 30) : this.randomInt(4, 10)
          house.relation = this.clamp((house.relation || 0) - houseLoss, -100, 100)
          house.heat = (house.heat || 0) + (caught ? 2 : 1)
          this.changePersonalRelation(society, currentId, characterId, -personalLoss, caught ? 'enemy' : 'resentful')
          let playerHouseId = this.currentCharacterDynastyId(state)
          if (playerHouseId && society.houses[playerHouseId]) {
            this.changeHouseRelation(society, playerHouseId, house.id, -Math.round(houseLoss / 2))
          }
          this.applyStats({ prestige: -Math.max(2, Math.round(houseLoss / 3)), influence: -Math.max(3, Math.round(houseLoss / 2)) })
          this.log(society, 'A theft against ' + house.name + ' is exposed; relations with ' + this.characterName(target, state) + ' worsen.', 'rivalry', house.id)
          this.save(society)
          this.pushModal({
            societyMenu: true,
            title: 'Caught stealing',
            message: 'The attempt is traced back to you.\nHouse relation: -' + houseLoss + '. Personal relation: -' + personalLoss + '. Prestige and influence fall.',
            image: this.bundledIcon('stealingFrom', 'wounded'),
            options: [
              { text: 'Back to person', action: { event: this.event, method: 'openPerson', context: { houseId: house.id, characterId } } },
              { text: 'Close' }
            ]
          })
        },
        safeCharacterFlag(characterId, flag) {
          try {
            return daapi.getCharacterFlag({ characterId, flag })
          } catch (err) {
            let state = daapi.getState()
            let character = state && state.characters && state.characters[characterId]
            return character && character.modFlags ? character.modFlags[flag] : false
          }
        },
        familyTreeRelatives(character, state) {
          let id = character && character.id
          let relatives = {
            children: [],
            siblings: []
          }
          let addUnique = (list, characterId) => {
            if (!characterId || list.indexOf(characterId) >= 0 || !state.characters[characterId]) {
              return
            }
            list.push(characterId)
          }
          ;(character.childrenIds || []).forEach((childId) => addUnique(relatives.children, childId))
          for (let characterId in state.characters) {
            if (!state.characters.hasOwnProperty(characterId)) {
              continue
            }
            let other = state.characters[characterId]
            if (!other || other.isDead) {
              continue
            }
            other.id = other.id || characterId
            if (this.sameCharacterId(other.fatherId, id) || this.sameCharacterId(other.motherId, id)) {
              addUnique(relatives.children, other.id)
            }
            if (!this.sameCharacterId(other.id, id) && (
              (character.fatherId && this.sameCharacterId(other.fatherId, character.fatherId)) ||
              (character.motherId && this.sameCharacterId(other.motherId, character.motherId))
            )) {
              addUnique(relatives.siblings, other.id)
            }
          }
          return relatives
        },
        sameCharacterId(first, second) {
          return first !== undefined && first !== null && second !== undefined && second !== null && String(first) === String(second)
        },
        characterLink(characterId, state) {
          if (!characterId || !state.characters[characterId]) {
            return 'none'
          }
          let character = state.characters[characterId]
          character.id = character.id || characterId
          return '[c|' + character.id + '|' + this.characterName(character, state) + ']'
        },
        houseIdForCharacter(character, state, society) {
          if (!character) {
            return ''
          }
          if (character.corSocietyHouseId && society.houses[character.corSocietyHouseId]) {
            return character.corSocietyHouseId
          }
          if (character.dynastyId && society.houses[character.dynastyId]) {
            return character.dynastyId
          }
          let dynastyId = character.dynastyId
          if (dynastyId) {
            let house = this.createHouseRecord(dynastyId)
            let dynasty = state.dynasties[dynastyId] || {}
            house.name = this.houseName(dynasty, dynastyId)
            house.stratum = this.classifyHouse(dynasty, [character], this.characterScore(character, state), this.isSenatorialCharacter(character, state))
            house.memberIds = [character.id]
            house.notableIds = [character.id]
            house.generated = false
            society.houses[dynastyId] = house
            this.refreshHouseMemberLists(society, state, house)
            this.save(society)
            return dynastyId
          }
          return ''
        },
        familyRelativeOption(label, characterId, state, society, fallbackHouseId, returnTo, returnPage) {
          let character = state.characters[characterId]
          character.id = character.id || characterId
          let houseId = this.houseIdForCharacter(character, state, society) || fallbackHouseId
          let house = society.houses[houseId] || society.houses[fallbackHouseId]
          return {
            text: label + ': ' + this.characterName(character, state),
            tooltip: this.characterTooltip(character, state),
            icons: [this.characterPortrait(character, state, house)],
            action: {
              event: this.event,
              method: 'openFamilyTree',
              context: { houseId, characterId: character.id, returnTo, returnPage, mode: 'full' }
            }
          }
        },
        visibleHousePeople(house, state) {
          let seen = {}
          let ids = []
          ;[(house && house.notableIds) || [], (house && house.memberIds) || []].forEach((list) => {
            list.forEach((characterId) => {
              if (seen[characterId]) {
                return
              }
              let character = state && state.characters ? state.characters[characterId] : false
              if (character && character.isDead) {
                return
              }
              seen[characterId] = true
              ids.push(characterId)
            })
          })
          return ids
        },
        housePortrait(house, state) {
          state = state || daapi.getState()
          let ids = this.visibleHousePeople(house, state)
          let character = ids.length ? (state.characters[ids[0]] || false) : false
          return character ? this.characterPortrait(character, state, house) : this.affairIcon('log')
        },
        startPlayerStatusOverlay() {
          if (this.playerStatusOverlayStarted) {
            this.applyPlayerStatusOverlay()
            this.applyPortraitOverlays()
            this.clearRelationBadges()
            return
          }
          this.playerStatusOverlayStarted = true
          this.applyPlayerStatusOverlay()
          this.applyPortraitOverlays()
          this.clearRelationBadges()
          if (typeof window !== 'undefined' && window.setInterval) {
            window.setInterval(() => {
              try {
                if (window.corSociety) {
                  window.corSociety.applyPlayerStatusOverlay()
                  window.corSociety.applyPortraitOverlays()
                }
              } catch (err) {
                console.warn(err)
              }
            }, 1400)
          }
        },
        applyPlayerStatusOverlay() {
          if (typeof document === 'undefined') {
            return
          }
          let state = daapi.getState()
          let target = this.findPlayerStatusElement()
          if (!target) {
            return
          }
          let key = this.playerStatusKey(state)
          if (target.getAttribute('data-cor-society-status-key') === key) {
            return
          }
          let status = this.playerSocietyStatus(state)
          let text = status.title + (status.className ? ' (' + status.className + ')' : '')
          if (!target.getAttribute('data-cor-society-original-status')) {
            target.setAttribute('data-cor-society-original-status', target.textContent || '')
          }
          target.setAttribute('data-cor-society-status-key', key)
          target.setAttribute('title', 'Society order: ' + this.stratumTitle(status.stratum) + (status.className ? '; vanilla property class: ' + status.className : ''))
          target.textContent = text
        },
        findPlayerStatusElement() {
          let socialSection = document.querySelector('[aria-label="Social status"]')
          if (socialSection) {
            let direct = socialSection.querySelector('.h5')
            if (direct) {
              return direct
            }
          }
          let dynastyTitle = document.querySelector('.dynasty-title')
          if (dynastyTitle && dynastyTitle.parentElement) {
            let candidates = dynastyTitle.parentElement.querySelectorAll('.h5')
            if (candidates.length) {
              return candidates[0]
            }
          }
          return false
        },
        applyPortraitOverlays() {
          if (typeof document === 'undefined') {
            return
          }
          let state = daapi.getState()
          if (!state || !state.characters) {
            return
          }
          if (!this.hasActiveWardrobeOutfits(state)) {
            this.restoreClearedPortraitOverlays(state)
            return
          }
          this.restoreClearedPortraitOverlays(state)
          this.applyCurrentCharacterPortraitOverlay(state)
          this.applyAttributedCharacterPortraitOverlays(state)
        },
        hasActiveWardrobeOutfits(state) {
          if (!state || !state.characters) {
            return false
          }
          let count = Object.keys(state.characters).length
          let month = this.monthKey(state)
          if (this.wardrobeOutfitCache && this.wardrobeOutfitCache.count === count && this.wardrobeOutfitCache.month === month) {
            return !!this.wardrobeOutfitCache.active
          }
          let active = false
          for (let characterId in state.characters) {
            if (state.characters.hasOwnProperty(characterId) && state.characters[characterId] && state.characters[characterId].corSocietyOutfit) {
              active = true
              break
            }
          }
          this.wardrobeOutfitCache = { count, month, active }
          return active
        },
        restoreClearedPortraitOverlays(state) {
          let images = Array.prototype.slice.call(document.querySelectorAll('img[data-cor-society-original-src]'))
          images.forEach((img) => {
            let id = img.getAttribute('data-cor-society-character-id') || this.characterIdFromElement(img)
            let character = id && state.characters[id]
            if (character && this.shouldUseSocietyPortrait(character)) {
              return
            }
            let original = img.getAttribute('data-cor-society-original-src')
            if (original) {
              img.src = original
            }
            img.removeAttribute('data-cor-society-original-src')
            img.removeAttribute('data-cor-society-portrait-src')
            img.removeAttribute('data-cor-society-character-id')
          })
        },
        applyCurrentCharacterPortraitOverlay(state) {
          let currentId = this.currentCharacterId(state)
          let character = state.characters[currentId]
          if (!this.shouldUseSocietyPortrait(character)) {
            return
          }
          let img = this.findCurrentPortraitImage(state)
          if (!img) {
            return
          }
          this.replacePortraitImage(img, character, state)
        },
        applyAttributedCharacterPortraitOverlays(state) {
          let images = Array.prototype.slice.call(document.querySelectorAll('img[data-character-id], img[data-characterid], img[data-character], img[data-id], [data-character-id] img, [data-characterid] img, [data-character] img, [data-id] img'))
          images.forEach((img) => {
            let id = this.characterIdFromElement(img)
            let character = id && state.characters[id]
            if (this.shouldUseSocietyPortrait(character)) {
              this.replacePortraitImage(img, character, state)
            }
          })
        },
        applyRelationBadges() {
          if (typeof document === 'undefined') {
            return
          }
          this.clearRelationBadges()
          return
          let state = daapi.getState()
          if (!state || !state.characters) {
            return
          }
          let society = this.load()
          this.clearRelationBadges()
          this.familyRelationCandidateIds(state).forEach((characterId) => {
            let character = state.characters[characterId]
            if (!character || this.sameCharacterId(characterId, this.currentCharacterId(state))) {
              return
            }
            character.id = character.id || characterId
            let visual = this.relationVisual(society, state, character, { lastKnownForDead: true })
            if (!visual) {
              return
            }
            this.relationBadgeTargets(character, state).forEach((target) => {
              this.mountRelationBadge(target.node, visual, characterId, target.mode)
            })
          })
        },
        clearRelationBadges() {
          Array.prototype.slice.call(document.querySelectorAll('.cor-society-vanilla-relation-badge')).forEach((badge) => {
            if (badge && badge.parentElement) {
              badge.parentElement.removeChild(badge)
            }
          })
          Array.prototype.slice.call(document.querySelectorAll('[data-cor-society-rel-anchor="1"]')).forEach((node) => {
            if (node && !node.querySelector('.cor-society-vanilla-relation-badge')) {
              node.removeAttribute('data-cor-society-rel-anchor')
              node.classList.remove('cor-society-relation-anchor')
              node.classList.remove('cor-society-relation-anchor-text')
            }
          })
        },
        familyRelationCandidateIds(state) {
          let currentId = this.currentCharacterId(state)
          let current = state.characters[currentId] || state.current || {}
          let ids = []
          let seen = {}
          let add = (id) => {
            if (!id || seen[id] || !state.characters[id]) {
              return
            }
            seen[id] = true
            ids.push(id)
          }
          ;((state.current && state.current.householdCharacterIds) || []).forEach(add)
          ;((state.current && state.current.formerHouseholdCharacterIds) || []).forEach(add)
          ;((state.current && state.current.deadHouseholdCharacterIds) || []).forEach(add)
          ;((current && current.childrenIds) || []).forEach(add)
          add(current.spouseId)
          add(current.fatherId)
          add(current.motherId)
          for (let characterId in state.characters) {
            if (!state.characters.hasOwnProperty(characterId)) {
              continue
            }
            let character = state.characters[characterId]
            if (!character) {
              continue
            }
            if (current.dynastyId && character.dynastyId === current.dynastyId) {
              add(characterId)
            }
          }
          return ids.slice(0, 120)
        },
        relationBadgeTargets(character, state) {
          let targets = []
          let seen = []
          let add = (node, mode) => {
            if (!node || seen.indexOf(node) >= 0) {
              return
            }
            if (node.closest && node.closest('#interactionModal, .interaction-modal, .modal, .cor-society-family-tree-overlay')) {
              return
            }
            seen.push(node)
            targets.push({ node, mode: mode || 'overlay' })
          }
          let id = this.attrEscape(character.id)
          let selectors = [
            '[data-character-id="' + id + '"] img',
            '[data-characterid="' + id + '"] img',
            '[data-character="' + id + '"] img',
            '[data-id="' + id + '"] img',
            'img[data-character-id="' + id + '"]',
            'img[data-characterid="' + id + '"]',
            'img[data-character="' + id + '"]',
            'img[data-id="' + id + '"]',
            '[data-character-id="' + id + '"]',
            '[data-characterid="' + id + '"]',
            '[data-character="' + id + '"]',
            '[data-id="' + id + '"]'
          ]
          selectors.forEach((selector) => {
            Array.prototype.slice.call(document.querySelectorAll(selector)).forEach((node) => {
              let anchor = node.tagName && node.tagName.toLowerCase() === 'img' ? node.parentElement : node
              add(anchor, 'overlay')
            })
          })
          if (!targets.length) {
            this.relationTextTargets(character, state).forEach((node) => add(node, 'text'))
          }
          return targets.slice(0, 4)
        },
        relationTextTargets(character, state) {
          let names = []
          let full = this.characterName(character, state)
          if (full) names.push(full)
          let dynasty = state.dynasties && state.dynasties[character.dynastyId] || {}
          let expanded = [character.praenomen, dynasty.nomen, dynasty.cognomen].filter(Boolean).join(' ')
          if (expanded) names.push(expanded)
          let nodes = []
          let candidates = Array.prototype.slice.call(document.querySelectorAll('button, a, .card, .list-group-item, .media, .row, .col, [class*="character"], [class*="family"], [class*="member"]'))
          candidates.forEach((node) => {
            if (!node || !node.textContent || node.offsetParent === null) {
              return
            }
            let text = node.textContent.replace(/\s+/g, ' ').trim()
            if (text.length > 180) {
              return
            }
            if (names.some((name) => name && text.indexOf(name) >= 0)) {
              nodes.push(node)
            }
          })
          return nodes
        },
        mountRelationBadge(node, visual, characterId, mode) {
          if (!node || !visual) {
            return
          }
          node.setAttribute('data-cor-society-rel-anchor', '1')
          node.classList.add('cor-society-relation-anchor')
          if (mode === 'text') {
            node.classList.add('cor-society-relation-anchor-text')
          }
          let badge = document.createElement('span')
          badge.className = 'cor-society-vanilla-relation-badge cor-society-tone-' + visual.tone
          badge.setAttribute('data-cor-society-rel-character-id', characterId)
          badge.setAttribute('title', visual.tooltip)
          let img = document.createElement('img')
          img.src = visual.icon
          img.alt = ''
          img.setAttribute('aria-hidden', 'true')
          let score = document.createElement('strong')
          score.textContent = visual.text
          let label = document.createElement('span')
          label.textContent = visual.label
          badge.appendChild(img)
          badge.appendChild(score)
          badge.appendChild(label)
          node.appendChild(badge)
        },
        shouldUseSocietyPortrait(character) {
          return !!(character && character.corSocietyOutfit)
        },
        characterIdFromElement(element) {
          let node = element
          while (node && node !== document.body) {
            if (node.getAttribute) {
              let value = node.getAttribute('data-character-id') || node.getAttribute('data-characterid') || node.getAttribute('data-character') || node.getAttribute('data-id')
              if (value) {
                return value
              }
            }
            node = node.parentElement
          }
          return ''
        },
        replacePortraitImage(img, character, state) {
          let portrait = this.characterPortrait(character, state)
          if (!portrait || img.getAttribute('data-cor-society-portrait-src') === portrait) {
            return
          }
          if (!img.getAttribute('data-cor-society-original-src')) {
            img.setAttribute('data-cor-society-original-src', img.getAttribute('src') || img.src || '')
          }
          if (character && character.id) {
            img.setAttribute('data-cor-society-character-id', character.id)
          }
          img.setAttribute('data-cor-society-portrait-src', portrait)
          img.src = portrait
        },
        startPlayerCrestOverlay() {
          if (this.playerCrestOverlayStarted) {
            this.applyPlayerCrestOverlay()
            return
          }
          this.playerCrestOverlayStarted = true
          this.applyPlayerCrestOverlay()
          if (typeof window !== 'undefined' && window.setInterval) {
            window.setInterval(() => {
              try {
                if (window.corSociety) {
                  window.corSociety.applyPlayerCrestOverlay()
                }
              } catch (err) {
                console.warn(err)
              }
            }, 1600)
          }
        },
        applyPlayerCrestOverlay() {
          if (typeof document === 'undefined') {
            return
          }
          let state = daapi.getState()
          let society = this.load()
          society.crestSettings = { playerOverlay: true, ...(society.crestSettings || {}) }
          if (!society.crestSettings.playerOverlay) {
            this.clearPlayerCrestOverlay()
            return
          }
          let crestId = this.playerCrestId(state)
          let hadCrest = society.crests && society.crests[crestId]
          let crest = this.ensurePlayerCrest(society, state)
          if (!hadCrest) {
            this.save(society)
          }
          let badge = document.getElementById('corSocietyPlayerCrestBadge')
          if (!badge) {
            badge = document.createElement('img')
            badge.id = 'corSocietyPlayerCrestBadge'
            badge.className = 'cor-society-player-crest-badge'
            badge.setAttribute('aria-hidden', 'true')
            badge.alt = ''
            document.body.appendChild(badge)
          }
          let viewportWidth = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 360
          let size = Math.max(26, Math.min(38, Math.round(viewportWidth * 0.09)))
          badge.src = this.crestIcon(crest, 96)
          badge.style.left = '6px'
          badge.style.top = '6px'
          badge.style.width = size + 'px'
          badge.style.height = Math.round(size * 1.15) + 'px'
          badge.style.display = 'block'
        },
        clearPlayerCrestOverlay() {
          if (typeof document === 'undefined') {
            return
          }
          let badge = document.getElementById('corSocietyPlayerCrestBadge')
          if (badge && badge.parentElement) {
            badge.parentElement.removeChild(badge)
          }
        },
        findCurrentPortraitImage(state) {
          if (typeof document === 'undefined') {
            return false
          }
          let currentId = (state.current || {}).id
          let escapedId = this.attrEscape(currentId)
          let selectors = [
            '[data-character-id="' + escapedId + '"] img',
            '[data-characterid="' + escapedId + '"] img',
            '[data-character="' + escapedId + '"] img',
            '[data-id="' + escapedId + '"] img',
            'img[data-character-id="' + escapedId + '"]',
            'img[data-characterid="' + escapedId + '"]',
            'img[data-character="' + escapedId + '"]',
            'img[data-id="' + escapedId + '"]'
          ]
          for (let i = 0; i < selectors.length; i++) {
            let found = this.bestVisibleImage(Array.prototype.slice.call(document.querySelectorAll(selectors[i])))
            if (found) {
              return found
            }
          }
          let character = state.characters[currentId]
          if (!character) {
            return false
          }
          let portrait = this.vanillaCharacterPortrait(character, state)
          let exact = []
          let images = Array.prototype.slice.call(document.querySelectorAll('img'))
          images.forEach((img) => {
            let src = img.getAttribute('src') || img.src || ''
            if (portrait && (src === portrait || img.src === portrait)) {
              exact.push(img)
            }
          })
          return this.bestVisibleImage(exact)
        },
        bestVisibleImage(images) {
          let best = false
          let bestScore = -1
          images.forEach((img) => {
            if (!img || !img.getBoundingClientRect) {
              return
            }
            let rect = img.getBoundingClientRect()
            if (rect.width < 28 || rect.height < 28 || rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
              return
            }
            let style = window.getComputedStyle ? window.getComputedStyle(img) : {}
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || 1) === 0) {
              return
            }
            let inModal = img.closest && img.closest('.modal, #interactionModal, .interaction-modal')
            let score = rect.width * rect.height - (inModal ? 100000 : 0)
            if (score > bestScore) {
              best = img
              bestScore = score
            }
          })
          return best
        },
        attrEscape(value) {
          return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        },
        log(society, text, kind, houseId) {
          let state = daapi.getState()
          let entry = {
            text: 'Y' + state.year + ' M' + ((state.month || 0) + 1) + ': ' + text,
            kind: kind || this.inferAffairKind(text),
            houseId: houseId || '',
            year: state.year || 0,
            month: (state.month || 0) + 1
          }
          society.log = society.log || []
          society.log.unshift(entry)
        },
        normalizeLogEntry(entry, index) {
          if (entry && typeof entry === 'object') {
            return {
              index,
              text: entry.text || '',
              kind: entry.kind || this.inferAffairKind(entry.text || ''),
              houseId: entry.houseId || ''
            }
          }
          let text = String(entry || '')
          return {
            index,
            text,
            kind: this.inferAffairKind(text),
            houseId: ''
          }
        },
        inferAffairKind(text) {
          text = String(text || '').toLowerCase()
          if (text.indexOf('marriage') >= 0 || text.indexOf('wedding') >= 0) return 'marriage'
          if (text.indexOf('birth') >= 0 || text.indexOf('child') >= 0 || text.indexOf('expecting') >= 0 || text.indexOf('pregnan') >= 0) return 'birth'
          if (text.indexOf('trade') >= 0 || text.indexOf('venture') >= 0 || text.indexOf('compact') >= 0) return 'tradeVenture'
          if (text.indexOf('rival') >= 0 || text.indexOf('feud') >= 0 || text.indexOf('rumor') >= 0 || text.indexOf('slander') >= 0) return 'rivalry'
          if (text.indexOf('petition') >= 0) return 'petition'
          if (text.indexOf('office') >= 0 || text.indexOf('campaign') >= 0) return 'officeCampaign'
          if (text.indexOf('scandal') >= 0) return 'scandal'
          if (text.indexOf('inheritance') >= 0) return 'inheritanceDispute'
          if (text.indexOf('gift') >= 0) return 'gift'
          if (text.indexOf('patronage') >= 0 || text.indexOf('favor') >= 0) return 'patronage'
          return 'log'
        },
        shortText(text, maxLength) {
          text = String(text || '').replace(/\s+/g, ' ').trim()
          maxLength = maxLength || 64
          if (text.length <= maxLength) {
            return text
          }
          return text.slice(0, Math.max(8, maxLength - 3)).replace(/\s+\S*$/, '') + '...'
        },
        monthKey(state) {
          return String(state.year || 0) + '-' + String(state.month || 0)
        },
        futureMonthKey(months) {
          let state = daapi.getState()
          let total = (state.year || 0) * 13 + (state.month || 0) + months
          return Math.floor(total / 13) + '-' + (total % 13)
        },
        monthKeyReached(targetKey, state) {
          return this.monthIndex(this.monthKey(state || daapi.getState())) >= this.monthIndex(targetKey)
        },
        monthIndex(key) {
          let parts = String(key || '0-0').split('-')
          return (parseInt(parts[0] || 0, 10) * 13) + parseInt(parts[1] || 0, 10)
        },
        safeId(value) {
          return String(value || '').replace(/[^a-zA-Z0-9_]/g, '_')
        },
        signed(value) {
          value = Math.round(value || 0)
          return (value > 0 ? '+' : '') + value
        },
        clamp(value, min, max) {
          return Math.max(min, Math.min(max, value))
        },
        randomInt(min, max) {
          return Math.floor(min + Math.random() * (max - min + 1))
        },
        pick(list) {
          list = (list || []).filter((item) => item !== undefined)
          return list[Math.floor(Math.random() * list.length)]
        },
        pickUnique(list, count) {
          let pool = (list || []).filter((item, index, arr) => item && arr.indexOf(item) === index)
          let picked = []
          while (pool.length && picked.length < count) {
            let index = Math.floor(Math.random() * pool.length)
            picked.push(pool.splice(index, 1)[0])
          }
          return picked
        }
      }

      window.corSociety.ensure()
      window.corSociety.installDebtSaleModalPatch()
      window.corSociety.registerPlayerEntryActions()
      window.corSociety.startPlayerCrestOverlay()
      window.corSociety.startPlayerStatusOverlay()
    },
    monthlyTick() {
      if (!window.corSociety) {
        daapi.invokeMethod({ event: '/cor_society/engine', method: 'boot' })
      }
      window.corSociety.monthlyTick()
    },
    showInstallNoticeOnce() {
      if (!window.corSociety) {
        daapi.invokeMethod({ event: '/cor_society/engine', method: 'boot' })
      }
      window.corSociety.showInstallNoticeOnce()
    },
    openHub() {
      if (!window.corSociety) {
        daapi.invokeMethod({ event: '/cor_society/engine', method: 'boot' })
      }
      window.corSociety.openHub()
    },
    openEstate(args) {
      window.corSociety.openEstate(args || {})
    },
    openDynasty(args) {
      window.corSociety.openDynasty(args || {})
    },
    createPlayerCadetHouse(args) {
      window.corSociety.createPlayerCadetHouse(args || {})
    },
    openRelations() {
      window.corSociety.openRelations()
    },
    openAllies(args) {
      window.corSociety.openAllies(args || {})
    },
    openRivals(args) {
      window.corSociety.openRivals(args || {})
    },
    openLog(args) {
      window.corSociety.openLog(args || {})
    },
    openLogEntry(args) {
      window.corSociety.openLogEntry(args || {})
    },
    openPlayerCrest() {
      window.corSociety.openPlayerCrest()
    },
    randomizePlayerCrest() {
      window.corSociety.randomizePlayerCrest()
    },
    cyclePlayerCrest(args) {
      window.corSociety.cyclePlayerCrest(args || {})
    },
    togglePlayerCrestOverlay() {
      window.corSociety.togglePlayerCrestOverlay()
    },
    openWardrobe() {
      window.corSociety.openWardrobe()
    },
    openWardrobeCharacter(args) {
      window.corSociety.openWardrobeCharacter(args || {})
    },
    applyWardrobeOutfit(args) {
      window.corSociety.applyWardrobeOutfit(args || {})
    },
    openHouse(args) {
      window.corSociety.openHouse(args || {})
    },
    openPeople(args) {
      window.corSociety.openPeople(args || {})
    },
    openMemberGroups(args) {
      window.corSociety.openMemberGroups(args || {})
    },
    openMemberGroup(args) {
      window.corSociety.openMemberGroup(args || {})
    },
    openPerson(args) {
      window.corSociety.openPerson(args || {})
    },
    openVanillaActions(args) {
      window.corSociety.openVanillaActions(args || {})
    },
    openVanillaKnownFamily(args) {
      window.corSociety.openVanillaKnownFamily(args || {})
    },
    openVanillaFullFamilyTree(args) {
      window.corSociety.openVanillaFullFamilyTree(args || {})
    },
    openFamilyTree(args) {
      window.corSociety.openFamilyTree(args || {})
    },
    openDynastyTree(args) {
      window.corSociety.openDynastyTree(args || {})
    },
    openHouseFamilyTree(args) {
      window.corSociety.openHouseFamilyTree(args || {})
    },
    openPlayerFamilyTree() {
      window.corSociety.openPlayerFamilyTree()
    },
    closeFamilyTreeOverlay() {
      window.corSociety.closeFamilyTreeOverlay()
    },
    openMarriageHousehold(args) {
      window.corSociety.openMarriageHousehold(args || {})
    },
    openMarriageCandidates(args) {
      window.corSociety.openMarriageCandidates(args || {})
    },
    confirmSocietyMarriage(args) {
      window.corSociety.confirmSocietyMarriage(args || {})
    },
    performSocietyMarriage(args) {
      window.corSociety.performSocietyMarriage(args || {})
    },
    registerBundledBankActions(args) {
      window.corSociety.registerBundledBankActions(args || {})
    },
    registerBundledSlaveActions(args) {
      window.corSociety.registerBundledSlaveActions(args || {})
    },
    registerBundledMatchmakerAction(args) {
      window.corSociety.registerBundledMatchmakerAction(args || {})
    },
    openBankOfRome() {
      window.corSociety.openBankOfRome()
    },
    takeBankLoan(args) {
      window.corSociety.takeBankLoan(args || {})
    },
    takeEmergencyDebtLoan(args) {
      window.corSociety.takeEmergencyDebtLoan(args || {})
    },
    payBankLoan(args) {
      window.corSociety.payBankLoan(args || {})
    },
    deferBankPayment(args) {
      window.corSociety.deferBankPayment(args || {})
    },
    openHouseholdSlaves(args) {
      window.corSociety.openHouseholdSlaves(args || {})
    },
    openPlayerSlavePath(args) {
      window.corSociety.openPlayerSlavePath(args || {})
    },
    playerSlaveWorkExtra(args) {
      window.corSociety.playerSlaveWorkExtra(args || {})
    },
    playerSlavePetitionFreedom(args) {
      window.corSociety.playerSlavePetitionFreedom(args || {})
    },
    playerSlaveSeekPatron(args) {
      window.corSociety.playerSlaveSeekPatron(args || {})
    },
    playerSlaveEscape(args) {
      window.corSociety.playerSlaveEscape(args || {})
    },
    openSlaveMarket(args) {
      window.corSociety.openSlaveMarket(args || {})
    },
    buySlave(args) {
      window.corSociety.buySlave(args || {})
    },
    openManageSlave(args) {
      window.corSociety.openManageSlave(args || {})
    },
    openAssignSlaveTask(args) {
      window.corSociety.openAssignSlaveTask(args || {})
    },
    assignSlaveTask(args) {
      window.corSociety.assignSlaveTask(args || {})
    },
    openSlaveEducationTargets(args) {
      window.corSociety.openSlaveEducationTargets(args || {})
    },
    setSlaveEducationTarget(args) {
      window.corSociety.setSlaveEducationTarget(args || {})
    },
    privateCompanySlave(args) {
      window.corSociety.privateCompanySlave(args || {})
    },
    legitimizeSlaveBastard(args) {
      window.corSociety.legitimizeSlaveBastard(args || {})
    },
    openSlaveMarriageCandidates(args) {
      window.corSociety.openSlaveMarriageCandidates(args || {})
    },
    marryOwnedSlaves(args) {
      window.corSociety.marryOwnedSlaves(args || {})
    },
    acceptSlaveSelfPurchase(args) {
      window.corSociety.acceptSlaveSelfPurchase(args || {})
    },
    sellSlave(args) {
      window.corSociety.sellSlave(args || {})
    },
    freeSlave(args) {
      window.corSociety.freeSlave(args || {})
    },
    buyEnslavedCharacter(args) {
      window.corSociety.buyEnslavedCharacter(args || {})
    },
    captureEnslavedCharacter(args) {
      window.corSociety.captureEnslavedCharacter(args || {})
    },
    openMatchmaker(args) {
      window.corSociety.openMatchmaker(args || {})
    },
    acceptMatchmakerCandidate(args) {
      window.corSociety.acceptMatchmakerCandidate(args || {})
    },
    declineMatchmakerCandidates(args) {
      window.corSociety.declineMatchmakerCandidates(args || {})
    },
    sendGift(args) {
      window.corSociety.sendGift(args || {})
    },
    hostDinner(args) {
      window.corSociety.hostDinner(args || {})
    },
    askSupport(args) {
      window.corSociety.askSupport(args || {})
    },
    tradeDeal(args) {
      window.corSociety.tradeDeal(args || {})
    },
    offerPatronage(args) {
      window.corSociety.offerPatronage(args || {})
    },
    seekPatronage(args) {
      window.corSociety.seekPatronage(args || {})
    },
    startRivalry(args) {
      window.corSociety.startRivalry(args || {})
    },
    reconcile(args) {
      window.corSociety.reconcile(args || {})
    },
    praisePerson(args) {
      window.corSociety.praisePerson(args || {})
    },
    requestIntroduction(args) {
      window.corSociety.requestIntroduction(args || {})
    },
    inviteHomeTalk(args) {
      window.corSociety.inviteHomeTalk(args || {})
    },
    courtCharacter(args) {
      window.corSociety.courtCharacter(args || {})
    },
    resolveCourtship(args) {
      window.corSociety.resolveCourtship(args || {})
    },
    spreadRumor(args) {
      window.corSociety.spreadRumor(args || {})
    },
    startStealingFromCharacter(args) {
      window.corSociety.startStealingFromCharacter(args || {})
    },
    resolveStealingFromCharacter(args) {
      window.corSociety.resolveStealingFromCharacter(args || {})
    },
    answerSlander(args) {
      window.corSociety.answerSlander(args || {})
    },
    ignoreSlander(args) {
      window.corSociety.ignoreSlander(args || {})
    },
    acceptOpening(args) {
      window.corSociety.acceptOpening(args || {})
    },
    declineOpening(args) {
      window.corSociety.declineOpening(args || {})
    },
    supportPetition(args) {
      window.corSociety.supportPetition(args || {})
    },
    refusePetition(args) {
      window.corSociety.refusePetition(args || {})
    },
    attendFamilyInvitation(args) {
      window.corSociety.attendFamilyInvitation(args || {})
    },
    declineFamilyInvitation(args) {
      window.corSociety.declineFamilyInvitation(args || {})
    },
    endorseOffice(args) {
      window.corSociety.endorseOffice(args || {})
    },
    honorWedding(args) {
      window.corSociety.honorWedding(args || {})
    },
    judgeInheritance(args) {
      window.corSociety.judgeInheritance(args || {})
    },
    investVenture(args) {
      window.corSociety.investVenture(args || {})
    },
    collectVentureResult(args) {
      window.corSociety.collectVentureResult(args || {})
    },
    treatFamilyMember(args) {
      window.corSociety.treatFamilyMember(args || {})
    },
    comfortFamilyMember(args) {
      window.corSociety.comfortFamilyMember(args || {})
    },
    ignoreFamilyDistress(args) {
      window.corSociety.ignoreFamilyDistress(args || {})
    },
    shieldScandal(args) {
      window.corSociety.shieldScandal(args || {})
    },
    exploitScandal(args) {
      window.corSociety.exploitScandal(args || {})
    },
    declineFamilyAffair(args) {
      window.corSociety.declineFamilyAffair(args || {})
    }
  }
}
