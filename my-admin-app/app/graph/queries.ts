import { gql } from "@apollo/client";

export const GET_PACKAGES_QUERY = gql`
  query GetAllPackages {
    getAllPackages {
      id
      checkoutId
      status
      createdAt
      Checkout {
        Governorate {
          id
          name
        }
        id
        total
        paymentMethod
      }
    }
  }
`;
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
export const CATEGORY_BY_ID_QUERY = gql`
  query CategoryById($categoryId: String!) {
    categoryById(categoryId: $categoryId) {
      name
      bigImage
      smallImage
      description
      parentId
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
          reviews {
            rating
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
            Discount {
              percentage
            }
          }
          images
          createdAt
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
      Category {
        id
        name
      }
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
  query FetchAllCoupons($page: Int, $pageSize: Int) {
    fetchAllCoupons(page: $page, pageSize: $pageSize) {
      id
      available
      code
      discount
      checkout {
        id
        createdAt
      }
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
          Discount {
            id
            percentage
          }
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
  query GetAllPackages {
    getAllPackages {
      id
      customId
      Checkout {
        userName
        userId
        guestEmail
        deliveryComment
        governorateId
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

export const GET_ALL_USERS = gql`
  query FetchAllUsers {
    fetchAllUsers {
      id
      fullName
      email
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

export const FETCH_ALL_USERS = gql`
  query FetchAllUsers {
    fetchAllUsers {
      id
      fullName
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
          reference
        }
      }
      checkout {
        id
        Governorate {
          name
        }
        package {
          id
          customId
          status
        }
      }
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
      Checkout {
        id
        paymentMethod
        User {
          fullName
          email
          number
        }
        Coupons {
          discount
        }
        userId
        guestEmail
        deliveryComment
        userName
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
              Discount {
                percentage
              }
            }
          }
        }
      }
    }
  }
`;
export const DISCOUNT_PERCENTAGE_QUERY = gql`
  query DiscountsPercentage {
    DiscountsPercentage {
      id
      percentage
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
          Discount {
            percentage
          }
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
        subcategories {
          id
          name
          subcategories {
            id
            name
          }
        }
      }
      productDiscounts {
        id
        price
        newPrice
        dateOfEnd
        dateOfStart
        discountId
      }
      Colors {
        id
        color
        Hex
      }
      Brand {
        id
        name
        logo
      }
      attributes {
        id
        name
        value
      }
    }
  }
`;
