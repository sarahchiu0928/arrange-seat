import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const router = createBrowserRouter(
  [
    {
      path: '/',
      children: [
        { index: true, element: <Navigate to="/arrange-seat" replace /> },
        { path: '/arrange-seat', element: <App /> },
        { path: '*', element: <Navigate to="/arrange-seat" replace /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
