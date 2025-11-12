import React, { useState } from "react";

const Details = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for validation errors
    const newErrors = {
      name: !customerName.trim(),
      phone: userPhone.length !== 10,
      address: !address.trim(),
    };

    setErrors(newErrors);

    // If any errors exist, show alert and stop
    if (newErrors.name) {
      alert("Please enter your name");
      return;
    }
    if (newErrors.phone) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    if (newErrors.address) {
      alert("Please enter your delivery address");
      return;
    }

    // ✅ Send data to API
    const customerDetails = {
      name: customerName,
      phone: userPhone,
      address: address,
      deliveryType: deliveryType,
      instructions: instructions,
    };

    console.log("Sending to API:", customerDetails);
    // yahan API call karna hai
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold text-center text-gray-700">
          Enter Delivery Details
        </h2>

        {/* Name Input */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1">Name</label>
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
            className={`p-3 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.name
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-blue-400"
            }`}
          />
        </div>

        {/* Phone Input */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1">Phone</label>
          <div className="flex">
            <span className="flex items-center px-3 bg-gray-200 border border-r-0 rounded-l-lg text-gray-600">
              +91
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{10}"
              value={userPhone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setUserPhone(value);
                if (value.length === 10) {
                  setErrors((prev) => ({ ...prev, phone: false }));
                }
              }}
              placeholder="Enter 10-digit number"
              className={`flex-1 p-3 border rounded-r-lg focus:ring-2 outline-none ${
                errors.phone
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-green-400"
              }`}
            />
          </div>
        </div>

        {/* Address Input */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1">Delivery Address</label>
          <textarea
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, address: false }));
              }
            }}
            placeholder="Enter your full address with landmark"
            rows="3"
            className={`p-3 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.address
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-blue-400"
            }`}
          />
        </div>

        {/* Delivery Type */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1">Delivery Type</label>
          <select
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option>Home Delivery</option>
            <option>Pickup</option>
            <option>Dine-In</option>
          </select>
        </div>

        {/* Special Instructions */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1">Special Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="E.g. Call on arrival, No onions etc."
            rows="2"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
        >
          Confirm & Place Order
        </button>
      </div>
    </div>
  );
};

export default Details;
