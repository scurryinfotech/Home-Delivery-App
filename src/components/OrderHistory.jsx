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
    if (!selectedOrder) return;

    const updatedOrder = orders.find(
      (o) => o.orderId === selectedOrder.orderId
    );

    if (updatedOrder) {
      setSelectedOrder(updatedOrder); 
    }
  }, [orders])

  useEffect(() => {
    fetchOrders();
    const fetchInterval = setInterval(fetchOrders, 15000);
    return () => clearInterval(fetchInterval);
  }, []);

  debugger;

  const getTableNumber = () => {
    return (
      tableNo ||
      selectedTable?.TableNo ||
      selectedTable?.tableNo ||
      selectedTable?.id ||
      selectedTable
    );
  };

  // NEW: Group orders by orderId
  const groupOrdersByOrderId = (ordersArray) => {
    const grouped = {};

    ordersArray.forEach(order => {
      const orderId = order.orderId || order.OrderId;
      if (!grouped[orderId]) {
        grouped[orderId] = {
          orderId: orderId,
          orderStatusId: order.orderStatusId,
          createdDate: order.createdDate,
          modifiedDate: order.modifiedDate,
          tableNo: order.tableNo || order.TableNo,
          items: [],
          discount: order.discount
        };
      }
      grouped[orderId].items.push(order);
    });

    // Determine the overall status for each order group
    Object.values(grouped).forEach(group => {
      group.orderStatusId = determineOrderStatus(group.items);
    });

    return Object.values(grouped);
  };

  // NEW: Determine overall order status based on all items
  const determineOrderStatus = (items) => {
    const statuses = items.map(item => item.orderStatusId);

    // If any item is cancelled, check if all are cancelled
    const allCancelled = statuses.every(s => s === 5);
    if (allCancelled) return 5;

    // If all items are delivered (ignoring cancelled ones)
    const nonCancelledStatuses = statuses.filter(s => s !== 5);
    if (nonCancelledStatuses.length > 0) {
      const allDelivered = nonCancelledStatuses.every(s => s === 4);
      if (allDelivered) return 4;

      // If any item is still being prepared or waiting, use the lowest status
      const minStatus = Math.min(...nonCancelledStatuses);
      return minStatus;
    }

    // Default to the first item's status
    return items[0].orderStatusId;
  };

  const sortOrders = (ordersArray) => {
    return ordersArray.sort((a, b) => {
      // Priority order: 1 (Order Placed) > 2 (Preparing) > 3 (Delivered)
      const statusPriority = {
        1: 1, // Highest priority - Order Place
        2: 2, // Medium priority - Preparin
        3: 3, // Lowest priority - Delivere
        4: 4  // Cancelled orders at the en
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
        `https://localhost:7104/api/Order/GetOrderHome?${userId ? `&userId=${userId}` : ""
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

      // NEW: Group orders by orderId, then sort
      const groupedOrders = groupOrdersByOrderId(filteredOrders);
      const sortedOrders = sortOrders(groupedOrders);
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

  // NEW: Calculate total price for all items in grouped order (excluding cancelled items)
  const calculateGroupTotalPrice = (groupedOrder) => {
    return groupedOrder.items.reduce((total, item) => {
      // Don't add price for cancelled items
      if (item.orderStatusId === 5) return total;
      return total + calculateTotalPrice(item);
    }, 0);
  };

  const formatPortionText = (order) => {
    if (order.fullPortion) {
      return `${order.fullPortion} Full Portion${order.fullPortion > 1 ? "s" : ""
        }`;
    }
    if (order.halfPortion) {
      return `${order.halfPortion} Half Portion${order.halfPortion > 1 ? "s" : ""
        }`;
    }
    const qty = order.quantity || 0;
    return `${qty} portion${qty > 1 ? "s" : ""}`;
  };

  const getOrderId = () => {
    if (orders.length === 0) return "#OrderId";
    return `#${orders[0].orderId || "N/A"}`;
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

    const totalPrice = calculateGroupTotalPrice(selectedOrder);

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
                  Order #{selectedOrder.orderId}
                </span>
                <span className="text-lg font-bold">
                  ₹{totalPrice}
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
                  {/* {selectedOrder.orderStatusId === 2 ? (
                    <OrderCountdownTimer
                      modifiedDate={selectedOrder.modifiedDate}
                      durationMinutes={10}
                    />
                  ) : {( */}
                  <div>
                    <p className="text-sm text-gray-600">
                      {getStatusText(selectedOrder.orderStatusId)}
                    </p>
                    <p className="text-xs font-medium text-yellow-800">
                      Special Instructions:
                    </p>
                    <p className="text-xs text-yellow-700">
                      <p className="text-xs text-yellow-700">
                        {selectedOrder.items.find(i => i.specialInstructions)?.specialInstructions || "None"}
                      </p>
                    </p>
                  </div>

                  {/* )} */}
                </div>
              </div>
            </div>

            {/* Order Items - NOW SHOWS ALL ITEMS WITH INDIVIDUAL STATUSES */}
            <div className="p-4">
              <h3 className="font-semibold mb-3">Your Order</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="py-2 border-b last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.itemName}</p>
                          {/* <span className={`px-2 py-0.5 rounded text-white text-xs ${getStatusColor(item.orderStatusId)}`}> */}
                          {/* {getStatusText(item.orderStatusId)} */}
                          {/* </span> */}
                        </div>
                        {/* <p className="text-sm text-gray-500">
                          {formatPortionText(item)}
                        </p> */}
                        {item.specialInstructions && (
                          <div className="">
                            {/* <p className="text-xs font-medium text-yellow-800">
                              Special Instructions:
                            </p>
                            <p className="text-xs text-yellow-700">
                              {item.specialInstructions}
                            </p> */}
                          </div>
                        )}
                      </div>
                      <p className={`font-medium ml-4 ${item.orderStatusId === 5 ? 'line-through text-gray-400' : ''}`}>
                        ₹{calculateTotalPrice(item)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span>₹{selectedOrder.discount || "0"}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹0</span>
                </div> */}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
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
                          className={`w-0.5 h-12 ${progress[index + 1].completed
                            ? "bg-green-500"
                            : "bg-gray-300"
                            }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"
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
              {orders.map((groupedOrder, index) => {
                const status = groupedOrder.orderStatusId;
                const totalPrice = calculateGroupTotalPrice(groupedOrder);
                const itemCount = groupedOrder.items.length;

                return (
                  <div
                    key={groupedOrder.orderId || index}
                    onClick={() => setSelectedOrder(groupedOrder)}
                    className="flex items-start p-4 rounded-lg shadow-sm bg-white border hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                  >
                    <div
                      className={`w-2 h-16 rounded-full ${getStatusColor(
                        status
                      )} flex-shrink-0`}
                    />

                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="font-semibold text-gray-900">
                          Order #{groupedOrder.orderId}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded text-white text-xs font-medium ${getStatusColor(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>

                      {/* Show all items in the order with their individual statuses */}
                      <div className="space-y-1 mb-2">
                        {groupedOrder.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2">
                            <p className={`text-sm ${item.orderStatusId === 5 ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                              • {item.itemName}, {formatPortionText(item)}
                            </p>
                            {item.orderStatusId === 5 && (
                              <span className="text-xs text-red-500 font-medium">(Cancelled)</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {itemCount} item{itemCount > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          Total: ₹{totalPrice}
                        </p>
                      </div>
                    </div>
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