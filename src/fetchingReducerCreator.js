import { REHYDRATE } from 'redux-persist/constants'

import { successActionType, errorActionType } from './request'

export default baseAction => (state = false, action) => {
  switch (action.type) {
    case baseAction:
      return true
    case REHYDRATE:
    case successActionType(baseAction):
    case errorActionType(baseAction):
      return false
    default:
      return state
  }
}
