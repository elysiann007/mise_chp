import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

const Home             = lazy(() => import('./pages/Home/Home'))
const MenuHub          = lazy(() => import('./pages/Menu/MenuHub'))
const HookahBuilder    = lazy(() => import('./pages/Menu/HookahBuilder/HookahBuilder'))
const FoodMenu         = lazy(() => import('./pages/Menu/FoodMenu/FoodMenu'))
const DrinksMenu       = lazy(() => import('./pages/Menu/DrinksMenu/DrinksMenu'))
const NonAlcoholicMenu = lazy(() => import('./pages/Menu/DrinksMenu/NonAlcoholicMenu'))
const AlcoholicMenu    = lazy(() => import('./pages/Menu/DrinksMenu/AlcoholicMenu'))
const About            = lazy(() => import('./pages/About/About'))
const NotFound         = lazy(() => import('./pages/NotFound/NotFound'))
const ChatBot          = lazy(() => import('./components/ChatBot/ChatBot'))
const CampaignPopup    = lazy(() => import('./components/CampaignPopup/CampaignPopup'))

function PageFallback() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
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
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      <Suspense fallback={null}>
        <CampaignPopup />
      </Suspense>
    </BrowserRouter>
  )
}
