const app = new Vue({
  el: "#app",
  data: {
    lessons: [], // This will be loaded from the lessons API
    cart: [], // Contains items added to the cart
    searchQuery: "",
    sortCriteria: "name",
    sortOrder: "ascending",
    showProduct: true, // Determines if the product page is displayed
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
      BC: "British Columbia",
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
    // Fetch lessons from the API
    fetchLessons() {
      fetch('http://localhost:3000/api/lessons')
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          this.lessons = data; // Update lessons with the fetched data
        })
        .catch(err => {
          console.error("Failed to fetch lessons:", err);
        });
    },

    // Add lesson to the cart and decrease available spaces
    addToCart(index) {
      const lesson = this.lessons[index];
      if (lesson.spaces > 0) {
        lesson.spaces--; // Decrease the space count when added to the cart
        this.cart.push({ ...lesson, quantity: 1 });
      }
    },

    // Remove item from the cart and restore space
    removeFromCart(index) {
      const cartItem = this.cart[index];
      const lessonIndex = this.lessons.findIndex(
        (lesson) => lesson.subject === cartItem.subject
      );
      if (lessonIndex >= 0) {
        this.lessons[lessonIndex].spaces += this.cart[index].quantity; // Restore spaces on removal
      }
      this.cart.splice(index, 1); // Remove item from cart
    },

    // Clear the cart
    clearCart() {
      this.cart = [];
    },

    // Show the checkout page
    showCheckOut() {
      this.showProduct = false; // Hide the product page and show cart
    },

    // Reset the order and return to the product view
    resetOrder() {
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

    // Handle form submission and show the order summary
    handleSubmit() {
      this.showSummary = true;
      this.showProduct = false;
    },

    // Post an order to the API and clear cart if successful
    placeOrder(order) {
      fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to place the order");
          }
          return response.json();
        })
        .then(data => {
          this.cart = []; // Clear the cart after successful order
          this.checkoutData = {
            name: '',
            address: '',
            phone: '',
            city: '',
            state: '',
          };
          this.isCheckoutEnabled = false;
          this.showCourses = true;
          alert(`Order placed successfully! Order ID: ${data.orderId}`);
        })
        .catch(err => {
          console.error("Error placing order:", err);
          alert("Failed to place the order. Please try again.");
        });
    },

    // Update available space for a lesson
    updateAvailableSpace(courseId, updatedSpaces) {
      fetch(`http://localhost:3000/api/lessons/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availableSpaces: updatedSpaces }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to update lesson space");
          }
          return response.json();
        })
        .then(data => {
          console.log("Lesson space updated successfully:", data);
        })
        .catch(err => {
          console.error("Error updating lesson space:", err);
        });
    },
  },
  mounted() {
    // Fetch lessons when the component is mounted
    this.fetchLessons();
  },
});
