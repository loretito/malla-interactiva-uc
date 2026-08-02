import { useContext } from "react";
import {
  Button,
  Navbar,
  Footer,
  Stats,
  Info,
  Malla,
  SettingsMenu,
  EditModeBanner,
  TypeColorEditor,
  Toast,
} from "./components";
import { CourseContext } from "./context/CourseContext";

function App() {
  const { editMode, toastMessage, clearToast } = useContext(CourseContext);

  return (
    <>
      <Navbar />
      <EditModeBanner />
      <div className="mx-auto max-w-[1360px] px-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div
            className={
              editMode
                ? "pointer-events-none opacity-[0.12] grayscale blur-[0.4px]"
                : ""
            }
          >
            <Button />
          </div>
          <div className="flex items-center gap-2">
            <TypeColorEditor />
            <SettingsMenu />
          </div>
        </div>
        <div
          className={
            editMode
              ? "pointer-events-none opacity-[0.12] grayscale blur-[0.4px]"
              : ""
          }
        >
          <Stats />
        </div>
      </div>
      <Malla />
      <Info />
      <Footer />
      <Toast message={toastMessage} onClose={clearToast} />
    </>
  );
}

export default App;
