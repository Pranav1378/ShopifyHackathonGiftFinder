import React, {useCallback, useState} from 'react'
import StartScreen from '../screens/StartScreen'
import Questionnaire from '../screens/Questionnaire'
import { SearchResults } from '../components/SearchResults'

type Route =
  | { name: 'home' }
  | { name: 'questionnaire'; profileId?: string }
  | { name: 'results'; llmOutput: unknown; profileId?: string }

export function AppShell() {
  const [route, setRoute] = useState<Route>({name: 'home'})

  const goCreate = useCallback(() => setRoute({name: 'questionnaire'}), [])
  const goOpen = useCallback((profileId: string) => setRoute({name: 'questionnaire', profileId}), [])

  if (route.name === 'home') return <StartScreen onCreate={goCreate} onOpen={goOpen} />
  
  if (route.name === 'questionnaire') return (
    <Questionnaire
      profileId={route.profileId}
      onBack={() => setRoute({name: 'home'})}
      onSuccess={(llmOutput) => setRoute({ name: 'results', llmOutput, profileId: route.profileId })}
    />
  )

  if (route.name === 'results') return (
    <div className="pt-16 px-4">
      <SearchResults
        llmOutput={route.llmOutput}
        profileId={route.profileId}
        onBackToQuestionnaire={() => setRoute({ name: 'questionnaire', profileId: route.profileId })}
      />
    </div>
  )

  return null
}

export default AppShell


