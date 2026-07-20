import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

const importMenuHub          = () => import('./pages/Menu/MenuHub')
const importHookahBuilder    = () => import('./pages/Menu/HookahBuilder/HookahBuilder')
const importFoodMenu         = () => import('./pages/Menu/FoodMenu/FoodMenu')
const importDrinksMenu       = () => import('./pages/Menu/DrinksMenu/DrinksMenu')
const importNonAlcoholicMenu = () => import('./pages/Menu/DrinksMenu/NonAlcoholicMenu')
const importAlcoholicMenu    = () => import('./pages/Menu/DrinksMenu/AlcoholicMenu')
const importAbout            = () => import('./pages/About/About')

const Home             = lazy(() => import('./pages/Home/Home'))
const MenuHub          = lazy(importMenuHub)
const HookahBuilder    = lazy(importHookahBuilder)
const FoodMenu         = lazy(importFoodMenu)
const DrinksMenu       = lazy(importDrinksMenu)
const NonAlcoholicMenu = lazy(importNonAlcoholicMenu)
const AlcoholicMenu    = lazy(importAlcoholicMenu)
const About            = lazy(importAbout)
const NotFound         = lazy(() => import('./pages/NotFound/NotFound'))
const ChatBot          = lazy(() => import('./components/ChatBot/ChatBot'))

function useRoutePrefetch() {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
    const id = idle(() => {
      for (const importFn of [importMenuHub, importHookahBuilder, importFoodMenu, importDrinksMenu, importNonAlcoholicMenu, importAlcoholicMenu, importAbout]) {
        importFn()
      }
    })
    return () => (window.cancelIdleCallback ?? clearTimeout)(id)
  }, [])
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 dark:border-amber-400/30 border-t-amber-500 dark:border-t-amber-400 animate-spin" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<PageFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuHub />} />
          <Route path="/menu/hookah" element={<HookahBuilder />} />
          <Route path="/menu/food" element={<FoodMenu />} />
          <Route path="/menu/drinks" element={<DrinksMenu />} />
          <Route path="/menu/drinks/nonalcoholic" element={<NonAlcoholicMenu />} />
          <Route path="/menu/drinks/alcoholic" element={<AlcoholicMenu />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default function App() {
  useRoutePrefetch()
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </BrowserRouter>
  )
}
