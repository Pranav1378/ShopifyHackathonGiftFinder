import {useCallback} from 'react'
import { RecipientProfile } from '../types/quickPicker'

// Minimal async storage wrapper; prefer SDK hook if available
const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  async setItem<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

const LAST_USED_KEY = 'quickpicker:lastUsed'
const PROFILES_KEY = 'quickpicker:profiles'

export function useProfiles() {
  const listProfiles = useCallback(async (): Promise<RecipientProfile[]> => {
    const existing = await storage.getItem<RecipientProfile[]>(PROFILES_KEY)
    return existing ?? []
  }, [])

  const getLastUsed = useCallback(async () => {
    return (await storage.getItem<{profileId: string; budget?: number; occasion?: string; vibes?: string[]}>(LAST_USED_KEY)) ?? null
  }, [])

  const setLastUsed = useCallback(async (payload: {profileId: string; budget?: number; occasion?: string; vibes?: string[]}) => {
    await storage.setItem(LAST_USED_KEY, payload)
  }, [])

  const upsertProfiles = useCallback(async (profiles: RecipientProfile[]) => {
    await storage.setItem(PROFILES_KEY, profiles)
  }, [])

  return { listProfiles, getLastUsed, setLastUsed, upsertProfiles }
}

