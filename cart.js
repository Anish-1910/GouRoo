let cart = JSON.parse(localStorage.getItem("cart")) || [];
const container = document.getElementById("cartContainer");
const totalPriceEl = document.getElementById("totalPrice");
const cartDataInput = document.getElementById("cartData");

const razorPay = document.getElementById("razorPay");
const codPay = document.getElementById("codPay");
const termsSection = document.getElementById("termsSection");
const acceptTerms = document.getElementById("acceptTerms");
const termsError = document.getElementById("termsError");
const payNowBtn = document.getElementById("payWithRazorpay");
const placeOrderBtn = document.querySelector('button[type="submit"]');

let cartTotal = 0;

function renderCart() {
  container.innerHTML = "";
  cartTotal = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>Your cart is empty.</p>";
    totalPriceEl.innerHTML = "";
    return;
  }

  const cartSummary = [];

  cart.forEach((item, index) => {
    const priceValue = parseInt(item.price.replace(/[^\d]/g, ""));
    cartTotal += priceValue * item.quantity;

    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="width:250px; height:250px; border-radius:10px;"/>
      <h1 style="font-family: 'Shrikhand'; font-size: 1.2em;">${item.name}</h1>
      <h4>${item.price}</h4>
      <div class="quantity-controls">
        <button onclick="decreaseQuantity(${index})">-</button>
        <span>Quantity: ${item.quantity}</span>
        <button onclick="increaseQuantity(${index})">+</button>
      </div>
      <button onclick="removeFromCart(${index})" style="background-color:red; color:white; padding:5px 10px; border:none; border-radius:5px;">Remove</button>
    `;
    container.appendChild(div);
    cartSummary.push(`${item.name} - Qty: ${item.quantity}`);
  });

  cartDataInput.value = cartSummary.join('\n');
  updateDisplayAndButtons();
}

function increaseQuantity(index) {
  cart[index].quantity += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function calculateCartTotal() {
  cartTotal = 0;
  cart.forEach(item => {
    const price = parseInt(item.price.replace(/[^\d]/g, ""));
    cartTotal += price * item.quantity;
  });
}

function updateDisplayAndButtons() {
  calculateCartTotal();
  const isCartEmpty = cart.length === 0;

  // Reset visibility
  document.getElementById("codFinalAmount").style.display = "none";
  document.getElementById("razorpayFinalAmount").style.display = "none";

  if (razorPay.checked) {
    termsSection.style.display = "block";
    document.getElementById("razorpaySection").style.display = "block";
    payNowBtn.disabled = !acceptTerms.checked;
    placeOrderBtn.disabled = !acceptTerms.checked;

    if (!isCartEmpty) {
      totalPriceEl.innerHTML = `Total: ₹${cartTotal}/-`;
      document.getElementById("razorpayFinalAmount").innerText = `Final Amount to Pay: ₹${cartTotal}/-`;
      document.getElementById("razorpayFinalAmount").style.display = "block";
    }

  } else if (codPay.checked) {
    termsSection.style.display = "block";
    document.getElementById("razorpaySection").style.display = "none";
    payNowBtn.disabled = true;
    placeOrderBtn.disabled = !acceptTerms.checked;

    if (!isCartEmpty) {
      totalPriceEl.innerHTML = `Total: ₹${cartTotal}/-`;
      document.getElementById("codFinalAmount").innerText = `Final Amount to Pay: ₹${cartTotal + 100}/- (Includes ₹100 COD charge)`;
      document.getElementById("codFinalAmount").style.display = "block";
    }
  }
}

razorPay.addEventListener("change", updateDisplayAndButtons);
codPay.addEventListener("change", updateDisplayAndButtons);
acceptTerms.addEventListener("change", updateDisplayAndButtons);

document.getElementById("payWithRazorpay").addEventListener("click", function () {
  calculateCartTotal();
  const finalAmount = cartTotal;

  const options = {
    key: "rzp_live_tXMmp49Tpt9pr6",
    amount: finalAmount * 100,
    currency: "INR",
    name: "GouRoo Naturals",
    description: "Order Payment",
    image: "GouRoo®.png",
    handler: function (response) {
      alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      document.getElementById("orderForm").submit();
    },
    prefill: {
      name: document.getElementById("name").value,
      contact: document.getElementById("phone").value
    },
    theme: {
      color: "#3399cc"
    },
    method: {
      upi: true,
      card: false,
      netbanking: false,
      wallet: false,
      paylater: false
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
});

document.getElementById("orderForm").addEventListener("submit", function (e) {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  let hasError = false;
  document.getElementById("nameError").textContent = "";
  document.getElementById("phoneError").textContent = "";
  document.getElementById("addressError").textContent = "";
  termsError.textContent = "";

  if (name === "") {
    document.getElementById("nameError").textContent = "Name is required.";
    hasError = true;
  }

  if (!/^\d{10}$/.test(phone)) {
    document.getElementById("phoneError").textContent = "Enter a valid 10-digit phone number.";
    hasError = true;
  }

  if (address.length < 10) {
    document.getElementById("addressError").textContent = "Please enter a valid address.";
    hasError = true;
  }

  if (cart.length === 0) {
    alert("Your cart is empty. Please add products to proceed.");
    e.preventDefault();
    return;
  }

  if (!codPay.checked && !razorPay.checked) {
    alert("Please select a payment method.");
    e.preventDefault();
    return;
  }

  if ((codPay.checked || razorPay.checked) && !acceptTerms.checked) {
    termsError.textContent = "Please accept the terms and conditions.";
    hasError = true;
  }

  if (hasError) {
    e.preventDefault();
    return;
  }

  alert("Thank you! Your order has been placed.");
  localStorage.removeItem("cart");
});

renderCart();
updateDisplayAndButtons();
