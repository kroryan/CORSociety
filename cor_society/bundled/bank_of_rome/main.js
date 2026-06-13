{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {
    try {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'registerBundledBankActions'
      })
    } catch (err) {
      console.warn(err)
    }
  },
  methods: {
    openBank() {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'openBankOfRome'
      })
    }
  }
}
