import { Outlet } from "react-router-dom";

// Note: Since we are using react-router RouterProvider in main.jsx, App.jsx might not be strictly needed as the root,
// but it's good to have an App component wrapping everything inside the Router context to use hooks or context providers.
function App() {
  return (
    <Outlet />
  );
}

export default App;
