const app = new Vue({
    el: "#app",
    data: {
      lessons: [], // This will be loaded from lessons.js
      cart: [], // Contains items added to the cart
      searchQuery: "",
      sortCriteria: "name",
      sortOrder: "ascending",
      showProduct: true, // Determines if product page is displayed
      showSummary: false, // Determines if order summary is displayed
      order: {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        method: "",
      },
      states: {
        KN: "Koln",
        MAN: "Manchester",
        BC: "British Colombia",
        VN: "Venice",
        LDN: "London",
        NY: "New York",
        LYN: "Lyon",
        HK: "Hong Kong",
        NRB: "Nairobi",
        KLF: "Kilifi",
      },
    },
    computed: {
      // Filter lessons based on search and sorting
      filterItems() {
        let filteredLessons = this.lessons;
  
        // Search filter
        if (this.searchQuery) {
          filteredLessons = filteredLessons.filter((lesson) =>
            lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }
  
        // Sorting
        if (this.sortCriteria) {
          filteredLessons.sort((a, b) => {
            const fieldA = a[this.sortCriteria];
            const fieldB = b[this.sortCriteria];
            if (this.sortOrder === "ascending") {
              return fieldA > fieldB ? 1 : -1;
            } else {
              return fieldA < fieldB ? 1 : -1;
            }
          });
        }
  
        return filteredLessons;
      },
      isCartEmpty() {
        return this.cart.length === 0;
      },
      cartItemCount() {
        return this.cart.length;
      },
      totalPrice() {
        return this.cart.reduce((total, item) => total + item.price, 0).toFixed(2);
      },
    },
    methods: {
      addToCart(index) {
        const lesson = this.lessons[index];
        if (lesson.spaces > 0) {
          lesson.spaces--;
          this.cart.push({ ...lesson, quantity: 1 });
        }
      },
      removeFromCart(index) {
        const cartItem = this.cart[index];
        const lessonIndex = this.lessons.findIndex(
          (lesson) => lesson.subject === cartItem.subject
        );
        if (lessonIndex >= 0) {
          this.lessons[lessonIndex].spaces += this.cart[index].quantity;
        }
        this.cart.splice(index, 1);
      },
      clearCart() {
        this.cart = [];
      },
      showCheckOut() {
        this.showProduct = false; // Switch to cart view
      },
      resetOrder() {
        // Reset order and return to product view
        this.cart = [];
        this.order = {
          firstName: "",
          lastName: "",
          address: "",
          city: "",
          state: "",
          method: "",
        };
        this.showProduct = true;
        this.showSummary = false;
      },
      handleSubmit() {
        // Display the order summary and hide the cart
        this.showSummary = true;
        this.showProduct = false;
      },
    },
    mounted() {
      // Load lessons from lessons.js
      this.lessons = lessons;
    },
  });
  