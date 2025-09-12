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

export const CATEGORY_QUERY = gql`
  query Categories {
    categories {
      id
      name
      bigImage
      smallImage
      subcategories {
        id
        name
        parentId
        bigImage
        smallImage
        subcategories {
          id
          name
          parentId
          bigImage
          smallImage
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
        price
        purchasePrice
        isVisible
        reference
        description
        inventory
        solde
        broken
        images
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
        Colors {
          id
          color
          Hex
        }
        productDiscounts {
          dateOfStart
          dateOfEnd
          price
          newPrice
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
        images
        price
        productDiscounts {
          newPrice
          price
         
        }
        categories {
          id
          name
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
      }
      Category {
        id
        name
      }
    }
  }
`;
export const PACKAGES_QUERY = gql`
   query GetAllPackages($page: Int, $pageSize: Int,$dateFrom: String, $dateTo: String,$statusFilter:[String]) {
    getAllPackages(page: $page, pageSize: $pageSize, dateFrom: $dateFrom, dateTo: $dateTo,statusFilter:$statusFilter) {
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
          fullName
          email
          number
        }
        Coupons {
          discount
        }
        phone
        address
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
export const PRODUCT_QUERY = gql`
  query Products {
    products {
      id
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
