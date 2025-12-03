import { gql } from "@apollo/client";


export const GET_CATEGORY_BY_ID = gql`
  query CategoryById($categoryId: String!) {
    categoryById(categoryId: $categoryId) {
      id
      name
      parentId
      smallImage
      bigImage
      description
    }
  }
`;

export const GET_ALL_USERS_QUERY = gql`
  query FetchAllUsers {
    fetchAllUsers {
      id
    }
  }
`;


export const MAIN_CATEGORY_QUERY = gql`
 query FetchMainCategories {
  fetchMainCategories {
    id
    name
    bigImage
    smallImage
    order
    subcategories {
      id
      name
      parentId
      smallImage
      order
      subcategories {
        id
        name
        parentId
        smallImage
        order
      }
    }
  }
}
`;

export const SEARCH_PRODUCTS_QUERY = gql`
query SearchProducts($input: ProductSearchInput!) {
  searchProducts(input: $input) {
    results {
      products {
        id
        name
        slug
        images
        reference
        price
        productDiscounts {
          dateOfStart
          dateOfEnd
          price
          newPrice
        }
        
        purchasePrice
        isVisible
        description
        inventory
        solde
        broken
        createdAt
        reviews {
          id
          rating
          comment
          userName
        }
        categories {
          id
          name
         
        }
        Colors {
          id
          color
          Hex
        }
       
        ProductInCheckout {
          checkout {
            phone
            package {
              status
            }
            Governorate {
              name
            }
          }
        }
      }
      categories {
        id
        name
      }
    }
    totalCount
  }
}


`;


export const GET_ALL_CAMPAIGNS_QUERY = gql`
  query GetAllCampaigns {
    getAllCampaigns {
      id
      name
      description
      type
      dateStart
      dateEnd
      isActive
      conditions
      productsAffected
      totalRevenue
      createdAt
      updatedAt
      createdBy {
        fullName
      }
    }
  }
`;
export const GET_ACTIVE_CAMPAIGNS_QUERY = gql`
  query GetActiveCampaigns {
    getActiveCampaigns {
      id
      name
      description
      type
      dateStart
      dateEnd
      isActive
      conditions
      productsAffected
      totalRevenue
      createdAt
      updatedAt
      createdBy {
        fullName
      }
    }
  }
`;


export const GET_DISCOUNT_HISTORY_QUERY = gql`
query GetDiscountHistory($productName: String!) {
  getDiscountHistory(productName: $productName) {
    id
    product {
      id
    }
    productId
    price
    newPrice
    discountType
    discountValue
    campaignName
    campaignType
    dateOfStart
    dateOfEnd
    isActive
    isDeleted
    createdAt
    updatedAt
    createdBy {
      fullName
    }
    createdById
  }
}

`;




export const GET_BRANDS = gql`
  query FetchBrands {
    fetchBrands {
      id
      logo
      name
    }
  }
`;
export const COLORS_QUERY = gql`
  query Colors {
    colors {
      id
      color
      Hex
    }
  }
`;
export const COUPONS_QUERY = gql`
  query FetchAllCoupons($pageSize: Int, $page: Int) {
  fetchAllCoupons(pageSize: $pageSize, page: $page) {
    coupons {
      id
      discount
      available
      code
      checkout {
        createdAt
      }
    }
    totalCount
  }
}
`;
export const SECTION_VISIBILITY_QUERY = gql`
  query GetAllSectionVisibility {
    getAllSectionVisibility {
      section
      visibility_status
    }
  }
`;

export const BEST_SELLS_QUERY = gql`
  query GetBestSells {
    getBestSells {
      Product {
        id
        name
        slug
        images
        price
        productDiscounts {
          newPrice
          price
         
        }
        categories {
          id
          name
        }
      }
      Category {
        id
        name
      }
    }
  }
`;
export const PACKAGES_QUERY = gql`
  query GetAllPackages($page: Int, $pageSize: Int, $dateFrom: String, $searchTerm: String, $dateTo: String, $statusFilter: [String]) {
    getAllPackages(page: $page, pageSize: $pageSize, searchTerm: $searchTerm, dateFrom: $dateFrom, dateTo: $dateTo, statusFilter: $statusFilter) {
      packages {
        id
        customId
        deliveryReference
        Checkout {
          userName
          userId
          guestEmail
          deliveryComment
          Governorate {
            id
            name
          }
          address
          phone
          freeDelivery
          paymentMethod
          manualDiscount
          productInCheckout {
            productQuantity
            price
            discountedPrice
            product {
              id
              name
              reference
              images
              solde
              broken
              purchasePrice
              price
            }
          }
          total
        }
        status
        createdAt
        delivredAt
        inTransitAt
        returnedAt
      }
      pagination {
        currentPage
        hasNextPage
        hasPreviousPage
        totalPages
      }
    }
  }
`;

