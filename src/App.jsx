import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Calculator from "./Pages/Calculator";
import Module2 from "./Pages/Module2";
import AdminLayout from "./Pages/AdminLayout";
import AdminRoutes from "./components/admin/AdminRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/calculator" element={<Calculator page="BOMCalc" />} />
          <Route path="/drawing" element={<Calculator page="Drawing" />} />
          <Route path="/module2" element={<Module2 page="index" />} />
        </Route>

        

        {/* Admin Layout */}
        <Route path="/admin/*" element={<AdminRoutes />}/>
          
      </Routes>
    </BrowserRouter>
  );
};

export default App;
