import { all, spawn } from 'redux-saga/effects'
import { requestQueueSagas } from './requestQueue/requestQueue.sagas'

export fetchingReducerCreator from './fetchingReducerCreator'

export { getRequest, successActionType, errorActionType } from './request'

export { queueRequest, requestQueue } from './requestQueue'

export function* offlineRequestsSagas() {
  yield all([
    spawn(requestQueueSagas)
  ])
}
