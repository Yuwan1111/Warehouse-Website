document.addEventListener('DOMContentLoaded', function() {
    // 模拟从服务器端获取的历史订单数据
    var orders = []; // 替换为您从服务器端获取的历史订单数据

    if (orders.length > 0) {
        displayHistoryOrders(orders);
    } else {
        var message = document.createElement('p');
        message.textContent = 'No history orders found.';
        document.querySelector('.cart-container').appendChild(message);
    }

    // 显示订单详细信息
    function displayHistoryOrders(orders) {
        var container = document.querySelector('.cart-container');

        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];

            var h3 = document.createElement('h3');
            var h3Link = document.createElement('a');
            h3Link.href = '#';
            h3Link.className = 'order-toggle';
            h3Link.dataset.orderId = order.orderId;
            h3Link.textContent = 'order_id: ' + order.orderId;
            h3.appendChild(h3Link);
            container.appendChild(h3);

            var pTotalPrice = document.createElement('p');
            pTotalPrice.textContent = 'Total Price: $' + order.totalPrice;
            container.appendChild(pTotalPrice);

            var pOrderTime = document.createElement('p');
            pOrderTime.textContent = 'Order Time: ' + order.orderTime;
            container.appendChild(pOrderTime);

            var divOrderDetails = document.createElement('div');
            divOrderDetails.className = 'order-details';
            divOrderDetails.dataset.orderId = order.orderId;
            container.appendChild(divOrderDetails);

            if (order.items.length > 0) {
                var ulItemList = document.createElement('ul');
                ulItemList.className = 'item-list';

                for (var j = 0; j < order.items.length; j++) {
                    var item = order.items[j];

                    var liItem = document.createElement('li');
                    liItem.className = 'item';

                    var imgItem = document.createElement('img');
                    imgItem.src = item.imageSrc;
                    imgItem.alt = '';
                    liItem.appendChild(imgItem);

                    var pQuantity = document.createElement('p');
                    pQuantity.textContent = 'Quantity: ' + item.quantity;
                    liItem.appendChild(pQuantity);

                    var pPrice = document.createElement('p');
                    pPrice.textContent = 'Price: $' + item.price;
                    liItem.appendChild(pPrice);

                    ulItemList.appendChild(liItem);
                }

                divOrderDetails.appendChild(ulItemList);
            }
        }
    }
});

// 添加点击事件监听器
var orderToggles = document.querySelectorAll('.order-toggle');

orderToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
        var orderId = toggle.dataset.orderId;
        var orderDetails = document.querySelector('.order-details[data-order-id="' + orderId + '"]');

        orderDetails.style.display = orderDetails.style.display === 'none' ? 'block' : 'none';
    });
});