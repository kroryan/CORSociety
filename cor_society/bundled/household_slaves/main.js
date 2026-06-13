{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {
    try {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'registerBundledSlaveActions'
      })
    } catch (err) {
      console.warn(err)
    }
  },
  methods: {
    openHouseholdSlaves() {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'openHouseholdSlaves'
      })
    }
  }
}
