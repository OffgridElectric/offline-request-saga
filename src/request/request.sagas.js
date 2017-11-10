import 'core-js/fn/object/values'
import { take, put, select, call } from 'redux-saga/effects'

import { ONLINE, OFFLINE, isOffline } from 'redux-offline-status'
import { dequeueRequest } from '../requestQueue/requestQueue.actions'
import { requestSuccess, requestError } from './request.actions'
import { isNetworkError } from '../isNetworkError'

export function* waitForOnline() {
  const offline = yield select(isOffline)

  if (offline) {
    return yield take(ONLINE)
  }

  return true
}

export function* getRequest(apiCall, action) {
  yield call(waitForOnline)

  try {
    const res = yield call(apiCall, action.params)
    yield put(requestSuccess(action.type, res))

    return res
  } catch (error) {
    if (isNetworkError(error)) {
      yield put({ type: OFFLINE })
      return yield call(getRequest, apiCall, action)
    }

    yield put(requestError(action.type, error))

    return new Error(error)
  }
}

export const fetchJson = (url, method, payload) =>
  fetch(url, {
    method,
    credentials: 'include',
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify(payload)
  })
  .then((res) => {
    if (res.ok) {
      return res.json()
    }

    throw new Error(res.statusText)
  })

export function* fetchQueuedRequest(action) {
  const {
    type,
    url,
    method,
    payload,
  } = action

  yield call(waitForOnline)

  try {
    const res = yield call(fetchJson, url, method, payload)
    yield put(requestSuccess(type, {
      ...res,
      queued: true,
      parent: action
    }))

    yield put(dequeueRequest(action.id))

    return res
  } catch (error) {
    // Network Error
    if (isNetworkError(error)) {
      yield put({ type: OFFLINE })
    } else { // Server Error
      yield put(dequeueRequest(action.id))
    }

    yield put(requestError(type, error))

    return new Error(error)
  }
}
