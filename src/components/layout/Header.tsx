import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();

  const menus = [
    { to: "/", label: "Home" },
    { to: "/register-passkey", label: "Passkey" },
    { to: "/payment", label: "Payment" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          7702 Pay
        </Link>

        <nav className="nav">
          {menus.map((menu) => (
            <Link
              key={menu.to}
              to={menu.to}
              className={pathname === menu.to ? "nav-link active" : "nav-link"}
            >
              {menu.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
