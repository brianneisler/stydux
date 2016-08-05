import _ from 'mudash'

export default function createStydux(options) {

  const currentSelector = _.isFunction(options) ? options : (currentState) => {
    const selectPath = _.get(options, 'name', 'styles')
    return _.get(currentState, selectPath)
  }
  let currentStyles = null
  let currentListeners = []
  let nextListeners = currentListeners
  let isSelecting = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    if (isSelecting) {
      throw new Error(
        'You may not call stydux.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, subscribe ' +
        'and invoke stydux.getStyles() in the callback to access the latest styles. '
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isSelecting) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. '
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  function selectStyles(currentState) {

    if (isSelecting) {
      throw new Error('Selectors may not selectStyles.')
    }

    try {
      isSelecting = true
      currentStyles = currentSelector(currentState)
    } finally {
      isSelecting = false
    }

    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
  }

  function getStyles() {
    if (isSelecting) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
        'The reducer has already received the state as an argument. ' +
        'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentStyles
  }

  return {
    getStyles,
    selectStyles,
    subscribe
  }
}
