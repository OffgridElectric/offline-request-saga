export const successActionType = actionType => `${actionType}_SUCCESS`
export const requestSuccess = (type, params) => ({
  type: successActionType(type),
  ...params
})

export const errorActionType = actionType => `${actionType}_ERROR`
export const requestError = (type, error, params) => ({
  type: errorActionType(type),
  error: error.message,
  ...params
})
