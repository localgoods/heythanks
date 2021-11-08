export function productDataIsEmpty(productData) {
  return productData && !productData.productByHandle?.id;
}

export function productDataNeedsDelete({
  subscriptionIsDeactivated,
  productData,
}) {
  return subscriptionIsDeactivated && productData?.productByHandle?.id;
}

export function shopMetafieldIsEmpty({ shopData, shopDataError }) {
  return shopData?.shop && !shopDataError && !shopData?.shop?.privateMetafield;
}
