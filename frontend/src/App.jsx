import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUser } from "./features/auth/authSlice";
import axios from "axios";
import "./App.css";
import { Toaster } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Layout
import TopHeader from "./pages/TopHeader";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTopButton from "./components/ScrollToTopButton";

const App = () => {
  const dispatch = useDispatch();

  /* =========================
      LOAD USER (SINGLE SOURCE)
    ========================= */
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  /* =========================
      AXIOS INTERCEPTOR
    ========================= */
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const sessionId = sessionStorage.getItem("pellisco_session_id");

      if (sessionId) {
        config.headers["x-session-id"] = sessionId;
        config.headers["x-current-path"] = window.location.pathname;
      }

      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  /* =========================
      SESSION INITIALIZATION
    ========================= */
  useEffect(() => {
    const initializeSession = async () => {
      let sessionId = sessionStorage.getItem("pellisco_session_id");

      if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem("pellisco_session_id", sessionId);
      }

      try {
        await axios.post("/api/v1/analytics/pulse", {
          sessionId,
          currentPath: window.location.pathname,
          deviceInfo: {
            browser: navigator.userAgent,
            isMobile: /Mobi|Android/i.test(navigator.userAgent),
          },
        });
      } catch (err) {
        console.warn("Tracking pulse failed");
      }
    };

    initializeSession();
  }, []);

  return (
    <>
      <Toaster richColors position="top-right" />

      <Router>
        <div className="flex flex-col min-h-screen">
          <TopHeader />
          <Header />

          <main className="grow">
            <AppRoutes />
          </main>

          <ScrollToTopButton />
          <Footer />
        </div>
      </Router>
    </>
  );
};

export default App;
