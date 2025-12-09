import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import noOrdersImage from "../assets/image.png";
import OrderCountdownTimer from "./OrderCountdownTimer";

const OrderHistory = ({ onClose, selectedTable, tableNo }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    const fetchInterval = setInterval(fetchOrders, 30000);
    return () => clearInterval(fetchInterval);
  }, []);

  const getTableNumber = () => {
    return (
      tableNo ||
      selectedTable?.TableNo ||
      selectedTable?.tableNo ||
      selectedTable?.id ||
      selectedTable
    );
  };

  const sortOrders = (ordersArray) => {
    return ordersArray.sort((a, b) => {
      // Priority order: 1 (Order Placed) > 2 (Preparing) > 3 (Delivered)
      const statusPriority = {
        1: 1, // Highest priority - Order Placed
        2: 2, // Medium priority - Preparing
        3: 3, // Lowest priority - Delivered
        4: 4  // Cancelled orders at the end
      };

      const priorityA = statusPriority[a.orderStatusId] || 5;
      const priorityB = statusPriority[b.orderStatusId] || 5;

      // First sort by status priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same status, sort by creation date (newer first)
      const dateA = new Date(a.createdDate || 0);
      const dateB = new Date(b.createdDate || 0);
      return dateB - dateA;
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkdyaWxsX05fU2hha2VzIiwibmJmIjoxNzU5MTMyMzY3LCJleHAiOjE3NjY5MDgzNjcsImlhdCI6MTc1OTEzMjM2N30.ko8YPHfApg0uN0k3kUTLcJXpZp-2s-6TiRHpsiab42Q";
      const actualTableNo = getTableNumber();
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `https://yyadavrrohit-001-site4.rtempurl.com/api/Order/GetOrderHome?${
          userId ? `&userId=${userId}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      const ordersArray = Array.isArray(data) ? data : [];

      const filteredOrders = actualTableNo
        ? ordersArray.filter((order) => {
            const orderTableNo =
              order.tableNo || order.TableNo || order.table_no;
            return orderTableNo == actualTableNo;
          })
        : ordersArray;

      // Sort orders before setting state - show all orders including delivered ones
      const sortedOrders = sortOrders(filteredOrders);
      setOrders(sortedOrders);
    } catch (err) {
      // setError("Failed to load orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      1: "bg-yellow-500",
      2: "bg-blue-500",
      3: "bg-blue-500",
      4: "bg-emerald-500",
      5: "bg-red-500",
    };
    return colors[status] || "bg-slate-400";
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Waiting to accept order.";
      case 2:
        return "Preparing..";
      case 3:
        return "Out for delivery.";
      case 4:
        return "Delivered.";
      default:
        return "Cancelled.";
    }
  };

  const calculateTotalPrice = (order) => {
    const basePrice = order.price || 0;
    const quantity =
      order.fullPortion || order.halfPortion || order.quantity || 1;
    return basePrice * quantity;
  };

  const formatPortionText = (order) => {
    if (order.fullPortion) {
      return `${order.fullPortion} Full Portion${
        order.fullPortion > 1 ? "s" : ""
      }`;
    }
    if (order.halfPortion) {
      return `${order.halfPortion} Half Portion${
        order.halfPortion > 1 ? "s" : ""
      }`;
    }
    const qty = order.quantity || 0;
    return `${qty} portion${qty > 1 ? "s" : ""}`;
  };

  const getOrderId = () => {
    if (orders.length === 0) return "#OrderId";
    return `#${orders[0].orderId || orders[0].OrderId || "N/A"}`;
  };

  const getProgressSteps = (status) => {
    const steps = [
      { label: "Order Placed", time: "", status: 1 },
      { label: "Preparing", time: "", status: 2 },
      { label: "Out for delivery", time: "", status: 3 },
      { label: "Delivered", time: "", status: 4 },
      { label: "Cancelled", time: "", status: 5 },
    ];

    return steps.map((step) => ({
      ...step,
      completed: status >= step.status,
    }));
  };

  // Order Detail View
  if (selectedOrder) {
    const progress = getProgressSteps(selectedOrder.orderStatusId);
    const currentStepIndex =
      selectedOrder.orderStatusId === 1
        ? 0
        : selectedOrder.orderStatusId === 2
        ? 2
        : 3;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="flex justify-between items-center p-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <h1 className="text-lg font-bold">Grill N Shakes</h1>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[75vh]">
            {/* Order Info */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">
                  Order #{selectedOrder.orderId || selectedOrder.OrderId}
                </span>
                <span className="text-lg font-bold">
                  ₹{calculateTotalPrice(selectedOrder)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Placed at {selectedOrder.createdDate || "N/A"}
              </div>
            </div>

            {/* Status Banner */}
            <div className="bg-orange-50 p-4 mx-4 mt-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <div className="bg-orange-100 p-2 rounded">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  
                  {selectedOrder.orderStatusId === 2 ? (
                    <OrderCountdownTimer
                      modifiedDate={selectedOrder.modifiedDate}
                      durationMinutes={10}
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      {getStatusText(selectedOrder.orderStatusId)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{}</p>
            </div>

            {/* Order Items */}
            <div className="p-4">
              <h3 className="font-semibold mb-3">Your Order</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{selectedOrder.itemName}</p>
                    <p className="text-sm text-gray-500">
                      {formatPortionText(selectedOrder)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₹{calculateTotalPrice(selectedOrder)}
                  </p>
                </div>

                {selectedOrder.specialInstructions && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">
                      Special Instructions:
                    </p>
                    <p className="text-sm text-yellow-700">
                      {selectedOrder.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{calculateTotalPrice(selectedOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Charge</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>₹{calculateTotalPrice(selectedOrder) + 0}</span>
                </div>
              </div>
            </div>

            {/* Order Progress */}
            <div className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">Order Progress</h3>
              <div className="relative">
                {progress.map((step, index) => (
                  <div key={index} className="flex mb-6 last:mb-0">
                    <div className="relative flex flex-col items-center mr-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-green-500"
                            : index === currentStepIndex
                            ? "bg-orange-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {step.completed ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      {index < progress.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            progress[index + 1].completed
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${
                          step.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.time && (
                        <p className="text-sm text-gray-500">{step.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Order List View
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 ml-3">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-bold">Orders</h1>
          <span className="text-gray-400 text-sm">{getOrderId()}</span>
          <button
            onClick={onClose}
            className="px-6 py-2 font-bold bg-gray-200 text-black rounded hover:bg-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[75vh]">
          {error ? (
            <div className="text-center p-4">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-48 h-48 bg-gray-200 rounded-lg mb-5 flex items-center justify-center">
                <img
                  src={noOrdersImage}
                  alt="No orders available"
                  className="w-48 h-auto mb-5"
                />
              </div>
              <p className="text-gray-500 text-lg">You haven't Ordered Yet!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, index) => {
                const orderId = order.Id || order.id || index;
                const status = order.orderStatusId;

                return (
                  <div
                    key={orderId}
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white border hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                  >
                    <div
                      className={`w-2 h-16 rounded-full ${getStatusColor(
                        status
                      )}`}
                    />

                    <div className="flex-1 ml-4">
                      <h2 className="font-semibold text-gray-900">
                        {order.itemName || "Item Name"},{" "}
                        {formatPortionText(order)}
                      </h2>

                      <p className="text-sm font-medium text-green-600 mt-1">
                        Price: ₹{calculateTotalPrice(order)}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded text-white text-sm font-medium ${getStatusColor(
                        status
                      )}`}
                    >
                      {getStatusText(status)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default OrderHistory;