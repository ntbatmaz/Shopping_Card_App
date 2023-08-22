class Cart {

    static MAX_CART_PRICE = 500000;
    static MAX_ITEM_COUNT = 30;
    static MAX_ITEM_QUANTITY = 10;
    static MAX_VAS_ITEMS = 3;
    static MAX_DIGITAL_ITEMS = 5;
    static DIGITAL_ITEM_SELLER_ID = 5003;
    static CATEGORY_FURNITURE = 1001;
    static CATEGORY_ELECTRONICS = 3004;
    static CATEGORY_VAS = 3242;
    static CATEGORY_DIGITAL = 7889;
    static TOTAL_PRICE_PROMOTION_ID = 1232;
    static SAME_SELLER_PROMOTION_ID = 9909;
    static CATEGORY_PROMOTION_ID = 5676;

    constructor() {
        this.items = [];
        this.totalPrice = 0;
        this.totalDiscount = 0;
        this.maxCartPrice = Cart.MAX_CART_PRICE;
        this.maxItemCount = Cart.MAX_ITEM_COUNT;
    }

    /**
     * Processes the given command and payload to perform the corresponding action on the cart.
     * @param {string} command - The command to execute.
     * @param {Object} payload - The payload containing the necessary data for the command.
     * @returns {Object} - The result of the command execution.
     */
    processCommand(command, payload) {
        switch (command) {
            case 'addItem':
                return this.addItem(
                    payload.itemId,
                    payload.categoryId,
                    payload.sellerId,
                    payload.price,
                    payload.quantity
                );
            case 'addVasItemToItem':
                return this.addVasItemToItem(
                    payload.itemId,
                    payload.vasItemId,
                    payload.categoryId,
                    payload.sellerId,
                    payload.price,
                    payload.quantity
                );
            case 'removeItem':
                return this.removeItem(payload.itemId);
            case 'resetCart':
                return this.resetCart();
            case 'displayCart':
                return this.displayCart();
            default:
                return { result: false, message: 'Invalid command' };
        }
    }

    /**
     * Adds an item to the cart or updates the quantity of an existing item.
     * @param {number} itemId - The ID of the item.
     * @param {number} categoryId - The category ID of the item.
     * @param {number} sellerId - The seller ID of the item.
     * @param {number} price - The price of the item.
     * @param {number} quantity - The quantity of the item to add.
     * @returns {Object} - The result of the item addition operation.
     */
    addItem(itemId, categoryId, sellerId, price, quantity) {

        if(sellerId == Cart.DIGITAL_ITEM_SELLER_ID){
            return { result: false, message: 'SellerId 5003 only for VasItems Seller' };
        }
        const existingItem = this.items.find(
            item => item.itemId === itemId && item.categoryId === categoryId && item.sellerId === sellerId
        );

        if (existingItem) {
            const totalQuantity = existingItem.quantity + quantity;
            if (totalQuantity > Cart.MAX_ITEM_QUANTITY) {
                const addedQuantity = Cart.MAX_ITEM_QUANTITY - existingItem.quantity;
                existingItem.quantity = Cart.MAX_ITEM_QUANTITY;
                this.totalPrice += addedQuantity * existingItem.price;
                return {
                    result: false,
                    message: `The maximum quantity of ${existingItem.itemId} in the cart is 10. Only ${addedQuantity} items added.`,
                    addedQuantity,
                };
            } else {
                existingItem.quantity += quantity;
                this.totalPrice += quantity * existingItem.price;
                return { result: true, message: 'Added from the same item, item quantity updated in cart.' };
            }
        }

        if (this.items.length == 10) {
            return { result: false, message: `Cart can contain a maximum of 10 unique items(excluding VasItems). ItemId with ${itemId} can't added.` };
        }

        const totalPriceWithNewItem = this.totalPrice + price * quantity;
        let categoryPromotion = this.calculateCategoryPromotion(totalPriceWithNewItem);
        let totalPricePromotion = this.calculateTotalPricePromotion(totalPriceWithNewItem);
        let sameSellerPromotion = this.calculateSameSellerPromotion(totalPriceWithNewItem);

        let bestPromotionValue = Math.max(categoryPromotion.discount, totalPricePromotion.discount, sameSellerPromotion.discount);

        if (totalPriceWithNewItem - bestPromotionValue > this.maxCartPrice) {
            const remainingQuantity = Math.floor((this.maxCartPrice - this.totalPrice) / price);
            if (remainingQuantity === 0) {
                return { result: false, message: 'Total cart price exceeded, total cart price cannot exceed 500000.' };
            } else {
                const addedQuantity = quantity - remainingQuantity;
                this.totalPrice += price * remainingQuantity;
                const item = { itemId, categoryId, sellerId, price, quantity: remainingQuantity, vasItems: [] };
                this.items.push(item);
                return {
                    result: false,
                    message: `Total cart price exceeded. Only ${remainingQuantity} items added to the cart.`,
                    addedQuantity,
                };
            }
        }

        if (this.getTotalItemCount() >= this.maxItemCount) {
            return {
                result: false,
                message: 'Cart is full. No items added to the cart.',
            };
        } else if (this.getTotalItemCount() + quantity > this.maxItemCount) {
            const remainingQuantity = this.maxItemCount - this.getTotalItemCount();
            const addedQuantity = quantity - remainingQuantity;
            const item = {
                itemId,
                categoryId,
                sellerId,
                price,
                quantity: remainingQuantity,
                vasItems: [],
            };
            this.items.push(item);
            this.totalPrice += price * remainingQuantity;
            return {
                result: false,
                message: `Total number of products exceeded. Only ${remainingQuantity} items added to the cart.`,
                addedQuantity,
            };
        }

        if (categoryId === Cart.CATEGORY_VAS) {
            return {
                result: false,
                message: 'VasItem can only be added as sub-items to items in the Furniture and electronic categories.',
            };
        }

        if (categoryId === Cart.CATEGORY_DIGITAL) {
            const digitalItemCount = this.getDigitalItemCount();
            if (digitalItemCount + quantity > Cart.MAX_DIGITAL_ITEMS) {
                const availableQuantity = Math.min(quantity, Cart.MAX_DIGITAL_ITEMS - digitalItemCount);
                if (availableQuantity > 0) {
                    const remainingQuantity = quantity - availableQuantity;
                    const item = { itemId, categoryId, sellerId, price, quantity: availableQuantity, vasItems: [] };
                    this.items.push(item);
                    this.totalPrice += price * availableQuantity;

                    if (remainingQuantity > 0) {
                        return {
                            result: false,
                            message: `The number of digital items cannot be more than ${Cart.MAX_DIGITAL_ITEMS}. Only ${availableQuantity} items added.`,
                            addedQuantity: availableQuantity,
                        };
                    } else {
                        return { result: true, message: 'Item added to cart' };
                    }
                } else {
                    return { result: false, message: `The number of digital items cannot be more than ${Cart.MAX_DIGITAL_ITEMS}. No items added.` };
                }
            }
        }

        const item = { itemId, categoryId, sellerId, price, quantity, vasItems: [] };
        this.items.push(item);
        this.totalPrice += price * quantity;

        return { result: true, message: 'Item added to cart' };
    }

    /**
     * Adds a VasItem to an existing item in the cart or updates the quantity of an existing VasItem.
     * @param {number} itemId - The ID of the item to add the VasItem to.
     * @param {number} vasItemId - The ID of the VasItem to add.
     * @param {number} categoryId - The category ID of the VasItem.
     * @param {number} sellerId - The seller ID of the VasItem.
     * @param {number} price - The price of the VasItem.
     * @param {number} quantity - The quantity of the VasItem to add.
     * @returns {Object} - The result of the VasItem addition operation.
     */
    addVasItemToItem(itemId, vasItemId, categoryId, sellerId, price, quantity) {

        if (sellerId != Cart.DIGITAL_ITEM_SELLER_ID){
            return { result: false, message: 'SellerId for vasItems must be 5003' };
        }
        const item = this.getItemById(itemId);

        if (!item) {
            return { result: false, message: 'Item not found in cart' };
        }

        if (categoryId !== Cart.CATEGORY_VAS) {
            return { result: false, message: 'The CategoryID of VasItem can only be 3242' };
        }
        const existingItem = this.items.find(item => item.itemId === itemId);
        if (existingItem && (existingItem.categoryId !== Cart.CATEGORY_FURNITURE && existingItem.categoryId !== Cart.CATEGORY_ELECTRONICS)) {
            return { result: false, message: 'VasItem can only be added to items in Furniture or Electronics category' };
        }

        if (existingItem && (existingItem.price < price)){
            return { result: false, message: 'The price of the VasItem added to the DefaultItem cannot be higher than the DefaultItem\'s price.' };
        }

        let availableSpace = Cart.MAX_VAS_ITEMS;
        if (item.vasItems.length > 0) {
            const existingVasItem = item.vasItems.find(vasItem => vasItem.vasItemId === vasItemId);
            if (existingVasItem) {
                availableSpace -= existingVasItem.quantity;
            }
        }

        if (availableSpace === 0) {
            return { result: false, message: 'A maximum of 3 VasItems can be added to a DefaultItem.' };
        }

        const existingVasItem = item.vasItems.find(vasItem => vasItem.vasItemId === vasItemId);

        if (existingVasItem) {
            const totalQuantity = existingVasItem.quantity + quantity;
            if (totalQuantity > Cart.MAX_ITEM_QUANTITY) {
                const addedQuantity = Cart.MAX_ITEM_QUANTITY - existingVasItem.quantity;
                existingVasItem.quantity = Cart.MAX_ITEM_QUANTITY;
                this.totalPrice += addedQuantity * existingVasItem.price;
                return {
                    result: false,
                    message: `The maximum quantity of ${existingVasItem.vasItemId} in the item is 10. Only ${addedQuantity} items added.`,
                    addedQuantity,
                };
            } else {
                existingVasItem.quantity += quantity;
                this.totalPrice += quantity * existingVasItem.price;
                return { result: true, message: 'VasItem quantity updated in item' };
            }
        }

        if (quantity > availableSpace) {
            if (availableSpace === 0) {
                return { result: false, message: 'A maximum of 3 VasItems can be added to a DefaultItem.' };
            } else {
                const addedQuantity = availableSpace;
                const vasItem = { vasItemId, categoryId, sellerId, price, quantity: addedQuantity };
                item.vasItems.push(vasItem);
                this.totalPrice += price * addedQuantity;
                return {
                    result: false,
                    message: `Only ${addedQuantity} VasItems added to the item.`,
                    addedQuantity,
                };
            }
        }

        const totalPriceWithVasItem = this.totalPrice + price * quantity;
        if (totalPriceWithVasItem > this.maxCartPrice) {
            const remainingQuantity = Math.floor((this.maxCartPrice - this.totalPrice) / price);
            if (remainingQuantity <= 0) {
                return { result: false, message: 'Total cart price exceeded, total cart price cannot exceed 500000.' };
            } else {
                const addedQuantity = quantity - remainingQuantity;
                this.totalPrice += price * remainingQuantity;
                const vasItem = { vasItemId, categoryId, sellerId, price, quantity: remainingQuantity };
                item.vasItems.push(vasItem);
                return {
                    result: false,
                    message: `Total cart price exceeded. Only ${remainingQuantity} VasItems added to the item.`,
                    addedQuantity,
                };
            }
        }

        const vasItem = { vasItemId, categoryId, sellerId, price, quantity };
        item.vasItems.push(vasItem);
        this.totalPrice += price * quantity;

        return { result: true, message: `VasItem added to item with itemId: ${itemId}.`};
    }

    /**
     * Removes an item from the cart.
     * @param {number} itemId - The ID of the item to remove.
     * @returns {Object} - The result of the item removal operation.
     */
    removeItem(itemId) {
        const itemIndex = this.items.findIndex(item => item.itemId === itemId);

        if (itemIndex === -1) {
            return { result: false, message: `Item with itemId:${itemId} not found in cart` };
        }

        const item = this.items[itemIndex];
        this.totalPrice -= item.price * item.quantity;
        this.items.splice(itemIndex, 1);

        return { result: true, message: 'Item removed from cart' };
    }

    /**
     * Resets the cart by removing all items and resetting the total price and discount.
     * @returns {Object} - The result of the cart reset operation.
     */
    resetCart() {
        this.items = [];
        this.totalPrice = 0;
        this.totalDiscount = 0;
        return { result: true, message: 'Cart reset' };
    }

    /**
     * Displays the cart with the list of items, total price, applied promotion ID, and total discount.
     * @returns {Object} - The result of displaying the cart.
     */
    displayCart() {
        const cartData = {
            items: this.items.map(item => ({
                itemId: item.itemId,
                categoryId: item.categoryId,
                sellerId: item.sellerId,
                price: item.price,
                quantity: item.quantity,
                vasItems: item.vasItems,
            })),
            totalPrice: this.totalPrice,
            appliedPromotionId: null,
            totalDiscount: this.totalDiscount,
        };

        this.applyPromotions(cartData);

        return { result: true, message: cartData };
    }

    getItemById(itemId) {
        return this.items.find(item => item.itemId === itemId);
    }

    getTotalItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    getDigitalItemCount() {
        return this.items.filter(item => item.categoryId === Cart.CATEGORY_DIGITAL).reduce((count, item) => count + item.quantity, 0);
    }

    applyPromotions(cartData) {
        const totalPricePromotion = this.calculateTotalPricePromotion(cartData.totalPrice);
        const sameSellerPromotion = this.calculateSameSellerPromotion(cartData.totalPrice);
        const categoryPromotion = this.calculateCategoryPromotion(cartData.totalPrice);

        if (totalPricePromotion.discount > sameSellerPromotion.discount && totalPricePromotion.discount > categoryPromotion.discount) {
            this.applyTotalPricePromotion(cartData, totalPricePromotion);
        } else if (sameSellerPromotion.discount > categoryPromotion.discount) {
            this.applySameSellerPromotion(cartData, sameSellerPromotion);
        } else {
            this.applyCategoryPromotion(cartData, categoryPromotion);
        }
    }

    calculateTotalPricePromotion(totalPrice) {
        const totalCartPrice = totalPrice;
        let discount = 0;

        if (totalCartPrice < 5000) {
            discount = 250;
        } else if (totalCartPrice < 10000) {
            discount = 500;
        } else if (totalCartPrice < 50000) {
            discount = 1000;
        } else {
            discount = 2000;
        }

        const currentDiscount = Math.min(discount, totalPrice);

        return {
            discount: currentDiscount,
            promotionId: Cart.TOTAL_PRICE_PROMOTION_ID
        };
    }

    calculateSameSellerPromotion(totalPrice) {
        if (this.items.length === 0) {
            return {
                discount: 0,
                promotionId: null
            };
        }

        const sameSellerId = this.items[0].sellerId;
        for (const item of this.items) {
            if (item.sellerId !== sameSellerId) {
                return {
                    discount: 0,
                    promotionId: null
                };
            }
        }

        const sameSellerPromotionId = Cart.SAME_SELLER_PROMOTION_ID;
        const discount = this.totalPrice * 0.1;

        const currentDiscount = Math.min(discount, totalPrice);

        return {
            discount: currentDiscount,
            promotionId: sameSellerPromotionId
        };
    }

    calculateCategoryPromotion(totalPrice) {
        const categoryPromotionId = Cart.CATEGORY_PROMOTION_ID;
        const categoryPromotionDiscount = 0.05;

        const categoryItems = this.items.filter(item => item.categoryId === 3003);
        if (categoryItems.length > 0) {
            const categoryTotalPrice = categoryItems.reduce((total, item) => total + item.price * item.quantity, 0);
            const categoryDiscount = categoryTotalPrice * categoryPromotionDiscount;

            const currentDiscount = Math.min(categoryDiscount, totalPrice);

            return {
                discount: currentDiscount,
                promotionId: categoryPromotionId
            };
        }

        return {
            discount: 0,
            promotionId: null
        };
    }

    applyTotalPricePromotion(cartData, promotion) {
        const currentDiscount = promotion.discount;
        const finalTotalPrice = cartData.totalPrice - currentDiscount;

        cartData.totalPrice = Math.max(finalTotalPrice, 0);
        cartData.appliedPromotionId = promotion.promotionId;
        cartData.totalDiscount += currentDiscount;
    }

    applySameSellerPromotion(cartData, promotion) {
        const currentDiscount = promotion.discount;
        const finalTotalPrice = cartData.totalPrice - currentDiscount;

        cartData.totalPrice = Math.max(finalTotalPrice, 0);
        cartData.appliedPromotionId = promotion.promotionId;
        cartData.totalDiscount += currentDiscount;
    }

    applyCategoryPromotion(cartData, promotion) {
        const currentDiscount = promotion.discount;
        const finalTotalPrice = cartData.totalPrice - currentDiscount;

        cartData.totalPrice = Math.max(finalTotalPrice, 0);
        cartData.appliedPromotionId = promotion.promotionId;
        cartData.totalDiscount += currentDiscount;
    }
}

module.exports = Cart;
