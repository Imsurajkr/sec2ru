import client from './client'

export const getConnections = (params = {}) =>
  client.get('/network/conns', { params }).then(r =>
    Array.isArray(r.data) ? r.data : []
  )

export const getAppSummary = (tw = '30m') =>
  client.get('/network/app-summary', { params: { window: tw } }).then(r =>
    Array.isArray(r.data) ? r.data : []
  )
