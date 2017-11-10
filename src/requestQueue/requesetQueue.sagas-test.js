import { expectSaga, testSaga } from 'redux-saga-test-plan'
import { ONLINE } from 'redux-offline-status'
import { REHYDRATE } from 'redux-persist/constants'

import {
  executeQueueAction,
  queueRequestAction,
  EXECUTE_QUEUE
} from './requestQueue.actions'
import {
  watchOnline,
  queueRequest,
  watchExecuteQueue,
  executeQueue,
  waitForRehydrate
} from './requestQueue.sagas'

describe('queueRequest Saga', () => {
  const action = {
    type: 'TEST_QUEUE',
    id: '1234',
    url: 'https://google.com',
    payload: undefined,
    method: 'POST'
  }

  it('dispatches a QUEUE_REQUEST with required params', () =>
    expectSaga(queueRequest, action)
      .put(queueRequestAction(action))
      .run()
  )

  it('dispatches a EXECUTE_QUEUE after the request is queued', () =>
    expectSaga(queueRequest, action)
      .put(queueRequestAction(action))
      .put(executeQueueAction)
      .run()
  )
})

describe('watchExecuteQueue Saga', () => {
  it('takes the latest EXECUTE_QUEUE online and triggers executeQueue', () => {
    testSaga(watchExecuteQueue)
      .next()
      .takeLatestEffect(EXECUTE_QUEUE, executeQueue)
  })
})

describe('watchOnline Saga', () => {
  it('takes the latest ONLINE action and triggers executeQueue', () =>
    testSaga(watchOnline)
      .next()
      .takeLatestEffect(ONLINE, executeQueue)
  )
})

describe('waitForRehydrate Saga', () => {
  it('waits for the REHYDRATE event', () =>
    expectSaga(waitForRehydrate)
      .take(REHYDRATE)
      .silentRun()
  )

  it('on REHYDRATE it dispatches EXECUTE_QUEUE', () =>
    expectSaga(waitForRehydrate)
      .dispatch({ type: REHYDRATE })
      .put(executeQueueAction)
      .run()
  )
})
