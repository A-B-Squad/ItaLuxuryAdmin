import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
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
import { formatDate } from "@/app/(mainApp)/Helpers/_formatDate";
import Load from "./Load";
import { toast, useToast } from "@/components/ui/use-toast";

// Define interfaces for props and discount options
interface AddPriceProps {
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

const AddPrice: React.FC<AddPriceProps> = ({
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
  setFinalDiscountPrice,
  discountType,
  setDiscountType,
  selectedDiscountId,
  isDiscountEnabled,
  setIsDiscountEnabled,
}) => {
  const { toast } = useToast()
  // GraphQL query for discount percentages
  const { data, loading, error } = useQuery(DISCOUNT_PERCENTAGE_QUERY);
  // State variables
  const [discountedPrice, setDiscountedPrice] = useState<string>("0.00");
  const [date, setDate] = useState<DateRange | undefined>(() => ({
    from: dateOfStartDiscount ? new Date(dateOfStartDiscount) : undefined,
    to: dateOfEndDiscount ? new Date(dateOfEndDiscount) : undefined,
  }));
  const [showCalendar, setShowCalendar] = useState(false);

  const discountOptions: DiscountOption[] = data?.DiscountsPercentage || [];

  const updateDiscountedPrice = useCallback((price: number) => {
    if (discountType === "percentage") {
      const discount = (price * discountPercentage) / 100;
      const finalPrice = price - discount;
      setDiscountedPrice(finalPrice.toFixed(2));
      setFinalDiscountPrice(finalPrice);
    } else if (discountType === "manual") {
      const finalPrice = Math.max(0, price - manualDiscountPrice);
      setDiscountedPrice(finalPrice.toFixed(2));
      setFinalDiscountPrice(finalPrice);
    }
  }, [discountType, discountPercentage, manualDiscountPrice, setFinalDiscountPrice]);




  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isBeforeToday = (date: Date) => {
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate < today;
    };

    if (range?.from && isBeforeToday(range.from)) {
      alert("La date de début ne peut pas être antérieure à aujourd'hui.");
      return;
    }

    if (range?.to && isBeforeToday(range.to)) {
      alert("La date de fin ne peut pas être antérieure à aujourd'hui.");
      return;
    }

    setDate(range);
    if (range?.from) {
      setDateOfStartDiscount(formatDate(range.from.getTime().toString()));
    }
    if (range?.to) {
      setDateOfEndDiscount(formatDate(range.to.getTime().toString()));
    }
  };




  // Handle original price changes
  const handleOriginalPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!purchasePrice) {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Veuillez d'abord ajouter le prix d'achat.",
        duration: 5000,
      });
      return;
    }
    const price = parseFloat(e.target.value) || 0;
    setOriginalPrice(price);
    updateDiscountedPrice(price);
  };
  // Handle discount percentage changes
  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseInt(value) || 0;
    setDiscountPercentage(percentage);
    const selectedOption = discountOptions.find(
      (option: DiscountOption) => option.percentage === percentage
    );
    setSelectedDicountId(selectedOption ? selectedOption.id : null);
    updateDiscountedPrice(originalPrice);
  };

  // Handle manual discount price changes
  const handleManualDiscountPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (!originalPrice || !purchasePrice) {
      toast({
        title: "Erreur de mise à jour",
        variant: "destructive",
        description: "Veuillez fournir un prix ou une remise.",
        duration: 5000,
      });
      return;
    }

    if (inputValue === '') {
      setManualDiscountPrice(0);
      setSelectedDicountId(null);
      updateDiscountedPrice(originalPrice);
      return;
    }

    const discountPrice = parseFloat(inputValue);

    if (isNaN(discountPrice)) {
      toast({
        title: "Erreur de mise à jour",
        variant: "destructive",
        description: "Invalid discount price input",
        duration: 5000,
      });
      return;
    }

    const validDiscountPrice = Math.max(0, Math.min(discountPrice, originalPrice));
    setManualDiscountPrice(validDiscountPrice);
    setSelectedDicountId(null);
    updateDiscountedPrice(originalPrice);
  };

  // Handle discount type changes
  const handleDiscountTypeChange = (value: string) => {
    const type = value as "percentage" | "manual";

    if (!purchasePrice || !originalPrice) {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Veuillez d'abord ajouter le prix d'achat.",
        duration: 5000,
      });
      return;
    }
    setDiscountType(type);
    updateDiscountedPrice(originalPrice);
  };

  // Calculate discounted price based on percentage
  const calculateDiscountedPrice = (price: number, percentage: number) => {
    const discount = (price * percentage) / 100;
    const finalPrice = price - discount;
    updateFinalPrice(finalPrice);
  };

  // Handle purchase price changes
  const handlePurchasePriceChange = (e: ChangeEvent<HTMLInputElement>) => {

    const price = parseFloat(e.target.value) || 0;
    // Check if the input is a valid number
    if (isNaN(price) || price < 0) {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Veuillez entrer un prix d'achat valide.",
        duration: 5000,
      });
      return;
    }

    setPurchasePrice(price);
  };

  // Calculate manual discounted price
  const calculateManualDiscountedPrice = (
    price: number,
    discountPrice: number,
  ) => {
    const finalPrice = price - discountPrice;
    updateFinalPrice(finalPrice);
  };

  // Toggle calendar visibility
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  // Handle discount enabled/disabled changes
  const handleDiscountEnabledChange = () => {
    if (isDiscountEnabled) {
      resetDiscountValues();
    } else {
      setIsDiscountEnabled(true);
    }
  };



  // Helper function to update selected discount
  const updateSelectedDiscount = (percentage: number) => {
    const selectedOption = discountOptions.find(
      (option: DiscountOption) => option.percentage === percentage,
    );
    setSelectedDicountId(selectedOption ? selectedOption.id : null);
  };

  // Helper function to update final price
  const updateFinalPrice = (finalPrice: number) => {
    setManualDiscountPrice(finalPrice);
    setDiscountedPrice(finalPrice.toFixed(2));
    setFinalDiscountPrice(finalPrice);
  };

  // Helper function to reset discount values
  const resetDiscountValues = () => {
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
  };

 
  useEffect(() => {
    if (discountType !== "empty" && isDiscountEnabled) {
      updateDiscountedPrice(originalPrice);
    } else {
      setDiscountedPrice(originalPrice.toFixed(2));
    }
  }, [discountType, isDiscountEnabled, originalPrice, updateDiscountedPrice]);



  if (loading) return <Load />;
  if (error) return <p>Error loading discount percentages</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full my-3 mx-auto relative">
      <h1 className="text-lg font-bold mb-4">Tarification</h1>

      {/* Purchase Price Input */}
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

      {/* Original Price Input */}
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

      {/* Discount Enable/Disable Toggle */}
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

      {/* Discount Options */}
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

export default AddPrice;
