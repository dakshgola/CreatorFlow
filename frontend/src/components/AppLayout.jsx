import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="lg:pl-72">
        <Navbar />

        <main className="saas-container py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
