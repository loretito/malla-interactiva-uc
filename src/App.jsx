import {
  Button,
  Navbar,
  Footer,
  Stats,
  Info,
  Malla,
  SettingsMenu,
  EditModeBanner,
} from "./components";

function App() {
  return (
    <>
      <Navbar />
      <EditModeBanner />
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-between mb-1">
          <Button />
          <SettingsMenu />
        </div>
        <Stats />
      </div>
      <Malla />
      <Info />
      <Footer />
    </>
  );
}

export default App;
