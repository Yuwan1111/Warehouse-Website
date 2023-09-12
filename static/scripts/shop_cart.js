document.addEventListener('DOMContentLoaded', function() {
  var cartItems = localStorage.getItem('cartItems');

  if (cartItems) {
    cartItems = JSON.parse(cartItems);
    displayCartItems(cartItems);
    updateTotalPrice(cartItems);
  }

  history.pushState(null, null, location.href);
  window.addEventListener('popstate', function() {
    history.pushState(null, null, location.href);
  });

  var payOrderButton = document.getElementById('payOrderButton');
  if (payOrderButton) {
    payOrderButton.addEventListener('click', function() {
      // Check if cart has items
      var cartItems = localStorage.getItem('cartItems');
      if (!cartItems || JSON.parse(cartItems).length === 0) {
        alert("Please select more items.");
        return;
      }

      // Display payment details
      document.getElementById('paymentDetails').style.display = 'block';

      // Check if payment details are filled
      var cardNumber = document.getElementById('cardNumber').value;
      var expirationDate = document.getElementById('expirationDate').value;
      var cvv = document.getElementById('cvv').value;
      if (cardNumber && expirationDate && cvv) {
        var order = {
          cartItems: JSON.parse(localStorage.getItem('cartItems')),
          paymentDetails: {
            cardNumber: cardNumber,
            expirationDate: expirationDate,
            cvv: cvv
          }
        };

        // Send AJAX request to Flask route
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Shop_cart', true); // 修改请求路径为大写的 "/Shop_cart"
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if (xhr.status === 200) {
            // Clear cart and redirect to My Orders page
            clearCartItems();
            window.location.href = "http://localhost:5000/My_orders";
          } else {
            alert("Failed to save the order. Please try again.");
          }
        };
        xhr.send(JSON.stringify(order));
      } else {
        alert("Please fill in all the payment details.");
      }
    });
  }

  function addToCart(item) {
    var cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      cartItems = JSON.parse(cartItems);
    } else {
      cartItems = [];
    }

    // 添加物品到购物车

    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    displayCartItems(cartItems);
    updateTotalPrice(cartItems);
    document.getElementById('paymentDetails').style.display = 'block';
  }

  function updateTotalPrice(cartItems) {
    var totalPrice = calculateTotalPrice(cartItems);

    var totalPriceElement = document.getElementById('totalPrice');
    if (totalPriceElement) {
      totalPriceElement.textContent = '$' + totalPrice.toFixed(2);
    }
  }

  function calculateTotalPrice(cartItems) {
    var totalPrice = 0;
    cartItems.forEach(function(item) {
      totalPrice += item.price;
    });
    return totalPrice;
  }

  function displayCartItems(cartItems) {
    var cartItemsContainer = document.getElementById('cartItems');

    cartItemsContainer.innerHTML = '';

    cartItems.forEach(function(item, index) {
      var cartItemDiv = document.createElement('div');
      cartItemDiv.classList.add('cart-item');

      var itemImage = document.createElement('img');
      itemImage.src = item.imageSrc;
      itemImage.alt = '';

      var itemName = document.createElement('p');
      itemName.textContent = item.name;

      var itemQuantity = document.createElement('p');
      itemQuantity.textContent = 'Quantity: ' + item.quantity;

      var itemPrice = document.createElement('p');
      itemPrice.textContent = 'Price: ' + item.price;

      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function() {
        removeFromCart(index);
      });

      cartItemDiv.appendChild(itemImage);
      cartItemDiv.appendChild(itemName);
      cartItemDiv.appendChild(itemQuantity);
      cartItemDiv.appendChild(itemPrice);
      cartItemDiv.appendChild(deleteButton);

      cartItemsContainer.appendChild(cartItemDiv);
    });
  }

  function removeFromCart(index) {
    var cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      cartItems = JSON.parse(cartItems);
      cartItems.splice(index, 1); // 从数组中删除指定索引的元素
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      displayCartItems(cartItems);
      updateTotalPrice(cartItems);
    }
  }

  function clearCartItems() {
    localStorage.removeItem('cartItems');
    displayCartItems([]);
    updateTotalPrice([]);
  }

  var clearButton = document.getElementById('clearButton');
  if (clearButton) {
    clearButton.addEventListener('click', clearCartItems);
  }

  let map;

  async function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });

    var locateButton = document.getElementById('locateButton');
    if (locateButton) {
      locateButton.addEventListener('click', function() {
        // 检查浏览器是否支持地理定位
        if (navigator.geolocation) {
          // 获取当前位置
          navigator.geolocation.getCurrentPosition(
            function(position) {
              var userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };

              // 在地图上显示用户位置的标记
              var marker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location"
              });

              // 将地图中心设置为用户位置
              map.setCenter(userLocation);
            },
            function(error) {
              console.log("Error occurred. Error code: " + error.code);
            }
          );
        } else {
          console.log("Geolocation is not supported by this browser.");
        }
      });
    }

    var geocoder = new google.maps.Geocoder();
    var address = '1600 Amphitheatre Parkway, Mountain View, CA';

    geocoder.geocode({ 'address': address }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        // 获取第一个结果的经纬度
        var location = results[0].geometry.location;
        console.log('Latitude:', location.lat());
        console.log('Longitude:', location.lng());

        // 在地图上显示地址位置的标记
        var marker = new google.maps.Marker({
          position: location,
          map: map,
          title: address
        });

        // 将地图中心设置为地址位置
        map.setCenter(location);
      } else {
        console.log('Geocode was not successful for the following reason:', status);
      }
    });
  }

  var addressInput = document.getElementById('addressInput');
  var autocomplete = new google.maps.places.Autocomplete(addressInput);

  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();

    if (place.geometry && place.geometry.location) {
      var location = place.geometry.location;
      console.log('Latitude:', location.lat());
      console.log('Longitude:', location.lng());

      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: place.formatted_address
      });

      map.setCenter(location);
    } else {
      console.log('No location found for the entered address.');
    }
  });
  // 调用initMap函数
  initMap();
});