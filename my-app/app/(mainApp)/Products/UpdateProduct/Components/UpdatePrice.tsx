import React, { useState, ChangeEvent, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/app/(mainApp)/Helpers/_formatDate";

interface UpdatePriceProps {
  discountPercentage: number;
  setDiscountPercentage: (percentage: number) => void;
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
  setSelectedDicountId: (id: string | null) => void;
  setFinalDiscountPrice: (finalDiscountPrice: number) => void;
  discountType: "percentage" | "manual" | "empty";
  setDiscountType: (type: "percentage" | "manual" | "empty") => void;
  selectedDiscountId: string | null;
  isDiscountEnabled: boolean;
  setIsDiscountEnabled: (type: boolean) => void;
}

interface DiscountOption {
  id: string;
  percentage: number;
}

const UpdatePrice: React.FC<UpdatePriceProps> = ({
  discountPercentage,
  setDiscountPercentage,
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
  setSelectedDicountId,
  discountType,
  setDiscountType,
  selectedDiscountId,
  isDiscountEnabled,
  setIsDiscountEnabled,
}) => {
  const [discountedPrice, setDiscountedPrice] = useState<string>("0.00");

  const { data, loading, error } = useQuery(DISCOUNT_PERCENTAGE_QUERY);
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
    if (discountType === "percentage") {
      calculateDiscountedPrice(price, discountPercentage);
    } else {
      calculateManualDiscountedPrice(price, manualDiscountPrice);
    }
  };

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseInt(value) || 0;
    setDiscountPercentage(percentage);

    const selectedOption = discountOptions.find(
      (option: DiscountOption) => option.percentage === percentage,
    );

    if (selectedOption) {
      setSelectedDicountId(selectedOption.id);
    } else {
      setSelectedDicountId(null);
    }

    calculateDiscountedPrice(originalPrice, percentage);
  };
  const handleManualDiscountPriceChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const discountPrice = Number(e.target.value) || 0;

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
    setFinalDiscountPrice(finalPrice);
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
      setDiscountPercentage(0);
      setManualDiscountPrice(0);
      setDateOfStartDiscount(null);
      setDateOfEndDiscount(null);
      setSelectedDicountId(null);
      setDiscountedPrice("0.00");
      setFinalDiscountPrice(0);
      setDate(undefined);
      setDiscountType("empty");
    } else {
      setIsDiscountEnabled(true);
    }
  };
  const discountOptions: DiscountOption[] = data?.DiscountsPercentage || [];
  useEffect(() => {
    if (discountType !== "empty") {
      if (selectedDiscountId) {
        const selectedOption = discountOptions.find(
          (option: DiscountOption) => option.id === selectedDiscountId,
        );
        if (selectedOption) {
          setDiscountPercentage(selectedOption.percentage);
          calculateDiscountedPrice(originalPrice, selectedOption.percentage);
        }
      } else {
        // Calculate discounted price based on the current discount type
        if (discountType === "percentage") {
          calculateDiscountedPrice(originalPrice, discountPercentage);
        } else if (discountType === "manual") {
          calculateManualDiscountedPrice(originalPrice, manualDiscountPrice);
        }
      }

      setIsDiscountEnabled(true);
      // Set initial dates
      const startDate = parseAndFormatDate(dateOfStartDiscount);
      const endDate = parseAndFormatDate(dateOfEndDiscount);

      setDate({
        from: startDate || undefined,
        to: endDate || undefined,
      });
    } else {
      setIsDiscountEnabled(false);
      setDiscountedPrice(originalPrice.toFixed(2)); // Reset to original price when discount is disabled
    }
  }, [
    discountType,
    selectedDiscountId,
    discountOptions,
    originalPrice,
    dateOfStartDiscount,
    dateOfEndDiscount,
    discountPercentage,
    manualDiscountPrice,
  ]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading discount percentages</p>;

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
            <label className="block text-gray-700">Type de remise</label>
            <Select
              value={discountType}
              onValueChange={handleDiscountTypeChange}
            >
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
                  value={discountPercentage.toString()}
                  onValueChange={handleDiscountPercentageChange}
                >
                  <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
                    <SelectValue placeholder="Sélectionner la valeur de la remise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Valeurs de la remise</SelectLabel>
                      {discountOptions.map((option: DiscountOption) => (
                        <SelectItem
                          key={option.id}
                          value={option.percentage.toString()}
                        >
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
                  value={manualDiscountPrice}
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
