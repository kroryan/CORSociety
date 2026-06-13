{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct: function() {
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
            try {
              daapi.deleteGlobalAction({ key })
            } catch (err) {
            }
            try {
              daapi.deleteGlobalAction(key)
            } catch (err) {
            }
          }
        } catch (err) {
          console.warn(err)
        }
      })
      let state = daapi.getState()
      let characterId = state && state.current && state.current.id
      if (characterId) {
        let addCharacterEntry = function(key, title, tooltip, icon, method, context) {
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
                event: '/cor_society/main',
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
      daapi.setGlobalFlag({
        flag: 'corSocietyLastError',
        data: err.name + ': ' + err.message
      })
      daapi.pushInteractionModalQueue({
        title: 'Roman Society loader active',
        message: 'The loader is active, but the society engine failed: ' + err.name + ': ' + err.message,
        image: daapi.requireImage('/cor_society/icon.svg')
      })
    }
  },
  methods: {
    openHub: function() {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openHub'
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Roman Society engine error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    },
    openPlayerCrest: function() {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openPlayerCrest'
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'House Shield error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    },
    openWardrobe: function() {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openWardrobe'
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Family Wardrobe error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    },
    openPlayerFamilyTree: function() {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openPlayerFamilyTree'
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Player Dynasty Tree error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    },
    openBankOfRome: function() {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openBankOfRome'
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Bank of Rome error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    },
    openHouseholdSlaves: function() {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openHouseholdSlaves'
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Household Slaves error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    }
  }
}
