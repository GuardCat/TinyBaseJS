# LinkedBase
Простая база данных для использования в небольшом проекте. Успешно работает на фронте и бэкенде. Описывает манипуляции с данными, но не охватывает вопросы сохранения данных на диск, переноса, прав доступа. Все эти вопросы требуется решать отдельно от БД.

# Особенности

- БД использует ссылочные типы данных JS для организации связи между таблицами.
- БД использует модель реляционных БД с их взаимоссылающимися плоскими таблицами, но ускоряет и упрощает работу с данными за счет прямых ссылок.
- Ключевым определяющим параметром элемента таблицы является его положение в массиве. Это позволяет быстро получить элемент по его номеру, но накладывает запрет на сортировку таблиц БД. Предлагается сортировать копии таблиц. При удалении элемента
- Каждая запись имеет техническое поле id, равное позиции элемента в массиве данных. При несовпадении позиции и содержания поля, система пытается восстановить позиционирование, при невозможности восстановления, БД считается неконсистентной, работа с ней невозможна.

# Связи

- Связи в БД организованы ссылочными типами JS. Так, если поле строки таблицы ссылается на строку другой таблицы, поле содержит эту строку. При ссылке типа один-ко-многим, поле содержит массив ссылок на соответствующие строки других таблиц.
- Использование ссылочных типов ограничивает операции записи в отношении полученных срезов из БД. Запись в поле по ссылке приведет к изменению объекта.
- Все связи опираются на поле id.
- Для сохранения, класс LinkedBase отдает объект со всеми таблицами БД и структурой, где ссылки заменены их текстовым аналогом.

# Описание учебной БД

База для учёта обучения сотрудников по программам и учебных программ. Используется для примеров в даном руководстве.

```json
// Обзорная структура
structure = {
    employees:	[ ],	// Сотрудники
    positions:	[ ],	// Должности
    trainings:	[ ],	// Учебные программы
    plan:		[ ],	// Какие сотрудники какие программы проходят
    events:		[ ],	// Проведенные мероприятия
}
```

```json
// Подробная структура
structure = {
	employees:	[name: "text", position: {link: "positions", type: "oo"}],
	positions:	[name: "text"],
	trainings:	[name: "text"],
	plan:		[position: {link: "positions", type: "oo"}, trainings: {link: "trainings", type: "om"}]
	events:		[date: "date", members: {link: "employees", type: "om"}, training: {link: "trainings", type: "oo"}]
}
```

