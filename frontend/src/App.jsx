import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import ResultsPage from './ResultsPage';
import Footer from './Footer';

function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-950">
        <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="*" element={<Home />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}


export default App