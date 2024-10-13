const variants = [
  { size: "Small", stock: 567, price: "4567", _id: "66f7e0f271665dbdb1ab94a3" },
  { size: "Medium", stock: 123, price: "7890", _id: "66f7e0f271665dbdb1ab94a4" },

];

// Iterate through the variants array
variants.forEach(variant => {
    console.log(`Size: ${variant.size}`);
    console.log(`Stock: ${variant.stock}`);
    console.log(`Price: ${variant.price}`);

});
