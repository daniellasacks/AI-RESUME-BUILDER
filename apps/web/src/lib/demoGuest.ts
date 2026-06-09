import { DEMO_MODE, getToken, setToken } from './api'
import { loadState, saveState } from './demoStore'

export const DEMO_GUEST_ID = 'demo-guest-user'

/** Demo mode: silent guest session so the product works without sign-up */
export function ensureDemoGuest() {
  if (!DEMO_MODE || getToken()) return
  const state = loadState()
  if (!state.users.some((u) => u.id === DEMO_GUEST_ID)) {
    state.users.push({
      id: DEMO_GUEST_ID,
      email: 'guest@demo.local',
      fullName: 'Guest',
      passwordHash: 'guest',
    })
    saveState(state)
  }
  setToken(`demo:${DEMO_GUEST_ID}`)
}
