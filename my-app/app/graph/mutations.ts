import { gql } from "@apollo/client";

export const CREATE_CAROUSEL_ADVERTISEMENT_MUTATIONS = gql`
  mutation CreateCarouselAdvertisement($input: [advertisementInput]) {
    createCarouselAdvertisement(input: $input)
  }
`;

export const ADMIN_SIGNIN = gql`
  mutation AdminSignIn($input: AdminSignInInput!) {
    adminSignIn(input: $input)
  }
`;
export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory(
    $updateCategoryId: ID!
    $input: UpdateCategoryInput!
  ) {
    updateCategory(id: $updateCategoryId, input: $input)
  }
`;
export const CREATE_MODERATOR = gql`
  mutation CreateModerator($adminId: ID!, $input: CreateModeratorInput!) {
    createModerator(adminId: $adminId, input: $input)
  }
`;

export const ADD_API_CREDENTIALS = gql`
  mutation AddApiCredentials($input: CreateApiCredentialsInput!) {
    addApiCredentials(input: $input)
  }
`;

export const CREATE_BANNER_ADVERTISEMENT_MUTATIONS = gql`
  mutation CreateBannerAdvertisement($input: [advertisementInput]) {
    createBannerAdvertisement(input: $input)
  }
`;
export const CREATE_CLIENT_SERVICE_MUTATIONS = gql`
  mutation CreateClientService($input: [advertisementInput]) {
    createClientService(input: $input)
  }
`;
export const CREATE_NEXT_TO_CAROUSEL_ADVERTISEMENT_MUTATIONS = gql`
  mutation CreateLeftNextToCarouselAds($input: [advertisementInput]) {
    createLeftNextToCarouselAds(input: $input)
  }
`;
export const CREATE_BIG_ADVERTISEMENT_MUTATIONS = gql`
  mutation CreateBigAds($input: advertisementInput) {
    createBigAds(input: $input)
  }
`;
export const CREATE_SIDE_ADVERTISEMENT_MUTATIONS = gql`
  mutation CreateSideAdvertisement($input: [advertisementInput]) {
    createSideAdvertisement(input: $input)
  }
`;
export const CREATE_COMPANY_INFO_MUTATIONS = gql`
  mutation CreateOrUpdateCompanyInfo($input: CompanyInfoInput!) {
    createOrUpdateCompanyInfo(input: $input) {
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
export const ADD_PRODUCT_TO_TOP_DEALS_MUTATION = gql`
  mutation AddProductToTopDeals($productId: String!) {
    addProductToTopDeals(productId: $productId)
  }
`;

export const ADD_COLOR_MUTATION = gql`
  mutation AddColor($color: String!, $hex: String!) {
    addColor(color: $color, Hex: $hex)
  }
`;

export const DELETE_COLOR_MUTATION = gql`
  mutation DeleteColor($hex: String!) {
    deleteColor(Hex: $hex)
  }
`;
export const ADD_BRAND_MUTATION = gql`
  mutation AddBrand($name: String!, $logo: String!, $categoryId: String) {
    addBrand(name: $name, logo: $logo, categoryId: $categoryId)
  }
`;
export const DELETE_BRAND_MUTATION = gql`
  mutation DeleteBrand($brandId: ID!) {
    deleteBrand(brandId: $brandId)
  }
`;

export const UPDATE_SECTION_VISIBILITY_MUTATIONS = gql`
  mutation UpdateSectionVisibility(
    $section: String!
    $visibilityStatus: Boolean!
  ) {
    updateSectionVisibility(
      section: $section
      visibilityStatus: $visibilityStatus
    )
  }
`;
export const ADD_BEST_SELLS_MUTATIONS = gql`
  mutation AddBestSells($productId: String!, $categoryId: String) {
    addBestSells(productId: $productId, categoryId: $categoryId)
  }
`;
export const DELETE_BEST_SELLS_MUTATIONS = gql`
  mutation AddBestSells($productId: String!) {
    deleteProductBestSells(productId: $productId)
  }
`;
export const DELETE_PRODUCT_MUTATIONS = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;
export const DELETE_PRODUCT_FROM_DEALS_MUTATION = gql`
  mutation DeleteTopDeals($productId: String!) {
    deleteTopDeals(productId: $productId)
  }
`;
export const DELETE_COUPONS_MUTATIONS = gql`
  mutation DeleteCoupons($couponsId: ID!) {
    deleteCoupons(couponsId: $couponsId)
  }
`;
export const PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS = gql`
  mutation PayedOrToDeliveryPackage(
    $packageId: ID!
    $status: String!
    $paymentMethod: PaymentMethod!
  ) {
    payedOrToDeliveryPackage(
      packageId: $packageId
      status: $status
      paymentMethod: $paymentMethod
    )
  }
`;
export const CREATE_COUPONS_MUTATIONS = gql`
  mutation CreateCoupons($input: CreateCouponInput!) {
    createCoupons(input: $input)
  }
`;
export const CREATE_PRODUCT_MUTATIONS = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input)
  }
`;
export const UPDATE_PRODUCT_MUTATIONS = gql`
  mutation UpdateProduct($productId: ID!, $input: ProductInput!) {
    updateProduct(productId: $productId, input: $input)
  }
`;
export const CANCEL_PACKAGE_MUTATIONS = gql`
  mutation CancelPackage($input: CancelPackageInput!) {
    cancelPackage(input: $input)
  }
`;
export const CREATE_CHECKOUT_MUTATION = gql`
  mutation CreateCheckout($input: CreateCheckoutInput!) {
    createCheckout(input: $input) {
      id
      userId
      governorateId
      phone
      address
      total
      createdAt
      couponsId
    }
  }
`;
export const UPDATE_CHECKOUT_MUTATIONS = gql`
  mutation UpdateCheckout($input: UpdateCheckoutInput!) {
    updateCheckout(input: $input)
  }
`;
export const UPDATE_CUSTOMER_MUTATIONS = gql`
  mutation UpdateCustomerCheckout($input: UpdateCustomerCheckoutInput!) {
    updateCustomerCheckout(input: $input)
  }
`;
export const REFUND_PACKAGE_MUTATIONS = gql`
  mutation RefundPackage($input: RefundPackageInput!) {
    refundPackage(input: $input)
  }
`;
export const UPDATE_PRODUCT_INVENTORY_MUTATION = gql`
  mutation AddProductInventory($productId: ID!, $inventory: Int!) {
    addProductInventory(productId: $productId, inventory: $inventory)
  }
`;
export const CREATE_PACKAGE_COMMENTS_MUTATIONS = gql`
  mutation CreatePackageComments($packageId: ID!, $comment: [String!]!) {
    createPackageComments(packageId: $packageId, comment: $comment)
  }
`;
export const CREATE_CHECKOUT_FROM_ADMIN_MUTATIONS = gql`
  mutation CreateCheckoutFromAdmin($input: CreateCheckoutFromAdminInput!) {
    createCheckoutFromAdmin(input: $input)
  }
`;

export const CREATE_CATEGORY_MUTATIONS = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input)
  }
`;
export const UPDATE_CATEGORY_MUTATIONS = gql`
  mutation UpdateCategory(
    $updateCategoryId: ID!
    $input: UpdateCategoryInput!
  ) {
    updateCategory(id: $updateCategoryId, input: $input)
  }
`;
export const DELETE_CATEGORIES_MUTATIONS = gql`
  mutation DeleteCategory($deleteCategoryId: ID!) {
    deleteCategory(id: $deleteCategoryId)
  }
`;
