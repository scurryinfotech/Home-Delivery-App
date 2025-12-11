import React, { useState, useEffect } from "react";
import { Plus, Minus, Trash2, MapPin } from "lucide-react";
import { toast } from "react-toastify";

const CartModal = ({
  cart,
  updateCartQuantity,
  removeFromCart,
  handlePlaceOrder,
  selectedTable,
  setShowCart,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState("Home Delivery");
  const [instructions, setInstructions] = useState("");

  // Track which fields have errors
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    address: false,
  });

  // Load phone number from localStorage on component mount
  useEffect(() => {
    const savedPhone = localStorage.getItem("loginame");
    if (savedPhone) {
      setUserPhone(savedPhone);
    }
  }, []);

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };
  
  const handleFinalOrder = () => {
    // Check for validation errors
    const newErrors = {
      name: !customerName.trim(),
      phone: !/^[0-9]{10}$/.test(userPhone),
      address: deliveryType === "Home Delivery" && !address.trim(),
    };

    setErrors(newErrors);

    // If any errors exist, show alert and stop
    if (newErrors.name) {
      toast("Please enter your name");
      return;
    }
    if (newErrors.phone) {
      toast("Please enter a valid 10-digit phone number");
      return;
    }
    if (newErrors.address) {
      toast("Please enter delivery address");
      return;
    }

    localStorage.setItem("userPhone", userPhone);

  
    handlePlaceOrder({
      customerName,
      userPhone,
      address: deliveryType === "Home Delivery" ? address : null,
      deliveryType,
      instructions,
      table: selectedTable,
      cart,
    });
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">Your Cart</h2>
            <button
              onClick={() => setShowCart(false)}
              className="text-white hover:text-gray-200 text-xl sm:text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-3 sm:p-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
              Your cart is empty
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b gap-3 hover:bg-gray-50 px-2 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize">
                      {item.size} Portion
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 font-semibold">
                      Rs {item.price} × {item.quantity} = Rs{" "}
                      {item.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total Amount Section */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-l text-gray-800">
                    Total Amount:
                  </span>
                  <span className="text-sm text-green-600">
                    Rs {calculateTotal()}
                  </span>
                </div>
              </div>

              {/* User Details Form */}
              {showDetails ? (
                <div className="mt-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-gray-600 block mb-1">Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (e.target.value.trim()) {
                          setErrors((prev) => ({ ...prev, name: false }));
                        }
                      }}
                      placeholder="Enter your name"
                      className={`w-full p-3 border rounded-lg focus:ring-2 outline-none ${
                        errors.name
                          ? "border-red-500 focus:ring-red-400"
                          : "focus:ring-green-400"
                      }`}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-gray-600 block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setUserPhone(value);
                        if (value.length === 10) {
                          setErrors((prev) => ({ ...prev, phone: false }));
                        }
                      }}
                      placeholder="Enter your phone number"
                      className={`w-full p-3 border rounded-lg focus:ring-2 outline-none ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-400"
                          : "focus:ring-green-400"
                      }`}
                    />
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="text-gray-600 block mb-1">
                      Delivery Type
                    </label>
                    <div className="w-full p-3 border rounded-lg bg-gray-50">
                      Home Delivery
                    </div>
                  </div>

                  {/* Address (only if Home Delivery) */}
                  {deliveryType === "Home Delivery" && (
                    <div>
                      <label className="text-gray-600 block mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, address: false }));
                          }
                        }}
                        placeholder="Enter full address with landmark"
                        rows="3"
                        className={`w-full p-3 border rounded-lg focus:ring-2 outline-none ${
                          errors.address
                            ? "border-red-500 focus:ring-red-400"
                            : "focus:ring-green-400"
                        }`}
                      />
                    </div>
                  )}

                  {/* Special Instructions */}
                  <div>
                    <label className="text-gray-600 block mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="E.g. No onion, call on arrival"
                      rows="2"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                    />
                  </div>

                  <button
                    onClick={handleFinalOrder}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition"
                  >
                    Confirm & Place Order
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDetails(true)}
                  className="mt-4 w-full py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-teal-700 hover:to-teal-800"
                >
                  Place Order COD
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;