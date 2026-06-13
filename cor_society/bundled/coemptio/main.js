{
  canTriggerIfUnavailable: true,
  checkType: 'householdCharacters',
  checkAndAct(characterId) {
    try {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'registerBundledMatchmakerAction',
        context: { characterId }
      })
    } catch (err) {
      console.warn(err)
    }
  },
  methods: {
    openMatchmaker(context) {
      daapi.invokeMethod({
        event: '/cor_society/engine',
        method: 'openMatchmaker',
        context: context || {}
      })
    }
  }
}
