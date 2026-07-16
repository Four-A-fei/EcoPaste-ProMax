import { useClipboardWindowEditableFocus } from "@/hooks/useClipboardWindowEditableFocus";
import FilterBar from "./components/FilterBar";
import Footer from "./components/Footer";
import Group from "./components/Group";
import Header from "./components/Header";
import List from "./components/List";

const Clipboard = () => {
  useClipboardWindowEditableFocus();

  return (
    <div
      className="flex size-screen flex-col overflow-hidden bg-ant-container"
      data-tauri-drag-region
    >
      <Header />

      <div className="flex min-h-0 flex-1">
        <Group />

        <div className="flex min-w-0 flex-1 flex-col">
          <FilterBar />

          <List />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Clipboard;
