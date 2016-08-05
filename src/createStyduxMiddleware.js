export default function createStyduxMiddleware(stydux) {
  return store => next => action => {
    const result = next(action)
    const nextState = store.getState()
    stydux.selectStyles(nextState)
    return result
  }
}