export const PACKAGES_EXPORT_QUERY = gql`
  query GetAllPackagesForExport(
    $searchTerm: String
    $dateFrom: String
    $dateTo: String
    $statusFilter: [String]
  ) {
    getAllPackages(
      searchTerm: $searchTerm
      dateFrom: $dateFrom
      dateTo: $dateTo
      statusFilter: $statusFilter
    ) {
      packages {

        id
        customId
        createdAt
        status

        Checkout {
          userName
          userId
          phone
          total
          guestEmail
          deliveryComment
          freeDelivery
          paymentMethod
        }
      }
      pagination {
        currentPage
        hasNextPage
        hasPreviousPage
        totalPages
      }
    }
  }
`;
export const GET_GOVERMENT_INFO = gql`
  query AllGovernorate {
    allGovernorate {
      id
      name
    }
  }
`;

export const GET_API_CREDENTIALS = gql`
  query getApiCredentials($integrationFor: String) {
    getApiCredentials(integrationFor: $integrationFor) {
      access_token
      api_id
      domainVerification
    }
  }
`;


export const FETCH_ALL_BASKET = gql`
  query FetchAllBasket {
    fetchAllBasket {
      id
      userId
      quantity
      Product {
        id
        reference
        name
        slug
        price
        images
        productDiscounts {
          newPrice
        }
        categories {
          id
          name
          subcategories {
            id
            name

            subcategories {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export const ALL_CONTACTS = gql`
  query AllContactUs {
    allContactUs {
      id
      userId
      document
      email
      message
      subject
    }
  }
`;

export const GET_REVIEW_QUERY = gql`
   query ProductReview($productId: ID!) {
    productReview(productId: $productId) {
      id
      rating
      comment
      userId
      user {
        fullName
      }
      userName
    }
  }
`;



export const USER_POINTS_QUERY = gql`
  query UserPoints($userId: String!) {
    userPoints(userId: $userId) {
      points
      pointTransactions {
        id
        amount
        type
        description
        createdAt
      }
    }
  }
`;

export const FETCH_ALL_USERS = gql`
query FetchAllUsers {
  fetchAllUsers {
    id
    fullName
    email
    createdAt
    ContactUs {
      id
      subject
      document
      message
    }
    reviews {
      productId
      rating
      product {
        name
        reference
      }
    }
    checkout {
      id
      total
      productInCheckout {
        price
        productQuantity
        product {
          name
        }
      }
      Governorate {
        name
      }
      package {
        id
        customId
        status
      }
    }
    Voucher {
      id
      code
      amount
      isUsed
      createdAt
      expiresAt
      usedAt
      userId
      checkoutId
    }
    pointTransactions {
      id
      amount
      type
      description
      createdAt
      userId
      checkoutId
    }
    number
    points
  }
}


`;
export const GET_POINT_SETTINGS = gql`
  query GetPointSettings {
    getPointSettings {
      id
      conversionRate
      redemptionRate
      minimumPointsToUse
      loyaltyThreshold
      loyaltyRewardValue
      isActive
    }
  }
`;
export const PACKAGE_BY_ID_QUERY = gql`
 query PackageById($packageId: ID!) {
  packageById(packageId: $packageId) {
    id
    comments
    createdAt
    customId
    status
    deliveryReference
    Checkout {
      id
      userName
      userId
      guestEmail
      deliveryComment
      paymentMethod
      Governorate {
        id
        name
      }
      User {
        id
        fullName
        email
        number
        pointTransactions {
          id
          amount
          type
          createdAt
        }
      }
      Coupons {
        discount
      }
      phone
      address
      Governorate {
        name
      }
      governorateId
      manualDiscount
      freeDelivery
      total
      productInCheckout {
        id
        productQuantity
        price
        discountedPrice
        product {
          id
          name
          inventory
          reference
          images
          productDiscounts {
            dateOfEnd
            price
            newPrice
          }
        }
      }
    }
  }
}

