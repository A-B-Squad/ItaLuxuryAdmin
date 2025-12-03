import React from "react";
import { FaPercentage, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import moment from "moment";

interface Props {
  discountType: "percentage" | "amount";
  setDiscountType: (type: "percentage" | "amount") => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  dateStart: string;
  setDateStart: (date: string) => void;
  dateEnd: string;
  setDateEnd: (date: string) => void;
}

export default function DiscountForm({
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
}: Props) {
  // Convert DD/MM/YYYY HH:mm to datetime-local format (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    const parsed = moment(dateStr, "DD/MM/YYYY HH:mm");
    if (!parsed.isValid()) return "";
    return parsed.format("YYYY-MM-DDTHH:mm");
  };

  // Convert datetime-local format to DD/MM/YYYY HH:mm
  const fromDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    return moment(dateStr).format("DD/MM/YYYY HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Discount Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type de Remise
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setDiscountType("percentage")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
              discountType === "percentage"
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <FaPercentage className="w-5 h-5" />
            <span className="font-semibold">Pourcentage</span>
          </button>
          
          <button
            type="button"
            onClick={() => setDiscountType("amount")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
              discountType === "amount"
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <FaDollarSign className="w-5 h-5" />
            <span className="font-semibold">Montant Fixe</span>
          </button>
        </div>
      </div>

      {/* Discount Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {discountType === "percentage" ? "Pourcentage de Remise" : "Montant de Remise"}
        </label>
        <div className="relative">
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder={discountType === "percentage" ? "ex: 25" : "ex: 50"}
            min="0"
            max={discountType === "percentage" ? "100" : undefined}
            step={discountType === "percentage" ? "1" : "0.01"}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
            {discountType === "percentage" ? "%" : "DT"}
          </span>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date et Heure de Début
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="datetime-local"
              value={toDateTimeLocal(dateStart)}
              onChange={(e) => setDateStart(fromDateTimeLocal(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {dateStart && (
            <p className="text-xs text-gray-500 mt-1">
              Format: {dateStart}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date et Heure de Fin
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="datetime-local"
              value={toDateTimeLocal(dateEnd)}
              onChange={(e) => setDateEnd(fromDateTimeLocal(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {dateEnd && (
            <p className="text-xs text-gray-500 mt-1">
              Format: {dateEnd}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}