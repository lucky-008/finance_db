import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
})

const authHeader = (token) => ({
  headers: {
    Authorization: token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
  },
})

export const registerUser = async (payload) => {
  const { data } = await client.post('/users/register', payload)
  return data
}

export const loginUser = async (payload) => {
  const { data } = await client.post('/users/login', payload)
  const token = data.token
  const payloadPart = token?.split('.')[1]
  const normalizedPayload = payloadPart
    ? payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    : ''
  const paddedPayload = normalizedPayload
    ? normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4)
    : ''
  const decoded = paddedPayload ? JSON.parse(atob(paddedPayload)) : null
  return { ...data, role: decoded?.role || '' }
}

export const getUsers = async (token) => {
  const { data } = await client.get('/users', authHeader(token))
  return data
}

export const createRecord = async (token, payload) => {
  const { data } = await client.post('/records', payload, authHeader(token))
  return data
}

export const getRecords = async (token, filters) => {
  const { data } = await client.get('/records', {
    ...authHeader(token),
    params: filters,
  })
  return data
}

export const updateRecord = async (token, id, payload) => {
  const { data } = await client.put(`/records/${id}`, payload, authHeader(token))
  return data
}

export const deleteRecord = async (token, id) => {
  const { data } = await client.delete(`/records/${id}`, authHeader(token))
  return data
}

export const getDashboardSummary = async (token) => {
  const { data } = await client.get('/dashboard/summary', authHeader(token))
  return data
}

export const getDashboardCategory = async (token) => {
  const { data } = await client.get('/dashboard/category', authHeader(token))
  return data
}

export const getDashboardRecent = async (token) => {
  const { data } = await client.get('/dashboard/recent', authHeader(token))
  return data
}

export const getDashboardTrends = async (token, period = 'monthly') => {
  const { data } = await client.get('/dashboard/trends', {
    ...authHeader(token),
    params: { period },
  })
  return data
}
