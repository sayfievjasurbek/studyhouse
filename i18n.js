/* ============================================
   STUDY HOUSE — Language switcher (Uzbek · Russian · English)
   Default language: Uzbek. English is the original page markup.
   Dictionary: English text -> [Uzbek, Russian]
   ============================================ */

(function () {
  var STORAGE_KEY = 'sh-lang';
  var DEFAULT_LANG = 'uz';
  var LANGS = [
    { code: 'uz', label: 'UZ', name: 'Oʻzbekcha' },
    { code: 'ru', label: 'RU', name: 'Русский' },
    { code: 'en', label: 'EN', name: 'English' }
  ];
  var INDEX = { uz: 0, ru: 1 };

  var D = {
    /* ---------- Shared: navigation & footer ---------- */
    "Home": ["Bosh sahifa", "Главная"],
    "Universities": ["Universitetlar", "Университеты"],
    "Destinations": ["Yoʻnalishlar", "Направления"],
    "Services": ["Xizmatlar", "Услуги"],
    "About": ["Biz haqimizda", "О нас"],
    "Contact": ["Aloqa", "Контакты"],
    "Our Expertise": ["Tajribamiz", "Наш опыт"],
    "GPA Calculator": ["GPA kalkulyatori", "Калькулятор GPA"],
    "The comparison table could not be loaded. Please refresh the page.": ["Solishtirish jadvalini yuklab boʻlmadi. Sahifani yangilang.", "Не удалось загрузить таблицу сравнения. Обновите страницу."],
    "Countries": ["Davlatlar", "Страны"],
    "Programmes": ["Dasturlar", "Программы"],
    "Country or programme of interest": ["Qiziqtirgan davlat yoki dastur", "Интересующая страна или программа"],
    "Select a country or programme": ["Davlat yoki dasturni tanlang", "Выберите страну или программу"],
    "Please choose a country or programme.": ["Iltimos, davlat yoki dasturni tanlang.", "Пожалуйста, выберите страну или программу."],
    "We will send your GPA estimate with this request:": ["Ushbu ariza bilan GPA bahoingizni ham yuboramiz:", "Вместе с этой заявкой мы отправим вашу оценку GPA:"],
    "Let me look at those grades…": ["Keling, baholaringizni koʻrib chiqaman…", "Давайте посмотрю на ваши оценки…"],
    "Universities we help you apply to": ["Biz ariza topshirishda yordam beradigan universitetlar", "Университеты, с поступлением в которые мы помогаем"],
    "See Where Your Grades": ["Baholaringiz sizni qayerga", "Узнайте, куда вас могут"],
    "Can Take You.": ["olib borishi mumkinligini koʻring.", "привести ваши оценки."],
    "Turn your Uzbek school or university grades into a 4.0 GPA, an approximate German grade and a UK class band, then see which universities are ambitious, realistic or safe for that profile. Every result is an estimate.": ["Oʻzbek maktab yoki universitet baholaringizni 4.0 tizimidagi GPA, taxminiy nemis bahosi va Britaniya daraja toifasiga aylantiring, soʻng shu profil uchun qaysi universitetlar ambitsiyali, real yoki xavfsiz variant ekanini koʻring. Har bir natija — taxminiy.", "Переведите свои узбекские школьные или университетские оценки в GPA по шкале 4.0, приблизительную немецкую оценку и британскую категорию диплома, а затем посмотрите, какие университеты для такого профиля амбициозные, реалистичные или запасные. Каждый результат — оценочный."],
    "Open the full calculator": ["Toʻliq kalkulyatorni ochish", "Открыть полный калькулятор"],
    "Explore": ["Boʻlimlar", "Разделы"],
    "Phone": ["Telefon", "Телефон"],
    "Email": ["Email", "Эл. почта"],
    "Address": ["Manzil", "Адрес"],
    "Study House. All rights reserved.": ["Study House. Barcha huquqlar himoyalangan.", "Study House. Все права защищены."],
    "Study House is an independent education consultancy. We prepare your application; we do not decide admissions or visas.": ["Study House — mustaqil taʼlim maslahat agentligi. Biz arizangizni tayyorlaymiz; qabul va viza qarorlarini biz chiqarmaymiz.", "Study House — независимое образовательное консультационное агентство. Мы готовим вашу заявку; решения о зачислении и визе принимаем не мы."],
    "The fastest way to reach us is the booking form — we reply within 24 hours.": ["Biz bilan bogʻlanishning eng tez yoʻli — ariza shakli. 24 soat ichida javob beramiz.", "Быстрее всего связаться с нами через форму заявки — отвечаем в течение 24 часов."],
    "Programme names and logos belong to their owners; Study House is an independent consultancy.": ["Dastur nomlari va logotiplari ularning egalariga tegishli; Study House mustaqil maslahat agentligi.", "Названия и логотипы программ принадлежат их владельцам; Study House — независимое консультационное агентство."],

    /* ---------- Destinations hub ---------- */
    "Study Destinations": ["Oʻqish yoʻnalishlari", "Направления обучения"],
    "Four Regions.": ["Toʻrtta mintaqa.", "Четыре региона."],
    "One Advisor.": ["Bitta maslahatchi.", "Один консультант."],
    "Every country page shows the real yearly cost, the visa route and a side-by-side comparison of real universities, with the source and a \"Last updated\" date under each table.": ["Har bir davlat sahifasida haqiqiy yillik xarajat, viza yoʻli va real universitetlarning yonma-yon solishtiruvi keltirilgan; har bir jadval ostida manba va \"Oxirgi yangilanish\" sanasi koʻrsatilgan.", "На странице каждой страны указаны реальные годовые расходы, визовый путь и сравнение реальных университетов; под каждой таблицей — источник и дата последнего обновления."],
    "Six country guides: Germany, Italy, France, Spain, Finland and Latvia": ["Oltita davlat boʻyicha qoʻllanma: Germaniya, Italiya, Fransiya, Ispaniya, Finlandiya va Latviya", "Шесть страновых гидов: Германия, Италия, Франция, Испания, Финляндия и Латвия"],
    "Compare six universities, the F-1 route and the full yearly cost": ["Oltita universitet, F-1 viza yoʻli va toʻliq yillik xarajatni solishtiring", "Сравните шесть университетов, путь визы F-1 и полную годовую стоимость"],
    "Compare seven universities, the subclass 500 visa and work rights": ["Yettita universitet, subclass 500 vizasi va ishlash huquqini solishtiring", "Сравните семь университетов, визу subclass 500 и право на работу"],
    "Compare six universities, the X visa and scholarship routes": ["Oltita universitet, X vizasi va stipendiya yoʻllarini solishtiring", "Сравните шесть университетов, визу X и стипендиальные пути"],
    "Not Sure Which Country": ["Qaysi davlat sizga mos ekaniga", "Не уверены, какая страна"],
    "Fits Your Budget?": ["ishonchingiz komil emasmi?", "подходит вашему бюджету?"],

    /* ---------- Services ---------- */
    "What We Do": ["Nima qilamiz", "Чем мы занимаемся"],
    "Programmes We": ["Biz tayyorlaydigan", "Программы, к которым"],
    "Prepare You For.": ["dasturlar.", "мы готовим."],
    "University admission plus the exchange and scholarship programmes Uzbek students ask about most.": ["Universitetga qabul, shuningdek oʻzbek talabalari eng koʻp soʻraydigan almashinuv va stipendiya dasturlari.", "Поступление в университет, а также обменные и стипендиальные программы, о которых чаще всего спрашивают студенты из Узбекистана."],
    "Which Programme": ["Qaysi dastur", "Какая программа"],
    "Fits You?": ["sizga mos?", "вам подходит?"],

    /* ---------- GPA calculator ---------- */
    "Estimate Your": ["GPA'ingizni", "Оцените свой"],
    "GPA.": ["baholang.", "GPA."],
    "Convert Uzbek school and university grades into a 4.0 GPA, an approximate German grade and a UK class band. Every result is an estimate.": ["Oʻzbek maktab va universitet baholarini 4.0 tizimidagi GPA, taxminiy nemis bahosi va Britaniya daraja toifasiga oʻtkazing. Har bir natija — taxminiy.", "Переведите узбекские школьные и университетские оценки в GPA по шкале 4.0, приблизительную немецкую оценку и британскую категорию диплома. Каждый результат — оценочный."],
    "Want a Shortlist": ["GPA'ingizga mos roʻyxat", "Хотите подборку"],
    "Built Around Your GPA?": ["kerakmi?", "под ваш GPA?"],
    "Book a Consultation →": ["Konsultatsiya →", "Консультация →"],
    "Book a Consultation": ["Konsultatsiyaga yozilish", "Записаться на консультацию"],
    "Toggle navigation menu": ["Menyuni ochish/yopish", "Открыть/закрыть меню"],
    "Breadcrumb": ["Sahifa yoʻli", "Навигация"],
    "Study House - International Education Agency": ["Study House — xalqaro taʼlim agentligi", "Study House — международное образовательное агентство"],
    "Study House — International Education Agency": ["Study House — xalqaro taʼlim agentligi", "Study House — международное образовательное агентство"],
    "Study House Emblem": ["Study House emblemasi", "Эмблема Study House"],
    "Your Global Education Partner": ["Global taʼlim boʻyicha hamkoringiz", "Ваш партнёр в мировом образовании"],
    "© 2025 Study House. All rights reserved.": ["© 2025 Study House. Barcha huquqlar himoyalangan.", "© 2025 Study House. Все права защищены."],

    /* ---------- Country & region names ---------- */
    "Europe": ["Yevropa", "Европа"],
    "Germany": ["Germaniya", "Германия"],
    "Italy": ["Italiya", "Италия"],
    "Spain": ["Ispaniya", "Испания"],
    "France": ["Fransiya", "Франция"],
    "Finland": ["Finlandiya", "Финляндия"],
    "Latvia": ["Latviya", "Латвия"],
    "Australia": ["Avstraliya", "Австралия"],
    "China": ["Xitoy", "Китай"],
    "USA": ["AQSH", "США"],

    /* ---------- Shared: country page section labels ---------- */
    "Masters": ["Magistratura", "Магистратура"],
    "Bachelor": ["Bakalavriat", "Бакалавриат"],
    "Foundation": ["Tayyorlov kursi", "Подготовительная программа"],
    "Country Overview": ["Davlat haqida umumiy maʼlumot", "Обзор страны"],
    "The Study House Approach": ["Study House yondashuvi", "Подход Study House"],
    "THE BRIDGE": ["KOʻPRIK", "МОСТ"],
    "THE FINANCE": ["MOLIYA", "ФИНАНСЫ"],
    "THE DOCUMENT": ["HUJJATLAR", "ДОКУМЕНТЫ"],
    "Visa Pathway": ["Viza yoʻli", "Визовый путь"],
    "Visa Specifications": ["Viza talablari", "Требования к визе"],
    "Processing Time": ["Koʻrib chiqish muddati", "Срок рассмотрения"],
    "Work Rights": ["Ishlash huquqi", "Право на работу"],
    "Post-Study": ["Oʻqishdan keyin", "После учёбы"],
    "Visa Fee": ["Viza yigʻimi", "Визовый сбор"],
    "Application Fee": ["Ariza yigʻimi", "Сбор за подачу заявления"],
    "Minimum Funds Required": ["Talab qilinadigan minimal mablagʻ", "Минимально необходимые средства"],
    "Minimum Funds": ["Minimal mablagʻ", "Минимальные средства"],
    "Proof of Funds": ["Moliyaviy taʼminot hujjatlari", "Подтверждение финансовых средств"],
    "Blocked Account": ["Bloklangan hisob", "Блокированный счёт"],
    "Scholarship": ["Stipendiya", "Стипендия"],
    "Our network of partner institutions in Finland spans top-ranked public and private universities. Below is a preview.": ["Finlandiyadagi hamkor muassasalarimiz tarmogʻi yuqori reytingli davlat va xususiy universitetlarni qamrab oladi. Quyida qisqacha koʻrinish keltirilgan.", "Наша сеть партнёрских учреждений в Финляндии включает ведущие государственные и частные университеты. Ниже — краткий обзор."],
    "Our network of partner institutions in France spans top-ranked public and private universities. Below is a preview.": ["Fransiyadagi hamkor muassasalarimiz tarmogʻi yuqori reytingli davlat va xususiy universitetlarni qamrab oladi. Quyida qisqacha koʻrinish keltirilgan.", "Наша сеть партнёрских учреждений во Франции включает ведущие государственные и частные университеты. Ниже — краткий обзор."],
    "Our network of partner institutions in Germany spans top-ranked public and private universities. Below is a preview.": ["Germaniyadagi hamkor muassasalarimiz tarmogʻi yuqori reytingli davlat va xususiy universitetlarni qamrab oladi. Quyida qisqacha koʻrinish keltirilgan.", "Наша сеть партнёрских учреждений в Германии включает ведущие государственные и частные университеты. Ниже — краткий обзор."],
    "Our network of partner institutions in Italy spans top-ranked public and private universities. Below is a preview.": ["Italiyadagi hamkor muassasalarimiz tarmogʻi yuqori reytingli davlat va xususiy universitetlarni qamrab oladi. Quyida qisqacha koʻrinish keltirilgan.", "Наша сеть партнёрских учреждений в Италии включает ведущие государственные и частные университеты. Ниже — краткий обзор."],
    "Our network of partner institutions in Latvia spans top-ranked public and private universities. Below is a preview.": ["Latviyadagi hamkor muassasalarimiz tarmogʻi yuqori reytingli davlat va xususiy universitetlarni qamrab oladi. Quyida qisqacha koʻrinish keltirilgan.", "Наша сеть партнёрских учреждений в Латвии включает ведущие государственные и частные университеты. Ниже — краткий обзор."],
    "Our network of partner institutions in Spain spans top-ranked public and private universities. Below is a preview.": ["Ispaniyadagi hamkor muassasalarimiz tarmogʻi yuqori reytingli davlat va xususiy universitetlarni qamrab oladi. Quyida qisqacha koʻrinish keltirilgan.", "Наша сеть партнёрских учреждений в Испании включает ведущие государственные и частные университеты. Ниже — краткий обзор."],
    "Book a free diagnostic consultation. We'll assess your profile, identify your best-fit institutions, and map your complete application timeline.": ["Bepul diagnostik konsultatsiyaga yoziling. Profilingizni baholaymiz, sizga eng mos muassasalarni aniqlaymiz va hujjat topshirishning toʻliq jadvalini tuzamiz.", "Запишитесь на бесплатную диагностическую консультацию. Мы оценим ваш профиль, подберём наиболее подходящие вузы и составим полный график подачи документов."],

    "Request the Finland University List →": ["Finlandiya universitetlari roʻyxatini soʻrash →", "Запросить список университетов Финляндии →"],
    "Request the France University List →": ["Fransiya universitetlari roʻyxatini soʻrash →", "Запросить список университетов Франции →"],
    "Request the Germany University List →": ["Germaniya universitetlari roʻyxatini soʻrash →", "Запросить список университетов Германии →"],
    "Request the Italy University List →": ["Italiya universitetlari roʻyxatini soʻrash →", "Запросить список университетов Италии →"],
    "Request the Latvia University List →": ["Latviya universitetlari roʻyxatini soʻrash →", "Запросить список университетов Латвии →"],
    "Request the Spain University List →": ["Ispaniya universitetlari roʻyxatini soʻrash →", "Запросить список университетов Испании →"],

    /* ---------- Cities & universities ---------- */
    "Helsinki": ["Xelsinki", "Хельсинки"],
    "Espoo": ["Espoo", "Эспоо"],
    "Turku": ["Turku", "Турку"],
    "Paris": ["Parij", "Париж"],
    "Strasbourg": ["Strasburg", "Страсбург"],
    "Munich": ["Myunxen", "Мюнхен"],
    "Berlin": ["Berlin", "Берлин"],
    "Heidelberg": ["Geydelberg", "Гейдельберг"],
    "Bologna": ["Boloniya", "Болонья"],
    "Milan": ["Milan", "Милан"],
    "Rome": ["Rim", "Рим"],
    "Riga": ["Riga", "Рига"],
    "Barcelona": ["Barselona", "Барселона"],
    "Madrid": ["Madrid", "Мадрид"],
    "Valencia": ["Valensiya", "Валенсия"],
    "University of Cambridge": ["University of Cambridge", "Кембриджский университет"],
    "University of Cambridge logo": ["University of Cambridge logotipi", "Логотип Кембриджского университета"],
    "The University of Edinburgh": ["The University of Edinburgh", "Эдинбургский университет"],
    "The University of Edinburgh logo": ["The University of Edinburgh logotipi", "Логотип Эдинбургского университета"],
    "Technical University of Munich": ["Technical University of Munich", "Мюнхенский технический университет"],
    "Technical University of Munich logo": ["Technical University of Munich logotipi", "Логотип Мюнхенского технического университета"],
    "The University of Sydney": ["The University of Sydney", "Сиднейский университет"],
    "The University of Sydney logo": ["The University of Sydney logotipi", "Логотип Сиднейского университета"],
    "Tampere University": ["Tampere University", "Университет Тампере"],
    "Tampere University logo": ["Tampere University logotipi", "Логотип Университета Тампере"],
    "University of Helsinki": ["University of Helsinki", "Хельсинкский университет"],
    "Aalto University": ["Aalto University", "Университет Аалто"],
    "University of Turku": ["University of Turku", "Университет Турку"],
    "Sorbonne University": ["Sorbonne University", "Университет Сорбонны"],
    "Sciences Po": ["Sciences Po", "Sciences Po"],
    "University of Strasbourg": ["University of Strasbourg", "Страсбургский университет"],
    "Humboldt University of Berlin": ["Humboldt University of Berlin", "Берлинский университет имени Гумбольдта"],
    "Heidelberg University": ["Heidelberg University", "Гейдельбергский университет"],
    "University of Bologna": ["University of Bologna", "Болонский университет"],
    "Politecnico di Milano": ["Politecnico di Milano", "Миланский политехнический университет"],
    "Sapienza University of Rome": ["Sapienza University of Rome", "Римский университет Сапиенца"],
    "University of Latvia": ["University of Latvia", "Латвийский университет"],
    "Riga Technical University": ["Riga Technical University", "Рижский технический университет"],
    "Riga Stradiņš University": ["Riga Stradiņš University", "Университет имени Страдыня в Риге"],
    "University of Barcelona": ["University of Barcelona", "Барселонский университет"],
    "Complutense University of Madrid": ["Complutense University of Madrid", "Мадридский университет Комплутенсе"],
    "University of Valencia": ["University of Valencia", "Валенсийский университет"],

    /* ---------- Booking modal ---------- */
    "Leave your details and we will reply within 24 hours.": ["Maʼlumotlaringizni qoldiring, biz 24 soat ichida javob beramiz.", "Оставьте свои данные, и мы ответим в течение 24 часов."],
    "First name": ["Ism", "Имя"],
    "Surname": ["Familiya", "Фамилия"],
    "Mobile phone": ["Mobil telefon", "Мобильный телефон"],
    "Telegram username (optional)": ["Telegram username (ixtiyoriy)", "Имя пользователя Telegram (необязательно)"],
    "Country of interest": ["Qiziqqan davlat", "Интересующая страна"],
    "Select a country": ["Davlatni tanlang", "Выберите страну"],
    "United Kingdom": ["Buyuk Britaniya", "Великобритания"],
    "Other / not sure yet": ["Boshqa / hali aniq emas", "Другая / пока не уверен(а)"],
    "I agree that Study House may contact me using these details about my consultation request.": ["Study House konsultatsiya soʻrovim yuzasidan men bilan shu maʼlumotlar orqali bogʻlanishiga roziman.", "Я согласен(на), чтобы Study House связывался со мной по этим данным по поводу моей заявки на консультацию."],
    "Your details are sent to the Study House team only so we can reply to your request.": ["Maʼlumotlaringiz Study House jamoasiga faqat soʻrovingizga javob berish uchun yuboriladi.", "Ваши данные передаются команде Study House только для того, чтобы мы могли ответить на вашу заявку."],
    "Send request": ["Soʻrov yuborish", "Отправить заявку"],
    "Sending…": ["Yuborilmoqda…", "Отправка…"],
    "Close": ["Yopish", "Закрыть"],
    "Thank you, we will reply within 24 hours": ["Rahmat, 24 soat ichida javob beramiz", "Спасибо, мы ответим в течение 24 часов"],
    "Please enter your first name.": ["Iltimos, ismingizni kiriting.", "Пожалуйста, введите имя."],
    "Please enter your surname.": ["Iltimos, familiyangizni kiriting.", "Пожалуйста, введите фамилию."],
    "Enter a valid Uzbek mobile number: +998 followed by 9 digits.": ["Oʻzbekiston mobil raqamini toʻgʻri kiriting: +998 va undan keyin 9 ta raqam.", "Введите корректный узбекский мобильный номер: +998 и далее 9 цифр."],
    "Telegram username must be 5–32 characters: letters, numbers and underscores, starting with a letter.": ["Telegram username 5–32 belgidan iborat boʻlishi kerak: harflar, raqamlar va pastki chiziq, harf bilan boshlanadi.", "Имя пользователя Telegram — от 5 до 32 символов: буквы, цифры и подчёркивание, начинается с буквы."],
    "Please choose a country.": ["Iltimos, davlatni tanlang.", "Пожалуйста, выберите страну."],
    "Please tick the box to agree.": ["Iltimos, rozilik belgisini qoʻying.", "Пожалуйста, поставьте галочку в знак согласия."],
    "Please check the highlighted fields.": ["Iltimos, belgilangan maydonlarni tekshiring.", "Пожалуйста, проверьте выделенные поля."],
    "Sorry, we could not send your request. Please try again in a moment.": ["Kechirasiz, soʻrovingizni yubora olmadik. Iltimos, birozdan soʻng qayta urinib koʻring.", "К сожалению, не удалось отправить заявку. Пожалуйста, повторите попытку чуть позже."],
    "Hi! Let's plan your studies abroad.": ["Salom! Xorijda oʻqishingizni birga rejalashtiramiz.", "Привет! Давайте спланируем вашу учёбу за границей."],
    "Nice to meet you! What is your name?": ["Tanishganimdan xursandman! Ismingiz nima?", "Приятно познакомиться! Как вас зовут?"],
    "How can we reach you?": ["Siz bilan qanday bogʻlansak boʻladi?", "Как с вами связаться?"],
    "Where would you like to study?": ["Qayerda oʻqishni xohlaysiz?", "Где бы вы хотели учиться?"],
    "Yay! We got your request.": ["Ura! Soʻrovingiz bizga yetib keldi.", "Ура! Мы получили вашу заявку."],
    "Oops, let's fix that together.": ["Voy, buni birga tuzatamiz.", "Ой, давайте исправим это вместе."],

    /* ---------- Compare component & country page labels ---------- */
    "Compare universities": ["Universitetlarni solishtirish", "Сравнение университетов"],
    "Choose 2 or 3 universities to compare side by side": ["Yonma-yon solishtirish uchun 2 yoki 3 ta universitetni tanlang", "Выберите 2 или 3 университета для сравнения"],
    "Selected": ["Tanlangan", "Выбрано"],
    "You can compare up to 3 universities. Remove one to add another.": ["Koʻpi bilan 3 ta universitetni solishtirish mumkin. Yangisini qoʻshish uchun birini olib tashlang.", "Можно сравнивать не более 3 университетов. Уберите один, чтобы добавить другой."],
    "Select at least 2 universities to see the comparison.": ["Solishtirishni koʻrish uchun kamida 2 ta universitetni tanlang.", "Выберите минимум 2 университета, чтобы увидеть сравнение."],
    "University comparison table": ["Universitetlarni solishtirish jadvali", "Таблица сравнения университетов"],
    "City": ["Shahar", "Город"],
    "Public or private": ["Davlat yoki xususiy", "Государственный или частный"],
    "Public": ["Davlat", "Государственный"],
    "QS World University Rank": ["QS jahon universitetlari reytingi", "Рейтинг QS World University"],
    "Tuition per year": ["Yillik oʻqish narxi", "Стоимость обучения в год"],
    "Living cost": ["Yashash xarajati", "Стоимость проживания"],
    "English-taught programs & language test": ["Ingliz tilidagi dasturlar va til testi", "Программы на английском и языковой тест"],
    "Strongest fields": ["Eng kuchli yoʻnalishlar", "Сильнейшие направления"],
    "Scholarships for international students": ["Xalqaro talabalar uchun stipendiyalar", "Стипендии для иностранных студентов"],
    "Main application deadline": ["Asosiy ariza topshirish muddati", "Основной срок подачи документов"],
    "How selective": ["Tanlov qatʼiyligi", "Селективность"],
    "Most prestigious": ["Eng nufuzli", "Самый престижный"],
    "Best value": ["Eng qulay narx", "Лучшее соотношение цены"],
    "Best for scholarships": ["Stipendiya uchun eng yaxshi", "Лучший для стипендий"],
    "Highest QS rank in this list": ["Ushbu roʻyxatdagi eng yuqori QS oʻrni", "Самое высокое место QS в этом списке"],
    "Lowest cost among the figures shown in this table": ["Jadvalda koʻrsatilgan raqamlar ichida eng past xarajat", "Самая низкая стоимость среди цифр в этой таблице"],
    "Largest published award for international students in this list": ["Ushbu roʻyxatda xalqaro talabalar uchun eʼlon qilingan eng katta mukofot", "Самая крупная опубликованная награда для иностранных студентов в этом списке"],
    "Tags are based only on the figures shown in this table. Fees change every year — always confirm on the official page.": ["Teglar faqat ushbu jadvaldagi raqamlarga asoslangan. Narxlar har yili oʻzgaradi — doim rasmiy sahifada tasdiqlang.", "Метки основаны только на цифрах из этой таблицы. Цены меняются каждый год — всегда сверяйтесь с официальной страницей."],
    "Not verified yet — see the official site": ["Hali tasdiqlanmagan — rasmiy saytga qarang", "Пока не подтверждено — смотрите официальный сайт"],
    "Get my personal shortlist": ["Shaxsiy roʻyxatimni olish", "Получить личный список"],
    "Last updated": ["Oxirgi yangilanish", "Последнее обновление"],
    "Sources": ["Manbalar", "Источники"],
    "Sources for each university": ["Har bir universitet manbalari", "Источники по каждому университету"],
    "Ranking": ["Reyting", "Рейтинг"],
    "Key facts & real yearly cost": ["Asosiy faktlar va haqiqiy yillik xarajat", "Ключевые факты и реальная стоимость в год"],
    "Yearly tuition": ["Yillik oʻqish narxi", "Обучение в год"],
    "Living costs": ["Yashash xarajatlari", "Расходы на проживание"],
    "Work rights": ["Ishlash huquqi", "Право на работу"],
    "After graduation": ["Bitirgandan keyin", "После выпуска"],
    "Scholarship routes": ["Stipendiya yoʻllari", "Пути к стипендиям"],
    "Visa path": ["Viza yoʻli", "Визовый путь"],
    "Official fee": ["Rasmiy yigʻim", "Официальный сбор"],
    "Processing time": ["Koʻrib chiqish muddati", "Срок рассмотрения"],
    "Questions parents ask": ["Ota-onalar beradigan savollar", "Вопросы, которые задают родители"],
    "Honest answers — including what Study House cannot promise.": ["Halol javoblar — Study House nimani vaʼda qila olmasligi ham.", "Честные ответы — в том числе о том, что Study House обещать не может."],
    "Yes": ["Ha", "Да"],
    "Get my personal shortlist →": ["Shaxsiy roʻyxatimni olish →", "Получить личный список →"],
    "Language tests": ["Til testlari", "Языковые тесты"],

    /* ---------- Home page ---------- */
    "Study House — International Education Agency | Universities in Europe, Australia, China & USA": ["Study House — xalqaro taʼlim agentligi | Yevropa, Avstraliya, Xitoy va AQShdagi universitetlar", "Study House — международное образовательное агентство | Университеты Европы, Австралии, Китая и США"],
    "Study House helps ambitious students get into world-class universities in Europe, Australia, China and the USA. Expert guidance from consultation to arrival.": ["Study House intiluvchan talabalarga Yevropa, Avstraliya, Xitoy va AQShdagi jahon darajasidagi universitetlarga kirishda yordam beradi. Konsultatsiyadan yetib borishgacha mutaxassis yoʻl-yoʻrigʻi.", "Study House помогает целеустремлённым студентам поступить в университеты мирового уровня в Европе, Австралии, Китае и США. Экспертное сопровождение от консультации до прибытия."],
    "International Education Agency": ["Xalqaro taʼlim agentligi", "Международное образовательное агентство"],
    "Your Future Starts at the Right": ["Kelajagingiz toʻgʻri", "Ваше будущее начинается с правильного"],
    "University.": ["universitetdan boshlanadi.", "университета."],
    "We help ambitious students get into world-class universities in Europe, Australia, China and the USA.": ["Biz intiluvchan talabalarga Yevropa, Avstraliya, Xitoy va AQShdagi jahon darajasidagi universitetlarga kirishda yordam beramiz.", "Мы помогаем целеустремлённым студентам поступить в университеты мирового уровня в Европе, Австралии, Китае и США."],
    "Explore Universities →": ["Universitetlarni koʻrish →", "Смотреть университеты →"],
    "Europe · Australia · China · USA": ["Yevropa · Avstraliya · Xitoy · AQSH", "Европа · Австралия · Китай · США"],
    "Student with backpack looking up at a prestigious gothic university building": ["Ryukzakli talaba nufuzli gotik universitet binosiga qarab turibdi", "Студент с рюкзаком смотрит на престижное готическое здание университета"],
    "Global Opportunities. Real Futures.": ["Global imkoniyatlar. Haqiqiy kelajak.", "Мировые возможности. Реальное будущее."],
    "Top Destinations": ["Eng yaxshi yoʻnalishlar", "Лучшие направления"],
    "Study in the World's Best Countries": ["Dunyoning eng yaxshi davlatlarida oʻqing", "Учитесь в лучших странах мира"],
    "View all destinations": ["Barcha yoʻnalishlarni koʻrish", "Все направления"],
    "European university campus with classical architecture": ["Klassik me'morchilikdagi Yevropa universiteti kampusi", "Кампус европейского университета с классической архитектурой"],
    "World-renowned universities with rich academic traditions": ["Boy akademik anʼanalarga ega, dunyoga mashhur universitetlar", "Всемирно известные университеты с богатыми академическими традициями"],
    "Sydney harbour and skyline at sunset": ["Sidney porti va shahar silueti quyosh botishida", "Гавань и панорама Сиднея на закате"],
    "Top-ranked institutions in a vibrant, welcoming environment": ["Jonli va mehmondoʻst muhitdagi yuqori reytingli taʼlim muassasalari", "Высокорейтинговые вузы в динамичной, гостеприимной среде"],
    "Prestigious American university campus in autumn": ["Nufuzli Amerika universiteti kampusi kuzda", "Престижный американский университетский кампус осенью"],
    "Ivy League and beyond — limitless academic possibilities": ["Ivy League va undan tashqarida — cheksiz akademik imkoniyatlar", "Лига плюща и не только — безграничные академические возможности"],
    "Beautiful Chinese university campus with traditional architecture": ["An'anaviy me'morchilikdagi goʻzal Xitoy universiteti kampusi", "Красивый китайский университетский кампус с традиционной архитектурой"],
    "Fast-growing academic powerhouse with global connections": ["Global aloqalarga ega, tez rivojlanayotgan akademik markaz", "Быстрорастущая академическая держава с глобальными связями"],
    "Why Choose Study House": ["Nega aynan Study House", "Почему Study House"],
    "More Than an Agency.": ["Oddiy agentlikdan koʻproq.", "Больше, чем агентство."],
    "Your Global Partner.": ["Sizning global hamkoringiz.", "Ваш глобальный партнёр."],
    "With years of experience and a network of 200+ partner universities worldwide, we provide comprehensive support at every step of your educational journey — from initial consultation to your first day on campus.": ["Koʻp yillik tajriba va dunyo boʻylab 200 dan ortiq hamkor universitetlar tarmogʻi bilan biz taʼlim yoʻlingizning har bir bosqichida — dastlabki konsultatsiyadan kampusdagi birinchi kuningizgacha — har tomonlama yordam beramiz.", "Благодаря многолетнему опыту и сети из более чем 200 университетов-партнёров по всему миру мы сопровождаем вас на каждом этапе образовательного пути — от первой консультации до первого дня в кампусе."],
    "Personalized Approach": ["Individual yondashuv", "Индивидуальный подход"],
    "Tailored guidance based on your goals, budget, and preferences.": ["Maqsadlaringiz, byudjetingiz va istaklaringizga moslashtirilgan maslahat.", "Рекомендации с учётом ваших целей, бюджета и предпочтений."],
    "Expert Guidance": ["Mutaxassis maslahati", "Экспертное сопровождение"],
    "Seasoned advisors with deep knowledge of global admissions.": ["Xalqaro qabul jarayonini chuqur biladigan tajribali maslahatchilar.", "Опытные консультанты, глубоко знающие международное поступление."],
    "Top Universities": ["Yetakchi universitetlar", "Ведущие университеты"],
    "Access to 200+ partner universities with a high level of education.": ["Taʼlim darajasi yuqori boʻlgan 200+ hamkor universitetlarga kirish imkoni.", "Доступ к 200+ университетам-партнёрам с высоким уровнем образования."],
    "Full Support": ["Toʻliq yordam", "Полная поддержка"],
    "End-to-end help from application to visa to departure.": ["Hujjat topshirishdan viza va joʻnab ketishgacha toʻliq yordam.", "Помощь на всех этапах — от подачи документов до визы и вылета."],
    "Elegant university building with columns and ivy": ["Ustunlar va tokzor bilan bezatilgan noyob universitet binosi", "Элегантное здание университета с колоннами и плющом"],
    "How It Works": ["Bu qanday ishlaydi", "Как это работает"],
    "Your Path to a Global Education": ["Global taʼlimga yoʻlingiz", "Ваш путь к мировому образованию"],
    "Learn more about our process": ["Jarayonimiz haqida batafsil", "Подробнее о нашем процессе"],
    "Consultation": ["Konsultatsiya", "Консультация"],
    "We discuss your goals and choose the best options.": ["Maqsadlaringizni muhokama qilamiz va eng yaxshi variantlarni tanlaymiz.", "Обсуждаем ваши цели и подбираем лучшие варианты."],
    "University Selection": ["Universitet tanlash", "Выбор университета"],
    "We help you find the right university and program.": ["Sizga mos universitet va dasturni topishda yordam beramiz.", "Помогаем найти подходящий университет и программу."],
    "Application & Visa": ["Hujjat topshirish va viza", "Подача документов и виза"],
    "We handle the paperwork and visa process.": ["Hujjatlar va viza jarayonini biz oʻz zimmamizga olamiz.", "Берём на себя документы и визовый процесс."],
    "Departure & Arrival": ["Joʻnab ketish va yetib borish", "Вылет и прибытие"],
    "You get ready for your next chapter abroad.": ["Xorijdagi yangi hayot bosqichiga tayyorlanasiz.", "Вы готовитесь к новой главе жизни за границей."],
    "Featured Universities": ["Tanlangan universitetlar", "Избранные университеты"],
    "Top Universities, Global Opportunities": ["Yetakchi universitetlar, global imkoniyatlar", "Ведущие университеты, мировые возможности"],
    "View all universities": ["Barcha universitetlarni koʻrish", "Все университеты"],

    /* ---------- Europe page ---------- */
    "Study in Europe — Study House | Universities in Germany, Italy, Spain, France, Finland & Latvia": ["Yevropada oʻqish — Study House | Germaniya, Italiya, Ispaniya, Fransiya, Finlandiya va Latviyadagi universitetlar", "Учёба в Европе — Study House | Университеты Германии, Италии, Испании, Франции, Финляндии и Латвии"],
    "Explore top European university destinations with Study House. Zero-tuition Germany, affordable Latvia, generous Finland — find your perfect European study path.": ["Study House bilan Yevropaning eng yaxshi universitet yoʻnalishlarini kashf eting. Oʻqish bepul Germaniya, arzon Latviya, saxovatli Finlandiya — oʻzingizga mos Yevropa taʼlim yoʻlini toping.", "Откройте для себя лучшие университеты Европы вместе с Study House. Бесплатная Германия, доступная Латвия, щедрая Финляндия — найдите свой путь к европейскому образованию."],
    "Study in Europe": ["Yevropada oʻqish", "Учёба в Европе"],
    "Historic Universities,": ["Tarixiy universitetlar,", "Исторические университеты,"],
    "Modern Opportunities.": ["Zamonaviy imkoniyatlar.", "Современные возможности."],
    "From zero-tuition public universities in Germany to Europe's most affordable Baltic gateway, we help you find the right country and the right path.": ["Germaniyadagi bepul davlat universitetlaridan tortib Yevropaning eng arzon Boltiqboʻyi eshigigacha — sizga mos davlat va toʻgʻri yoʻlni topishda yordam beramiz.", "От бесплатных государственных университетов Германии до самых доступных балтийских вузов Европы — мы поможем выбрать подходящую страну и верный путь."],
    "Brandenburg Gate in Berlin, Germany at golden hour": ["Germaniya, Berlindagi Brandenburg darvozasi oltin soatda", "Бранденбургские ворота в Берлине, Германия, в золотой час"],
    "Zero tuition at public universities": ["Davlat universitetlarida oʻqish bepul", "Бесплатное обучение в государственных университетах"],
    "Florence Duomo and terracotta rooftops, Italy": ["Italiya, Florensiya Duomosi va terrakota tomlar", "Флорентийский собор и терракотовые крыши, Италия"],
    "Tuition that scales with your means": ["Oʻqish narxi daromadingizga qarab belgilanadi", "Стоимость обучения зависит от вашего дохода"],
    "Barcelona cityscape with Sagrada Familia, Spain": ["Ispaniya, Barselona manzarasi va Sagrada Familia", "Панорама Барселоны с Саграда Фамилия, Испания"],
    "Work while you study, automatically": ["Oʻqish bilan birga ishlang — ruxsat avtomatik", "Работайте во время учёбы — автоматически"],
    "Eiffel Tower and Paris cityscape, France": ["Fransiya, Parij manzarasi va Eyfel minorasi", "Эйфелева башня и панорама Парижа, Франция"],
    "World-class Grandes Écoles, accessible tuition": ["Jahon darajasidagi Grandes Écoles, qulay narxlar", "Grandes Écoles мирового уровня, доступная стоимость"],
    "Helsinki cathedral and cityscape, Finland": ["Finlandiya, Xelsinki sobori va shahar manzarasi", "Хельсинкский собор и панорама города, Финляндия"],
    "Europe's most generous post-study work rights": ["Yevropadagi eng keng oʻqishdan keyingi ish huquqlari", "Самые щедрые в Европе права на работу после учёбы"],
    "Riga old town architecture, Latvia": ["Latviya, Riganing eski shahar me'morchiligi", "Архитектура старого города Риги, Латвия"],
    "The EU's most affordable gateway": ["Yevropa Ittifoqining eng arzon eshigi", "Самые доступные ворота в ЕС"],
    "Ready to Study in": ["Yevropada", "Готовы учиться в"],
    "Europe?": ["oʻqishga tayyormisiz?", "Европе?"],
    "Book a free consultation with our European education specialists. We'll help you find the perfect country, university, and program.": ["Yevropa taʼlimi boʻyicha mutaxassislarimiz bilan bepul konsultatsiyaga yoziling. Sizga mos davlat, universitet va dasturni topishda yordam beramiz.", "Запишитесь на бесплатную консультацию к нашим специалистам по европейскому образованию. Мы поможем выбрать идеальную страну, университет и программу."],

    /* ---------- Finland ---------- */
    "Study in Finland — Study House | Tuition Waivers, 24-Month Post-Study Permit": ["Finlandiyada oʻqish — Study House | Oʻqish toʻlovidan ozod etish, 24 oylik oʻqishdan keyingi ruxsatnoma", "Учёба в Финляндии — Study House | Освобождение от оплаты, 24-месячный пост-учебный вид на жительство"],
    "Finland offers tuition waivers up to 100%, 30 hrs/week work rights, and Europe's most generous 24-month post-study permit. Study House handles Enter Finland applications.": ["Finlandiya 100% gacha oʻqish toʻlovidan ozod etish, haftasiga 30 soat ishlash huquqi va Yevropadagi eng saxovatli 24 oylik oʻqishdan keyingi ruxsatnomani taklif etadi. Study House Enter Finland arizalarini rasmiylashtiradi.", "Финляндия предлагает освобождение от оплаты до 100%, право работать 30 часов в неделю и самый щедрый в Европе 24-месячный вид на жительство после учёбы. Study House оформляет заявки через Enter Finland."],
    "Helsinki cathedral and harbour in winter": ["Xelsinki sobori va porti qishda", "Хельсинкский собор и гавань зимой"],
    "Nordic Excellence. Europe's Most Generous Work Rights.": ["Shimoliy Yevropa mukammalligi. Yevropadagi eng keng ish huquqlari.", "Северное совершенство. Самые щедрые права на работу в Европе."],
    "Finland lets international students work up to 30 hours a week on average, and stay two full years after graduating to find work.": ["Finlandiya xalqaro talabalarga oʻrtacha haftasiga 30 soatgacha ishlashga va bitirgandan keyin ish topish uchun toʻliq ikki yil qolishga ruxsat beradi.", "Финляндия позволяет иностранным студентам работать в среднем до 30 часов в неделю и оставаться после выпуска два полных года для поиска работы."],
    "Tuition (Non-EU, English-Taught)": ["Oʻqish narxi (YeIdan tashqari, ingliz tilida)", "Стоимость обучения (не для граждан ЕС, на английском)"],
    "30 Hrs/Week": ["Haftasiga 30 soat", "30 ч/неделю"],
    "Average Work Rights": ["Oʻrtacha ishlash huquqi", "Право на работу (в среднем)"],
    "24 Months": ["24 oy", "24 месяца"],
    "Post-Study Job Seeker Permit": ["Oʻqishdan keyingi ish izlash ruxsatnomasi", "Пост-учебный вид на жительство для поиска работы"],
    "Up to 100%": ["100% gacha", "До 100%"],
    "Tuition Waivers Available": ["Oʻqish toʻlovidan ozod etish mavjud", "Доступно освобождение от оплаты"],
    "Finland university campus": ["Finlandiya universiteti kampusi", "Университетский кампус в Финляндии"],
    "The System That Lets You Work 30 Hours a Week — and Stay Two Years After Graduating.": ["Haftasiga 30 soat ishlash va bitirgandan keyin ikki yil qolish imkonini beradigan tizim.", "Система, позволяющая работать 30 часов в неделю и оставаться на два года после выпуска."],
    "Finland introduced tuition fees for non-EU students in 2017, but most universities offer partial-to-full waivers for high-achieving applicants, and Finnish/Swedish-taught programmes remain free for every nationality. Combined with a two-year post-study jobseeker permit, Finland offers one of Europe's clearest long-term pathways.": ["Finlandiya 2017-yilda YeIga aʼzo boʻlmagan talabalar uchun oʻqish toʻlovini joriy etdi, lekin aksariyat universitetlar yuqori natijali abituriyentlarga qisman yoki toʻliq ozod etishni taklif qiladi, fin/shved tilidagi dasturlar esa barcha millat vakillari uchun bepul qoladi. Ikki yillik oʻqishdan keyingi ish izlash ruxsatnomasi bilan birgalikda Finlandiya Yevropadagi eng aniq uzoq muddatli yoʻllardan birini taqdim etadi.", "В 2017 году Финляндия ввела плату за обучение для студентов из стран вне ЕС, но большинство университетов предлагают частичное или полное освобождение успешным абитуриентам, а программы на финском и шведском остаются бесплатными для всех. В сочетании с двухлетним видом на жительство для поиска работы Финляндия предлагает один из самых понятных долгосрочных путей в Европе."],
    "The Finnish System Rewards Merit. We Position You For It.": ["Fin tizimi yutuqlarni ragʻbatlantiradi. Biz sizni shunga tayyorlaymiz.", "Финская система вознаграждает достижения. Мы готовим вас к этому."],
    "Tuition Waiver Strategy": ["Oʻqish toʻlovidan ozod boʻlish strategiyasi", "Стратегия получения освобождения от оплаты"],
    "We identify universities offering 50–100% tuition waivers for non-EU applicants and position your application to qualify.": ["YeIga aʼzo boʻlmagan abituriyentlarga 50–100% oʻqish toʻlovidan ozod etishni taklif qiladigan universitetlarni aniqlaymiz va arizangizni talablarga mos tayyorlaymiz.", "Мы находим университеты, предлагающие абитуриентам из-за пределов ЕС освобождение от оплаты на 50–100%, и готовим вашу заявку так, чтобы вы соответствовали требованиям."],
    "Proof-of-Funds & Scholarship Applications": ["Moliyaviy taʼminot hujjatlari va stipendiya arizalari", "Подтверждение средств и заявки на стипендии"],
    "We prepare the required financial documentation and apply for available university scholarships on your behalf.": ["Kerakli moliyaviy hujjatlarni tayyorlaymiz va mavjud universitet stipendiyalariga sizning nomingizdan ariza topshiramiz.", "Мы готовим необходимые финансовые документы и подаём заявки на доступные университетские стипендии от вашего имени."],
    "Enter Finland Application Management": ["Enter Finland arizasini yuritish", "Ведение заявления через Enter Finland"],
    "We manage your full residence-permit application through the Enter Finland portal, including health insurance and biometrics scheduling.": ["Yashash ruxsatnomasi arizangizni Enter Finland portali orqali toʻliq yuritamiz, jumladan sogʻliqni saqlash sugʻurtasi va biometrik maʼlumotlar topshirish vaqtini belgilashni.", "Мы полностью ведём ваше заявление на вид на жительство через портал Enter Finland, включая медицинскую страховку и запись на биометрию."],
    "Residence Permit for Studies. The Gateway to Finland.": ["Oʻqish uchun yashash ruxsatnomasi. Finlandiyaga eshik.", "Вид на жительство для учёбы. Ворота в Финляндию."],
    "Non-EU students need a Residence Permit for Studies before arrival, applied for online via Enter Finland — it's recommended to apply as early as possible given longer processing times.": ["YeIga aʼzo boʻlmagan talabalarga kelishdan oldin oʻqish uchun yashash ruxsatnomasi kerak, u Enter Finland orqali onlayn topshiriladi — koʻrib chiqish muddati uzoqligi sababli iloji boricha erta ariza topshirish tavsiya etiladi.", "Студентам из-за пределов ЕС до приезда необходим вид на жительство для учёбы, который оформляется онлайн через Enter Finland — из-за длительного рассмотрения рекомендуется подавать заявление как можно раньше."],
    "University acceptance received": ["Universitetga qabul qilinganlik tasdiqlandi", "Получено подтверждение о зачислении"],
    "Residence permit application submitted via Enter Finland": ["Yashash ruxsatnomasi arizasi Enter Finland orqali topshirildi", "Заявление на вид на жительство подано через Enter Finland"],
    "Proof of funds & tuition payment confirmed": ["Moliyaviy taʼminot va oʻqish toʻlovi tasdiqlandi", "Подтверждены финансовые средства и оплата обучения"],
    "Documents & health insurance prepared": ["Hujjatlar va sogʻliqni saqlash sugʻurtasi tayyorlandi", "Документы и медицинская страховка подготовлены"],
    "Biometrics enrolled at nearest Finnish mission": ["Biometrik maʼlumotlar eng yaqin Finlandiya vakolatxonasida topshirildi", "Биометрия сдана в ближайшем представительстве Финляндии"],
    "Permit granted — valid for the full duration of studies": ["Ruxsatnoma berildi — oʻqishning butun davri uchun amal qiladi", "Разрешение получено — действует весь срок обучения"],
    "~€360": ["~€360", "~€360"],
    "Up to 5 months (apply early)": ["5 oygacha (erta topshiring)", "До 5 месяцев (подавайте заранее)"],
    "30 hrs/week average": ["Oʻrtacha haftasiga 30 soat", "В среднем 30 ч/неделю"],
    "24-month jobseeker permit": ["24 oylik ish izlash ruxsatnomasi", "24-месячный вид на жительство для поиска работы"],
    "FINLAND Institutional Database": ["FINLANDIYA muassasalar bazasi", "БАЗА УЧРЕЖДЕНИЙ ФИНЛЯНДИИ"],
    "Partner Universities in Finland": ["Finlandiyadagi hamkor universitetlar", "Университеты-партнёры в Финляндии"],
    "Your Finland Application Starts With One Question: Are You Eligible?": ["Finlandiyaga arizangiz bitta savoldan boshlanadi: Siz mos kelasizmi?", "Ваша заявка в Финляндию начинается с одного вопроса: подходите ли вы?"],
    "Apply for Finland Diagnostic →": ["Finlandiya boʻyicha diagnostikaga yozilish →", "Записаться на диагностику по Финляндии →"],

    /* ---------- France ---------- */
    "Study in France — Study House | Grandes Écoles, Campus France, VLS-TS Visa": ["Fransiyada oʻqish — Study House | Grandes Écoles, Campus France, VLS-TS vizasi", "Учёба во Франции — Study House | Grandes Écoles, Campus France, виза VLS-TS"],
    "French public universities charge non-EU students a fraction of UK/US tuition. Study House manages Campus France, Eiffel scholarships, and your VLS-TS visa.": ["Fransiya davlat universitetlari YeIga aʼzo boʻlmagan talabalardan Buyuk Britaniya/AQSHdagi narxning atigi bir qismini oladi. Study House Campus France, Eiffel stipendiyalari va VLS-TS vizangizni yuritadi.", "Государственные университеты Франции берут с иностранных студентов лишь малую долю стоимости обучения в Великобритании и США. Study House ведёт Campus France, стипендии Eiffel и вашу визу VLS-TS."],
    "Paris Eiffel Tower and Haussmann rooftops at golden hour": ["Parij Eyfel minorasi va Osman uslubidagi tomlar oltin soatda", "Эйфелева башня и османовские крыши Парижа в золотой час"],
    "Grandes Écoles. Affordable by Design.": ["Grandes Écoles. Qulay narxlar uchun yaratilgan.", "Grandes Écoles. Доступно по своей сути."],
    "French public universities charge non-EU students a fraction of tuition in the UK, US, or Australia — with a clear post-study path to work.": ["Fransiya davlat universitetlari YeIga aʼzo boʻlmagan talabalardan Buyuk Britaniya, AQSH yoki Avstraliyadagi narxning atigi bir qismini oladi — oʻqishdan keyin ishga aniq yoʻl bilan.", "Государственные университеты Франции берут с иностранных студентов лишь малую долю стоимости обучения в Великобритании, США или Австралии — и предлагают понятный путь к работе после учёбы."],
    "Tuition (Non-EU, Bachelor/Master)": ["Oʻqish narxi (YeIdan tashqari, bakalavr/magistr)", "Стоимость обучения (не для граждан ЕС, бакалавриат/магистратура)"],
    "964 Hours/Year": ["Yiliga 964 soat", "964 часа в год"],
    "Permitted Work (~20 hrs/week)": ["Ruxsat etilgan ish (~haftasiga 20 soat)", "Разрешённая работа (~20 ч/неделю)"],
    "12 Months": ["12 oy", "12 месяцев"],
    "APS Job-Search Permit": ["APS ish izlash ruxsatnomasi", "Разрешение APS для поиска работы"],
    "€615/Month": ["€615/oy", "€615/месяц"],
    "France university campus": ["Fransiya universiteti kampusi", "Университетский кампус во Франции"],
    "The System Where a World-Class Degree Costs a Fraction of the Alternatives.": ["Jahon darajasidagi diplom muqobillarning atigi bir qismiga tushadigan tizim.", "Система, где диплом мирового уровня стоит в разы меньше альтернатив."],
    "Non-EU students at French public universities pay a differentiated rate of roughly €2,895/year for a bachelor's and €3,941/year for a master's — far below EU/EEA equivalents at private universities elsewhere, and many students qualify for exemptions that bring this even lower.": ["Fransiya davlat universitetlarida YeIga aʼzo boʻlmagan talabalar differensial tarif boʻyicha bakalavr uchun yiliga taxminan €2 895, magistratura uchun €3 941 toʻlaydi — bu boshqa joylardagi xususiy universitetlarning YeI/YeIH tariflaridan ancha past, koʻplab talabalar esa uni yanada pasaytiradigan imtiyozlarga ega boʻladi.", "Иностранные студенты в государственных университетах Франции платят по дифференцированному тарифу около €2 895 в год за бакалавриат и €3 941 за магистратуру — значительно меньше, чем аналогичные тарифы частных университетов в других странах, а многие студенты получают льготы, снижающие плату ещё больше."],
    "The French System Rewards Process. We Manage It.": ["Fransiya tizimi tartibga amal qilishni qadrlaydi. Uni biz boshqaramiz.", "Французская система ценит процедуру. Мы берём её на себя."],
    "Campus France Strategy": ["Campus France strategiyasi", "Стратегия Campus France"],
    "Applicants from Campus France-procedure countries must register and apply to universities through the Études en France portal. We manage the full submission.": ["Campus France tartibi amal qiladigan davlatlardan kelgan abituriyentlar Études en France portali orqali roʻyxatdan oʻtib, universitetlarga ariza topshirishi shart. Butun topshirish jarayonini biz yuritamiz.", "Абитуриенты из стран с процедурой Campus France должны зарегистрироваться и подавать документы в университеты через портал Études en France. Мы ведём всю подачу."],
    "Proof-of-Funds & Scholarship Search": ["Moliyaviy taʼminot hujjatlari va stipendiya qidiruvi", "Подтверждение средств и поиск стипендий"],
    "We prepare financial documentation to meet the €615/month threshold and identify Campus France and Eiffel scholarship opportunities.": ["Oyiga €615 talabiga mos moliyaviy hujjatlarni tayyorlaymiz va Campus France hamda Eiffel stipendiya imkoniyatlarini aniqlaymiz.", "Мы готовим финансовые документы, соответствующие порогу €615 в месяц, и подбираем стипендии Campus France и Eiffel."],
    "Attestation & Consular Documentation": ["Attestatsiya va konsullik hujjatlari", "Аттестация и консульские документы"],
    "We manage certified translation and the full consular document package for your VLS-TS application.": ["VLS-TS arizangiz uchun tasdiqlangan tarjima va konsullik hujjatlarining toʻliq paketini yuritamiz.", "Мы обеспечиваем заверенный перевод и полный пакет консульских документов для вашей заявки на VLS-TS."],
    "VLS-TS. The Gateway to France.": ["VLS-TS. Fransiyaga eshik.", "VLS-TS. Ворота во Францию."],
    "Full-degree non-EU students need the VLS-TS long-stay student visa, which functions as a residence permit and must be validated online within 3 months of arrival.": ["YeIga aʼzo boʻlmagan toʻliq daraja talabalariga VLS-TS uzoq muddatli talaba vizasi kerak, u yashash ruxsatnomasi vazifasini bajaradi va kelgandan keyin 3 oy ichida onlayn tasdiqlanishi shart.", "Иностранным студентам, поступающим на полную программу, нужна долгосрочная студенческая виза VLS-TS, которая выполняет функцию вида на жительство и должна быть подтверждена онлайн в течение 3 месяцев после приезда."],
    "Campus France (Études en France) account created": ["Campus France (Études en France) akkaunti yaratildi", "Создан аккаунт Campus France (Études en France)"],
    "University applications submitted through the portal": ["Universitetlarga arizalar portal orqali topshirildi", "Заявки в университеты поданы через портал"],
    "Acceptance secured & proof of funds arranged (~€615/month)": ["Qabul qilinganlik tasdiqlandi va moliyaviy taʼminot hujjatlari tayyorlandi (~oyiga €615)", "Получено зачисление и подготовлено подтверждение средств (~€615/месяц)"],
    "Documents translated and legalised": ["Hujjatlar tarjima qilindi va legallashtirildi", "Документы переведены и легализованы"],
    "Visa application filed via France-Visas / VFS Global": ["Viza arizasi France-Visas / VFS Global orqali topshirildi", "Заявление на визу подано через France-Visas / VFS Global"],
    "Visa granted — validated online via ANEF within 3 months of arrival": ["Viza berildi — kelgandan keyin 3 oy ichida ANEF orqali onlayn tasdiqlanadi", "Виза получена — подтверждается онлайн через ANEF в течение 3 месяцев после приезда"],
    "~€50–99": ["~€50–99", "~€50–99"],
    "15–45 days": ["15–45 kun", "15–45 дней"],
    "964 hrs/year (~20 hrs/week)": ["Yiliga 964 soat (~haftasiga 20 soat)", "964 ч/год (~20 ч/неделю)"],
    "12-month APS job-search permit": ["12 oylik APS ish izlash ruxsatnomasi", "12-месячное разрешение APS для поиска работы"],
    "FRANCE Institutional Database": ["FRANSIYA muassasalar bazasi", "БАЗА УЧРЕЖДЕНИЙ ФРАНЦИИ"],
    "Partner Universities in France": ["Fransiyadagi hamkor universitetlar", "Университеты-партнёры во Франции"],
    "Your France Application Starts With One Question: Are You Eligible?": ["Fransiyaga arizangiz bitta savoldan boshlanadi: Siz mos kelasizmi?", "Ваша заявка во Францию начинается с одного вопроса: подходите ли вы?"],
    "Apply for France Diagnostic →": ["Fransiya boʻyicha diagnostikaga yozilish →", "Записаться на диагностику по Франции →"],

    /* ---------- Germany ---------- */
    "Study in Germany — Study House | Zero Tuition, World-Class Universities": ["Germaniyada oʻqish — Study House | Bepul taʼlim, jahon darajasidagi universitetlar", "Учёба в Германии — Study House | Бесплатное обучение, университеты мирового уровня"],
    "German public universities charge no tuition fees. Study House helps you navigate Studienkolleg, blocked accounts, DAAD scholarships, and the Type D visa.": ["Germaniya davlat universitetlarida oʻqish toʻlovi yoʻq. Study House sizga Studienkolleg, bloklangan hisoblar, DAAD stipendiyalari va D turidagi viza masalalarida yordam beradi.", "В государственных университетах Германии нет платы за обучение. Study House поможет вам с Studienkolleg, блокированными счетами, стипендиями DAAD и визой типа D."],
    "Berlin Brandenburg Gate at golden hour": ["Berlindagi Brandenburg darvozasi oltin soatda", "Бранденбургские ворота в Берлине в золотой час"],
    "World-Class Education. Zero Tuition.": ["Jahon darajasidagi taʼlim. Oʻqish bepul.", "Образование мирового уровня. Без платы за обучение."],
    "German public universities charge no tuition fees — and their degrees are recognized everywhere in the world.": ["Germaniya davlat universitetlarida oʻqish toʻlovi yoʻq — va ularning diplomlari butun dunyoda tan olinadi.", "Государственные университеты Германии не берут плату за обучение — а их дипломы признаются во всём мире."],
    "Tuition at Public Universities": ["Davlat universitetlarida oʻqish narxi", "Стоимость обучения в государственных вузах"],
    "Up to €11,000": ["€11 000 gacha", "До €11 000"],
    "DAAD Scholarship Value Per Year": ["DAAD stipendiyasining yillik miqdori", "Размер стипендии DAAD в год"],
    "18 Months": ["18 oy", "18 месяцев"],
    "Post-Study Job Search Visa": ["Oʻqishdan keyingi ish izlash vizasi", "Виза для поиска работы после учёбы"],
    "120 Days": ["120 kun", "120 дней"],
    "Permitted Working Days Per Year": ["Yiliga ruxsat etilgan ish kunlari", "Разрешённых рабочих дней в год"],
    "Germany university campus": ["Germaniya universiteti kampusi", "Университетский кампус в Германии"],
    "The Only System in the World Where Excellence Is Free.": ["Dunyoda mukammallik bepul boʻlgan yagona tizim.", "Единственная в мире система, где превосходство бесплатно."],
    "German state universities charge a semester contribution of approximately €100–€400 to cover administrative costs. Tuition itself is zero. This is not a scholarship — it is the default. The degree you receive is identical to one paid for privately anywhere else in the world.": ["Germaniya davlat universitetlari maʼmuriy xarajatlarni qoplash uchun semestrga taxminan €100–€400 badal oladi. Oʻqishning oʻzi bepul. Bu stipendiya emas — bu odatiy holat. Siz oladigan diplom dunyoning boshqa joyida pul toʻlab olingan diplom bilan bir xil.", "Государственные университеты Германии берут семестровый взнос около €100–€400 на покрытие административных расходов. Само обучение бесплатно. Это не стипендия — это норма. Диплом, который вы получите, ничем не отличается от диплома, оплаченного в любой другой стране мира."],
    "The German System Rewards Precision. We Provide It.": ["Germaniya tizimi aniqlikni qadrlaydi. Buni biz taʼminlaymiz.", "Немецкая система ценит точность. Мы обеспечиваем её."],
    "Studienkolleg Strategy": ["Studienkolleg strategiyasi", "Стратегия Studienkolleg"],
    "For candidates needing a preparatory year, we identify and secure placement in the correct Studienkolleg track, then prepare you for the entrance exam and final assessment.": ["Tayyorlov yili kerak boʻlgan nomzodlar uchun toʻgʻri Studienkolleg yoʻnalishini aniqlab, oʻrin ajratamiz, soʻng kirish imtihoni va yakuniy baholashga tayyorlaymiz.", "Для кандидатов, которым нужен подготовительный год, мы подбираем и закрепляем место на подходящем направлении Studienkolleg, а затем готовим к вступительному экзамену и итоговой аттестации."],
    "The four stages of studying abroad": ["Xorijda oʻqishning toʻrt bosqichi", "Четыре этапа учёбы за границей"],
    "Blocked Account & DAAD Management": ["Bloklangan hisob va DAAD boshqaruvi", "Блокированный счёт и работа с DAAD"],
    "We calculate your blocked-account requirement (currently ~€12,000/year), guide account setup at a certified German bank, and prepare your DAAD scholarship application in full.": ["Bloklangan hisob talabini (hozirda ~yiliga €12 000) hisoblab chiqamiz, sertifikatlangan Germaniya bankida hisob ochishda yoʻl-yoʻriq beramiz va DAAD stipendiya arizangizni toʻliq tayyorlaymiz.", "Мы рассчитываем необходимую сумму на блокированном счёте (сейчас ~€12 000 в год), сопровождаем открытие счёта в сертифицированном немецком банке и полностью готовим вашу заявку на стипендию DAAD."],
    "Anabin & Document Legalisation": ["Anabin va hujjatlarni legallashtirish", "Anabin и легализация документов"],
    "Every document submitted to a German institution must meet Anabin verification standards. We manage certified translation, notarisation, and Apostille end-to-end.": ["Germaniya muassasasiga topshirilgan har bir hujjat Anabin tekshiruv standartlariga mos boʻlishi kerak. Tasdiqlangan tarjima, notarial tasdiqlash va apostilni boshidan oxirigacha yuritamiz.", "Каждый документ, подаваемый в немецкое учреждение, должен соответствовать стандартам проверки Anabin. Мы берём на себя заверенный перевод, нотариальное заверение и апостиль от начала до конца."],
    "National Visa Type D. The Gateway to Germany.": ["Milliy viza D turi. Germaniyaga eshik.", "Национальная виза типа D. Ворота в Германию."],
    "Every non-EU student requires a National Visa Type D before entering Germany. It requires a blocked account, an acceptance letter, and a consular appointment.": ["YeIga aʼzo boʻlmagan har bir talaba Germaniyaga kirishdan oldin milliy D turidagi vizaga ega boʻlishi kerak. Buning uchun bloklangan hisob, qabul xati va konsullikka yozilish talab qilinadi.", "Каждому иностранному студенту перед въездом в Германию нужна национальная виза типа D. Для неё требуются блокированный счёт, письмо о зачислении и запись в консульство."],
    "University acceptance letter secured": ["Universitetning qabul xati olindi", "Получено письмо о зачислении"],
    "Blocked account opened — minimum €12,000 deposited": ["Bloklangan hisob ochildi — kamida €12 000 kiritildi", "Блокированный счёт открыт — внесено минимум €12 000"],
    "Documents translated, notarised, and Apostilled": ["Hujjatlar tarjima qilindi, notarial tasdiqlandi va apostil qoʻyildi", "Документы переведены, нотариально заверены и апостилированы"],
    "Visa application filed through the German Embassy": ["Viza arizasi Germaniya elchixonasi orqali topshirildi", "Заявление на визу подано через посольство Германии"],
    "Consular interview preparation completed": ["Konsullik suhbatiga tayyorgarlik yakunlandi", "Подготовка к консульскому собеседованию завершена"],
    "Visa granted — residence permit filed within 14 days": ["Viza berildi — yashash ruxsatnomasi 14 kun ichida topshiriladi", "Виза получена — вид на жительство оформляется в течение 14 дней"],
    "€12,000 (annual)": ["€12 000 (yillik)", "€12 000 (в год)"],
    "4–12 weeks": ["4–12 hafta", "4–12 недель"],
    "120 full days or 240 half-days/year": ["Yiliga 120 toʻliq kun yoki 240 yarim kun", "120 полных или 240 неполных дней в год"],
    "18-month Job Seeker Visa": ["18 oylik ish izlash vizasi", "18-месячная виза для поиска работы"],
    "GERMANY Institutional Database": ["GERMANIYA muassasalar bazasi", "БАЗА УЧРЕЖДЕНИЙ ГЕРМАНИИ"],
    "Partner Universities in Germany": ["Germaniyadagi hamkor universitetlar", "Университеты-партнёры в Германии"],
    "Your Germany Application Starts With One Question: Are You Eligible?": ["Germaniyaga arizangiz bitta savoldan boshlanadi: Siz mos kelasizmi?", "Ваша заявка в Германию начинается с одного вопроса: подходите ли вы?"],
    "Apply for Germany Diagnostic →": ["Germaniya boʻyicha diagnostikaga yozilish →", "Записаться на диагностику по Германии →"],

    /* ---------- Italy ---------- */
    "Study in Italy — Study House | Means-Tested Tuition, EDISU Scholarships": ["Italiyada oʻqish — Study House | Daromadga qarab oʻqish narxi, EDISU stipendiyalari", "Учёба в Италии — Study House | Стоимость обучения по доходу, стипендии EDISU"],
    "Italian public university tuition is means-tested through ISEE. Study House handles Universitaly pre-enrollment, proof of funds, and the Type D visa.": ["Italiya davlat universitetlarida oʻqish narxi ISEE orqali daromadga qarab belgilanadi. Study House Universitaly oldindan roʻyxatdan oʻtkazish, moliyaviy taʼminot hujjatlari va D turidagi vizani yuritadi.", "Стоимость обучения в государственных университетах Италии определяется по доходу семьи через ISEE. Study House оформляет предварительную регистрацию на Universitaly, подтверждение средств и визу типа D."],
    "Florence Duomo and Italian rooftops at sunset": ["Florensiya Duomosi va Italiya tomlari quyosh botishida", "Флорентийский собор и итальянские крыши на закате"],
    "World-Class Universities. Tuition That Fits Your Means.": ["Jahon darajasidagi universitetlar. Imkoniyatingizga mos oʻqish narxi.", "Университеты мирового уровня. Стоимость обучения по вашим возможностям."],
    "Italian public university tuition is means-tested — most students pay a fraction of the listed rate, and some pay nothing at all.": ["Italiya davlat universitetlarida oʻqish narxi daromadga qarab belgilanadi — aksariyat talabalar eʼlon qilingan narxning bir qismini toʻlaydi, baʼzilari esa umuman toʻlamaydi.", "Стоимость обучения в государственных университетах Италии зависит от дохода — большинство студентов платят лишь часть объявленной суммы, а некоторые не платят вовсе."],
    "Tuition (Means-Tested, ISEE)": ["Oʻqish narxi (daromadga qarab, ISEE)", "Стоимость обучения (по доходу, ISEE)"],
    "Up to €5,000+": ["€5 000+ gacha", "До €5 000+"],
    "EDISU Regional Scholarship": ["EDISU hududiy stipendiyasi", "Региональная стипендия EDISU"],
    "Post-Study Job Search Permit": ["Oʻqishdan keyingi ish izlash ruxsatnomasi", "Разрешение на поиск работы после учёбы"],
    "1,040 Hours": ["1 040 soat", "1 040 часов"],
    "Permitted Work Per Year": ["Yiliga ruxsat etilgan ish", "Разрешённая работа в год"],
    "Italy university campus": ["Italiya universiteti kampusi", "Университетский кампус в Италии"],
    "The Only System Where Your Tuition Reflects Your Means, Not Your Nationality.": ["Oʻqish narxi fuqaroligingizga emas, imkoniyatingizga bogʻliq boʻlgan yagona tizim.", "Единственная система, где стоимость обучения зависит от ваших возможностей, а не от гражданства."],
    "Italian public universities set tuition through the ISEE means-testing system — students from lower-income households can pay close to nothing, while the standard flat rate for others ranges up to roughly €4,600/year. It's one of the fairest tuition systems in Europe, open equally to EU and non-EU applicants.": ["Italiya davlat universitetlari oʻqish narxini ISEE daromadni baholash tizimi orqali belgilaydi — daromadi past oilalarning talabalari deyarli hech narsa toʻlamasligi mumkin, boshqalar uchun oddiy tarif esa yiliga taxminan €4 600 gacha boradi. Bu Yevropadagi eng adolatli oʻqish tizimlaridan biri boʻlib, YeI va YeIga aʼzo boʻlmagan abituriyentlar uchun bir xil ochiq.", "Государственные университеты Италии определяют стоимость обучения через систему оценки дохода ISEE — студенты из семей с низким доходом могут платить почти ничего, а стандартная ставка для остальных доходит примерно до €4 600 в год. Это одна из самых справедливых систем оплаты в Европе, одинаково открытая для граждан ЕС и остальных абитуриентов."],
    "The Italian System Rewards Documentation. We Handle It.": ["Italiya tizimi hujjatlarni qadrlaydi. Ularni biz yuritamiz.", "Итальянская система ценит документы. Мы берём их на себя."],
    "Universitaly Pre-Enrollment Strategy": ["Universitaly oldindan roʻyxatdan oʻtish strategiyasi", "Стратегия предварительной регистрации на Universitaly"],
    "Every non-EU applicant must pre-enroll through the Universitaly portal before applying for a visa. We manage the portal submission and university validation end-to-end.": ["YeIga aʼzo boʻlmagan har bir abituriyent vizaga ariza berishdan oldin Universitaly portali orqali oldindan roʻyxatdan oʻtishi shart. Portalga topshirish va universitet tasdiqlashini boshidan oxirigacha yuritamiz.", "Каждый абитуриент из-за пределов ЕС должен до подачи на визу пройти предварительную регистрацию через портал Universitaly. Мы ведём подачу через портал и подтверждение университетом от начала до конца."],
    "ISEE & Proof-of-Funds Management": ["ISEE va moliyaviy taʼminot hujjatlarini yuritish", "Работа с ISEE и подтверждением средств"],
    "We calculate your ISEE-equivalent declaration, arrange proof of funds (~€8,000/year), and identify EDISU regional scholarship eligibility.": ["ISEE ga teng deklaratsiyangizni hisoblaymiz, moliyaviy taʼminot hujjatlarini (~yiliga €8 000) tayyorlaymiz va EDISU hududiy stipendiyasiga munosibligingizni aniqlaymiz.", "Мы рассчитываем декларацию, эквивалентную ISEE, готовим подтверждение средств (~€8 000 в год) и определяем ваше право на региональную стипендию EDISU."],
    "Declaration of Value & Legalisation": ["Qiymat deklaratsiyasi va legallashtirish", "Декларация о стоимости и легализация"],
    "We manage certified translation, notarisation, and the Declaration of Value required by Italian consulates for every academic document.": ["Italiya konsulliklari har bir akademik hujjat uchun talab qiladigan tasdiqlangan tarjima, notarial tasdiqlash va Qiymat deklaratsiyasini yuritamiz.", "Мы обеспечиваем заверенный перевод, нотариальное заверение и Декларацию о стоимости, которую итальянские консульства требуют для каждого академического документа."],
    "National Visa Type D. The Gateway to Italy.": ["Milliy viza D turi. Italiyaga eshik.", "Национальная виза типа D. Ворота в Италию."],
    "Non-EU students need a National Visa Type D (Visto per Studio) before entering Italy, followed by a residence permit application within 8 days of arrival.": ["YeIga aʼzo boʻlmagan talabalarga Italiyaga kirishdan oldin milliy D turidagi viza (Visto per Studio) kerak, kelgandan keyin 8 kun ichida yashash ruxsatnomasiga ariza topshiriladi.", "Иностранным студентам перед въездом в Италию нужна национальная виза типа D (Visto per Studio), а после приезда в течение 8 дней — заявление на вид на жительство."],
    "Universitaly pre-enrollment completed": ["Universitaly oldindan roʻyxatdan oʻtish yakunlandi", "Предварительная регистрация на Universitaly завершена"],
    "University acceptance & Declaration of Value obtained": ["Universitetga qabul va Qiymat deklaratsiyasi olindi", "Получены зачисление и Декларация о стоимости"],
    "Proof of funds arranged (~€8,000/year)": ["Moliyaviy taʼminot hujjatlari tayyorlandi (~yiliga €8 000)", "Подтверждение средств подготовлено (~€8 000 в год)"],
    "Visa application filed at the Italian Consulate": ["Viza arizasi Italiya konsulligida topshirildi", "Заявление на визу подано в консульство Италии"],
    "Visa granted — Permesso di Soggiorno filed within 8 days of arrival": ["Viza berildi — Permesso di Soggiorno kelgandan keyin 8 kun ichida topshiriladi", "Виза получена — Permesso di Soggiorno оформляется в течение 8 дней после приезда"],
    "~€8,036 (annual)": ["~€8 036 (yillik)", "~€8 036 (в год)"],
    "Several weeks": ["Bir necha hafta", "Несколько недель"],
    "1,040 hours/year (~20 hrs/week)": ["Yiliga 1 040 soat (~haftasiga 20 soat)", "1 040 ч/год (~20 ч/неделю)"],
    "12-month job-seeking permit": ["12 oylik ish izlash ruxsatnomasi", "12-месячное разрешение для поиска работы"],
    "ITALY Institutional Database": ["ITALIYA muassasalar bazasi", "БАЗА УЧРЕЖДЕНИЙ ИТАЛИИ"],
    "Partner Universities in Italy": ["Italiyadagi hamkor universitetlar", "Университеты-партнёры в Италии"],
    "Your Italy Application Starts With One Question: Are You Eligible?": ["Italiyaga arizangiz bitta savoldan boshlanadi: Siz mos kelasizmi?", "Ваша заявка в Италию начинается с одного вопроса: подходите ли вы?"],
    "Apply for Italy Diagnostic →": ["Italiya boʻyicha diagnostikaga yozilish →", "Записаться на диагностику по Италии →"],

    /* ---------- Latvia ---------- */
    "Study in Latvia — Study House | EU's Most Affordable, Schengen-Recognized Degrees": ["Latviyada oʻqish — Study House | YeIning eng arzon, Shengen hududida tan olinadigan diplomlari", "Учёба в Латвии — Study House | Самые доступные в ЕС дипломы, признаваемые в Шенгене"],
    "Latvia offers EU-recognized degrees, English-taught programmes, and among the lowest tuition fees in the Schengen Area. Study House manages your full application.": ["Latviya YeI tan oladigan diplomlar, ingliz tilidagi dasturlar va Shengen hududidagi eng past oʻqish narxlaridan birini taklif etadi. Study House butun arizangizni yuritadi.", "Латвия предлагает дипломы, признаваемые в ЕС, программы на английском и одну из самых низких стоимостей обучения в Шенгенской зоне. Study House ведёт всю вашу заявку."],
    "Riga old town and House of the Blackheads": ["Riganing eski shahri va Qoraboshlar uyi", "Старый город Риги и Дом Черноголовых"],
    "The EU's Most Affordable Gateway to Europe.": ["Yevropaga YeIning eng arzon eshigi.", "Самые доступные ворота в Европу."],
    "Latvia offers EU-recognized degrees, English-taught programmes, and some of the lowest tuition fees in the Schengen Area.": ["Latviya YeI tan oladigan diplomlar, ingliz tilidagi dasturlar va Shengen hududidagi eng past oʻqish narxlaridan birini taklif etadi.", "Латвия предлагает дипломы, признаваемые в ЕС, программы на английском и одну из самых низких стоимостей обучения в Шенгенской зоне."],
    "Tuition (Varies by Programme)": ["Oʻqish narxi (dasturga qarab farq qiladi)", "Стоимость обучения (зависит от программы)"],
    "20 Hrs/Week": ["Haftasiga 20 soat", "20 ч/неделю"],
    "Work Rights (Full-Time in Holidays)": ["Ishlash huquqi (taʼtilda toʻliq kun)", "Право на работу (полный день на каникулах)"],
    "€500–€600/Mo": ["€500–€600/oy", "€500–€600/мес."],
    "State Scholarship Available": ["Davlat stipendiyasi mavjud", "Доступна государственная стипендия"],
    "EU & Schengen": ["YeI va Shengen", "ЕС и Шенген"],
    "Full Degree Recognition": ["Diplomning toʻliq tan olinishi", "Полное признание диплома"],
    "Latvia university campus": ["Latviya universiteti kampusi", "Университетский кампус в Латвии"],
    "The Baltic System Where a European Degree Costs Less Than You'd Expect.": ["Yevropa diplomi oʻylagandan arzonga tushadigan Boltiqboʻyi tizimi.", "Балтийская система, где европейский диплом стоит дешевле, чем вы думаете."],
    "Latvian public universities charge among the lowest tuition fees in the EU — most programmes range from €1,500 to €6,000 per year, with medicine and specialised MBAs priced higher. Degrees are fully recognized across the EU under the Bologna system, and the Latvian State Scholarship supports qualifying students from year two onward.": ["Latviya davlat universitetlarida oʻqish narxi YeIdagi eng past narxlardan biri — aksariyat dasturlar yiliga €1 500 dan €6 000 gacha, tibbiyot va ixtisoslashgan MBA dasturlari esa qimmatroq. Diplomlar Boloniya tizimi asosida butun YeIda toʻliq tan olinadi, Latviya davlat stipendiyasi esa mos talabalarni ikkinchi yildan boshlab qoʻllab-quvvatlaydi.", "Государственные университеты Латвии берут одну из самых низких в ЕС плат за обучение — большинство программ стоит от €1 500 до €6 000 в год, медицина и специализированные MBA дороже. Дипломы полностью признаются в ЕС по Болонской системе, а государственная стипендия Латвии поддерживает подходящих студентов со второго курса."],
    "The Latvian System Rewards Early Preparation. We Lead It.": ["Latviya tizimi erta tayyorgarlikni qadrlaydi. Uni biz boshqaramiz.", "Латвийская система ценит раннюю подготовку. Мы ведём вас по ней."],
    "Programme & University Matching": ["Dastur va universitetni moslashtirish", "Подбор программы и университета"],
    "We match your profile to the right Latvian institution among 200+ English-taught programmes, weighted toward tuition and career fit.": ["Profilingizni 200 dan ortiq ingliz tilidagi dasturlar orasidan mos Latviya muassasasiga moslaymiz, bunda oʻqish narxi va kasbiy yoʻnalish hisobga olinadi.", "Мы подбираем для вашего профиля подходящий латвийский вуз среди 200+ программ на английском, учитывая стоимость обучения и карьерные цели."],
    "Proof-of-Funds & State Scholarship Applications": ["Moliyaviy taʼminot hujjatlari va davlat stipendiyasi arizalari", "Подтверждение средств и заявки на государственную стипендию"],
    "We prepare financial documentation to meet the ~€430/month threshold and apply for the Latvian State Scholarship on your behalf.": ["Oyiga ~€430 talabiga mos moliyaviy hujjatlarni tayyorlaymiz va Latviya davlat stipendiyasiga sizning nomingizdan ariza topshiramiz.", "Мы готовим финансовые документы, соответствующие порогу ~€430 в месяц, и подаём заявку на государственную стипендию Латвии от вашего имени."],
    "Consular Legalisation & Health Insurance": ["Konsullik legallashtirishi va sogʻliqni saqlash sugʻurtasi", "Консульская легализация и медицинская страховка"],
    "We manage document legalisation and arrange the Schengen-valid health insurance policy required for your residence permit.": ["Hujjatlarni legallashtiramiz va yashash ruxsatnomangiz uchun zarur boʻlgan Shengen hududida amal qiladigan sogʻliqni saqlash sugʻurtasini rasmiylashtiramiz.", "Мы занимаемся легализацией документов и оформляем медицинскую страховку, действующую в Шенгене, — она нужна для вашего вида на жительство."],
    "Long-Term National Visa (Type D). The Gateway to Latvia.": ["Uzoq muddatli milliy viza (D turi). Latviyaga eshik.", "Долгосрочная национальная виза (тип D). Ворота в Латвию."],
    "Non-EU students need a Long-Term National Visa (Type D) for stays over 90 days, followed by a residence permit through the Office of Citizenship and Migration Affairs (OCMA).": ["YeIga aʼzo boʻlmagan talabalarga 90 kundan ortiq qolish uchun uzoq muddatli milliy viza (D turi) kerak, undan keyin Fuqarolik va migratsiya masalalari boshqarmasi (OCMA) orqali yashash ruxsatnomasi olinadi.", "Иностранным студентам для пребывания более 90 дней нужна долгосрочная национальная виза (тип D), а затем вид на жительство через Управление по делам гражданства и миграции (OCMA)."],
    "University acceptance & invitation letter secured": ["Universitetga qabul va taklifnoma olindi", "Получены зачисление и приглашение"],
    "Proof of funds arranged (~€430/month)": ["Moliyaviy taʼminot hujjatlari tayyorlandi (~oyiga €430)", "Подтверждение средств подготовлено (~€430/месяц)"],
    "Visa application filed at the Latvian Embassy": ["Viza arizasi Latviya elchixonasida topshirildi", "Заявление на визу подано в посольстве Латвии"],
    "Consular interview attended": ["Konsullik suhbatidan oʻtildi", "Консульское собеседование пройдено"],
    "Visa granted — residence permit finalised via OCMA after arrival": ["Viza berildi — yashash ruxsatnomasi kelgandan keyin OCMA orqali rasmiylashtiriladi", "Виза получена — вид на жительство оформляется через OCMA после приезда"],
    "40+ days": ["40+ kun", "40+ дней"],
    "20 hrs/week (full-time in holidays)": ["Haftasiga 20 soat (taʼtilda toʻliq kun)", "20 ч/неделю (полный день на каникулах)"],
    "~€430/month": ["~oyiga €430", "~€430/месяц"],
    "€500–€600/month (Latvian State)": ["Oyiga €500–€600 (Latviya davlati)", "€500–€600/месяц (государство Латвия)"],
    "LATVIA Institutional Database": ["LATVIYA muassasalar bazasi", "БАЗА УЧРЕЖДЕНИЙ ЛАТВИИ"],
    "Partner Universities in Latvia": ["Latviyadagi hamkor universitetlar", "Университеты-партнёры в Латвии"],
    "Your Latvia Application Starts With One Question: Are You Eligible?": ["Latviyaga arizangiz bitta savoldan boshlanadi: Siz mos kelasizmi?", "Ваша заявка в Латвию начинается с одного вопроса: подходите ли вы?"],
    "Apply for Latvia Diagnostic →": ["Latviya boʻyicha diagnostikaga yozilish →", "Записаться на диагностику по Латвии →"],

    /* ---------- Spain ---------- */
    "Study in Spain — Study House | Automatic Work Rights, Affordable Tuition": ["Ispaniyada oʻqish — Study House | Avtomatik ish huquqi, qulay oʻqish narxi", "Учёба в Испании — Study House | Автоматическое право на работу, доступное обучение"],
    "Spain lets international students work up to 30 hours a week automatically. Study House guides your university match, proof of funds, and Type D visa.": ["Ispaniya xalqaro talabalarga haftasiga 30 soatgacha avtomatik ishlashga ruxsat beradi. Study House universitet tanlash, moliyaviy taʼminot hujjatlari va D turidagi viza boʻyicha yoʻl koʻrsatadi.", "Испания автоматически разрешает иностранным студентам работать до 30 часов в неделю. Study House поможет с выбором университета, подтверждением средств и визой типа D."],
    "Barcelona Sagrada Familia and cityscape at sunset": ["Barselona, Sagrada Familia va shahar manzarasi quyosh botishida", "Барселона, Саграда Фамилия и панорама города на закате"],
    "Ancient Universities. Modern Work Rights.": ["Qadimiy universitetlar. Zamonaviy ish huquqlari.", "Древние университеты. Современные права на работу."],
    "Spain lets international students work up to 30 hours a week automatically — no separate permit needed.": ["Ispaniya xalqaro talabalarga haftasiga 30 soatgacha avtomatik ishlashga ruxsat beradi — alohida ruxsatnoma kerak emas.", "Испания автоматически разрешает иностранным студентам работать до 30 часов в неделю — отдельное разрешение не требуется."],
    "Tuition (Non-EU, Public)": ["Oʻqish narxi (YeIdan tashqari, davlat)", "Стоимость обучения (не для граждан ЕС, государственные вузы)"],
    "Automatic Work Authorization": ["Avtomatik ish ruxsati", "Автоматическое разрешение на работу"],
    "€600/Month": ["€600/oy", "€600/месяц"],
    "Post-Study Work Permit": ["Oʻqishdan keyingi ish ruxsatnomasi", "Разрешение на работу после учёбы"],
    "Spain university campus": ["Ispaniya universiteti kampusi", "Университетский кампус в Испании"],
    "The Country Where You Can Work While You Study — Automatically.": ["Oʻqish bilan birga avtomatik ishlash mumkin boʻlgan davlat.", "Страна, где можно работать во время учёбы — автоматически."],
    "Since the 2025 reform, Spain's student visa automatically includes work authorization for up to 30 hours a week — no separate permit process. Combined with tuition that's a fraction of Anglophone destinations, Spain offers one of Europe's best study-to-work pathways.": ["2025-yilgi islohotdan beri Ispaniya talaba vizasi haftasiga 30 soatgacha ishlash ruxsatini avtomatik oʻz ichiga oladi — alohida ruxsatnoma jarayoni yoʻq. Ingliz tilli davlatlarga nisbatan ancha arzon oʻqish narxi bilan birga Ispaniya Yevropadagi eng yaxshi «oʻqishdan ishga» yoʻllaridan birini taklif etadi.", "После реформы 2025 года студенческая виза Испании автоматически включает разрешение на работу до 30 часов в неделю — отдельной процедуры не требуется. В сочетании со стоимостью обучения в разы ниже, чем в англоязычных странах, Испания предлагает один из лучших в Европе путей от учёбы к работе."],
    "The Spanish System Rewards Preparation. We Provide It.": ["Ispaniya tizimi tayyorgarlikni qadrlaydi. Buni biz taʼminlaymiz.", "Испанская система ценит подготовку. Мы обеспечиваем её."],
    "University & Programme Matching": ["Universitet va dasturni moslashtirish", "Подбор университета и программы"],
    "We match your academic profile to the right public university and region, where tuition and cost of living vary significantly.": ["Akademik profilingizni mos davlat universiteti va hududga moslaymiz — bu yerda oʻqish narxi va yashash xarajatlari sezilarli farq qiladi.", "Мы подбираем для вашего академического профиля подходящий государственный университет и регион, где стоимость обучения и жизни существенно различается."],
    "Proof-of-Funds Documentation": ["Moliyaviy taʼminot hujjatlari", "Документы, подтверждающие средства"],
    "We prepare your financial documentation to meet the ~€600/month threshold and guide sponsorship-letter requirements where applicable.": ["Oyiga ~€600 talabiga mos moliyaviy hujjatlaringizni tayyorlaymiz va kerak boʻlganda homiylik xati talablari boʻyicha yoʻl-yoʻriq beramiz.", "Мы готовим ваши финансовые документы в соответствии с порогом ~€600 в месяц и консультируем по требованиям к письму-спонсорству, где это необходимо."],
    "Apostille & Consular Legalisation": ["Apostil va konsullik legallashtirishi", "Апостиль и консульская легализация"],
    "We manage translation, notarisation, and Apostille certification for your complete academic and financial document package.": ["Akademik va moliyaviy hujjatlaringizning toʻliq paketi uchun tarjima, notarial tasdiqlash va apostil qoʻyishni yuritamiz.", "Мы берём на себя перевод, нотариальное заверение и апостилирование всего пакета ваших академических и финансовых документов."],
    "The National Visa (Type D). The Gateway to Spain.": ["Milliy viza (D turi). Ispaniyaga eshik.", "Национальная виза (тип D). Ворота в Испанию."],
    "Non-EU students need a National Visa (Type D) for courses over 90 days, followed by a residence card (TIE) after arrival.": ["YeIga aʼzo boʻlmagan talabalarga 90 kundan uzoq kurslar uchun milliy viza (D turi) kerak, kelgandan keyin esa yashash kartasi (TIE) olinadi.", "Иностранным студентам для курсов дольше 90 дней нужна национальная виза (тип D), а после приезда — карта резидента (TIE)."],
    "Proof of funds arranged (~€600/month)": ["Moliyaviy taʼminot hujjatlari tayyorlandi (~oyiga €600)", "Подтверждение средств подготовлено (~€600/месяц)"],
    "Visa application filed at the Spanish Consulate": ["Viza arizasi Ispaniya konsulligida topshirildi", "Заявление на визу подано в консульство Испании"],
    "Consular interview and biometrics completed": ["Konsullik suhbati va biometrik maʼlumotlar topshirish yakunlandi", "Консульское собеседование и биометрия завершены"],
    "Visa granted — TIE residence card collected within 30 days of arrival": ["Viza berildi — TIE yashash kartasi kelgandan keyin 30 kun ichida olinadi", "Виза получена — карта резидента TIE получается в течение 30 дней после приезда"],
    "6–12 weeks": ["6–12 hafta", "6–12 недель"],
    "30 hrs/week (automatic since 2025)": ["Haftasiga 30 soat (2025-yildan avtomatik)", "30 ч/неделю (автоматически с 2025 года)"],
    "~€600/month": ["~oyiga €600", "~€600/месяц"],
    "12-month work-permit modification": ["12 oylik ish ruxsatnomasiga oʻtish", "12-месячное изменение статуса на разрешение на работу"],
    "SPAIN Institutional Database": ["ISPANIYA muassasalar bazasi", "БАЗА УЧРЕЖДЕНИЙ ИСПАНИИ"],
    "Partner Universities in Spain": ["Ispaniyadagi hamkor universitetlar", "Университеты-партнёры в Испании"],
    "Your Spain Application Starts With One Question: Are You Eligible?": ["Ispaniyaga arizangiz bitta savoldan boshlanadi: Siz mos kelasizmi?", "Ваша заявка в Испанию начинается с одного вопроса: подходите ли вы?"],
    "Apply for Spain Diagnostic →": ["Ispaniya boʻyicha diagnostikaga yozilish →", "Записаться на диагностику по Испании →"],

    /* ---------- Our Expertise ---------- */
    "Our Expertise — Study House | University Application, Visa & Relocation Support": ["Bizning tajribamiz — Study House | Universitetga hujjat topshirish, viza va koʻchib oʻtish yordami", "Наш опыт — Study House | Поступление, виза и помощь с переездом"],
    "See exactly what goes wrong at every stage of studying abroad — and what your dedicated Study House advisor does about it. University applications, scholarships, visas, and relocation.": ["Xorijda oʻqishning har bir bosqichida aynan nima xato ketishini va Study House shaxsiy maslahatchingiz bunga qarshi nima qilishini koʻring. Universitetga hujjat topshirish, stipendiyalar, viza va koʻchib oʻtish.", "Узнайте, что именно идёт не так на каждом этапе учёбы за границей — и что делает ваш персональный консультант Study House. Поступление, стипендии, визы и переезд."],
    "What Goes Wrong, and What We Do About It": ["Nima xato ketadi va biz nima qilamiz", "Что идёт не так и что делаем мы"],
    "From Application to Arrival: Four Stages, One Advisor": ["Hujjat topshirishdan yetib borishgacha: toʻrt bosqich, bitta maslahatchi", "От подачи документов до прибытия: четыре этапа, один консультант"],
    "Here is what each stage involves and how Study House supports you through it.": ["Har bir bosqich nimalarni oʻz ichiga olishi va Study House sizni bu yoʻlda qanday qoʻllab-quvvatlashi bilan tanishing.", "Вот что включает каждый этап и как Study House поддерживает вас на этом пути."],
    "University Application": ["Universitetga hujjat topshirish", "Поступление в университет"],
    "Scholarship & Funding": ["Stipendiya va moliyalashtirish", "Стипендии и финансирование"],
    "Student Visa": ["Talaba vizasi", "Студенческая виза"],
    "Relocation & First Weeks": ["Koʻchib oʻtish va birinchi haftalar", "Переезд и первые недели"],
    "Without Support": ["Yordamsiz", "Без сопровождения"],
    "With Study House": ["Study House bilan", "С Study House"],
    "A template application copied from the internet — the committee spends ~8 minutes on it and has seen a hundred just like it.": ["Internetdan koʻchirilgan shablon ariza — komissiya unga ~8 daqiqa sarflaydi va xuddi shunday yuztasini koʻrgan.", "Шаблонная заявка, скопированная из интернета, — комиссия тратит на неё ~8 минут и уже видела сотню таких же."],
    "A personal statement not tailored to the specific department — a formal rejection 2–3 months later.": ["Muayyan kafedraga moslashtirilmagan shaxsiy bayonot — 2–3 oydan keyin rasmiy rad javobi.", "Мотивационное письмо, не адаптированное под конкретный факультет, — официальный отказ через 2–3 месяца."],
    "Applying to just 1–2 universities at random, with no backup options.": ["Zaxira variantlarsiz, tasodifiy tanlangan atigi 1–2 ta universitetga ariza berish.", "Подача всего в 1–2 случайных университета без запасных вариантов."],
    "A missed internal department or portal deadline.": ["Kafedra yoki portalning ichki muddati oʻtkazib yuboriladi.", "Пропущенный внутренний срок факультета или портала."],
    "No assessment of your chances before applying — you find out the result once other deadlines have already passed.": ["Ariza berishdan oldin imkoniyatlaringiz baholanmaydi — natijani boshqa muddatlar allaqachon oʻtib ketgandan keyin bilasiz.", "Нет оценки шансов до подачи — вы узнаёте результат, когда другие сроки уже прошли."],
    "A list of 5–7 universities matched to your profile and budget, with an honest assessment of your chances at each.": ["Profilingiz va byudjetingizga mos 5–7 ta universitet roʻyxati, har birida imkoniyatlaringizning halol baholanishi bilan.", "Список из 5–7 университетов, подобранных под ваш профиль и бюджет, с честной оценкой шансов в каждом."],
    "A personal narrative and essay built around the specific department's values, not a template.": ["Shablon emas, balki muayyan kafedra qadriyatlariga moslab yozilgan shaxsiy hikoya va esse.", "Личная история и эссе, выстроенные вокруг ценностей конкретного факультета, а не по шаблону."],
    "A recommendation and portfolio strategy matched to the program's requirements.": ["Dastur talablariga mos tavsiyanoma va portfolio strategiyasi.", "Стратегия рекомендаций и портфолио, соответствующая требованиям программы."],
    "A submission schedule for each university with buffer time before the deadline.": ["Har bir universitet uchun muddatdan oldin zaxira vaqti bilan topshirish jadvali.", "График подачи для каждого университета с запасом времени до дедлайна."],
    "One consultant manages the entire package — you always know exactly what stage your application is at.": ["Butun paketni bitta maslahatchi yuritadi — arizangiz qaysi bosqichda ekanini doim aniq bilasiz.", "Весь пакет ведёт один консультант — вы всегда точно знаете, на каком этапе ваша заявка."],
    "Scholarship search limited to whatever shows up in a Google search — most listings are outdated or already closed.": ["Stipendiya qidiruvi faqat Google natijalari bilan cheklanadi — aksariyat eʼlonlar eskirgan yoki allaqachon yopilgan.", "Поиск стипендий ограничен тем, что выдаёт Google, — большинство объявлений устарели или уже закрыты."],
    "A generic motivation letter reused across every scholarship application.": ["Har bir stipendiya arizasida qayta ishlatiladigan umumiy motivatsion xat.", "Универсальное мотивационное письмо, используемое для всех стипендий."],
    "Missing merit-based or need-based funding because eligibility rules were never checked.": ["Munosiblik qoidalari tekshirilmagani uchun yutuqqa yoki ehtiyojga asoslangan moliyalashtirish qoʻldan boy beriladi.", "Упущено финансирование за достижения или по нуждаемости, потому что критерии не проверили."],
    "No backup financial plan if the scholarship falls through.": ["Stipendiya berilmasa, zaxira moliyaviy reja yoʻq.", "Нет запасного финансового плана, если стипендию не дадут."],
    "Applying after the priority deadline, when award pools are already smaller.": ["Ustuvor muddatdan keyin ariza berish — mukofot jamgʻarmasi allaqachon kichrayib boʻlgan paytda.", "Подача после приоритетного срока, когда стипендиальный фонд уже меньше."],
    "A shortlist of scholarships and tuition waivers you actually qualify for, ranked by award size and odds.": ["Haqiqatan munosib boʻlgan stipendiya va oʻqish toʻlovidan ozod etish roʻyxati, miqdori va imkoniyati boʻyicha tartiblangan.", "Список стипендий и освобождений от оплаты, на которые вы действительно можете претендовать, ранжированный по размеру и шансам."],
    "A motivation letter and financial-need statement written for each specific fund.": ["Har bir aniq jamgʻarma uchun yozilgan motivatsion xat va moliyaviy ehtiyoj bayonoti.", "Мотивационное письмо и заявление о финансовой нуждаемости, написанные под каждый конкретный фонд."],
    "A blocked-account and proof-of-funds plan set up in parallel, so your visa isn't held up by financing.": ["Bloklangan hisob va moliyaviy taʼminot rejasi parallel tayyorlanadi, shunda vizangiz moliyalashtirish tufayli kechikmaydi.", "План блокированного счёта и подтверждения средств готовится параллельно, чтобы финансирование не задерживало визу."],
    "Priority-deadline tracking, so you apply while the award pool is largest.": ["Ustuvor muddatlarni kuzatish — mukofot jamgʻarmasi eng katta boʻlgan paytda ariza berasiz.", "Отслеживание приоритетных сроков — вы подаёте заявку, пока стипендиальный фонд наибольший."],
    "One consultant coordinating scholarship, tuition, and visa financing as one plan, not three.": ["Bitta maslahatchi stipendiya, oʻqish toʻlovi va viza moliyalashtirishini uchta emas, bitta reja sifatida uygʻunlashtiradi.", "Один консультант координирует стипендию, оплату обучения и финансирование визы как единый план, а не три отдельных."],
    "Visa documents assembled without knowing which translations need notarization or apostille.": ["Viza hujjatlari qaysi tarjimalarga notarial tasdiq yoki apostil kerakligi bilinmasdan yigʻiladi.", "Визовые документы собираются без понимания, какие переводы нужно нотариально заверять или апостилировать."],
    "A blocked account opened at the wrong bank, or with the wrong minimum balance.": ["Bloklangan hisob notoʻgʻri bankda yoki notoʻgʻri minimal qoldiq bilan ochiladi.", "Блокированный счёт открыт не в том банке или с неверной минимальной суммой."],
    "A consulate appointment booked without interview preparation.": ["Konsullikka yozilinadi, lekin suhbatga tayyorgarlik koʻrilmaydi.", "Запись в консульство сделана без подготовки к собеседованию."],
    "A missing required document discovered only at the counter — weeks lost rebooking.": ["Yetishmayotgan hujjat faqat peshtaxtada aniqlanadi — qayta yozilishda haftalar yoʻqotiladi.", "Недостающий документ обнаруживается только у окна — недели теряются на повторную запись."],
    "No visibility into processing time, so travel and housing get booked on guesswork.": ["Koʻrib chiqish muddati nomaʼlum, shu sabab yoʻl va turar joy taxminan band qilinadi.", "Сроки рассмотрения неизвестны, поэтому билеты и жильё бронируются наугад."],
    "A complete, pre-checked document file — translated, notarized, and apostilled to the exact consulate standard.": ["Toʻliq, oldindan tekshirilgan hujjatlar toʻplami — tarjima qilingan, notarial tasdiqlangan va konsullik standartiga aniq mos apostil qoʻyilgan.", "Полный, предварительно проверенный пакет документов — переведённый, нотариально заверенный и апостилированный по стандарту конкретного консульства."],
    "Blocked account and proof-of-funds set up at an approved institution, at the correct amount.": ["Bloklangan hisob va moliyaviy taʼminot hujjatlari tasdiqlangan muassasada, toʻgʻri miqdorda rasmiylashtiriladi.", "Блокированный счёт и подтверждение средств оформлены в одобренном учреждении на нужную сумму."],
    "A full pre-interview briefing before your consular appointment.": ["Konsullik suhbatidan oldin toʻliq tayyorgarlik yigʻilishi.", "Полный инструктаж перед консульским собеседованием."],
    "A document checklist confirmed complete before you ever leave for the embassy.": ["Elchixonaga borishdan oldin hujjatlar roʻyxati toʻliqligi tasdiqlanadi.", "Список документов подтверждается как полный ещё до вашего визита в посольство."],
    "A realistic processing-time estimate, so your travel dates are booked with confidence.": ["Koʻrib chiqish muddatining real bahosi — safar sanalarini ishonch bilan belgilaysiz.", "Реалистичная оценка сроков рассмотрения — вы бронируете поездку с уверенностью."],
    "Arriving with no housing booked, and searching in person while jet-lagged.": ["Turar joy band qilinmasdan keliladi va charchoq bilan joyida qidiriladi.", "Приезд без забронированного жилья и поиск на месте в состоянии джетлага."],
    "No bank account set up before the residence-permit appointment, which some offices require.": ["Yashash ruxsatnomasi uchun uchrashuvgacha bank hisobi ochilmagan — baʼzi idoralar buni talab qiladi.", "К приёму по виду на жительство не открыт банковский счёт, а некоторые ведомства этого требуют."],
    "Missing the local registration deadline, risking fines or permit delays.": ["Mahalliy roʻyxatdan oʻtish muddati oʻtkazib yuboriladi — jarima yoki ruxsatnoma kechikishi xavfi.", "Пропущен срок местной регистрации — риск штрафов или задержки разрешения."],
    "No orientation on the university's international-student office or local health-insurance rules.": ["Universitetning xalqaro talabalar boʻlimi yoki mahalliy sogʻliqni saqlash sugʻurtasi qoidalari haqida maʼlumot yoʻq.", "Нет ориентации по международному отделу университета и местным правилам медицинского страхования."],
    "Figuring out public transport, SIM cards, and groceries alone, in a new language.": ["Jamoat transporti, SIM-karta va oziq-ovqatni yangi tilda yolgʻiz oʻrganish.", "Самостоятельное освоение транспорта, SIM-карт и магазинов на новом языке."],
    "Housing shortlisted, and where possible confirmed, before you land.": ["Turar joy variantlari tanlanadi va imkon boʻlsa, kelishingizdan oldin tasdiqlanadi.", "Жильё подобрано и, по возможности, подтверждено ещё до вашего прилёта."],
    "A bank account and local registration appointment scheduled before or right after arrival.": ["Bank hisobi va mahalliy roʻyxatdan oʻtish uchun uchrashuv kelishdan oldin yoki darhol keyin belgilanadi.", "Банковский счёт и запись на местную регистрацию назначены до приезда или сразу после него."],
    "Residence-permit registration handled within the required window.": ["Yashash ruxsatnomasini rasmiylashtirish belgilangan muddat ichida amalga oshiriladi.", "Оформление вида на жительство выполняется в установленный срок."],
    "A welcome briefing covering your university's international office, health insurance, and local essentials.": ["Universitetning xalqaro boʻlimi, sogʻliqni saqlash sugʻurtasi va mahalliy zarur maʼlumotlarni oʻz ichiga olgan kutib olish yigʻilishi.", "Приветственный брифинг о международном отделе университета, медицинской страховке и местных мелочах."],
    "A local contact point for your first weeks, so questions get answered same-day, not next semester.": ["Dastlabki haftalar uchun mahalliy aloqa nuqtasi — savollarga keyingi semestrda emas, oʻsha kuni javob beriladi.", "Местный контакт на первые недели — на вопросы отвечают в тот же день, а не в следующем семестре."]
  };

  /* Pages with their own copy (e.g. the USA / Australia / China pages) load a data file that sets
     window.SH_EXTRA_DICT = { "English": [uz, ru], ... } before this script runs. */
  if (window.SH_EXTRA_DICT) {
    Object.keys(window.SH_EXTRA_DICT).forEach(function (k) { D[k] = window.SH_EXTRA_DICT[k]; });
  }

  /* ---------- Helpers ---------- */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };
  var ATTRS = ['alt', 'aria-label', 'title', 'placeholder', 'label'];   // `label` is the <optgroup> attribute

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  function lookup(text, lang) {
    var entry = D[norm(text)];
    return entry ? entry[INDEX[lang]] : null;
  }

  function getSaved() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'uz' || v === 'ru' || v === 'en') return v;
    } catch (e) { /* storage unavailable */ }
    return DEFAULT_LANG;
  }

  function save(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  /* Text nodes and attributes remember their original English so any
     language (including English) can be restored at any time. */
  var currentLang = DEFAULT_LANG;
  var textNodes = [];
  var attrNodes = [];
  var seenNodes = new WeakSet();
  var seenAttrs = new WeakMap();
  var meta = null;
  var titleEn = document.title;

  function textEntry(node, en) {
    seenNodes.add(node);
    var entry = { node: node, en: en };
    textNodes.push(entry);
    return entry;
  }

  function renderText(t, lang) {
    var tr = lang === 'en' ? null : lookup(t.en, lang);
    if (tr === null) { t.node.nodeValue = t.en; return; }
    var lead = t.en.match(/^\s*/)[0];
    var trail = t.en.match(/\s*$/)[0];
    t.node.nodeValue = lead + tr + trail;
  }

  function renderAttr(a, lang) {
    var tr = lang === 'en' ? null : lookup(a.en, lang);
    a.el.setAttribute(a.attr, tr === null ? a.en : tr);
  }

  /* Register every translatable text node / attribute under `root` that has
     not been seen yet. Safe to call again after injecting new markup. */
  function register(root) {
    root = root || document.body;
    var added = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP_TAGS[p.nodeName] || seenNodes.has(n)) return NodeFilter.FILTER_REJECT;
        return D[norm(n.nodeValue)] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = walker.nextNode())) added.push(textEntry(n, n.nodeValue));

    var els = root.querySelectorAll ? Array.prototype.slice.call(root.querySelectorAll('[alt],[aria-label],[title],[placeholder]')) : [];
    if (root.nodeType === 1) els.push(root);
    els.forEach(function (el) {
      var done = seenAttrs.get(el) || {};
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (!done[a] && v && D[norm(v)]) {
          done[a] = true;
          var entry = { el: el, attr: a, en: v };
          attrNodes.push(entry);
          added.push(entry);
        }
      });
      seenAttrs.set(el, done);
    });
    return added;
  }

  function collectHead() {
    meta = document.querySelector('meta[name="description"]');
    if (meta) meta = { el: meta, en: meta.getAttribute('content') };
  }

  function apply(lang) {
    currentLang = lang;
    textNodes.forEach(function (t) { renderText(t, lang); });
    attrNodes.forEach(function (a) { renderAttr(a, lang); });
    var titleTr = lang === 'en' ? null : lookup(titleEn, lang);
    document.title = titleTr === null ? titleEn : titleTr;
    if (meta) {
      var metaTr = lang === 'en' ? null : lookup(meta.en, lang);
      meta.el.setAttribute('content', metaTr === null ? meta.en : metaTr);
    }
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-switch__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('lang-switch__btn--active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('shlangchange', { detail: { lang: lang } }));
  }

  /* Switcher lives in the sticky navbar, so it sits at the top of every page.
     Wrap the CTA + hamburger with it so the navbar layout stays balanced. */
  function buildSwitcher() {
    var inner = document.querySelector('.navbar__inner');
    if (!inner) return;

    var sw = document.createElement('div');
    sw.className = 'lang-switch';
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', 'Language');
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-switch__btn';
      b.setAttribute('data-lang', l.code);
      b.setAttribute('lang', l.code);
      b.title = l.name;
      b.textContent = l.label;
      b.addEventListener('click', function () {
        save(l.code);
        apply(l.code);
      });
      sw.appendChild(b);
    });

    var actions = document.createElement('div');
    actions.className = 'navbar__actions';
    var cta = inner.querySelector('.navbar__cta');
    var burger = inner.querySelector('.navbar__hamburger');
    inner.appendChild(actions);
    actions.appendChild(sw);
    if (cta) actions.appendChild(cta);
    if (burger) actions.appendChild(burger);
  }

  /* Public API for scripts that build or change content at runtime
     (booking form, comparison tables). */
  window.shI18n = {
    lang: function () { return currentLang; },
    /* Translate an English string now (falls back to the English text). */
    t: function (en) {
      var tr = currentLang === 'en' ? null : lookup(en, currentLang);
      return tr === null ? en : tr;
    },
    /* Register markup added after page load and translate it. */
    refresh: function (root) {
      register(root).forEach(function (e) {
        if (e.node) renderText(e, currentLang); else renderAttr(e, currentLang);
      });
    },
    /* Set an element's text to `en`; it re-translates on every language switch. */
    setText: function (el, en) {
      el.textContent = '';
      var node = document.createTextNode(en);
      el.appendChild(node);
      renderText(textEntry(node, en), currentLang);
    }
  };

  register(document.body);
  collectHead();
  buildSwitcher();
  apply(getSaved());
})();
