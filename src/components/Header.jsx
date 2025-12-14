import React from 'react';
import { ShoppingCart, Home } from 'lucide-react';

const Header = ({ getCartItemCount, setShowCart,user, onLogout }) => (
  <header className="sticky top-0 bg-white z-50 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-3 sm:p-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      {/* Left side - Home Delivery Button */}
      {/* <button
        onClick={onDeliveryClick}
        className="bg-teal-500 hover:bg-teal-800 px-2 py-2 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shadow-md"
      >

        <Home size={16} className="sm:w-5 sm:h-5"/>
        <span className="hidden sm:inline">Delivery</span>
      </button> */}
      
       <a href="tel:+918928484618">
       <button className="bg-teal-500 hover:bg-teal-800 px-2 py-2 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shadow-md"
       >Need Help? Click Me</button>
       </a>

      {/* Center - Restaurant Name */}
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex-1 text-center">GNS Home Delivery</h1>
      
      {/* Right side - Cart Button */}


      <button
        onClick={() => setShowCart(true)}
        className="relative bg-white text-teal-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base shadow-md"
      >
        <ShoppingCart size={16} className="sm:w-5 sm:h-5"/>
        <span className="hidden sm:inline">Cart</span>
        {getCartItemCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
            {getCartItemCount()}
          </span>
        )}
      </button>
       <div className="flex items-center gap-3">
          {user && <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>}
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 ml-2 sm:px-4 sm:py-2  rounded-lg text-sm transition duration-200"
          >
            Logout
          </button>
        </div>
    </div>  
  </header>
);

export default Header;