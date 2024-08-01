import { gql } from "@apollo/client";

export const GET_PACKAGES_QUERY = gql`
  query GetAllPackages {
    getAllPackages {
      id
      checkoutId
      status
      createdAt
      Checkout {
        id
        total
      }
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
          isVisible
          reference
          description
          inventory
          solde
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

export const ORDERS_QUERY = gql`
  query GetAllPackages {
    getAllPackages {
      id
      customId
      Checkout {
        userName
        userId
        governorateId
        address
        phone
        productInCheckout {
          productQuantity
          price
          discountedPrice
          product {
            id
            name
            reference
            images
          }
        }
        total
      }
      status
      createdAt
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

export const FETCH_ALL_USERS = gql`
query FetchAllUsers {
  fetchAllUsers {
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
        User {
          fullName
          email
          number
        }
        Coupons {
          discount
        }
        userId
        userName
        phone
        address
        governorateId
        manualDiscount
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

export const PRODUCT_BY_ID_QUERY = gql`
  query ProductById($productByIdId: ID!) {
    productById(id: $productByIdId) {
      id
      name
      price
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
