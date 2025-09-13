let eventBus = new Vue() // Создаем экземпляр Vue, который будет использоваться как шина событий для обмена данными между компонентами

// Компонент для отображения вкладок с информацией о проду
Vue.component('product-tabs', {
    props: { //Определяет свойства, которые компонент принимает.
        reviews: { // Пропс для отзывов о продукте
            type: Array,
            required: false
        },
        shippingCost: { // Пропс для стоимости доставк
            type: String,
            required: true
        },
        details: { // Пропс для деталей продукта
            type: Array,
            required: true
        }
    },
    template: `
            <div>   
                <ul>
                    <span class="tab"
                          :class="{ activeTab: selectedTab === tab }"
                          v-for="(tab, index) in tabs"
                          @click="selectedTab = tab"
                    >{{ tab }}</span>
                </ul>
                <div v-show="selectedTab === 'Reviews'">
                    <p v-if="!reviews.length">There are no reviews yet.</p>
                    <ul>
                        <li v-for="review in reviews" :key="review.name">
                            <p>{{ review.name }}</p>
                            <p>Rating: {{ review.rating }}</p>
                            <p>{{ review.review }}</p>
                            <p>Recommended: {{ review.recommendation }}</p>
                        </li>
                    </ul>
                </div>
                <div v-show="selectedTab === 'Make a Review'">
                    <product-review></product-review>
                </div>
                <div v-show="selectedTab === 'Shipping'">
                    <p>Shipping Cost: {{ shippingCost }}</p>
                </div>
                <div v-show="selectedTab === 'Details'">
                    <h2>Details:</h2>
                    <ul>
                        <li v-for="detail in details" :key="detail">{{ detail }}</li>
                    </ul>
                </div>
            </div>
            `,
    data() { //Возвращает объект с данными компонента.
        return {
            tabs: ['Reviews', 'Make a Review','Shipping', 'Details'], // Названия вкладок
            selectedTab: 'Reviews' // Вкладка по умолчанию
        }
    }
})
// Компонент для формы отзыва о продукте
Vue.component('product-review', {
    template: `
<form class="review-form" @submit.prevent="onSubmit">
 <p v-if="errors.length">
<b>Please correct the following error(s):</b>
    <ul>
        <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
 </p>
    <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
    </p>
    <p>
        <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
   </p>
 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
   <p>
<label>Would you recommend this product?</label>
    <label>
        <input type="radio" value="yes" v-model="recommendation"> Yes
    </label>
    <label>
        <input type="radio" value="no" v-model="recommendation"> No
    </label>
    </p>
 </p>
 <p>
   <input type="submit" value="Submit"> 
 </p>
</form>
 `,
    data() {
        return {
            name: null, // Имя пользователя
            review: null, // Текст отзыва
            rating: null, // Рейтинг
            recommendation: null, // Рекомендация
            errors: [] // Ошибки валидации
        }
    },
    methods: {
        onSubmit() {    // Логика обработки отправки отзыва
            this.errors = []; // Сбрасываем ошибки
            // Проверяем, заполнены ли все поля
            if (this.name && this.review && this.rating && this.recommendation) {
                const productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                };
                // Отправляем отзыв через event bus
                eventBus.$emit('review-submitted', productReview);
                this.resetForm();
            } else {
                this.errors.push(...[
                    !this.name && "Name required.",
                    !this.review && "Review required.",
                    !this.rating && "Rating required.",
                    !this.recommendation && "Recommendation required."
                ].filter(Boolean));
            }
        },
        resetForm() { // Сброс формы
            this.name = '';
            this.review = '';
            this.rating = null;
            this.recommendation = '';
        }
    }
});
// Основной компонент продукта
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template:
        `
        <div class="product">
        <div class="product-image">
        <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <a class="link" :href="link">More products like this</a>
        <p v-if="inStock">In stock</p>
        <p v-else style="text-decoration: line-through">Out of Stock</p>
<p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>

            
        <span>{{ onsale }}</span>
        <p>{{ sale }}</p>        
        <div 
            class="color-box" 
            v-for="(variant, index) in variants" 
            :key="variant.variantId" 
            :style="{ backgroundColor: variant.variantColor }" 
            @mouseover="updateProduct(index)">
        </div>
        <ul>
          <li v-for="sizes in sizes">{{ sizes }}</li>
         </ul>
                     <button @click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart</button>
                    <button @click="delToCart">Delete from cart</button>
                </div>
                <div>
                    <product-tabs :reviews="reviews" :shipping-cost="shipping" :details="details"></product-tabs>
                </div>
            </div>
`,
    data() {
        return {
            reviews: [], // Массив для хранения отзывов
            product: "Socks", // Название продукта
            brand: 'Vue Mastery', // Бренд продукта
            description: "A pair of warm, fuzzy socks", // Описание продукта
            selectedVariant: 0, // Выбранный вариант продукта
            altText: "A pair of socks", // Альтернативный текст для изображения
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks.", // Ссылка на другие продукты
            inventory: 100,
            onsale: "On Sale",
            onSale: true,// Статус распродажи
            details: ['80% cotton', '20% polyester', 'Gender-neutral'], // Детали продукта
            variants: [ // Варианты продукта
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            reviews: [],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], // Доступные размеры
            cart: 0, // Корзина для хранения добавленных товаров
            salesCount: 0 // Количество продаж
        }
    },
    methods: { //Подписывается на событие review-submitted для добавления отзыва.

        addToCart() { // Добавление в корзину
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
            this.salesCount++; // Увеличиваем количество продаж
        },
        addReview(productReview) { /* Добавление отзыва */
            this.reviews.push(productReview)
        },
        deletToCart(index) { /* Удаление из корзины */
            this.selectedVariant = index;
            console.log(index);

        },
        delToCart() {
            this.$emit('del-to-cart');
        },
        updateProduct(index) { /* Обновление выбранного варианта продукта */
            this.selectedVariant = index;
            console.log(this.variants);
        },
    },
    mounted() {
        // Подписываемся на событие 'review-submitted' для добавления отзыва
        eventBus.$on('review-submitted', this.addReview);
    },
    beforeDestroy() {
        // Отписываемся от события перед уничтожением компонента
        eventBus.$off('review-submitted', this.addReview);
    },
    computed: { //Вычисляемые свойства для получения информации о продукте
        title() { /* Возвращает название продукта */
            return this.brand + ' ' + this.product;
        },
        image() { /* Возвращает изображение продукта */
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() { /* Проверяет наличие на складе */
            console.log(this.variants[this.selectedVariant].variantQuantity )
            return this.variants[this.selectedVariant].variantQuantity ;
        },
        sale() { // Возвращаем статус распродажи
            return this.onSale ? `${this.brand} ${this.product} is on sale!` : `${this.brand} ${this.product} is not on sale.`;
        },
        shipping() {  /* Определяет стоимость доставки */
            return this.premium ? "Free" : "2.99";
        },
        averageRating() { /* Рассчитывает средний рейтинг */
            if (this.reviews.length === 0) {
                return 0;
            }
            const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
            return totalRating / this.reviews.length; // Возвращаем средний рейтинг
        }
    }
});
Vue.component('product-details', {
    props: { //Принимает массив деталей продукта.
        details: {
            type: Array,
            required: true
        }
    },
    template: `
            <div>
                <h2>Details:</h2>
                <ul>
                    <li v-for="detail in details" :key="detail">{{ detail }}</li>
                </ul>
            </div>
            `
});
// Основной экземпляр Vue приложения
let app = new Vue({
    el: '#app', // Привязываем приложение к элементу с id 'app'
    data: {
        premium: true, // Статус премиум-клиента
        cart: [], // Корзина для хранения добавленных товаро
    },
    methods: {
        updateCart(id) {
            // Добавляем товар в корзину
            this.cart.push(id);
        },
        deletToCart() {
            // Удаляем последний добавленный товар из корзины if (this.cart.length > 0) {
            this.cart.pop();
        }

    },})