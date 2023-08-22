const Cart = require('../cart');

describe('Cart', () => {
    let cart;

    beforeEach(() => {
        cart = new Cart();
    });

    describe('addItem', () => {
        it('Must add product to cart.', () => {
            const result = cart.addItem(1, 1001, 1234, 10.0, 2);

            expect(result.result).toBe(true);
            expect(result.message).toBe('Item added to cart');
        });

        it('If the product is already in the cart, it should update the quantity.', () => {
            cart.addItem(1, 1001, 1234, 10.0, 2);
            const result = cart.addItem(1, 1001, 1234, 10.0, 3);

            expect(result.result).toBe(true);
            expect(result.message).toBe('Added from the same item, item quantity updated in cart.');
        });

        it('If the basket is full, an error message should return.', () => {
            for (let i = 0; i < 30; i++) {
                cart.addItem(i + 1, 1001, 1234, 10.0, 1);
            }

            const result = cart.addItem(31, 1001, 1234, 10.0, 1);

            expect(result.result).toBe(false);
            expect(result.message).toBe('Cart can contain a maximum of 10 unique items(excluding VasItems). ItemId with 31 can\'t added.');
        });
    });

    describe('addVasItemToItem', () => {
        it('Must add VasItem to an existing product.', () => {
            cart.addItem(1, 1001, 1234, 10.0, 2);
            const result = cart.addVasItemToItem(1, 10001, 3242, 5003, 5.0, 1);

            expect(result.result).toBe(true);
            expect(result.message).toBe('VasItem added to item with itemId: 1.');
        });

        it('If the product has not been added to the cart, an error message should return.', () => {
            const result = cart.addVasItemToItem(1, 10001, 3242, 5003, 5.0, 1);

            expect(result.result).toBe(false);
            expect(result.message).toBe('Item not found in cart');
        });

        it('If VasItem cannot be added to the product, an error message should return.', () => {
            cart.addItem(1, 1002, 5678, 20.0, 1);
            const result = cart.addVasItemToItem(1, 10001, 3242, 5003, 5.0, 1);

            expect(result.result).toBe(false);
            expect(result.message).toBe('VasItem can only be added to items in Furniture or Electronics category');
        });

        describe('removeItem', () => {
            it('Must remove a product from the cart.', () => {
                cart.addItem(1, 1001, 1234, 10.0, 2);
                const result = cart.removeItem(1);

                expect(result.result).toBe(true);
                expect(result.message).toBe('Item removed from cart');
            });

            it('When trying to remove a product that is not in the cart, the error message should return.', () => {
                const result = cart.removeItem(1);

                expect(result.result).toBe(false);
                expect(result.message).toBe('Item with itemId:1 not found in cart');
            });
        });

        describe('resetCart', () => {
            it('Should reset the cart.', () => {
                cart.addItem(1, 1001, 1234, 10.0, 2);
                const result = cart.resetCart();

                expect(result.result).toBe(true);
                expect(result.message).toBe('Cart reset');
                expect(cart.getTotalItemCount()).toBe(0);
            });
        });

        describe('displayCart', () => {
            it('Display the cart correctly and apply promotions.', () => {
                cart.addItem(1, 1001, 1234, 10.0, 2);
                const result = cart.displayCart();

                expect(result.result).toBe(true);
                expect(result.message.items.length).toBe(1);
                expect(result.message.totalPrice).toBe(0);
                expect(result.message.appliedPromotionId).not.toBeNull();
                expect(result.message.totalDiscount).toBeGreaterThan(0);
            });
        });
    });
});
