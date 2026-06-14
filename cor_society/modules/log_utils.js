{
  canTriggerIfUnavailable: true,
  checkType: 'general',
  checkAndAct() {},
  methods: {
    _mixinCorSocietyLogUtils() {
      if (!window.corSociety) {
        return
      }
      if (window.corSociety._mixinCorSocietyLogUtilsVersion === '1.1.293') {
        return
      }
      Object.assign(window.corSociety, {
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
      })
      window.corSociety._mixinCorSocietyLogUtilsVersion = '1.1.293'
    }
  }
}
