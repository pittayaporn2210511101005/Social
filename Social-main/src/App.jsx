// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Homepage from "./Homepage";
import Dashboard from "./Dashboard";
//import Sentiment from "./Sentiment";
import Trends from "./Trends";
import Settings from "./Settings";
import Pageone from "./Pageone";
import KeywordSentimentPage from "./pages/KeywordSentimentPage";

function RequireAuth({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
      <Router>
        <Routes>
          {/* เริ่มที่ login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={
            <Pageone onLogin={() => setIsLoggedIn(true)} />
          } />

          <Route
            path="/mentions"
            element={
              <RequireAuth isLoggedIn={isLoggedIn}>
                {console.log("isLoggedIn:", isLoggedIn)} {/* ✅ debug */}
                <Homepage />
              </RequireAuth>
            }
          />
          <Route
              path="/dashboard"
              element={
                <RequireAuth isLoggedIn={isLoggedIn}>
                  <Dashboard />
                </RequireAuth>
              }
          />

          <Route
              path="/trends"
              element={
                <RequireAuth isLoggedIn={isLoggedIn}>
                  <Trends />
                </RequireAuth>
              }
          />
          <Route
              path="/settings"
              element={
                <RequireAuth isLoggedIn={isLoggedIn}>
                  <Settings />
                </RequireAuth>
              }
          />
          {/* พจนานุกรมคำพูด / Keyword Sentiment */}
        <Route
          path="/keyword-sentiment"
          element={
            <RequireAuth isLoggedIn={isLoggedIn}>
              <KeywordSentimentPage />
            </RequireAuth>
          }
        />

          {/* กันกรณี path แปลก */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
  );
}
