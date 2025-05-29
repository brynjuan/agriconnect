import Link from "next/link";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-accent-50/30">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
