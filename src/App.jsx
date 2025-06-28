import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const Features = lazy(() => import('./Pages/Features'));
const KeyPointsGen = lazy(() => import('./Pages/KeyPointsGen'));
const About = lazy(() => import('./Pages/About'));

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Header />} />
            <Route path="/features" element={<Features />} />
            <Route path="/About" element={<About />} />
            <Route path="/KeyPointsGen" element={<KeyPointsGen />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Footer />
    </div>
  )
}

export default App;