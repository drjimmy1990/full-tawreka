import { useSettingsStore } from '../store';

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
    ar: {
        // Landing
        'landing.welcome': 'أهلاً بك',
        'landing.choose_service': 'اختر طريقة الطلب',
        'landing.delivery': 'توصيل',
        'landing.delivery_desc': 'اطلب لأي مكان في نطاق التغطية',
        'landing.pickup': 'استلام',
        'landing.pickup_desc': 'اختر الفرع واستلم طلبك',
        'landing.story_title': 'أول حكاية في قصة توريقة!',
        'landing.story_body': 'في توريقة، بنقدم الفطير المصري الأصيل بطريقة مبتكرة. بمكونات فاخرة وإبداع متميز، الطعم مصري 100% بس بشكل جديد يخطف قلبك! بنقدملك الفطير المشلتت الفلاحي بالسمنة البلدي والفطير المحشي بنكهات أصيلة وبلمسة عصرية.',
        'landing.features_title': 'الطعم المصري الأصيل',
        'landing.feature_1_title': 'دلع نفسك',
        'landing.feature_1_desc': 'فطيرنا معمول بأجود المكونات ونكهات جريئة. علشان تعيش تجربة مصرية أصيلة بطابع عصري ماينسيش.',
        'landing.feature_2_title': 'مع توريقة .. أنت البطل',
        'landing.feature_2_desc': 'كل فطيرة بنعملها بتحكي قصة... قصتك إنت. بطريقتك ومودك، لأنك مهم عندنا.',
        'landing.feature_3_title': 'تجربة أكل ما تتنسيش',
        'landing.feature_3_desc': 'رحلة بتبدأ من تراث مصر. بنوعدك لنكهات جديدة مبتكرة. كل فطيرة معمولة بحب.',
        'landing.contact_title': 'تواصلك معانا بيسعدنا',
        'landing.menu': 'المنيو',
        'landing.about': 'عن توريقة',
        'landing.contact_us': 'اتصل بنا',

        // Location
        'location.select_branch': 'اختر الفرع',
        'location.select_city': 'اختر المدينة',
        'location.select_area': 'اختر المنطقة',
        'location.detect': 'تحديد موقعي',
        'location.detecting': 'جاري تحديد الموقع...',
        'location.paste_link': 'لصق رابط Google Maps',
        'location.not_covered': 'عذراً، موقعك خارج نطاق التغطية',
        'location.covered': 'موقعك ضمن نطاق التغطية ✓',
        'location.continue': 'متابعة للقائمة',
        'location.nearby_branches': 'الفروع القريبة',
        'location.delivery_location': 'موقع التوصيل',
        'location.pickup_subtitle': 'اختر الفرع الأقرب إليك لاستلام طلبك',
        'location.delivery_subtitle': 'حدد موقعك على الخريطة لتوصيل طلبك',

        // Menu
        'menu.categories': 'الأقسام',
        'menu.from': 'من',
        'menu.add': 'أضف',
        'menu.added': 'تمت الإضافة',
        'menu.no_items': 'لا توجد أصناف',
        'menu.special_instructions': 'ملاحظات خاصة',
        'menu.total': 'الإجمالي',
        'menu.add_to_cart': 'أضف للسلة',
        'menu.required': 'مطلوب',
        'menu.optional': 'اختياري',

        // Cart
        'cart.title': 'سلة الطلب',
        'cart.empty': 'السلة فارغة',
        'cart.total': 'الإجمالي',
        'cart.checkout': 'إتمام الطلب',
        'cart.view': 'عرض السلة',
        'cart.items': 'اصناف',

        // Checkout
        'checkout.title': 'إتمام الطلب',
        'checkout.name': 'الاسم',
        'checkout.phone': 'رقم الهاتف',
        'checkout.address': 'العنوان بالتفصيل',
        'checkout.floor': 'الطابق',
        'checkout.apartment': 'الشقة',
        'checkout.notes': 'ملاحظات للمطبخ',
        'checkout.submit': 'تأكيد الطلب',
        'checkout.submitting': 'جاري الإرسال...',
        'checkout.success': 'تم استلام طلبك بنجاح!',
        'checkout.order_id': 'رقم الطلب',

        // Common
        'common.loading': 'جاري التحميل...',
        'common.error': 'حدث خطأ',
        'common.retry': 'إعادة المحاولة',
        'common.back': 'رجوع',
        'common.currency': 'ج.م',
    },
    en: {
        // Landing
        'landing.welcome': 'Welcome',
        'landing.choose_service': 'How would you like to order?',
        'landing.delivery': 'Delivery',
        'landing.delivery_desc': 'Order to any location in our coverage',
        'landing.pickup': 'Pickup',
        'landing.pickup_desc': 'Pick up from a branch near you',
        'landing.story_title': 'First story in Tawriqa\'s tale!',
        'landing.story_body': 'At Tawriqa, we serve authentic Egyptian Feteer in an innovative way. With premium ingredients and unique creativity, 100% Egyptian taste but with a new look that captures your heart!',
        'landing.features_title': 'Authentic Egyptian Taste',
        'landing.feature_1_title': 'Spoil Yourself',
        'landing.feature_1_desc': 'Our Feteer is made with the finest ingredients and bold flavors. To live an authentic Egyptian experience with a modern unforgettable touch.',
        'landing.feature_2_title': 'With Tawriqa .. You are the Hero',
        'landing.feature_2_desc': 'Every pie we make tells a story... Your story. Your way and your mood, because you matter to us.',
        'landing.feature_3_title': 'Unforgettable Dining Experience',
        'landing.feature_3_desc': 'A journey starting from Egypt\'s heritage. We promise you innovative new flavors. Every pie made with love.',
        'landing.contact_title': 'We\'d love to hear from you',
        'landing.menu': 'Menu',
        'landing.about': 'About Tawriqa',
        'landing.contact_us': 'Contact Us',

        // Location
        'location.select_branch': 'Select Branch',
        'location.select_city': 'Select City',
        'location.select_area': 'Select Area',
        'location.detect': 'Detect My Location',
        'location.detecting': 'Detecting location...',
        'location.paste_link': 'Paste Google Maps Link',
        'location.not_covered': 'Sorry, your location is not covered',
        'location.covered': 'Your location is covered ✓',
        'location.continue': 'Continue to Menu',
        'location.nearby_branches': 'Nearby Branches',
        'location.delivery_location': 'Delivery Location',
        'location.pickup_subtitle': 'Select the nearest branch to pick up your order',
        'location.delivery_subtitle': 'Pin your location on the map for delivery',

        // Menu
        'menu.categories': 'Categories',
        'menu.from': 'From',
        'menu.add': 'Add',
        'menu.added': 'Added',
        'menu.no_items': 'No items',
        'menu.special_instructions': 'Special Instructions',
        'menu.total': 'Total',
        'menu.add_to_cart': 'Add to Cart',
        'menu.required': 'Required',
        'menu.optional': 'Optional',

        // Cart
        'cart.title': 'Your Cart',
        'cart.empty': 'Cart is empty',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout',
        'cart.view': 'View Cart',
        'cart.items': 'items',

        // Checkout
        'checkout.title': 'Checkout',
        'checkout.name': 'Name',
        'checkout.phone': 'Phone Number',
        'checkout.address': 'Delivery Address',
        'checkout.floor': 'Floor',
        'checkout.apartment': 'Apartment',
        'checkout.notes': 'Kitchen Notes',
        'checkout.submit': 'Confirm Order',
        'checkout.submitting': 'Submitting...',
        'checkout.success': 'Order received successfully!',
        'checkout.order_id': 'Order ID',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.retry': 'Retry',
        'common.back': 'Back',
        'common.currency': 'EGP',
    },
    ru: {
        // Landing
        'landing.welcome': 'Добро пожаловать',
        'landing.choose_service': 'Как хотите заказать?',
        'landing.delivery': 'Доставка',
        'landing.delivery_desc': 'Закажите в любое место в зоне доставки',
        'landing.pickup': 'Самовывоз',
        'landing.pickup_desc': 'Заберите из ближайшего филиала',
        'landing.story_title': 'Первая история в сказке Tawriqa!',
        'landing.story_body': 'В Tawriqa мы подаем настоящий египетский фитир по-новому. С премиальными ингредиентами и уникальным творчеством!',
        'landing.features_title': 'Настоящий Египетский Вкус',
        'landing.feature_1_title': 'Побалуйте себя',
        'landing.feature_1_desc': 'Наш фитир сделан из лучших ингредиентов и смелых вкусов.',
        'landing.feature_2_title': 'С Tawriqa .. Вы Герой',
        'landing.feature_2_desc': 'Каждый пирог рассказывает историю... Вашу историю.',
        'landing.feature_3_title': 'Незабываемый опыт',
        'landing.feature_3_desc': 'Путешествие начинается с наследия Египта.',
        'landing.contact_title': 'Мы будем рады услышать вас',
        'landing.menu': 'Меню',
        'landing.about': 'О Tawriqa',
        'landing.contact_us': 'Свяжитесь с нами',

        // Location
        'location.select_branch': 'Выберите филиал',
        'location.select_city': 'Выберите город',
        'location.select_area': 'Выберите район',
        'location.detect': 'Определить моё местоположение',
        'location.detecting': 'Определение местоположения...',
        'location.paste_link': 'Вставить ссылку Google Maps',
        'location.not_covered': 'Извините, ваш адрес не в зоне доставки',
        'location.covered': 'Ваш адрес в зоне доставки ✓',
        'location.continue': 'Перейти к меню',
        'location.nearby_branches': 'Ближайшие филиалы',
        'location.delivery_location': 'Место доставки',
        'location.pickup_subtitle': 'Выберите ближайший филиал для самовывоза',
        'location.delivery_subtitle': 'Укажите ваше местоположение на карте для доставки',

        // Menu
        'menu.categories': 'Категории',
        'menu.from': 'от',
        'menu.add': 'Добавить',
        'menu.added': 'Добавлено',
        'menu.no_items': 'Нет товаров',
        'menu.special_instructions': 'Особые указания',
        'menu.total': 'Итого',
        'menu.add_to_cart': 'В корзину',
        'menu.required': 'Обязательно',
        'menu.optional': 'Необязательно',

        // Cart
        'cart.title': 'Корзина',
        'cart.empty': 'Корзина пуста',
        'cart.total': 'Итого',
        'cart.checkout': 'Оформить заказ',
        'cart.view': 'Корзина',
        'cart.items': 'товаров',

        // Checkout
        'checkout.title': 'Оформление заказа',
        'checkout.name': 'Имя',
        'checkout.phone': 'Телефон',
        'checkout.address': 'Адрес доставки',
        'checkout.floor': 'Этаж',
        'checkout.apartment': 'Квартира',
        'checkout.notes': 'Примечание к заказу',
        'checkout.submit': 'Подтвердить заказ',
        'checkout.submitting': 'Отправка...',
        'checkout.success': 'Заказ успешно получен!',
        'checkout.order_id': 'Номер заказа',

        // Common
        'common.loading': 'Загрузка...',
        'common.error': 'Произошла ошибка',
        'common.retry': 'Повторить',
        'common.back': 'Назад',
        'common.currency': 'EGP',
    },
};

export function useTranslation() {
    const { currentLanguage, supportedLanguages, setLanguage, getLocalizedSetting } = useSettingsStore();

    const t = (key: string): string => {
        const lang = currentLanguage as keyof typeof translations;
        return translations[lang]?.[key] || translations['ar']?.[key] || key;
    };

    const toggleLanguage = () => {
        const currentIndex = supportedLanguages.indexOf(currentLanguage);
        const nextIndex = (currentIndex + 1) % supportedLanguages.length;
        setLanguage(supportedLanguages[nextIndex]);
    };

    return {
        t,
        lang: currentLanguage,
        dir: currentLanguage === 'ar' ? 'rtl' : 'ltr',
        supportedLanguages,
        setLanguage,
        toggleLanguage,
        getLocalizedSetting,
    };
}

export default useTranslation;
