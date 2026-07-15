const BASE_URL = import.meta.env.VITE_API_URL || 'https://porthaven-logistics.onrender.com'
const API_PREFIX = '/api'

export interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
}

export interface Shipment {
  id: string
  trackingNumber: string
  senderName: string
  receiverName: string
  origin: string
  destination: string
  mode: 'AIR' | 'SEA'
  status: ShipmentStatus
  customerId: string | null
  createdAt: string
  estimatedDelivery: string
  events?: TrackingEvent[]
}

export type ShipmentStatus =
  | 'ORDER_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_FACILITY'
  | 'CUSTOMS_CLEARANCE'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION'

export interface TrackingEvent {
  id: string
  shipmentId: string
  status: ShipmentStatus
  location: string
  note: string
  timestamp: string
}

// ─── Token & user management ────────────────────────────────────────────────

const TOKEN_KEY = 'ph_token'
const USER_KEY = 'ph_user'

function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function getCurrentUser(): User | null {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function setCurrentUser(user: User): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

// ─── API client ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`)
  }

  return data as T
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await request<{ user: User; token: string }>('POST', '/auth/login', { email, password })
  setToken(data.token)
  setCurrentUser(data.user)
  return data
}

export function logout(): void {
  clearToken()
}

// ─── Admin API ──────────────────────────────────────────────────────────────

export async function createCustomerUser(data: {
  email: string
  password: string
  name: string
}): Promise<{ user: User; credentials: { email: string; password: string } }> {
  return request<{ user: User; credentials: { email: string; password: string } }>(
    'POST',
    '/admin/users',
    data,
    true,
  )
}

// ─── Shipment API ───────────────────────────────────────────────────────────

export async function getShipmentByTracking(trackingNumber: string): Promise<{ shipment: Shipment }> {
  return request<{ shipment: Shipment }>('GET', `/shipments/${encodeURIComponent(trackingNumber)}`)
}

export async function getMyShipments(): Promise<{ shipments: Shipment[] }> {
  return request<{ shipments: Shipment[] }>('GET', '/shipments', undefined, true)
}

export async function createShipment(data: {
  senderName: string
  receiverName: string
  origin: string
  destination: string
  mode: 'AIR' | 'SEA'
  customerId?: string | null
  estimatedDelivery: string
}): Promise<{ shipment: Shipment }> {
  return request<{ shipment: Shipment }>('POST', '/shipments', data, true)
}

export async function addTrackingEvent(shipmentId: string, data: {
  status: ShipmentStatus
  location: string
  note?: string
  timestamp?: string
}): Promise<{ event: TrackingEvent }> {
  return request<{ event: TrackingEvent }>('POST', `/shipments/${shipmentId}/events`, data, true)
}

export async function linkShipment(shipmentId: string): Promise<{ shipment: Shipment }> {
  return request<{ shipment: Shipment }>('PUT', `/shipments/${shipmentId}/link`, undefined, true)
}

export async function updateShipment(shipmentId: string, data: {
  senderName?: string
  receiverName?: string
  origin?: string
  destination?: string
  mode?: 'AIR' | 'SEA'
  estimatedDelivery?: string
}): Promise<{ shipment: Shipment }> {
  return request<{ shipment: Shipment }>('PUT', `/shipments/${shipmentId}`, data, true)
}

export async function deleteShipment(shipmentId: string): Promise<{ message: string }> {
  return request<{ message: string }>('DELETE', `/shipments/${shipmentId}`, undefined, true)
}

// ─── Status helpers ─────────────────────────────────────────────────────────

export const ALL_STATUSES: ShipmentStatus[] = [
  'ORDER_CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED_AT_FACILITY',
  'CUSTOMS_CLEARANCE',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
]

export const STATUS_DISPLAY: Record<ShipmentStatus, string> = {
  ORDER_CREATED: 'Order Created',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_FACILITY: 'Arrived at Facility',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception/Delayed',
}

export const STATUS_META: Record<ShipmentStatus, { color: string; bg: string; dot: string; icon: string }> = {
  ORDER_CREATED:      { color: 'text-slate-600',   bg: 'bg-slate-100',   dot: 'bg-slate-400',   icon: '📋' },
  PICKED_UP:          { color: 'text-sky-700',     bg: 'bg-sky-100',     dot: 'bg-sky-500',     icon: '📦' },
  IN_TRANSIT:         { color: 'text-indigo-700',  bg: 'bg-indigo-100',  dot: 'bg-indigo-500',  icon: '✈️'  },
  ARRIVED_AT_FACILITY:{ color: 'text-purple-700',  bg: 'bg-purple-100',  dot: 'bg-purple-500',  icon: '🏭' },
  CUSTOMS_CLEARANCE:  { color: 'text-amber-700',   bg: 'bg-amber-100',   dot: 'bg-amber-500',   icon: '🛃' },
  OUT_FOR_DELIVERY:   { color: 'text-orange-700',  bg: 'bg-orange-100',  dot: 'bg-orange-500',  icon: '🚚' },
  DELIVERED:          { color: 'text-green-700',   bg: 'bg-green-100',   dot: 'bg-green-500',   icon: '✅' },
  EXCEPTION:          { color: 'text-red-700',     bg: 'bg-red-100',     dot: 'bg-red-500',     icon: '⚠️' },
}

// ─── Locations (autocomplete for shipment event location) ──────────────────

export interface Location {
  id: string
  name: string
  city: string
  country: string
  type: string
}

let locationsAbort: AbortController | null = null

export async function searchLocations(query: string, limit = 20): Promise<Location[]> {
  if (!query.trim()) return []
  if (locationsAbort) locationsAbort.abort()
  locationsAbort = new AbortController()
  try {
    const res = await fetch(`${BASE_URL}${API_PREFIX}/locations?search=${encodeURIComponent(query)}&limit=${limit}`, {
      signal: locationsAbort.signal,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to load locations')
    return (data.locations as Location[]) || []
  } catch (err) {
    if ((err as Error).name === 'AbortError') return []
    throw err
  }
}
