{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct: function() {
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
          title: 'House Tree error',
          message: err.name + ': ' + err.message,
          image: daapi.requireImage('/cor_society/icon.svg')
        })
      }
    },
    openFamilyCharacterSheet: function(args) {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openFamilyCharacterSheet',
          context: args || {}
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Society Sheet error',
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
    openPlayerSlavePath: function(args) {
      try {
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'boot'
        })
        daapi.invokeMethod({
          event: '/cor_society/engine',
          method: 'openPlayerSlavePath',
          context: args || {}
        })
      } catch (err) {
        daapi.pushInteractionModalQueue({
          title: 'Path to Freedom error',
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
