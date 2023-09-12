document.addEventListener('DOMContentLoaded', function() {
  var images = document.querySelectorAll('.web-mains img');
  var cartCounter = document.querySelector('.cart span');
  var selectButtonsadd = document.querySelectorAll('.plus-button');
  var selectButtonssub = document.querySelectorAll('.minus-button');
  var cartCount = 0;

  selectButtonsadd.forEach(function(button) {
    button.addEventListener('click', function(event) {
      var quantityElement = button.parentNode.querySelector('.quantity');
      var currentValue = parseInt(quantityElement.textContent);
      var newValue = currentValue + 1;
      quantityElement.textContent = newValue;
      localStorage.setItem('quantityValue', newValue);
      var imageSrc = event.target.getAttribute('data-image');
      var price = parseFloat(event.target.getAttribute('data-price'));
      var item = {
        imageSrc: imageSrc,
        price: price,
        quantity: 1,
      };
      addToCart(item, button);
    });
  });


  


  selectButtonssub.forEach(function(button) {
    button.addEventListener('click', function(event) {
      var imageSrc = event.target.getAttribute('data-image');
      var price = parseFloat(event.target.getAttribute('data-price'));
      var item = {
        imageSrc: imageSrc,
        price: price,
        quantity: 1,
      };
      var quantityElement = button.parentNode.querySelector('.quantity');
      var currentValue = parseInt(quantityElement.textContent);
      var newValue = currentValue - 1;
      if (newValue < 0) {
        newValue = 0;
      }
      quantityElement.textContent = newValue;
      localStorage.setItem('quantityValue', newValue);
      subFromCart(item, button);
    });
  });

  images.forEach(function(img) {
    img.addEventListener('click', function() {
      var enlargedImg = document.createElement('div');
      enlargedImg.classList.add('enlarged-img');

      var imgElement = document.createElement('img');
      imgElement.src = this.src;

      var textElement = document.createElement('p');

      if (img.src.endsWith('1.jpg')) {
        textElement.textContent = 'Nori $2 each pack';
      } else if (img.src.endsWith('2.jpg')) {
        textElement.textContent = 'Rice $5 each pack';
      }

      enlargedImg.appendChild(imgElement);
      enlargedImg.appendChild(textElement);

      document.body.appendChild(enlargedImg);

      enlargedImg.addEventListener('click', function() {
        this.remove();
      });
    });
  });

  function addToCart(item, button) {
    try {
      var cartItems = localStorage.getItem('cartItems');
      if (cartItems) {
        cartItems = JSON.parse(cartItems);
      } else {
        cartItems = [];
      }

      var existingItem = cartItems.find(function(cartItem) {
        return cartItem.imageSrc === item.imageSrc;
      });

      if (existingItem) {
        existingItem.quantity++;
        existingItem.price += item.price;
      } else {
        item.quantity = 1;
        cartItems.push(item);
      }

      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      updateCartCountAndTotalPrice(cartItems);

      // 添加条件检查，确保existingItem存在
      if (existingItem) {
        var quantityElement = button.parentNode.querySelector('.quantity');
        var quantityZeroElement = button.parentNode.querySelector('.quantity-zero');

        quantityElement.textContent = existingItem.quantity;
        if (existingItem.quantity === 0) {
          quantityZeroElement.style.display = 'inline'; // 显示数量为零的元素
        } else {
          quantityZeroElement.style.display = 'none'; // 隐藏数量为零的元素
        }
      }
    } catch (error) {
      console.error('Invalid JSON format:', error);
      // 处理JSON格式错误
    }
  }

  function subFromCart(item, button) {
    try {
      var cartItems = localStorage.getItem('cartItems');
      if (cartItems) {
        cartItems = JSON.parse(cartItems);
      } else {
        cartItems = [];
      }

      var itemIndex = cartItems.findIndex(function(cartItem) {
        return cartItem.imageSrc === item.imageSrc;
      });

      if (itemIndex !== -1) {
        var existingItem = cartItems[itemIndex];

        existingItem.quantity--;
        existingItem.price -= item.price;

        if (existingItem.quantity === 0) {
          cartItems.splice(itemIndex, 1);
        }
        if (existingItem) {
          var quantityElement = button.parentNode.querySelector('.quantity');
          var quantityZeroElement = button.parentNode.querySelector('.quantity-zero');

          quantityElement.textContent = existingItem.quantity;
          if (existingItem.quantity === 0) {
            quantityZeroElement.style.display = 'inline'; // 显示数量为零的元素
          } else {
            quantityZeroElement.style.display = 'none'; // 隐藏数量为零的元素
          }
        }

        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartCountAndTotalPrice(cartItems);
        button.parentNode.querySelector('.quantity').textContent = existingItem.quantity;
        button.parentNode.querySelector('.quantity-zero').textContent = existingItem.quantity + ' ';
      }
    } catch (error) {
      console.error('Invalid JSON format:', error);
      // 处理JSON格式错误
    }
  }

  function updateCartCount(cartItems) {
    var count = 0;
    cartItems.forEach(function(item) {
      count += item.quantity;
    });

    var cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      cartCountElement.textContent = count;
    }
  }

  var cartItems = localStorage.getItem('cartItems');

  if (cartItems) {
    cartItems = JSON.parse(cartItems);
    displayCartItems(cartItems);
    updateCartCount(cartItems);
  }

  function calculateTotalPrice(cartItems) {
    var totalPrice = 0;
    cartItems.forEach(function(item) {
      totalPrice += item.price;
    });
    return totalPrice;
  }

  function updateCartCountAndTotalPrice(cartItems) {
    var count = 0;
    var totalPrice = 0;

    if (Array.isArray(cartItems)) {
      cartItems.forEach(function(item) {
        count += item.quantity;
        totalPrice += item.price;
      });
    } else {
      console.error('Invalid cart items:', cartItems);
      return;
    }

    var cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      cartCountElement.textContent = count;
    }

    var totalPriceElement = document.getElementById('totalPrice');
    if (totalPriceElement) {
      totalPriceElement.textContent = '$' + totalPrice.toFixed(2);
    }
  }

  function displayCartItems(cartItems) {
    var cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';

      try {
        if (Array.isArray(cartItems)) {
          cartItems.forEach(function(item, index) {
            var cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');

            var itemImage = document.createElement('img');
            itemImage.src = item.imageSrc;

            var itemPrice = document.createElement('p');
            itemPrice.textContent = '$' + item.price.toFixed(2);

            cartItemDiv.appendChild(itemImage);
            cartItemDiv.appendChild(itemPrice);

            cartItemsContainer.appendChild(cartItemDiv);
          });
        } else {
          console.error('Invalid cart items:', cartItems);
          return;
        }
      } catch (error) {
        console.error('Error parsing cart items:', error);
        return;
      }
    }
  }

  // 从本地存储中获取购物车数据，并更新数量显示和购物车内容
  var storedCartItems = localStorage.getItem('cartItems');
  if (storedCartItems) {
    var cartItems = JSON.parse(storedCartItems);
    updateCartCountAndTotalPrice(cartItems);
    displayCartItems(cartItems);
    updateCartCount(cartItems);
  }

  var storedValue = localStorage.getItem('quantityValue');
  if (storedValue) {
    var quantityElements = document.querySelectorAll('.quantity');
    quantityElements.forEach(function(element) {
      element.textContent = storedValue;
    });
  }
});