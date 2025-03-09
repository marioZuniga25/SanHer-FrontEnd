import { Landing } from "./components/Landing";
import LoginRegister from "./components/LoginRegister";
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import { NotFound } from "./components/NotFound";

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/landing/*" element={<Landing />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;