import App from "./App";
import { FilesystemPage } from "./Components/filesystem/FilesystemPage";

export default function AppRouter() {
  const pathname = window.location.pathname;
  if (pathname === "/filesystem") {
    return <FilesystemPage />;
  }

  return <App />;
}

