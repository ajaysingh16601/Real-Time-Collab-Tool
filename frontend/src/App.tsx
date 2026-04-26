import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CollaborationRoom from './pages/CollaborationRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<CollaborationRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
