// ============================================
// TYPES & INTERFACES
// ============================================

export interface Bundle {
    id: string;
    name: string;
    description: string;
    type: BundleType;
    status: BundleStatus;
    startDate?: string;
    endDate?: string;
    minPurchaseAmount: number;
    minQuantity: number;
    requiredProductRefs: string[];
    anyProductRefs: string[];
    requiredCategoryIds: string[];
    requiredBrandIds: string[];
    requireAllProducts: boolean;
    freeProductQuantity: number;
    freeProductRef?: string;
    discountPercentage: number;
    discountAmount: number;
    applyDiscountTo: string;
    givesFreeDelivery: boolean;
    giftProductRef?: string;
    giftQuantity: number;
    maxUsagePerUser?: number;
    maxUsageTotal?: number;
    currentUsage: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface BundleFormData {
    name: string;
    description: string;
    type: BundleType;
    status: BundleStatus;
    startDate: string;
    endDate: string;
    minPurchaseAmount: number;
    minQuantity: number;
    requiredProductRefs: string[];
    anyProductRefs: string[];
    requiredCategoryIds: string[];
    requiredBrandIds: string[];
    requireAllProducts: boolean;
    freeProductQuantity: number;
    freeProductRef: string;
    discountPercentage: number;
    discountAmount: number;
    applyDiscountTo: string;
    givesFreeDelivery: boolean;
    giftProductRef: string;
    giftQuantity: number;
    maxUsagePerUser: number | null;
    maxUsageTotal: number | null;
}

export type BundleType = 'BUY_X_GET_Y_FREE' | 'PERCENTAGE_OFF' | 'FIXED_AMOUNT_OFF' | 'FREE_DELIVERY' | 'FREE_GIFT';
export type BundleStatus = 'ACTIVE' | 'INACTIVE';

export interface BundleTypeInfo {
    value: BundleType;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

// ============================================
// CONSTANTS
// ============================================

import { BiPackage, BiTrendingDown, BiSolidTruck, BiGift } from 'react-icons/bi';

export const bundleTypes: BundleTypeInfo[] = [
    {
        value: 'BUY_X_GET_Y_FREE',
        label: 'Achetez X Obtenez Y Gratuit',
        icon: <BiPackage size={24} />,
        color: 'purple',
        description: 'Le client achète X articles et obtient Y articles gratuits'
    },
    {
        value: 'PERCENTAGE_OFF',
        label: 'Pourcentage de Réduction',
        icon: <BiTrendingDown size={24} />,
        color: 'orange',
        description: 'Appliquer une réduction en pourcentage sur les articles éligibles'
    },
    {
        value: 'FIXED_AMOUNT_OFF',
        label: 'Montant Fixe de Réduction',
        icon: <BiTrendingDown size={24} />,
        color: 'red',
        description: 'Réduction d\'un montant fixe sur les achats éligibles'
    },
    {
        value: 'FREE_DELIVERY',
        label: 'Livraison Gratuite',
        icon: <BiSolidTruck size={24} />,
        color: 'blue',
        description: 'Livraison gratuite lorsque les conditions sont remplies'
    },
    {
        value: 'FREE_GIFT',
        label: 'Cadeau Gratuit',
        icon: <BiGift size={24} />,
        color: 'green',
        description: 'Produit cadeau gratuit avec un achat éligible'
    }
];

export const getBundleTypeInfo = (type: BundleType): BundleTypeInfo =>
    bundleTypes.find(t => t.value === type) || bundleTypes[0];