import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import axios from "axios";

axios.defaults.withCredentials = true;

import "./index.css";
import App from "./App.jsx";
import { store, persistor } from "./app/store.jsx";

// Styles
import "react-toastify/dist/ReactToastify.css";

// 1. Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 2. Render Application
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* PersistGate prevents App from mounting until Redux state is restored */}
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <App />

        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          theme="light"
          toastStyle={{
            backgroundColor: "#FAF9F6",
            color: "#2C3327",
            fontFamily: "Poppins, sans-serif",
            fontSize: "12px",
            letterSpacing: "0.05em",
            borderLeft: "4px solid #9BA17B",
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
