import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import React, { ChangeEvent, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { formatDate } from "@/app/(mainApp)/Helpers/_formatDate";

interface UpdatePriceProps {

  manualDiscountPrice: number;
  setManualDiscountPrice: (price: number) => void;
  originalPrice: number;
  setOriginalPrice: (price: number) => void;
  purchasePrice: number;
  setPurchasePrice: (price: number) => void;
  dateOfEndDiscount: string | Date | null;
  setDateOfEndDiscount: (date: string | null) => void;
  dateOfStartDiscount: string | Date | null;
  setDateOfStartDiscount: (date: string | null) => void;
  setFinalDiscountPrice: (finalDiscountPrice: number) => void;
  isDiscountEnabled: boolean;
  setIsDiscountEnabled: (type: boolean) => void;
}



const UpdatePrice: React.FC<UpdatePriceProps> = ({
  manualDiscountPrice,
  setFinalDiscountPrice,
  setManualDiscountPrice,
  originalPrice,
  setOriginalPrice,
  purchasePrice,
  setPurchasePrice,
  dateOfEndDiscount,
  setDateOfEndDiscount,
  dateOfStartDiscount,
  setDateOfStartDiscount,
  isDiscountEnabled,
  setIsDiscountEnabled,
}) => {
  const [discountedPrice, setDiscountedPrice] = useState<string>("0.00");

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const startDate = dateOfStartDiscount
      ? new Date(dateOfStartDiscount)
      : undefined;
    const endDate = dateOfEndDiscount ? new Date(dateOfEndDiscount) : undefined;

    return {
      from: startDate,
      to: endDate,
    };
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const parseAndFormatDate = (
    dateString: string | Date | null,
  ): Date | null => {
    if (!dateString) return null;

    if (typeof dateString === "string") {
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hours, minutes] = timePart.split(":");
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
      );
    }

    return dateString;
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    // Get today's date, setting time to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isBeforeToday = (date: Date) => {
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate < today;
    };

    // Check if from date is before today
    if (range?.from && isBeforeToday(range.from)) {
      alert("La date de début ne peut pas être antérieure à aujourd'hui.");
      return; // Exit the function to prevent state update
    }

    // Check if to date is before today
    if (range?.to && isBeforeToday(range.to)) {
      alert("La date de fin ne peut pas être antérieure à aujourd'hui.");
      return; // Exit the function to prevent state update
    }

    setDate(range);
    if (range?.from) {
      setDateOfStartDiscount(formatDate(range.from.getTime().toString()));
    }
    if (range?.to) {
      setDateOfEndDiscount(formatDate(range.to.getTime().toString()));
    }
  };
  const handleOriginalPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;

    setOriginalPrice(price);

    calculateManualDiscountedPrice(price, manualDiscountPrice);

  };


  const handleManualDiscountPriceChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const discountPrice = Number(e.target.value) || 0;

    setManualDiscountPrice(discountPrice);
    calculateManualDiscountedPrice(originalPrice, discountPrice);
  };


  const handlePurchasePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;
    setPurchasePrice(price);
  };

  const calculateManualDiscountedPrice = (
    price: number,
    discountPrice: number,
  ) => {
    const finalPrice = price - discountPrice;
    setManualDiscountPrice(discountPrice);
    setDiscountedPrice(finalPrice.toFixed(2));
    setFinalDiscountPrice(finalPrice);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDiscountEnabledChange = () => {
    if (isDiscountEnabled) {
      // Reset discount values when disabling
      setIsDiscountEnabled(false);
      setManualDiscountPrice(0);
      setDateOfStartDiscount(null);
      setDateOfEndDiscount(null);
      setDiscountedPrice("0.00");
      setFinalDiscountPrice(0);
      setDate(undefined);
    } else {
      setIsDiscountEnabled(true);
    }
  };

  useEffect(() => {
    if (isDiscountEnabled) {
      calculateManualDiscountedPrice(originalPrice, manualDiscountPrice);
    }

    // Set initial dates
    const startDate = parseAndFormatDate(dateOfStartDiscount);
    const endDate = parseAndFormatDate(dateOfEndDiscount);

    setDate({
      from: startDate || undefined,
      to: endDate || undefined,
    });

  }, [
    originalPrice,
    dateOfStartDiscount,
    dateOfEndDiscount,
    manualDiscountPrice,
  ]);


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full my-3 mx-auto relative">
      <h1 className="text-lg font-bold mb-4">Tarification</h1>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Prix d'achat
        </label>
        <input
          type="number"
          value={purchasePrice}
          onChange={handlePurchasePriceChange}
          min="0"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Prix de vente
        </label>
        <input
          type="number"
          value={originalPrice}
          onChange={handleOriginalPriceChange}
          min="0"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4 bg-white bg-opacity-10 p-6 rounded-lg flex justify-between items-center shadow-lg ">
        <span className="text-xl font-medium">Activer la remise</span>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isDiscountEnabled}
            onChange={handleDiscountEnabledChange}
          />
          <div className="relative w-14 h-7 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600"></div>
        </label>
      </div>

      {isDiscountEnabled && (
        <>
          <div className="discount mb-4">

            <div className="mt-4">
              <label className="block text-gray-700">
                Valeur de la remise (Direct)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                value={manualDiscountPrice}
                onChange={handleManualDiscountPriceChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Période de remise</label>
            <div className="mt-2">
              <Button onClick={toggleCalendar}>
                {showCalendar
                  ? "Masquer le calendrier"
                  : "Afficher le calendrier"}
              </Button>
              {showCalendar && (
                <div className="absolute z-10 bg-white p-4 border rounded shadow-lg">
                  <Calendar
                    mode="range"
                    selected={date}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </div>
              )}
            </div>
            <div className="mt-2">
              <p>
                Du:{" "}
                {date?.from
                  ? formatDate(date.from.getTime().toString())
                  : "Non sélectionné"}
              </p>
              <p>
                Au:{" "}
                {date?.to
                  ? formatDate(date.to.getTime().toString())
                  : "Non sélectionné"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Prix après remise
            </label>
            <input
              type="text"
              value={discountedPrice}
              readOnly
              className="w-full outline-none p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UpdatePrice;
