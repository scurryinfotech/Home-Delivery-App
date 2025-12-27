import React, { useState, useEffect } from "react";
import { Plus, Minus, Trash2, MapPin, Truck, AlertCircle, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";

const CartModal = ({
  cart,
  updateCartQuantity,
  removeFromCart,
  handlePlaceOrder,
  selectedTable,
  setShowCart,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showAddressSection, setShowAddressSection] = useState(false); // New state for collapsible
  const [customerName, setCustomerName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState("Home Delivery");
  const [instructions, setInstructions] = useState("");

  // Constants for delivery
  const MIN_ORDER_AMOUNT = 150;
  const DELIVERY_CHARGE = 0;

  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    address: false,
    location: false,
  });

  const showToast = (message) => {
    alert(message);
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem("loginame");
    const savedAddress = localStorage.getItem("Address");
    if (savedAddress && savedAddress !== "undefined") {
      setAddress(savedAddress);
    } else {
      setAddress("");
    }
    if (savedPhone) {
      setUserPhone(savedPhone);
    }
  }, []);

  // Calculate subtotal amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const subtotal = calculateTotal();
  const canProceed = subtotal >= MIN_ORDER_AMOUNT;
  const amountNeededForMinOrder = MIN_ORDER_AMOUNT - subtotal;
  const finalTotal = subtotal;

  const handleProceedToDetails = () => {
    if (!canProceed) {
      showToast(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add ₹${amountNeededForMinOrder} more to proceed.`);
      return;
    }
    setShowDetails(true);
  };

  const handleFinalOrder = () => {
    // Check minimum order amount first
    if (!canProceed) {
      showToast(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add ₹${amountNeededForMinOrder} more.`);
      return;
    }

    // Validate if address contains valid location
    const normalizedAddress = (address || "").trim();
    const isValidLocation = deliveryType === "Home Delivery"
      ? /ulwe|kharkopar|bamandongri/i.test(normalizedAddress)
      : true;

    // Check for validation errors
    const newErrors = {
      name: !customerName.trim(),
      phone: !/^[0-9]{10}$/.test(userPhone),
      address: deliveryType === "Home Delivery" && !normalizedAddress,
      location: deliveryType === "Home Delivery" && normalizedAddress && !isValidLocation,
    };

    setErrors(newErrors);

    // If any errors exist, show alert and stop
    if (newErrors.name) {
      showToast("Please enter your name");
      return;
    }
    if (newErrors.phone) {
      showToast("Please enter a valid 10-digit phone number");
      return;
    }
    if (newErrors.address) {
      showToast("Please enter delivery address");
      return;
    }
    if (newErrors.location) {
      showToast("Sorry! We only deliver to Ulwe, Kharkopar, Bamandongri, Navi Mumbai");
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
      subtotal: subtotal,
      deliveryCharge: DELIVERY_CHARGE,
      finalTotal: finalTotal,
    });
  };
  return (
    <div className="fixed inset-0 bg-teal bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto shadow-xl">
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
                    <p className="text-xs sm:text-sm text-black font-semibold">
                      ₹ {item.price * item.quantity}
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
              <div className={`mt-4 p-3 rounded-lg ${
                canProceed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {canProceed ? (
                    <ShoppingBag size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-grow">
                    {canProceed ? (
                      <>
                        <p className="font-semibold text-green-800 text-sm">
                           Ready to Place Order!
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Your order meets the minimum amount of ₹{MIN_ORDER_AMOUNT}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-red-800 text-sm">
                           Minimum Order: ₹{MIN_ORDER_AMOUNT}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          Add ₹{amountNeededForMinOrder} more to place your order
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {!canProceed && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((subtotal / MIN_ORDER_AMOUNT) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-right">
                      ₹{subtotal} / ₹{MIN_ORDER_AMOUNT}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">₹{subtotal}</span>
                </div>
                
                {/* <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Delivery Charge:</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div> */}

                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-base text-gray-800 font-semibold">Total Amount:</span>
                  <span className="text-xl text-black font-bold">₹{finalTotal}</span>
                </div>
              </div>

              {/* User Details Form */}
              {showDetails ? (
                <div className="mt-4 space-y-4">
                   {/* Special Instructions */}
                  <div>
                    <label className="text-gray-700 font-medium block mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="E.g. No onion, extra spicy, call on arrival"
                      rows="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                    />
                  </div>
                  
                  {/* Name */}
                  <div>
                    <label className="text-gray-700 font-medium block mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                        errors.name
                          ? "border-red-500 focus:ring-red-400 bg-red-50"
                          : "border-gray-300 focus:ring-green-400"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        Name is required
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-gray-700 font-medium block mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
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
                      placeholder="Enter 10-digit phone number"
                      className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-400 bg-red-50"
                          : "border-gray-300 focus:ring-green-400"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        Please enter a valid 10-digit phone number
                      </p>
                    )}
                  </div>

                  {/* Collapsible Address Section (only if Home Delivery) */}
                  {deliveryType === "Home Delivery" && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Header - Click to expand/collapse */}
                      <button
                        type="button"
                        onClick={() => setShowAddressSection(!showAddressSection)}
                        className={`w-full p-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 transition-all ${
                          errors.address || errors.location ? 'border-l-4 border-red-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="text-green-600" size={20} />
                          <span className="text-gray-700 font-medium">
                            Delivery Address <span className="text-red-500">*</span>
                          </span>
                          {(address || "").trim() && !errors.address && !errors.location && (
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                              Added ✓
                            </span>
                          )}
                        </div>
                        {showAddressSection ? (
                          <ChevronUp className="text-gray-600" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-600" size={20} />
                        )}
                      </button>

                      {/* Collapsible Content */}
                      {showAddressSection && (
                        <div className="p-4 bg-white">
                          <textarea
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, address: false }));
                              }
                              // Check if location is valid
                              if (/ulwe|kharkopar|bamandongri/i.test(e.target.value)) {
                                setErrors((prev) => ({ ...prev, location: false }));
                              }
                            }}
                            placeholder="Enter your complete address in Ulwe, Kharkopar or Bamandongri, Navi Mumbai"
                            rows="3"
                            className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                              errors.address || errors.location
                                ? "border-red-500 focus:ring-red-400 bg-red-50"
                                : "border-gray-300 focus:ring-green-400"
                            }`}
                          />
                          {errors.address && (
                            <p className="text-red-500 text-sm mt-1">
                              Address is required
                            </p>
                          )}
                          {errors.location && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <MapPin size={14} />
                              Please enter an address in Ulwe, Kharkopar or Bamandongri, Navi Mumbai
                            </p>
                          )}
                          <p className="text-green-600 text-xs mt-2 font-medium flex items-center gap-1">
                            <MapPin size={12} />
                            Delivery available in Ulwe, Kharkopar, Bamandongri area only
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleFinalOrder}
                    disabled={!canProceed}
                    className={`w-full py-3 rounded-lg font-semibold shadow-md transition ${
                      canProceed
                        ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {canProceed 
                      ? `Confirm & Place Order - ₹${finalTotal}`
                      : `Minimum Order ₹${MIN_ORDER_AMOUNT} Required`
                    }
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleProceedToDetails}
                  disabled={!canProceed}
                  className={`mt-4 w-full py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md transition-all duration-200 ${
                    canProceed
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canProceed 
                  ? `Place Order - ₹${finalTotal} (COD)`
                  : `Add ₹${amountNeededForMinOrder} more (Min ₹${MIN_ORDER_AMOUNT})`
                  }
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