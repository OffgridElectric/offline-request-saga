export const QUEUE_REQUEST = 'QUEUE_REQUEST'
export const queueRequestAction = relatedAction => ({
  type: QUEUE_REQUEST,
  id: relatedAction.id,
  relatedAction
})

export const EXECUTE_QUEUE = 'EXECUTE_QUEUE'
export const executeQueueAction = { type: EXECUTE_QUEUE }

export const DEQUEUE_REQUEST = 'DEQUEUE_REQUEST'
export const dequeueRequest = id => ({
  type: DEQUEUE_REQUEST,
  id
})
