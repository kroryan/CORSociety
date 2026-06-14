// Switch characters
{
  canTriggerIfUnavailable: true,
  checkType: 'allCharacters',
  checkAndAct(characterId) {
    let character = daapi.getCharacter({ characterId })
    let deleteAction = () => {
      for (let i = 0; i < 12; i += 1) {
        try {
          daapi.deleteCharacterAction({ characterId, key: 'play_as' })
        } catch (err) {
          break
        }
      }
    }
    if (
      characterId !== daapi.getState().current.id &&
      character &&
      !character.isDead
    ) {
      deleteAction()
      daapi.addCharacterAction({
        characterId,
        key: 'play_as',
        action: {
          title: 'Play As',
          icon: daapi.requireImage('/cor_society/bundled/play_as/switch.svg'),
          isAvailable: true,
          hideWhenBusy: false,
          process: {
            event: '/cor_society/bundled/play_as/main',
            method: 'process',
            context: {
              characterId
            }
          }
        }
      })
    } else {
      deleteAction()
    }
  },
  methods: {
    process({ characterId }) {
      let character = daapi.getCharacter({ characterId })
      if (!character || character.isDead) {
        daapi.deleteCharacterAction({
          characterId,
          key: 'play_as'
        })
        return
      }
      daapi.pushInteractionModalQueue({
        title: 'Play as ' + character.praenomen + '?',
        message: 'Would you like to play as ' + `[c|${characterId}|${character.praenomen}]` + '?',
        image: daapi.requireImage('/cor_society/bundled/play_as/switch.svg'),
        options: [
          {
            variant: 'info',
            text: 'Yes please',
            action:{
              event: '/cor_society/bundled/play_as/main',
              method: 'doSwitch',
              context: {characterId}
            }
          },
          {
            text: 'No, thank you'
          }
        ]
      })
    },
    doSwitch({ characterId }) {
      daapi.setCurrentCharacter({ characterId })
      daapi.deleteCharacterAction({
        characterId,
        key: 'play_as'
      })
    }
  }
}
