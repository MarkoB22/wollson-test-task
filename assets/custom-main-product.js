// Images color filtering, swiper initialization and settings
document.addEventListener("DOMContentLoaded", function () {
  let colorRadios = document.querySelectorAll(".custom_main_product-color_option");
  let mainSwiperWrapper = document.querySelector(".custom_main_product-main_image_wrapper");
  let thumbSwiperWrapper = document.querySelector(".thumbsSwiper .swiper-wrapper");

  let allMainSlides = [...document.querySelectorAll(".custom_main_product-main_image")];
  let allThumbSlides = [...document.querySelectorAll(".custom_main_product-thumbnail")];

  let mainSwiper = new Swiper(".custom_main_product-swiper", {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      navigation: {
          nextEl: ".custom-swiper-button-next",
          prevEl: ".custom-swiper-button-prev",
      },
  });

  let thumbSwiper = new Swiper(".thumbsSwiper", {
      slidesPerView: "auto",
      spaceBetween: 10,
      loop: true,
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
      slideToClickedSlide: true,
  });

  mainSwiper.thumbs.swiper = thumbSwiper;

  function updateImagesAndThumbnails(selectedColor) {
      mainSwiperWrapper.innerHTML = "";
      thumbSwiperWrapper.innerHTML = "";

      let activeThumbIndex = null;

      allMainSlides.forEach((slide, index) => {
          let img = slide.querySelector("img");
          if (img.getAttribute("alt").toLowerCase().includes(selectedColor)) {
              mainSwiperWrapper.appendChild(slide.cloneNode(true));
          }
      });

      allThumbSlides.forEach((thumb, index) => {
          if (thumb.getAttribute("thumbnail-alt").toLowerCase().includes(selectedColor)) {
              thumbSwiperWrapper.appendChild(thumb.cloneNode(true));
              if (activeThumbIndex === null) {
                  activeThumbIndex = index;
              }
          }
      });

      mainSwiper.update();
      thumbSwiper.update();

      if (activeThumbIndex !== null) {
          thumbSwiper.slideTo(activeThumbIndex);
      }
  }

  colorRadios.forEach(radio => {
      radio.addEventListener("change", function () {
          updateImagesAndThumbnails(this.value.toLowerCase());
      });
  });

  const checkedColor = document.querySelector(".custom_main_product-color_option:checked").value.toLowerCase();
  updateImagesAndThumbnails(checkedColor);
});

