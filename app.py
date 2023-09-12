from flask import Flask, render_template, request, jsonify, session, flash, redirect, url_for
import mysql.connector
from mysql.connector import Error
import json
import datetime


app = Flask(__name__, template_folder='templates')
app.secret_key = '11'


# 连接本地数据库
def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='010511',
            database='warehouse2023'
        )
        print('Connected to MySQL database')
    except Error as e:
        print(f"The error '{e}' occurred while connecting to MySQL database")
    return connection


# 注册并连接web获取响应请求

@app.route('/Register', methods=['GET', 'POST'])
def register():
    register_message = ''
    register_success = False
    if request.method == 'POST':
        # 获取提交的用户名和密码
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        phonenumber = request.form['phonenumber']
        username = request.form['username']
        companyname = request.form['companyname']
        password = request.form['password']
        

        connection = create_connection()
        cursor = connection.cursor()

        try:
            # 创建新用户
            query = "INSERT INTO customer_info (firstname, lastname, phonenumber, username, companyname, password) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(query, (firstname, lastname, phonenumber, username, companyname, password))
            connection.commit()
            register_message = 'Register success! Please login'
            register_success = True
            flash(register_message, 'success')  # 设置会话变量
            return redirect(url_for('login'))
        except mysql.connector.Error as error:
            register_message = 'Email already used, please try again'
            register_success = False

    return render_template('register.html', register_message=register_message, register_success=register_success)


