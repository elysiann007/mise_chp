import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home/Home'
import MenuHub from './pages/Menu/MenuHub'
import HookahBuilder from './pages/Menu/HookahBuilder/HookahBuilder'
import FoodMenu from './pages/Menu/FoodMenu/FoodMenu'
import DrinksMenu from './pages/Menu/DrinksMenu/DrinksMenu'
import About from './pages/About/About'
import NotFound from './pages/NotFound/NotFound'
import ChatBot from './components/ChatBot/ChatBot'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuHub />} />
        <Route path="/menu/hookah" element={<HookahBuilder />} />
        <Route path="/menu/food" element={<FoodMenu />} />
        <Route path="/menu/drinks" element={<DrinksMenu />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
      <ChatBot />
    </BrowserRouter>
  )
}
