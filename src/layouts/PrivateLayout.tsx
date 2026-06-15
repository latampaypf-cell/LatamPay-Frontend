import { Outlet } from "react-router-dom";
import { PrivateNavbar } from "../components/navbar/PrivateNavbar";
import { FloatingChatButton } from "../components/chatbot/FloatingChatButton";

export function PrivateLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header>
        <PrivateNavbar />
      </header>

      <main className="pt-20">
        <Outlet />
      </main>

      <FloatingChatButton />
    </div>
  );
}

export default PrivateLayout;
