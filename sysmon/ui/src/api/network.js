import client from './client'

export const getConnections = (params = {}) =>
  client.get('/network/conns', { params }).then(r => r.data ?? [])

export const getAppSummary = (window = '30m') =>
  client.get('/network/app-summary', { params: { window } }).then(r => r.data ?? [])
