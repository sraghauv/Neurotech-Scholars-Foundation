import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Home, About, Contact, Navbar, Submit, TxNT } from "./components";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
   return (
      <Router>
         <div>
            <Navbar />
            <div>
               <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/submit" element={<Submit />} />
                  <Route path="/TxNT" element={<TxNT />} />
               </Routes>
            </div>
         </div>
      </Router>
   );
};

export default App;
