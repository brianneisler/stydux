export default function createStyduxMiddleware(stydux) {
  return store => next => action => {
    let result = next(action)
    const nextState = store.getState()
    stydux.selectStyles(nextState)
    return result
  }
}
