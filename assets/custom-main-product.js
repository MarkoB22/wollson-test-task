document.addEventListener("DOMContentLoaded", function () {
    const thumbSwiper = new Swiper(".custom_main_product-thumbnails_wrapper", {
      spaceBetween: 6.5,
      slidesPerView: "auto",
      freeMode: true,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
    });
  
    const mainSwiper = new Swiper(".custom_main_product-swiper", {
      loop: true,
      spaceBetween: 10,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".custom-swiper-button-next",
        prevEl: ".custom-swiper-button-prev",
      },
      thumbs: { swiper: thumbSwiper },
    });
  
    document.querySelectorAll(".custom_main_product-thumbnail").forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        mainSwiper.slideToLoop(index);
      });
    });
  
  });
  