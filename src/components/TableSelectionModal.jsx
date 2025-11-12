import React from 'react';
const TableSelectionModal = ({ tables, handleTableClick, setShowTableSelection }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
    <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-lg">
        <h2 className="text-lg sm:text-xl font-bold">Select Table</h2>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {table.tableName} (Seats: {table.capacity})
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowTableSelection()}
          className="w-full mt-4 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default TableSelectionModal;
