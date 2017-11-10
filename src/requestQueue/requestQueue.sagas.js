import { select, take, put, fork, all, takeLatest, spawn } from 'redux-saga/effects'
import {
  EXECUTE_QUEUE,
  executeQueueAction,
  queueRequestAction
} from './requestQueue.actions'
import { ONLINE } from 'redux-offline-status'
import { REHYDRATE } from 'redux-persist/constants'

import { getRequestQueue } from './requestQueue.getters'
import { fetchQueuedRequest } from '../request/request.sagas'

export function* executeQueue() {
  const requestQueue = yield select(getRequestQueue)

  const requests = requestQueue.map(request =>
    fork(fetchQueuedRequest, request.relatedAction)
  )

  return yield all(requests)
}

export function* queueRequest(action) {
  yield put(queueRequestAction(action))
  yield put(executeQueueAction)
}

export function* watchExecuteQueue() {
  yield takeLatest(EXECUTE_QUEUE, executeQueue)
}

export function* watchOnline() {
  yield takeLatest(ONLINE, executeQueue)
}

export function* waitForRehydrate() {
  yield take(REHYDRATE)
  yield put(executeQueueAction)
}

export function* requestQueueSagas() {
  yield all([
    spawn(watchOnline),
    spawn(watchExecuteQueue),
    spawn(waitForRehydrate)
  ])
}
