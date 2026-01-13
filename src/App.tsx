import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { StatusBar } from "./components/layout/StatusBar";
import { FileList } from "./components/file-list/FileList";
import { ImagePreview } from "./components/preview/ImagePreview";
import { LogViewer } from "./components/layout/LogViewer";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Header />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          <FileList />
        </main>
      </div>

      <StatusBar />
      <ImagePreview />
      <LogViewer />
    </div>
  );
}

export default App;
