import reactLogo from './assets/react.svg'
import alienLogo from './assets/alien.png'
import viteLogo from '/vite.svg'
import { createSignal, createEffect, useSignalScope } from "react-alien-signals";
import './App.css'
import { useSignal } from 'react-alien-signals';


const countSignal = createSignal(0);

function App() {

  const [count, setCount] = useSignal(countSignal)

  useSignalScope(() => {
    createEffect(() => {
      console.log('Count changed:', countSignal());
    });
  });

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://github.com/stackblitz/alien-signals" target='_blank'>
          <img src={alienLogo} className="logo" alt="Alien logo" />
        </a>
      </div>
      <h1>Vite + React + Signals</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
