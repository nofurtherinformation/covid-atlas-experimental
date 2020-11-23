const getCartogramValues = (gda_proxy, dataset, data ) => {
    let cartogramData = gda_proxy.cartogram(dataset, data)
    return cartogramData;
}

export default getCartogramValues;