// Variants selectors, quantity input, add to cart button and price update
document.addEventListener("DOMContentLoaded", function () {
    const productDataElement = document.querySelector(".custom_main_product-add_to_cart_and_quantity");
    
    // Parse product variants and inventory data
    const productVariants = JSON.parse(productDataElement.getAttribute("data-variants"));
    const inventoryData = JSON.parse(productDataElement.getAttribute("data-inventory"));

    const addToCartBtn = document.getElementById("add-to-cart");
    const priceElement = document.querySelector(".custom_main_product-price");
    const comparePriceElement = document.querySelector(".custom_main_product-compare_price");
    const increaseQtyBtn = document.getElementById("increase-qty");
    const decreaseQtyBtn = document.getElementById("decrease-qty");
    const quantityInput = document.getElementById("product-quantity");
    let selectedVariantId = null;
    let maxQuantity = Infinity;

    function getSelectedOptions() {
        let selectedOptions = [];

        // Get selected color (radio input)
        const selectedColor = document.querySelector(".custom_main_product-color_option:checked");
        if (selectedColor) {
            selectedOptions.push(selectedColor.value.toLowerCase());
        }

        // Get selected dropdown values
        document.querySelectorAll(".variant-option").forEach(input => {
            selectedOptions.push(input.value.toLowerCase());
        });

        return selectedOptions;
    }

    function updateVariant() {
        const selectedOptions = getSelectedOptions();

        let matchingVariant = productVariants.find(variant => {
            return selectedOptions.every((option, index) =>
                variant[`option${index + 1}`]?.toLowerCase() === option
            );
        });

        if (matchingVariant) {
            selectedVariantId = matchingVariant.id;
            addToCartBtn.dataset.variantId = matchingVariant.id;

            // Update Price
            priceElement.textContent = priceElement.dataset.currency + (matchingVariant.price / 100).toFixed(2);

            // Update Compare at Price
            if (matchingVariant.compare_at_price && matchingVariant.compare_at_price > matchingVariant.price) {
                comparePriceElement.textContent = priceElement.dataset.currency + (matchingVariant.compare_at_price / 100).toFixed(2);
                comparePriceElement.style.display = "inline";
            } else {
                comparePriceElement.style.display = "none";
            }

            // Get the correct inventory quantity
            maxQuantity = inventoryData[selectedVariantId] ?? Infinity;
            console.log(`Variant ID: ${selectedVariantId}, Inventory: ${maxQuantity}`);

            // Handle Out of Stock Case
            if (maxQuantity === 0) {
                addToCartBtn.disabled = true;
                addToCartBtn.classList.add("disabled");

                // Set quantity to 1 and disable it
                quantityInput.value = 1;
                quantityInput.disabled = true;
            } else {
                addToCartBtn.disabled = false;
                addToCartBtn.classList.remove("disabled");

                // Enable quantity input and adjust it if necessary
                quantityInput.disabled = false;
                if (parseInt(quantityInput.value, 10) > maxQuantity) {
                    quantityInput.value = maxQuantity;
                }
            }

            updateQuantityButtons();
        }
    }

    function updateQuantityButtons() {
        let value = parseInt(quantityInput.value, 10);
        if (!isNaN(value)) {
            quantityInput.value = String(value).padStart(2, "0");
        }
        const currentQuantity = parseInt(quantityInput.value, 10);

        // Disable "+" button if max quantity is reached
        increaseQtyBtn.disabled = currentQuantity >= maxQuantity;

        // Disable "-" button if at minimum
        decreaseQtyBtn.disabled = currentQuantity <= 1;
    }

    // Event Listeners for Quantity Buttons
    increaseQtyBtn.addEventListener("click", () => {
        let currentQty = parseInt(quantityInput.value, 10);
        if (currentQty < maxQuantity) {
            quantityInput.value = currentQty + 1;
            updateQuantityButtons();
        }
    });

    decreaseQtyBtn.addEventListener("click", () => {
        let currentQty = parseInt(quantityInput.value, 10);
        if (currentQty > 1) {
            quantityInput.value = currentQty - 1;
            updateQuantityButtons();
        }
    });

    // Event Listeners for Color Selection
    document.querySelectorAll(".custom_main_product-color_option").forEach(radio => {
        radio.addEventListener("change", updateVariant);
    });

    // Event Listeners for Dropdown Selection
    document.querySelectorAll(".custom_main_product-custom_dropdown").forEach(dropdown => {
        const selected = dropdown.querySelector(".custom_main_product-custom_dropdown_selected");
        const selectedText = dropdown.querySelector(".custom_main_product-custom_dropdown_selected_text");
        const items = dropdown.querySelectorAll(".custom_main_product-custom_dropdown_item");
        const hiddenInput = dropdown.querySelector(".variant-option");

        selected.addEventListener("click", function () {
            dropdown.classList.toggle("active");
        });

        items.forEach(item => {
            item.addEventListener("click", function () {
                selectedText.textContent = this.textContent;
                hiddenInput.value = this.dataset.value;
                dropdown.classList.remove("active");
                updateVariant();
            });
        });

        document.addEventListener("click", function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove("active");
            }
        });
    });

    // Add to Cart
    addToCartBtn.addEventListener("click", function () {
        if (selectedVariantId) {
            let quantity = parseInt(quantityInput.value);

            fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: selectedVariantId,
                    quantity: quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                alert("Added to cart!");
            })
            .catch(error => console.error('Error adding to cart:', error));
        } else {
            alert("Please select all options.");
        }
    });

    updateVariant();
});




