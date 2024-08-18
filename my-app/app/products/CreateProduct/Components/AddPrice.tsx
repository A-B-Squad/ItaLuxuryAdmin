import React, { useState, ChangeEvent } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@apollo/client";
import { DISCOUNT_PERCENTAGE_QUERY } from "@/app/graph/queries";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/app/Helpers/_formatDate";

const AddPrice = ({
  discountPercentage,
  setDiscountPercentage,
  manualDiscountPrice,
  setManualDiscountPrice,
  originalPrice,
  setOriginalPrice,
  purchasePrice,
  setPurchasePrice,
  dateOfEndDiscount,
  setDateOfEndDiscount,
  dateOfStartDiscount,
  setDateOfStartDiscount,
  setSelectedDicountId,
}: any) => {
  const [discountType, setDiscountType] = useState<"percentage" | "manual">(
    "percentage",
  );
  const [discountedPrice, setDiscountedPrice] = useState<string>("0.00");
  const { data, loading, error } = useQuery(DISCOUNT_PERCENTAGE_QUERY);
  const [showCalendar, setShowCalendar] = useState(false);
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
  const handleDateRangeChange = (range: DateRange | undefined) => {
    console.log(range, "###############################");

    // Get the current date
    const currentDate = new Date();

    // Check if from date is not in the past
    if (range?.from && range.from < currentDate) {
      alert("La date de début ne peut pas être dans le passé.");
      return; // Exit the function to prevent state update
    }

    // Check if to date is not in the past
    if (range?.to && range.to < currentDate) {
      alert("La date de fin ne peut pas être dans le passé.");
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

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleOriginalPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;
    setOriginalPrice(price);
    if (discountType === "percentage") {
      calculateDiscountedPrice(price, discountPercentage);
    } else {
      calculateManualDiscountedPrice(price, manualDiscountPrice);
    }
  };

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseInt(value) || 0;
    setDiscountPercentage(percentage);

    // Find the corresponding discount option and get its ID
    const selectedOption = discountOptions.find(
      (option: { percentage: number }) => option.percentage === percentage,
    );
    if (selectedOption) {
      setSelectedDicountId(selectedOption.id);
    } else {
      setSelectedDicountId("");
    }
    calculateDiscountedPrice(originalPrice, percentage);
  };

  const handleManualDiscountPriceChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const discountPrice = parseFloat(e.target.value) || 0;
    setManualDiscountPrice(discountPrice);
    setSelectedDicountId("");
    calculateManualDiscountedPrice(originalPrice, discountPrice);
  };

  const handleDiscountTypeChange = (value: string) => {
    const type = value as "percentage" | "manual";
    setDiscountType(type);
    if (type === "percentage") {
      calculateDiscountedPrice(originalPrice, discountPercentage);
    } else {
      calculateManualDiscountedPrice(originalPrice, manualDiscountPrice);
    }
  };

  const calculateDiscountedPrice = (price: number, percentage: number) => {
    const discount = (price * percentage) / 100;
    const finalPrice = price - discount;
    setManualDiscountPrice(finalPrice);
    setDiscountedPrice(finalPrice.toFixed(2));
  };

  const calculateManualDiscountedPrice = (
    price: number,
    discountPrice: number,
  ) => {
    const finalPrice = price - discountPrice;
    setManualDiscountPrice(finalPrice);
    setDiscountedPrice(finalPrice.toFixed(2));
  };

  const handlePurchasePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;
    setPurchasePrice(price);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading discount percentages</p>;

  const discountOptions = data?.DiscountsPercentage || [];

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

      <div className="discount mb-4">
        <label className="block text-gray-700">Type de remise</label>
        <Select value={discountType} onValueChange={handleDiscountTypeChange}>
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner le type de remise" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Types de remise</SelectLabel>
              <SelectItem value="percentage">Pourcentage</SelectItem>
              <SelectItem value="manual">Valeur</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {discountType === "percentage" && (
          <div className="mt-4">
            <label className="block text-gray-700">
              Valeur de la remise (%)
            </label>
            <Select
              value={discountPercentage}
              onValueChange={handleDiscountPercentageChange}
            >
              <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
                <SelectValue placeholder="Sélectionner la valeur de la remise" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Valeurs de la remise</SelectLabel>
                  {discountOptions.map((option: any) => (
                    <SelectItem key={option.id} value={option.percentage}>
                      {option.percentage}%
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {discountType === "manual" && (
          <div className="mt-4">
            <label className="block text-gray-700">
              Valeur de la remise (Direct)
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              onChange={handleManualDiscountPriceChange}
              min="0"
              step="0.01"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Période de remise</label>
        <div className="mt-2">
          <Button onClick={toggleCalendar}>
            {showCalendar ? "Masquer le calendrier" : "Afficher le calendrier"}
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
    </div>
  );
};

export default AddPrice;
