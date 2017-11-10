import expect from 'expect'
import { expectSaga } from 'redux-saga-test-plan'
import { take, call } from 'redux-saga/effects'
import { throwError } from 'redux-saga-test-plan/providers'

import { ONLINE, OFFLINE } from 'redux-offline-status'
import { waitForOnline, getRequest, fetchQueuedRequest, fetchJson } from './request.sagas'
import { requestSuccess, requestError } from './request.actions'
import { dequeueRequest } from '../requestQueue/requestQueue.actions'

describe('waitForOnline saga', () => {
  it('does not wait for ONLINE if already online', () =>
    expectSaga(waitForOnline)
      .withState({ offline: false })
      .not.call.fn(take(ONLINE))
      .run()
  )

  it('returns true when the application is online', () =>
    expectSaga(waitForOnline)
      .withState({ offline: false })
      .returns(true)
      .run()
  )

  it('waits for the application to come online when offline', () =>
    expectSaga(waitForOnline)
      .withState({ offline: true })
      .take(ONLINE)
      .silentRun()
  )

  it('when offline, it returns when an ONLINE action is fired', () =>
    expectSaga(waitForOnline)
      .withState({ offline: true })
      .delay(250)
      .dispatch({ type: ONLINE })
      .run(500)
  )
})

describe('getRequest Saga', () => {
  const res = {
    data: 'test'
  }

  const apiCall = (param1, param2) => Promise.resolve(res)

  const action = {
    type: 'TEST',
    params: { testParam: 'stuff' }
  }

  it('it pauses the saga when offline is true', () =>
    expectSaga(getRequest, apiCall, action)
      .withState({ offline: true })
      .call(waitForOnline)
      .silentRun()
  )

  it('makes API request if ONLINE', () =>
    expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .call(apiCall, action.params)
      .run()
  )

  it('emits a _SUCCESS with the response action when the API request returns a response', () =>
    expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .provide([
        [call(apiCall, action.params), res]
      ])
      .put(requestSuccess(action.type, res))
      .run()
  )

  it('returns the API response when done', () =>
    expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .provide([
        [call(apiCall, action.params), res]
      ])
      .returns(res)
      .run()
  )

  it('emits an OFFLINE action if there is a Network Error', () => {
    const error = new Error('Network Error')

    return expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .provide([
        [call(apiCall, action.params), throwError(error)],
        [call(getRequest, apiCall, action)]
      ])
      .put({ type: OFFLINE })
      .run()
  })

  it('restarts the saga if there is a Network Error', () => {
    const error = new Error('Network Error')

    return expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .provide([
        [call(apiCall, action.params), throwError(error)],
        [call(getRequest, apiCall, action)]
      ])
      .call(getRequest, apiCall, action)
      .run()
  })

  it('emits a _ERROR action with an error when the API request throws an error', () => {
    const error = new Error('There was an error')

    return expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .provide([
        [call(apiCall, action.params), throwError(error)]
      ])
      .put(requestError(action.type, error))
      .run()
  })

  it('returns an error when the API request throws a non-network error', () => {
    const error = new Error('There was an error')

    return expectSaga(getRequest, apiCall, action)
      .withState({ offline: false })
      .provide([
        [call(apiCall, action.params), throwError(error)]
      ])
      .run(result => expect(result.returnValue).toEqual(error))
  })
})

describe('fetchQueuedRequest Saga', () => {
  const action = {
    type: 'TEST_QUEUE',
    id: '1234',
    url: 'https://google.com',
    payload: undefined,
    method: 'POST'
  }

  const res = {
    data: true
  }

  it('pauses the saga when offline', () =>
    expectSaga(fetchQueuedRequest, action)
      .withState({ offline: true })
      .call(waitForOnline)
      .silentRun()
  )

  it('when paused, it continues the saga when an ONLINE action is emitted', () =>
    expectSaga(fetchQueuedRequest, action)
      .withState({ offline: true })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), res],
      ])
      .delay(200)
      .dispatch({ type: ONLINE })
      .call(fetchJson, action.url, action.method, action.payload)
      .run()
  )

  it('makes API request if ONLINE', () =>
    expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), res],
      ])
      .call(fetchJson, action.url, action.method, action.payload)
      .run()
  )

  it('emits a queued _SUCCESS with the response action when the API request returns a response', () =>
    expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), res]
      ])
      .put(requestSuccess(action.type, {
        ...res,
        queued: true,
        parent: action
      }))
      .run()
  )

  it('dispatches a DEQUEUE_REQUEST action on request SUCCESS', () =>
    expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), res]
      ])
      .put(dequeueRequest(action.id))
      .run()
  )

  it('returns the API response when done', () =>
    expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), res]
      ])
      .returns(res)
      .run()
  )

  it('dispatches an OFFLINE action if there is a Network Error', () => {
    const error = new Error('Network Error')

    return expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), throwError(error)],
      ])
      .put({ type: OFFLINE })
      .run()
  })

  it('does not dispatch a DEQUEUE_REQUEST action on Network Error', () => {
    const error = new Error('Network Error')

    return expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), throwError(error)],
      ])
      .not.call.fn(dequeueRequest(action.id))
      .run()
  })

  it('dispatches a _ERROR action with an error when the API request throws an error', () => {
    const error = new Error('There was an error')

    return expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), throwError(error)],
      ])
      .put(requestError(action.type, error))
      .run()
  })

  it('returns an error when when the request returns an error', () => {
    const error = new Error('There was an error')

    return expectSaga(fetchQueuedRequest, action)
      .withState({ offline: false })
      .provide([
        [call(fetchJson, action.url, action.method, action.payload), throwError(error)]
      ])
      .run(result => expect(result.returnValue).toEqual(error))
  })
})
