import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { persistor, store } from "./redux/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}> 
        <PersistGate loading={null} persistor={persistor}>
          <App />
          <Toaster position="bottom-right" reverseOrder={false} />
        </PersistGate>
        </Provider>
      </GoogleOAuthProvider>
    <Toaster position="top-right" reverseOrder={false} />
  </StrictMode>
);
