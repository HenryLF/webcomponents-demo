import Alpine from "alpinejs";
import "./components/htmlViewer";
import "./components/darkMode";
Alpine.data("data", () => ({
  count: 0,
}));
Alpine.start();