@app.route('/Login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        connection = create_connection()
        cursor = connection.cursor()
        query = "SELECT * FROM customer_info WHERE username = %s AND password = %s"
        values = (username, password)
        cursor.execute(query, values)
        result = cursor.fetchone()
        cursor.close()

        if result is not None:
            session['username'] = username
            if username == "oceancommercetrading@gmail.com":
                return redirect(url_for('owner_login'))
            else:
                return redirect(url_for('order'))
        else:
            flash('The email or password is invalid, please try again.', 'error')
            return redirect(url_for('login'))

    register_message = session.pop('register_message', None)
    return render_template('Login.html', register_message=register_message)


@app.route('/Owner_login', methods=['GET', 'POST'])
def owner_login():
    if request.method == 'POST':
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        phonenumber = request.form['phonenumber']
        companyname = request.form['companyname']
        password = request.form['password']

        # 查询数据库中是否存在匹配的用户信息
        connection = create_connection()
        cursor = connection.cursor()
        query = "SELECT * FROM customer_info WHERE firstname = %s AND lastname = %s AND phonenumber = %s AND companyname = %s AND username = %s AND password = %s"
        values = (firstname, lastname, phonenumber, companyname, 'oceancommercetrading@gmail.com', password)
        cursor.execute(query, values)
        result = cursor.fetchone()
        cursor.close()


        if result:
            # 输入正确，跳转到Edit.html
            return redirect(url_for('edit'))
        else:
            flash('输入信息不正确。', 'error')
            return redirect(url_for('owner_login'))

    return render_template('Owner_login.html')

@app.route('/Index')
def index():
    return render_template('index.html')


@app.route('/Images')
def images():
    return render_template('images.html')

@app.route('/Eidt')
def edit():
    return render_template('Edit.html')

@app.route('/Order')
def order():
    if 'username' in session:
        username = session['username']
        connection = create_connection()
        cursor = connection.cursor()
        query = "SELECT firstname FROM customer_info WHERE username = %s"
        cursor.execute(query, (username,))
        result = cursor.fetchone()
        cursor.close()
        if result:
            firstname = result[0]
            return render_template('Order.html', firstname=firstname)
        else:
            flash('User not found', 'error')
            return redirect(url_for('login'))
    else:
        flash('Please login', 'error')
    return redirect(url_for('login'))


@app.route('/Shop_cart', methods=['GET', 'POST'])
def shop_cart():
    if request.method == 'POST' and request.is_json:
        try:
            data = request.get_json()
            cart_items = data.get('cartItems')
            
            if not cart_items or len(cart_items) == 0:
                return "Please select more items.", 400
            card_number = data.get('paymentDetails').get('cardNumber')
            expiration_date = data.get('paymentDetails').get('expirationDate')
            cvv = data.get('paymentDetails').get('cvv')

            if 'username' in session:
                username = session['username']
                connection = create_connection()
                cursor = connection.cursor()

                # 创建订单
                current_time = datetime.datetime.now()  # 获取当前时间
                cursor.execute(
                    "INSERT INTO orders (username, total_price, order_time) VALUES (%s, 0, %s)",
                    (username, current_time)
                )
                order_id = cursor.lastrowid

                total_price = 0
                cart_items_data = []

                for item in cart_items:
                    image_src = item.get('imageSrc')
                    quantity = item.get('quantity')
                    price = item.get('price')
                    
                    cart_item_data = {
                        'imageSrc': image_src,
                        'quantity': quantity,
                        'price': price
                    }
                    
                    cart_items_data.append(cart_item_data)

                    total_price += float(price)
                    
                   
                cart_items_json = json.dumps(cart_items_data)

                # 插入购物车项到 cart_items 表的单个行中
                cursor.execute(
                    "INSERT INTO cart_items (username, cart_data, card_number, expiration_date, cvv, order_id) VALUES (%s, %s, %s, %s, %s, %s)",
                    (username, cart_items_json, card_number, expiration_date, cvv, order_id)
                )

                # 更新订单总价
                cursor.execute(
                    "UPDATE orders SET total_price = %s WHERE order_id = %s",
                    (total_price, order_id)
                )

                connection.commit()
                cursor.close()
                return redirect(url_for('my_orders'))
            else:
                flash('Please login', 'error')
                return redirect(url_for('login'))

        except Exception as e:
            print(f"The error '{e}' occurred while processing the request")
            return "Failed to process the request"
    else:
        return render_template('Shop_cart.html')

@app.route('/My_orders')
def my_orders():
    if 'username' in session:
        username = session['username']
        connection = create_connection()
        cursor = connection.cursor()

        try:
            # Get the firstname for the current user
            cursor.execute(
                "SELECT firstname FROM customer_info WHERE username = %s",
                (username,)
            )
            firstname_result = cursor.fetchone()
            firstname = firstname_result[0] if firstname_result else None

            # Get the orders for the current user
            cursor.execute(
                "SELECT order_id, total_price, order_time FROM orders WHERE username = %s",
                (username,)
            )
            orders = cursor.fetchall()

            order_details = []

            order_counter = 1

            for order in orders:
                order_id = order[0]
                total_price = order[1]
                order_time = order[2] if len(order) > 2 else None  # 获取订单时间

                # Get the cart items for each order
                cursor.execute(
                    "SELECT cart_data FROM cart_items WHERE username = %s AND order_id = %s",
                    (username, order_id)
                )

                order_info = {
                    'order_id': order_counter,  # 使用计数器作为订单ID
                    'total_price': total_price,
                    'order_time': order_time,
                    'items': []
                }

                # Fetch one cart item at a time
                cart_items = cursor.fetchall()

                for cart_item in cart_items:
                    cart_data = cart_item[0]

                    # Parse cart item data into a dictionary
                    cart_item_data = json.loads(cart_data)
                    order_info['items'].append(cart_item_data)

                order_details.append(order_info)

                # 增加计数器的值
                order_counter += 1

            cursor.close()

            print(order_details)

            return render_template('my_orders.html', firstname=firstname, order_details=order_details)

        except Exception as e:
            print("Error:", e)

        finally:
            # 确保游标和连接关闭
            cursor.close()
            connection.close()

    else:
        flash('Please login', 'error')
        return redirect(url_for('login'))

@app.route('/Member_center', methods=['GET', 'POST'])
def member_center():
    print("Reached the member_center route")

    if 'username' in session:
        username = session['username']
        connection = create_connection()
        cursor = connection.cursor()

        if request.method == 'POST':
            if request.is_json:
                # 解析JSON请求体
                data = request.get_json()

                # 更新用户信息
                new_firstname = data.get('firstname')
                new_lastname = data.get('lastname')
                new_phonenumber = data.get('phonenumber')

                try:
                    cursor.execute(
                        "UPDATE customer_info SET firstname = %s, lastname = %s, phonenumber = %s WHERE username = %s",
                        (new_firstname, new_lastname, new_phonenumber, username)
                    )
                    connection.commit()
                    flash('信息更新成功', 'success')
                    return jsonify({'success': True})
                except Exception as e:
                    print("错误:", e)  # 打印错误信息到控制台
                    return jsonify({'success': False, 'message': 'An error occurred. Please try again.'}), 500

            else:
                flash('无效的请求', 'error')
                return jsonify({'success': False, 'message': 'Invalid request.'}), 400

        cursor.execute(
            "SELECT firstname, lastname, phonenumber, username FROM customer_info WHERE username = %s",
            (username,)
        )
        user_info = cursor.fetchone()

        firstname = user_info[0] if user_info else None
        lastname = user_info[1] if user_info else None
        phonenumber = user_info[2] if user_info else None
        username = user_info[3] if user_info else None

        cursor.close()
        connection.close()

        password_edit = False  # 设置密码是否可编辑的标志

        return render_template('member_center.html', firstname=firstname, lastname=lastname,
                               phonenumber=phonenumber, username=username, password_edit=password_edit)
        
if __name__ == '__main__':
    app.run()