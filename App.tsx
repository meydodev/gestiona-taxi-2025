import { StatusBar } from "expo-status-bar";
import Routes from "./src/app/navigation/Routes";

export default function App() {
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <Routes />
    </>
  );
}
