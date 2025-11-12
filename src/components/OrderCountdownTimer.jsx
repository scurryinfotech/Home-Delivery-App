import React, { useEffect, useState } from "react";

const OrderCountdownTimer = ({ modifiedDate, durationMinutes = 10 }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!modifiedDate) {
      setTimeLeft("");
      return;
    }

    const startTime = new Date(modifiedDate);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("It's taking longer than usual!");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimer(); // initialize immediately
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [modifiedDate, durationMinutes]);

  return (
    <p className="text-sm text-orange-600">
      ETA: {timeLeft || "Waiting kitchen to accept..."}
    </p>
  );
};

export default OrderCountdownTimer;
