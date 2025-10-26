import React from "react";

const SnackCard = ({ item, price, qty = 0, increase, decrease, disabled }) => {
    const desc = item.description || item.category;

    return (
        <div className="h-full border border-gray-200 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-[96px_1fr] gap-4 min-h-[128px]">
                {/* Left: image */}
                <div className="flex items-center justify-center">
                    <img
                        src={item.image}
                        alt={item.beverageName}
                        className="w-24 h-24 object-contain"
                    />
                </div>

                {/* Right */}
                <div className="grid grid-rows-[auto_1fr_auto]">
                    <h3 className="text-base font-semibold leading-snug">
                        {item.beverageName}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">{desc}</p>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="font-semibold whitespace-nowrap">₹{price}</div>

                        {qty > 0 ? (
                            <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => decrease(item._id)}
                                    className="w-9 h-9 flex items-center justify-center"
                                    aria-label="Decrease"
                                >
                                    −
                                </button>
                                <span className="w-10 text-center text-sm">{qty}</span>
                                <button
                                    onClick={() => increase(item._id)}
                                    disabled={disabled}
                                    className={`w-9 h-9 flex items-center justify-center ${disabled ? "cursor-not-allowed text-gray-300" : ""
                                        }`}
                                    aria-label="Increase"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => !disabled && increase(item._id)}
                                disabled={disabled}
                                className={`px-4 h-9 rounded-full font-semibold border ${disabled
                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                    : "border-orange-500 text-orange-500 hover:bg-orange-50"
                                    }`}
                            >
                                Add
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};


export default SnackCard;