`;

export const ADVERTISSMENT_QUERY = gql`
  query AdvertismentByPosition($position: String!) {
    advertismentByPosition(position: $position) {
      images
      link
    }
  }
`;

export const COMPANY_INFO_QUERY = gql`
  query CompanyInfo {
    companyInfo {
      phone
      deliveringPrice
      logo
      instagram
      facebook
      location
      email
    }
  }
`;

export const GET_ALL_PRODUCT_GROUPS = gql`
query GetAllProductGroups {
  getAllProductGroups {
    groupProductName
    id
  }
}
`

export const PRODUCT_IN_TOP_DEALS = gql`
  query AllDeals {
    allDeals {
      id
      product {
        id
        images
        slug
        price
        name
        reference
        productDiscounts {
          dateOfEnd
          dateOfStart
          newPrice
          price
         
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_SLUG = gql`
query GetProductBySlug($slug: String!) {
  getProductBySlug(slug: $slug) {
      id
      name
      slug
      price
      purchasePrice
      isVisible
      reference
      description
      inventory
      solde
      images
      createdAt
      updatedAt
      technicalDetails
      categories {
        id
        name
        description
        subcategories {
          id
          name
          parentId
          subcategories {
            id
            name
            parentId
          }
        }
      }
      productDiscounts {
        id
        price
        newPrice
        dateOfEnd
        dateOfStart
      }
      Colors {
        id
        color
        Hex
      }
      
      reviews {
        rating
        userId
      }
      Brand {
        id
        name
      }
      GroupProductVariant {
        id
        groupProductName
        Products {
          id
          slug
          name
          Colors {
            Hex
          }
        }
      }
    }
  }`

export const PRODUCT_BY_ID_QUERY = gql`
query ProductById($productByIdId: ID!) {
  productById(id: $productByIdId) {
    id
    name
    price
    purchasePrice
    isVisible
    reference
    description
    inventory
    solde
    images
    createdAt
    categories {
      id
      name
      description
      subcategories {
        id
        name
        parentId
        subcategories {
          id
          name
          parentId
        }
      }
    }
    productDiscounts {
      id
      price
      newPrice
      dateOfEnd
      dateOfStart
    }
    Colors {
      id
      color
      Hex
    }
    technicalDetails
    reviews {
      rating
      userId
    }
    Brand {
      name
    }
    GroupProductVariant {
      id
      groupProductName
      Products {
        id
        name
        Colors {
          Hex
        }
      }
    }
    
  }
}



        `;




export const GET_All_BUNDLES = gql`
query GetAllBundles($status: BundleStatus, $type: BundleType) {
  getAllBundles(status: $status, type: $type) {
    id
    name
    description
    type
    status
    startDate
    endDate
    minPurchaseAmount
    minQuantity
    requiredProductRefs
    anyProductRefs
    requiredCategoryIds
    requiredBrandIds
    requireAllProducts
    freeProductQuantity
    freeProductRef
    discountPercentage
    discountAmount
    applyDiscountTo
    givesFreeDelivery
    giftProductRef
    giftQuantity
    maxUsagePerUser
    maxUsageTotal
    currentUsage
    createdAt
    updatedAt
  }
}
`;
export const GET_BUNDLE_BY_ID = gql`

query GetBundle($id: ID!) {
  getBundle(id: $id) {
    id
    name
    description
    type
    status
    startDate
    endDate
    minPurchaseAmount
    minQuantity
    requiredProductRefs
    anyProductRefs
    requiredCategoryIds
    requiredBrandIds
    requireAllProducts
    freeProductQuantity
    freeProductRef
    discountPercentage
    discountAmount
    applyDiscountTo
    givesFreeDelivery
    giftProductRef
    giftQuantity
    maxUsagePerUser
    maxUsageTotal
    currentUsage
    checkouts {
      id
      userName
      total
    }
    
    createdAt
    updatedAt
  }
}
`;