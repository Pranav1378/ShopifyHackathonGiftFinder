import React, {useCallback, useState} from 'react'
import StartScreen from '../screens/StartScreen'
import Questionnaire from '../screens/Questionnaire'
import { SearchResults } from '../components/SearchResults'
import ErrorBoundary from '../components/ui/ErrorBoundary'

type Route =
  | { name: 'home' }
  | { name: 'questionnaire'; profileId?: string }
  | { name: 'results'; llmOutput: unknown }

export function AppShell() {
  const [route, setRoute] = useState<Route>({name: 'home'})

  const goCreate = useCallback(() => setRoute({name: 'questionnaire'}), [])
  const goOpen = useCallback((profileId: string) => setRoute({name: 'questionnaire', profileId}), [])

  if (route.name === 'home') return <StartScreen onCreate={goCreate} onOpen={goOpen} />
  
  if (route.name === 'questionnaire') return (
    <Questionnaire
      profileId={route.profileId}
      onBack={() => setRoute({name: 'home'})}
      onSuccess={(llmOutput) => setRoute({ name: 'results', llmOutput })}
    />
  )

  if (route.name === 'results') return (
    <div className="pt-16 px-4">
      <ErrorBoundary>
        <SearchResults llmOutput={route.llmOutput} />
      </ErrorBoundary>
      <div className="mt-8 text-center">
        <button className="text-sm text-blue-600" onClick={() => setRoute({name: 'home'})}>Back to start</button>
      </div>
    </div>
  )

  return null
}

export default AppShell

