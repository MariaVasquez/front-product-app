import { Home } from './pages/Home';
import { Header } from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="p-6">
        <Home />
      </main>
    </div>
  );
}

export default App;