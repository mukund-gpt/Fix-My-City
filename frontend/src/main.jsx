import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux';
import App from "./App.jsx";
import "./index.css";
import { store } from './redux/store';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      </Provider>
    <Toaster position="top-right" reverseOrder={false} />
  </StrictMode>
);
