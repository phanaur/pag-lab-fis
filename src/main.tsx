import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import "./style.css";

import App from "./App";
import MrInves from "./pages/mr/MrInves";
import Mru from "./pages/mr/Mru";
import Mrua from "./pages/mr/Mrua";
import Mcu from "./pages/mc/Mcu";
import Mcua from "./pages/mc/Mcua";
import Caili from "./pages/mr/Caili";
import Tiropar from "./pages/mr/Tiropar";
import Tirohor from "./pages/mr/Tirohor";
import Charges from "./pages/ef/Charges";
import EfInves from "./pages/ef/EfInves";
import Grav from "./pages/grav/Grav";
import GravInves from "./pages/grav/GravInves";
import Cables from "./pages/mag/Cables";
import MagInves from "./pages/mag/MagInves";

const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/mr/Inves", element: <MrInves /> },
    { path: "/mr/Mru", element: <Mru /> },
    { path: "/mr/Mrua", element: <Mrua /> },
    { path: "/mc/Mcu", element: <Mcu /> },
    { path: "/mc/Mcua", element: <Mcua /> },
    { path: "/mr/Caili", element: <Caili /> },
    { path: "/mr/Tiropar", element: <Tiropar /> },
    { path: "/mr/Tirohor", element: <Tirohor /> },
    { path: "/ef/Charges", element: <Charges /> },
    { path: "/ef/EfInves", element: <EfInves /> },
    { path: "/grav/Grav", element: <Grav /> },
    { path: "/grav/GravInves", element: <GravInves /> },
    { path: "/mag/Cables", element: <Cables /> },
    { path: "/mag/MagInves", element: <MagInves /> },
  ],
  {
    basename: "/pag-lab-fis",
  },
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
