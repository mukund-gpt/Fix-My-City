import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux';
import App from "./App";
import { store } from "./redux/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}> 
        <App />
        </Provider>
      </GoogleOAuthProvider>
    <Toaster position="top-right" reverseOrder={false} />
  </StrictMode>
);
