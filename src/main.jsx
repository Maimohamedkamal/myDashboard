import "./i18n";
import 'leaflet/dist/leaflet.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
    import { Toaster } from 'react-hot-toast';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import App from './App.jsx'
import NumberContextProvider from './Components/Context/TokenContext.jsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
let queryclient=new QueryClient()


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NumberContextProvider>
<QueryClientProvider client={queryclient}>
    <App />
          <ReactQueryDevtools initialIsOpen={false} />

<Toaster position="top-center"  duration={5000}/>

</QueryClientProvider>

    </NumberContextProvider>

  </StrictMode>,
)
