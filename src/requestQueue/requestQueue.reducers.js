import { QUEUE_REQUEST, DEQUEUE_REQUEST } from './requestQueue.actions'

export const requestQueue = (state = [], action) => {
  const {
    type,
    ...rest
  } = action

  switch (type) {
    case QUEUE_REQUEST:
      return [...state, rest] // TODO: Kill requests with the same ID

    case DEQUEUE_REQUEST:
      return state.filter(request => request.id !== action.id)

    default:
      return state
  }
}

export default requestQueue
