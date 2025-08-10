import React, {useCallback, useState} from 'react'
import StartScreen from '../screens/StartScreen'
import Questionnaire from '../screens/Questionnaire'

type Route = { name: 'home' } | { name: 'questionnaire'; profileId?: string }

export function AppShell() {
  const [route, setRoute] = useState<Route>({name: 'home'})

  const goCreate = useCallback(() => setRoute({name: 'questionnaire'}), [])
  const goOpen = useCallback((profileId: string) => setRoute({name: 'questionnaire', profileId}), [])

  if (route.name === 'home') return <StartScreen onCreate={goCreate} onOpen={goOpen} />
  
  if (route.name === 'questionnaire') return <Questionnaire profileId={route.profileId} onBack={() => setRoute({name: 'home'})} />

  return null
}

export default AppShell


