const app = new Vue({
  el: "#app",
  data: {
    lessons: [], // Loaded from the backend
    cart: [], // Items added to the cart
    searchQuery: "", // User search input
    sortCriteria: "name", // Criteria to sort lessons
    sortOrder: "ascending", // Order of sorting (ascending/descending)
    showProduct: true, // Whether to show the product page
    showSummary: false, // Whether to show the order summary
    order: { // User order details
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      method: "",
    },
    states: { // List of states for the dropdown
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
    // Filters lessons based on search query and sorts them
    filterItems() {
      console.log("Lessons before filtering:", this.lessons); // Debugging line
    
      let filteredLessons = this.lessons;
      if (this.searchQuery) {
        filteredLessons = filteredLessons.filter((lesson) =>
          lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.sortCriteria) {
        filteredLessons.sort((a, b) => {
          const fieldA = a[this.sortCriteria];
          const fieldB = b[this.sortCriteria];
    
          if (typeof fieldA === "string" && typeof fieldB === "string") {
            return this.sortOrder === "ascending"
              ? fieldA.localeCompare(fieldB)
              : fieldB.localeCompare(fieldA);
          }
          return this.sortOrder === "ascending" ? fieldA - fieldB : fieldB - fieldA;
        });
      }
    
      console.log("Filtered Lessons:", filteredLessons); // Debugging line
      return filteredLessons;
      
    },
    
    // Checks if the cart is empty
    isCartEmpty() {
      return this.cart.length === 0;
    },
    // Calculates the total number of items in the cart
    cartItemCount() {
      return this.cart.reduce((total, item) => total + item.quantity, 0);
    },
    // Calculates the total price of items in the cart
    totalPrice() {
      return this.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    },
  },
  methods: {
    // Adds a lesson to the cart and updates available spaces
    addToCart(index) {
      const lesson = this.lessons[index];
      if (lesson.spaces > 0) {
        const cartItem = this.cart.find((item) => item.id === lesson.id);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          this.cart.push({ ...lesson, quantity: 1 });
        }
        lesson.spaces--; // Reduce available spaces
        this.updateAvailableSpace(lesson.id, lesson.spaces); // Update backend
      }
    },
    // Method to handle the search input with debounce
    handleSearchInput() {
      clearTimeout(this.debounceTimer); // Clear any previous debounce timer
      this.debounceTimer = setTimeout(() => {
          this.handleSearch(); // Call search after debounce delay
      }, 300); // 300ms delay
  },
  // Method to search for courses
  searchCourses() {
      console.log('Current search query:', this.searchQuery);
      const encodedQuery = encodeURIComponent(this.searchQuery.trim());
      fetch(`/api/search?q=${encodedQuery}`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to fetch search results');
              }
              return response.json();
          })
          .then(data => {
              this.courses = data;
          })
          .catch(error => {
              console.error('Error fetching search results:', error);
          });
  },
    // Removes an item from the cart and restores spaces
    removeFromCart(index) {
      const cartItem = this.cart[index];
      const lessonIndex = this.lessons.findIndex((lesson) => lesson.id === cartItem.id);
      if (lessonIndex >= 0) {
        this.lessons[lessonIndex].spaces += this.cart[index].quantity; // Restore spaces
        this.updateAvailableSpace(cartItem.id, this.lessons[lessonIndex].spaces); // Update backend
      }
      this.cart.splice(index, 1); // Remove item from cart
    },
    // Clears all items from the cart
    clearCart() {
      this.cart = [];
    },
    // Switches to the checkout view
    showCheckOut() {
      this.showProduct = false;
    },
    // Resets the order form and returns to the product view
    resetOrder() {
      this.cart = []; // Clear the cart
      this.order = { // Reset order details
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        method: "",
      };
      this.showProduct = true; // Show product page
      this.showSummary = false; // Hide summary
    },
    // Submits the order and shows the summary view
    handleSubmit() {
      // Save the order to the backend
      fetch("http://localhost:8000/collection/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: this.order,
          cart: this.cart,
          totalPrice: this.totalPrice,
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to save the order");
          return response.json();
        })
        .then((data) => {
          console.log("Order saved:", data);
          this.showSummary = true; // Show summary
          this.showProduct = false; // Hide product view
        })
        .catch((error) => console.error("Error saving order:", error));
    },
    // Updates the available spaces for a lesson on the backend
    updateAvailableSpace(id, spaces) {
      fetch(`http://localhost:8000/collection/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaces }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update available spaces");
          return response.json();
        })
        .then((data) => console.log("Updated spaces:", data))
        .catch((error) => console.error("Error updating spaces:", error));
    },
  },
  mounted() {
    // Fetches all lessons from the backend when the app loads
    fetch("http://localhost:8000/collection/products")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch lessons");
        return response.json();
      })
      .then((data) => {
        this.lessons = data; // Load lessons into the app
      })
      .catch((error) => console.error("Error fetching lessons:", error));
  },
  handleSubmit() {
    console.log("Submit button clicked");  // Log to see if this is triggered
    fetch("http://localhost:8000/collection/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: this.order,
        cart: this.cart,
        totalPrice: this.totalPrice,
      }),
    })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to save the order");
      return response.json();
    })
    .then((data) => {
      console.log("Order saved:", data);
      this.showSummary = true;
      this.showProduct = false;
    })
    .catch((error) => console.error("Error saving order:", error));
  }
});