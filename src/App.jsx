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
  Toast,
} from "./components";
import { CourseContext } from "./context/CourseContext";

function App() {
  const { editMode, toastMessage, clearToast } = useContext(CourseContext);

  return (
    <>
      <Navbar />
      <EditModeBanner />
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-between mb-1">
          <div
            className={
              editMode
                ? "pointer-events-none opacity-[0.12] grayscale blur-[0.4px]"
                : ""
            }
          >
            <Button />
          </div>
          <SettingsMenu />
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
