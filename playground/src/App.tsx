import { createSignal, useSignal } from "react-alien-signals";
import alienLogo from "./assets/alien.png";
import reactLogo from "./assets/react.svg";
import "./App.css";

const countSignal = createSignal(0);

function App() {
  const [count, setCount] = useSignal(countSignal);

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://github.com/stackblitz/alien-signals" target="_blank">
          <img src={alienLogo} className="logo" alt="Alien Signals logo" />
        </a>
      </div>
      <h1>React Alien Signals</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count: {count}
        </button>
        <p>
          This component subscribes to an Alien Signal through React.
        </p>
      </div>
      <p className="read-the-docs">
        React 19 with concurrency-safe external-store subscriptions.
      </p>
    </>
  );
}

export default App
