# TinyBaseJS
Simple sinchronous database logic for browser.
It's a more simple version DB than [GCBase](https://github.com/GuardCat/GCBaseJS).

# Описание
TinyBaseJS это логика, соглашения, и несколько простых функций. Иногда требуется работать с небольшим структурированным объемом данных в браузере, но удобно иметь связи между объектами для экономии места, траффика и времени.

# Логика
Пользователь хранит данные в объекте, отвечающем соглашениям. Для потенциально разрушительных или приводящих к возможным ошибкам действий, использует методы базы. Связи между таблицами настраиваются вручную.

Формат БД: объект массивов объектов.

Формат описания полей см. ниже в примере в поле __structure

# Соглашения
Данные хранятся в следующей структуре: объект с ключами-именами таблиц, значения которых — массивы однотипных объектов — строк. Если между таблицами есть связи, они прописываются в верхнем объекте по ключу ```__relations``` в формате, который понятен из примера ниже.
```javascript
let base = {
	students: [
		{ id: 0, fio: "Ivan",	grade: "III"},
		{ id: 1, fio: "Maria",	grade: "II"	},
		{ id: 2, fio: "Petr",	grade: "I"	},
		{ id: 3, fio: "Anton",	grade: "IV"	},
		{ id: 4, fio: "Julia",	grade: "V"	}
	],

	trainings: [
		{ id: 0, name: "BME"},
		{ id: 1, name: "Sales"},
		{ id: 2, name: "Defeat"},
		{ id: 3, name: "TM"},
		{ id: 4, name: "Stress"},
		{ id: 5, name: "Eloquent speaker"}
	],

	events: [
		{ id: 0, date: "2019-09-01", theme: 5, students: [2, 3] },
		{ id: 1, date: "2019-08-01", theme: 4, students: [0, 1, 3] },
		{ id: 2, date: "2019-07-01", theme: 2, students: [1, 0] },
		{ id: 3, date: "2019-06-01", theme: 5, students: [0, 3, 2] }
	],

	__structure : {
		events: [
			{name: "id",		type: "auto"},
			{name: "date",		type: "date"},
			{name: "students",	type: "link",	toTable: "students", byField: "id", from: "many", to: "one"},
			{name: "theme",		type: "link",	toTable: "trainings", byField: "id", from: "one", to: "one"}
		],

		trainings: [
			{name: "id",	type: "auto"},
			{name: "name",	type: "text"}

		],

		students: [
			{name: "id",	type: "auto"},
			{name: "fio",	type: "text"},
			{name: "grade", type: "text"}
		]
	}
};
```
Пользователь самостоятельно следит за соблюдением уникальности ключей, корректностью связей и т.д. если пользуется средствами JS для изменения БД.
Пользователь самостоятельно осуществляет бэкап данных. TinyBaseJS изменяет и удаляет данные не копируя объект.

# Описание полей
1 text
2 auto		целое, назначается только автоматически
3 key		любое, но уникальное
4 link
5 integer
6 float
7 date		дата в формате, разбираемом Date.parse

