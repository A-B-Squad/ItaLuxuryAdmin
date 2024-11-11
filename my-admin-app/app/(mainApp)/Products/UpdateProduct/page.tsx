"use client";
import React, { useEffect, useState } from "react";
import ChoiceCategory from "./Components/UpdateCategory";
import UpdateBrand from "./Components/UpdateBrand";
import UpdateInventory from "./Components/UpdateInventory";
import UpdateDescription from "./Components/UpdateDescription";
import UpdatePrice from "./Components/UpdatePrice";
import UpdateAttribute from "./Components/UpdateAttributes";
import UpdateImage from "./Components/UploadImages";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_PRODUCT_MUTATIONS } from "../../../graph/mutations";
import UpdateReference from "./Components/UpdateReference";
import UpdateColors from "./Components/UpdateColors";
import { useToast } from "@/components/ui/use-toast";
import { PRODUCT_BY_ID_QUERY } from "../../../graph/queries";
import Load from "./Load";
import { formatDate } from "@/app/(mainApp)/Helpers/_formatDate";

interface Attribute {
  name: string;
  value: string;
}

const UpdateProduct = ({ searchParams }: any) => {
  const { toast } = useToast();
  const productId = searchParams.productId;
  const [attributes, setAttributes] = useState<Attribute[]>([
    { name: "", value: "" },
  ]);
  const [discountType, setDiscountType] = useState<
    "empty" | "percentage" | "manual"
  >("empty");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [reference, setReference] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [manualDiscountPrice, setManualDiscountPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(false);

  const [dateOfStartDiscount, setDateOfStartDiscount] = useState<
    string | Date | null
  >(null);
  const [dateOfEndDiscount, setDateOfEndDiscount] = useState<
    string | Date | null
  >(null);
  const [selectedDiscountId, setSelectedDicountId] = useState<string | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<boolean>(true);
  const [finalDiscountPrice, setFinalDiscountPrice] = useState<number>(0);

  const [selectedIds, setSelectedIds] = useState({
    categoryId: "",
    subcategoryId: "",
    subSubcategoryId: "",
  });
  const [brandId, setBrand] = useState<string | null>(null);
  const [updateProductMutation] = useMutation(UPDATE_PRODUCT_MUTATIONS);

  const {
    data: productDataById,
    loading,
    error,
  } = useQuery(PRODUCT_BY_ID_QUERY, {
    variables: { productByIdId: productId },
  });

  useEffect(() => {
    if (!loading && !error && productDataById && productDataById.productById) {
      const product = productDataById.productById;

      // Ne mettez à jour l'état que si les valeurs changent réellement
      setTitle((prev) => (prev !== product.name ? product.name : prev));
      setDescription((prev) =>
        prev !== product.description ? product.description : prev,
      );
      setStock((prev) =>
        prev !== product.inventory ? product.inventory : prev,
      );
      setReference((prev) =>
        prev !== product.reference ? product.reference : prev,
      );
      setUploadedImages((prev) =>
        prev !== product.images ? product.images : prev,
      );
      setOriginalPrice((prev) =>
        prev !== product.price ? product.price : prev,
      );
      setPurchasePrice((prev) =>
        prev !== product.purchasePrice ? product.purchasePrice : prev,
      );
      setVisibility((prev) =>
        prev !== product.isVisible ? product.isVisible : prev,
      );
      setSelectedColor((prev) =>
        prev !== product.Colors?.id ? product.Colors?.id : prev,
      );
      setBrand((prev) =>
        prev !== product.Brand?.id ? product.Brand?.id : prev,
      );

      // Mettre à jour les attributs uniquement si nécessaire
      setAttributes((prev) => {
        const newAttributes = product.attributes.map(
          (attr: { name: any; value: any }) => ({
            name: attr.name,
            value: attr.value,
          }),
        );
        return JSON.stringify(prev) !== JSON.stringify(newAttributes)
          ? newAttributes
          : prev;
      });

      if (product.categories.length > 0) {
        const category = product.categories;
        setSelectedIds((prev) => {
          const newSelectedIds = {
            categoryId: category[0].id,
            subcategoryId:
              Object.keys(category[1]).length > 0
                ? category[1].id
                : "",
            subSubcategoryId:
              Object.keys(category[2]).length > 0
                ? category[2].id
                : "",
          };
          return JSON.stringify(prev) !== JSON.stringify(newSelectedIds)
            ? newSelectedIds
            : prev;
        });
      }

      if (product.productDiscounts && product.productDiscounts.length > 0) {
        const discount = product.productDiscounts[0];
        setDiscountType(discount.discountId ? "percentage" : "manual");
        setSelectedDicountId(discount.discountId || null);
        const startDate = formatDate(discount.dateOfStart);
        const endDate = formatDate(discount.dateOfEnd);
        setDateOfStartDiscount(startDate);
        setDateOfEndDiscount(endDate);
      } else {
        setDiscountType("empty");
      }
    }
  }, [productDataById, loading, error]);



  const removeDuplicateAttributes = (attributes: Attribute[]) => {
    const seen = new Set();
    return attributes
      .filter(attr => attr.name.trim() && attr.value.trim())
      .filter(attr => {
        const key = attr.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };


  const handleUpdateProduct = () => {
    const cleanedAttributes = removeDuplicateAttributes(attributes);

    if (
      !title ||
      !description ||
      !uploadedImages.length ||
      !selectedIds.categoryId
    ) {
      toast({
        title: "Erreur de mise à jour",
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
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
        return;
      }
      if (discountType === "manual" && !manualDiscountPrice) {
        toast({
          title: "Erreur de mise à jour",
          variant: "destructive",
          description: "Veuillez fournir un prix de remise manuel.",
          duration: 5000,
        });
        return;
      }
      if (discountType === "percentage" && !selectedDiscountId) {
        toast({
          title: "Erreur de mise à jour",
          variant: "destructive",
          description: "Veuillez sélectionner un type de remise.",
          duration: 5000,
        });
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
      return;
    }

    const productData = {
      productId: productId,
      input: {
        attributeInputs: cleanedAttributes,
        brandId: brandId !== "empty" ? brandId : null,
        categories: [
          selectedIds.categoryId,
          selectedIds.subcategoryId,
          selectedIds.subSubcategoryId,
        ].filter(Boolean),
        description,
        name: title,
        images: uploadedImages,
        inventory: stock,
        isVisible: visibility,
        price: originalPrice,
        purchasePrice,
        colorsId: selectedColor,
        reference,
        ...(hasDiscount &&
          discountType === "manual" && {
          discount: [
            {
              newPrice: finalDiscountPrice,
              dateOfStart: dateOfStartDiscount,
              dateOfEnd: dateOfEndDiscount,
            },
          ],
        }),
        ...(hasDiscount &&
          discountType === "percentage" && {
          discount: [
            {
              discountId: selectedDiscountId,
              dateOfStart: dateOfStartDiscount,
              dateOfEnd: dateOfEndDiscount,
              newPrice: finalDiscountPrice,
            },
          ],
        }),
      },
    };

    updateProductMutation({
      variables: productData,
    });

    updateProductMutation({
      variables: productData,
      onCompleted() {
        toast({
          title: "Produit mis à jour",
          className: "text-white bg-mainColorAdminDash border-0",
          description: "Le produit a été mis à jour avec succès.",
          duration: 5000,
        });
      },

      onError(err) {

        toast({
          title: "Erreur de mise à jour",
          variant: "destructive",
          description: `${err.message}`,
          duration: 5000,
        });
        return
      }
    });
  };

  if (loading)
    return (
      <div className="h-dvh relative overflow-hidden border bg-[#ffffffc2] rounded-md flex items-center justify-center w-full">
        <Load />
      </div>
    );
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="container mx-auto py-10 bg-slate-100 w-full">
      <h1 className="text-2xl font-bold mb-6">Mettre à jour un produit</h1>
      <div className="details flex w-full gap-5">
        <div className="baseDetails w-3/4 flex flex-col gap-3">
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
            <UpdateDescription
              description={description}
              setDescription={setDescription}
            />
          </div>

          <UpdatePrice
            discountPercentage={discountPercentage}
            setDiscountPercentage={setDiscountPercentage}
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
            selectedDiscountId={selectedDiscountId}
            setFinalDiscountPrice={setFinalDiscountPrice}
            setSelectedDicountId={setSelectedDicountId}
            discountType={discountType}
            setDiscountType={setDiscountType}
            isDiscountEnabled={isDiscountEnabled}
            setIsDiscountEnabled={setIsDiscountEnabled}
          />

          <UpdateImage
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
          />

          <UpdateAttribute
            attributes={attributes}
            setAttributes={setAttributes}
          />
        </div>

        <div className="moreDetails w-1/4 flex flex-col gap-3">
          <div className="visibility bg-white rounded-md shadow-md p-3">
            <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
              Visibilité
            </label>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600 font-semibold">Visible</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={visibility}
                  onChange={(e) => {
                    setVisibility(e.target.checked);
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mainColorAdminDash rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-mainColorAdminDash"></div>
              </label>
            </div>
          </div>

          <ChoiceCategory
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
          <UpdateInventory stock={stock} setStock={setStock} />
          <UpdateReference reference={reference} setReference={setReference} />
          <UpdateColors
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <UpdateBrand setBrand={setBrand} selectedBrandId={brandId} />
        </div>
      </div>
      <div className="w-full my-5 py-2">
        <button
          onClick={handleUpdateProduct}
          className="py-2 w-full flex items-center justify-center gap-3 rounded-lg text-center bg-mainColorAdminDash text-white"
        >
          <span className="font-semibold text-lg">Mettre à jour</span>
        </button>
      </div>
    </div>
  );
};

export default UpdateProduct;
