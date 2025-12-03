"use client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { CREATE_PRODUCT_MUTATIONS } from "../../../../graph/mutations";
import TechnicalDetails from "./Components/AddTechnicalDetails";
import AddDescription from "./Components/AddDescription";
import AddPrice from "./Components/AddPrice";
import AddReference from "./Components/AddRef";
import AddStock from "./Components/AddStock";
import ChoiceBrand from "./Components/ChoiceBrand";
import ChoiceCategory from "./Components/ChoiceCategory";
import ChoiseColors from "./Components/ChoiseColors";
import UploadImage from "./Components/UploadImages";
import AddVariant from "./Components/AddVariant";


const CreateProduct = ({ action }: { action?: string }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [technicalDetails, setTechnicalDetails] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [reference, setReference] = useState<string>("");
  const [manualDiscountPrice, setManualDiscountPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [dateOfStartDiscount, setDateOfStartDiscount] = useState<
    string | Date | null
  >(null);
  const [dateOfEndDiscount, setDateOfEndDiscount] = useState<
    string | Date | null
  >(null);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<boolean>(true);
  const [finalDiscountPrice, setFinalDiscountPrice] = useState<number>(0);

  const [selectedIds, setSelectedIds] = useState({
    categoryId: "",
    subcategoryId: "",
    subSubcategoryId: "",
  });

  const [brand, setBrand] = useState<string | null>(null);
  const [createProductMutation] = useMutation(CREATE_PRODUCT_MUTATIONS);

  useEffect(() => {
    if (action === 'duplicate') {
      try {
        const duplicatedData = sessionStorage.getItem('duplicateProductData');
        if (duplicatedData) {
          const productData = JSON.parse(duplicatedData);
          // Set all your form states with the duplicated data
          setTitle(productData.name);
          setDescription(productData.description);
          setStock(productData.inventory);
          setUploadedImages(productData.images);
          setOriginalPrice(productData.price);
          setPurchasePrice(productData.purchasePrice);
          setVisibility(productData.isVisible);
          setTechnicalDetails(productData.technicalDetails);
          setReference(productData.reference);
          setBrand(productData.brandId);
          setSelectedGroupId(productData.groupVariantId);

          if (productData.hasDiscount && productData.discount) {
            setIsDiscountEnabled(true);
            setDateOfStartDiscount(productData.discount.dateOfStart);
            setDateOfEndDiscount(productData.discount.dateOfEnd);
            setManualDiscountPrice(productData.discount.newPrice);
            setFinalDiscountPrice(productData.discount.newPrice);
          }

          // Set categories if you have them
          if (productData.categoryIds && productData.categoryIds.length > 0) {
            setSelectedIds({
              categoryId: productData.categoryIds[0] || "",
              subcategoryId: productData.categoryIds[1] || "",
              subSubcategoryId: productData.categoryIds[2] || "",
            });
          }

          // Set colors if you have them
          if (productData.colorId) {
            setSelectedColor(productData.colorId);
          }

          // Clean up sessionStorage after loading
          sessionStorage.removeItem('duplicateProductData');

          toast({
            title: "Produit dupliqué",
            description: "Les données du produit ont été chargées pour duplication.",
            className: "bg-blue-600 text-white",
          });
        }
      } catch (error) {
        console.error('Error parsing duplicated product data:', error);
        toast({
          title: "Error",
          description: "Failed to load duplicated product data",
          variant: "destructive",
        });
      }
    }
  }, [action, toast]);

  const handleSubmit = () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Set submitting state to true
    setIsSubmitting(true);

    if (
      !title ||
      !description ||
      !uploadedImages.length ||
      !selectedIds.categoryId ||
      !reference
    ) {
      toast({
        title: "Erreur de création",
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    const hasDiscount = isDiscountEnabled;

    if (hasDiscount) {
      if (!dateOfEndDiscount || !dateOfStartDiscount) {
        toast({
          title: "Erreur de mise à jour",
          variant: "destructive",
          description:
            "Veuillez remplir les dates de début et de fin de remise.",
          duration: 5000,
        });
        setIsSubmitting(false);

        return;
      }
      if (!manualDiscountPrice) {
        toast({
          title: "Erreur de mise à jour",
          variant: "destructive",
          description: "Veuillez fournir un prix de remise manuel.",
          duration: 5000,
        });
        setIsSubmitting(false);

        return;
      }

    }

    if (!originalPrice && !hasDiscount) {
      toast({
        title: "Erreur de mise à jour",
        variant: "destructive",
        description: "Veuillez fournir un prix ou une remise.",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    const productData = {
      input: {
        technicalDetails: technicalDetails,
        brandId: brand,
        categories: [
          selectedIds.categoryId,
          selectedIds.subcategoryId,
          selectedIds.subSubcategoryId,
        ].filter(id => id && id.trim() !== ""),
        description,
        name: title,
        images: uploadedImages,
        inventory: stock,
        isVisible: visibility,
        price: originalPrice,
        purchasePrice: purchasePrice,
        colorsId: selectedColor,
        reference,
        ...(selectedGroupId && { groupProductVariantId: selectedGroupId }),
        ...(hasDiscount && {
          discount: [
            {
              dateOfStart: dateOfStartDiscount,
              dateOfEnd: dateOfEndDiscount,
              newPrice: finalDiscountPrice,
            },
          ],
        }),
      },
    };

    createProductMutation({
      variables: productData,
      onCompleted() {
        // Reset all inputs
        setTechnicalDetails("");
        setUploadedImages([]);
        setTitle("");
        setDescription("");
        setStock(0);
        setReference("");
        setManualDiscountPrice(0);
        setOriginalPrice(0);
        setPurchasePrice(0);
        setDateOfStartDiscount(null);
        setDateOfEndDiscount(null);
        setSelectedColor(null);
        setVisibility(true);
        setSelectedGroupId(null);

        setSelectedIds({
          categoryId: "",
          subcategoryId: "",
          subSubcategoryId: "",
        });
        setBrand("");
        window.location.reload()
        toast({
          title: "Produit créé",
          className: "text-white bg-mainColorAdminDash border-0",
          description: "Le produit a été créé avec succès.",
          duration: 5000,
        });
        // No need to reset isSubmitting as we're reloading the page
      },
      onError(err) {
        toast({
          title: "Erreur de mise à jour",
          variant: "destructive",
          description: `${err.message}`,
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }
    });
  };

  return (
    <div className="container mx-auto py-10 bg-slate-100 w-full">
      <h1 className="text-2xl font-bold mb-6">Créer un produit</h1>
      <div className="details flex flex-col lg:flex-row w-full gap-5">
        <div className="baseDetails w-full  lg:w-3/4 flex flex-col gap-3">
          <div className="p-3 rounded-md shadow-lg bg-white">
            <div className="title mb-4">
              <label className="text-lg font-bold mb-4">Titre</label>
              <input
                type="text"
                placeholder="Nom"
                className="w-full p-2 focus:border-black focus:shadow-md border placeholder:text-gray-200 transition-all outline-none border-gray-300 rounded mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <AddDescription
              description={description}
              setDescription={setDescription}
            />
          </div>

          <AddPrice
            isDiscountEnabled={isDiscountEnabled}
            setIsDiscountEnabled={setIsDiscountEnabled}

            manualDiscountPrice={manualDiscountPrice}
            setManualDiscountPrice={setManualDiscountPrice}
            originalPrice={originalPrice}
            setOriginalPrice={setOriginalPrice}
            purchasePrice={purchasePrice}
            setPurchasePrice={setPurchasePrice}
            dateOfEndDiscount={dateOfEndDiscount}
            setDateOfEndDiscount={setDateOfEndDiscount}
            dateOfStartDiscount={dateOfStartDiscount}
            setDateOfStartDiscount={setDateOfStartDiscount}
            setFinalDiscountPrice={setFinalDiscountPrice}
          />

          <UploadImage
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
          />

          <TechnicalDetails technicalDetails={technicalDetails} setTechnicalDetails={setTechnicalDetails} />
        </div>

        <div className="moreDetails w-full   lg:w-1/4 flex flex-col gap-3">
          <div className="visibility bg-white rounded-md shadow-md p-3">
            <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
              Visibilité
            </label>
            <div className="flex w-full gap-2 py-3 my-2 px-1 cursor-pointer border-slate-200 rounded-md border justify-start">
              <input
                type="checkbox"
                className="checkbox-custom relative border-gray-300 w-5 h-5 appearance-none bg-white border rounded-md cursor-pointer checked:bg-mainColorAdminDash"
                checked={visibility}
                onChange={(e) => setVisibility(e.target.checked)}
              />
              <label className="text-sm">Boutique en ligne</label>
            </div>
          </div>

          <ChoiceCategory
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
          <AddVariant
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
          />
          <AddStock stock={stock} setStock={setStock} />
          <AddReference reference={reference} setReference={setReference} />
          <ChoiseColors
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <ChoiceBrand brand={brand} setBrand={setBrand} />
        </div>
      </div>
      <button
        type="button"
        className={`w-full py-3 mt-6 transition-all bg-mainColorAdminDash text-white rounded-md shadow-sm ${isSubmitting
          ? "opacity-70 cursor-not-allowed"
          : "hover:opacity-90 hover:bg-mainColorAdminDash-dark"
          }`}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Création en cours..." : "Créer le produit"}
      </button>
    </div>
  );
};

export default CreateProduct;
