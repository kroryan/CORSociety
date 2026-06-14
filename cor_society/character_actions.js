{
  canTriggerIfUnavailable: true,
  checkType: 'householdCharacters',
  checkAndAct(characterId) {
    let state = daapi.getState()
    let currentId = state && state.current && (state.current.id || state.current.characterId)
    let character = state && state.characters && state.characters[characterId]
    if (!character) {
      return
    }

    let addAction = (key, title, tooltip, icon, method, context) => {
      try {
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
              context: { characterId, targetCharacterId: characterId, ...(context || {}) }
            }
          }
        })
      } catch (err) {
        console.warn('Roman Society action registration failed: ' + key, err)
      }
    }

    let isCurrent = String(characterId) === String(currentId)
    if (isCurrent) {
      addAction('cor_society', 'Roman Society', 'Opens the Society overview. Consequences: no stats change until you choose an action inside.', daapi.requireImage('/cor_society/icon.svg'), 'openHub')
      addAction('cor_society_player_crest', 'House Shield', 'Opens player house shield settings. Consequences: visual shield changes only; no stats change.', daapi.requireImage('/cor_society/shield.svg'), 'openPlayerCrest')
      addAction('cor_society_wardrobe', 'Family Wardrobe', 'Change Society portrait clothing for members of your household. Consequences: visual clothing changes only; no stats change.', daapi.requireImage('/cor_society/assets/wardrobe.svg'), 'openWardrobe')
      addAction('cor_society_bank_of_rome', 'Bank of Rome', 'Open Society banking. Consequences happen only when taking or repaying a loan.', daapi.requireImage('/cor_society/bundled/bank_of_rome/money.svg'), 'openBankOfRome')
      addAction('cor_society_household_slaves', 'Household Slaves', 'Open Society household slave management. Slaves are real generated characters.', daapi.requireImage('/cor_society/bundled/household_slaves/household.svg'), 'openHouseholdSlaves')
      if (character.corSocietySlave || character.corSocietySlaveActive) {
        addAction('cor_society_slave_path', 'Path to Freedom', 'Open slave-focused Society actions for earning or negotiating freedom.', daapi.requireImage('/cor_society/assets/poor.svg'), 'openPlayerSlavePath')
      }
      return
    }

    if (!character.isDead) {
      addAction('cor_society_character_sheet', 'Society Sheet', 'Open this family member in Roman Society. Consequences: opens the Society character sheet; no stats change.', daapi.requireImage('/cor_society/assets/scroll.svg'), 'openFamilyCharacterSheet')
    }
  }
}
