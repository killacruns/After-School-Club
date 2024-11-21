new Vue({
    el: "#app",
    data: {
      showProduct: true,
      sortOrder: "ascending",
      sortCriteria: "name",
      searchQuery: "",
      lessons: lessons, // Assuming 'lessons' is an array of lesson objects
      cart: [], // The shopping cart
    },
    methods: {
      addToCart(index) {
        const lesson = this.lessons[index];
        if (lesson.spaces > 0) {
          // Find if the item is already in the cart
          const cartItem = this.cart.find((item) => item.id === lesson.id);
          if (cartItem) {
            cartItem.quantity++;
          } else {
            // If it's not in the cart, add it
            this.cart.push({ ...lesson, quantity: 1 });
          }
          // Reduce the number of spaces available in the lesson
          lesson.spaces--;
        } else {
          alert("No spaces left for this lesson.");
        }
      },
      removeFromCart(index) {
        // Remove the item from the cart by index
        const cartItem = this.cart[index];
        cartItem.quantity--;
        if (cartItem.quantity === 0) {
          this.cart.splice(index, 1); // Remove the item completely from the cart
        }
        // Increase the spaces available for that lesson
        const lesson = this.lessons.find(lesson => lesson.id === cartItem.id);
        if (lesson) {
          lesson.spaces++;
        }
      },
      showCheckOut() {
        this.showProduct = false; // Toggle to the cart view
      },
      backToLessons() {
        this.showProduct = true; // Toggle back to the lessons view
      },
    },
    computed: {
      cartItemCount() {
        // Total items in the cart
        return this.cart.reduce((total, item) => total + item.quantity, 0);
      },
      isCartEmpty() {
        // Check if the cart is empty
        return this.cart.length === 0;
      },
      total() {
        // Calculate the total price of all items in the cart
        return this.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
      },
      filterItems() {
        const query = this.searchQuery.toLowerCase();
        return this.lessons.filter((lesson) =>
          lesson.subject.toLowerCase().includes(query)
        );
      },
    },
  });
  