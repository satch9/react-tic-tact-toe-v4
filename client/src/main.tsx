import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SocketContextProvider } from './reducers/socketReducers.ts'

const initialSocketState = {
  socket: undefined,
  uid: "",
  users: []
};


ReactDOM.createRoot(document.getElementById('root')!).render(
  <SocketContextProvider value={{ SocketState: initialSocketState, SocketDispatch: () => { } }}>
    <App />
  </SocketContextProvider>
);
