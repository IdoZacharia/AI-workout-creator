import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import ResultsPage from './ResultsPage';
import Footer from './Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-950">
        <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}


export default App