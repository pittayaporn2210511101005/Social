import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Pageone from './Pageone'
import Homepage from './Homepage'
import Dashboard from './Dashboard'


function App() {
  
const [isLoggedIn, setIsLoggedIn] = useState(false)/*เก็บสถานะว่าล็อกอินแล้วหรือยัง*/

  return (
    <>
       {isLoggedIn ? (
        <Homepage />
      ) : (
        <Pageone onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  )
}

export default App
