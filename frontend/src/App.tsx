import { ThemeProvider } from "./components/ui/theme-provider";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}
