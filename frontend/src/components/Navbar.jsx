import { Link } from "react-router-dom";

const NavBar = ({ tabs }) => {
  
  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-yellow-400">
              FixMyCity
            </Link>
          </div>

          {/* Tabs */}
          <ul className="hidden md:flex space-x-6">
            {tabs.map((tab) => (
              <li key={tab.name} className="relative group">
                <Link
                  to={tab.path}
                  className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.name}</span>
                </Link>

                {/* Dropdown / Submenu */}
                <ul className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-400 invisible group-hover:visible z-50">
                  {tab.options && tab.options.map((option) => (
                    <li key={option.name}>
                      <Link
                        to={option.path}
                        className="block px-4 py-2 hover:bg-gray-700"
                      >
                        {option.name}
                      </Link>
                    </li>
                  ))}
                </ul>

              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
