export const STATUS_MESSAGES = {
  400: {
    title: '400 Invalid Request',
    description: 'Something was wrong with your request. Please try again.',
  },
  401: {
    title: '401 Unauthorized',
    description: 'You need to log in to continue.',
  },
  403: {
    title: '403 Access Denied',
    description: "You don't have permission to perform this action.",
  },
  404: {
    title: '404 Not Found',
    description: 'The requested resource could not be found.',
  },
  408: {
    title: '408 Request Timeout',
    description: 'The server took too long to respond.',
  },
  409: {
    title: '408 Conflict',
    description: 'A conflict occurred. This might already exist.',
  },
  413: {
    title: '413 Too Large',
    description: 'The uploaded data exceeds the allowed size.',
  },
  429: {
    title: '429 Too Many Requests',
    description: 'You’ve made too many requests. Please slow down.',
  },
  500: {
    title: '500 Server Error',
    description: 'Something went wrong on the server.',
  },
  502: {
    title: '502 Bad Gateway',
    description: 'Upstream server returned an invalid response.',
  },
  503: {
    title: '503 Service Unavailable',
    description: 'The service is temporarily unavailable.',
  },
  504: {
    title: '504 Gateway Timeout',
    description: 'The server took too long to respond.',
  },
};
