import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from './components/Sidebar.jsx'
import { ErrorToast } from './components/ErrorToast.jsx'
import { Skeleton } from './components/Skeleton.jsx'

const Classify = lazy(() => import('./pages/Classify.jsx'))
const Evaluate = lazy(() => import('./pages/Evaluate.jsx'))
const About = lazy(() => import('./pages/About.jsx'))

const Loader = () => (
  <div className="page"><Skeleton height="2rem" width="40%" /><br /><Skeleton width="70%" /></div>
)

export default function App() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  return (
    <div className="dom-root">
      <ErrorToast />
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menú"><i className="bx bx-menu" /></button>
      <div className={`overlay${open ? ' show' : ''}`} onClick={() => setOpen(false)} />
      <Sidebar isOpen={open} onToggle={() => setOpen((o) => !o)} />
      <div className={`content-page${open ? ' active' : ''}`}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Classify />} />
            <Route path="/evaluar" element={<Evaluate />} />
            <Route path="/modelo" element={<About />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}
