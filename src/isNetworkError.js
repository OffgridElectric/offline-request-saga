export const isNetworkError = error =>
  error.message === 'Network Error' || // XHR error in Chrome
  error.message === 'Failed to fetch' || // Fetch error in Chrome
  error.message === 'Type error' || // Safari
  error.message === 'NetworkError when attempting to fetch resource.' // Firefox
  // TODO: Opera, XHR for Firefox and Safari

export default isNetworkError
