# Shopping_Card_App
Simple Shopping Card Application
Cart
It is an object that contains all other objects. All objects are applied to the Cart. A cart can contain a maximum of 10 unique items (excluding VasItems). The total number of products cannot exceed 30. The total amount of the Cart cannot exceed 500,000 TL.

Item
Items are the products found in the Cart. Items can be added to and removed from the Cart. Items in the Cart can be reset. Items can be of multiple types such as VasItem, DefaultItem, DigitalItem. Multiple instances of unique item can be added as quantity. The maximum quantity of an item that can be added is 10. The price of each item is determined differently and provided as input to the application. Items in the Cart have seller and category IDs.

DigitalItem
DigitalItem is an item that exist in the cart with the same type of items. Digital items include items such as steam cards, donation cards, etc. The maximum quantity of DigitalItem that can be added is 5. Items with CategoryID 7889 are defined as DigitalItems. Another type of item cannot be defined with this CategoryID.

DefaultItem
Default items are the products commonly used in traditional e-commerce. For example, t-shirt, mobile phone, detergent, etc. The price of the VasItem added to the DefaultItem cannot be higher than the DefaultItem's price.

VasItem
VasItem represents value-added service items such as insurance, assembly, etc. These items do not represent a physical product but a service related to a specific product and they do not have a meaning on their own. Therefore, they can only be added as sub-items to default items in the Furniture (CategoryID: 1001) and Electronics (CategoryID: 3004) categories. A maximum of 3 VasItems can be added to a DefaultItem. The CategoryID of VasItem is 3242. The seller ID of VasItems is 5003. VasItems cannot be defined with a seller ID other than 5003. There is no other type of item with a seller ID of 5003.

Promotion
An entity that applies a discount to specific items or the entire Cart.

SameSellerPromotion
The SameSellerPromotion ID is 9909. If the seller of the items in the Cart is the same (excluding VasItems), SameSellerPromotion is applied to the Cart, and a 10% discount is applied to the total amount of the Cart.

CategoryPromotion
The CategoryPromotion ID is 5676. A promotion with a 5% discount is applied to the items in the Cart with CategoryID 3003. It is applied to the total amount of the Cart.

TotalPricePromotion
The TotalPricePromotion ID is 1232. If the price of the cart is less than 5,000 TL (excluding 5,000), a discount of 250 TL is applied. If the price is between 5,000 TL and 10,000 TL (excluding 10,000), a discount of 500 TL is applied. If the price is between 10,000 TL and 50,000 TL (excluding 50,000), a discount of 1,000 TL is applied. If the price is 50,000 TL or above, a discount of 2,000 TL is applied.

Multiple promotions are not applied to the Cart. If a cart hits multiple promotions, the most advantageous promotion for the customer is applied (the most advantageous promotion is the one that provides the maximum discount to the customer, regardless of its type).

Commands
Below are the commands that can be used in the input file that your application will receive from the command line and the outputs that it will write to the output file. Input

{"command":"addItem","payload":{"itemId":int,"categoryId":int,"sellerId":int,"price":double,"quantity":int}}  
Output:

{"result":boolean, "message": string}  
Input

{"command":"addVasItemToItem", "payload": {"itemId": int, "vasItemId":int, "categoryId": int, "sellerId":int, "price":double, "quantity":int}}  
Output:

{"result":boolean, "message": string}  
Input

{"command":"removeItem", payload:{"itemId":int}}  
Output:

{"result":boolean, "message": string}  
Input

{"command":"resetCart"}  
Output:

{"result":boolean, "message": string}  
Input

{"command":"displayCart"}  
Output:

{"result":boolean, "message":{"items":[ty.item], "totalPrice":double, "appliedPromotionId":int, "totalDiscount":double}}  
ty.item -> {"itemId": int, "categoryId": int, "sellerId":int, "price":double, "quantity":int, "vasItems":[ty.vasItem]}  
ty.vasItem -> {"vasItemId":int, "categoryId": int, "sellerId":int, "price":double, "quantity":int}  
