import { Outlet } from "react-router-dom";
import Header from "./Header";

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#181716] font-sans antialiased">
      <Header />
      <main className="min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;