# Offline Request Saga
Sagas for handling requests when an application is offline.

## Store Setup
You need to manage your offline status in Redux to use offline-request-saga. I suggest [redux-offline-status](https://www.npmjs.com/package/redux-offline-status).
```
import { requestQueue } from 'offline-request-saga'
import { offlineStatus, offline } from 'redux-offline-status'
import createSagaMiddleware from 'redux-saga'
import { persistStore, autoRehydrate } from 'redux-persist'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'

const appReducer = combineReducers([
  offline,
  requestQueue,
  // your other reducers
])

const sagaMiddleware = createSagaMiddleware()

const middleware = [
  offlineStatus,
  sagaMiddleware
]

const enhancer = compose(
  applyMiddleware(...middleware),
  autoRehydrate(),
)

const store = createStore(
  appReducer,
  initialState,
  enhancer
)

//For your request queue to persist across page reloads you must persist your store.
persistStore(store, {
  blacklist: ['offline'] // ensure offline/online state is not persisted
})
```

## Query Retry with `getRequest`

## Mutation Queue with `queueRequest`

## Handling Events in Reducers
When your run `getRequest` or `queueRequest` you pass an action. While you may certainly want to respond to this action in your reducers, there are additional actions fired by the middleware that you should handle in your reducers. Import `successActionType` and `errorActionType` to wrap the appropriate action.
```
import { successActionType, errorActionType } from 'offline-request-saga'
import { GET_ITEMS } from './actions'

export const items = (state = [], action) => {
  switch (action.type) {
    case successActionType(GET_ITEMS): {
      return action.data
    }

    case GET_ITEMS:
    case errorActionType(GET_ITEMS): {
      return []
    }

    default:
      return state
  }
})
```
