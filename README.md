# TinyBaseJS
Simple sinchronous database logic for browser.
It's a more simple version DB than [GCBase](https://github.com/GuardCat/GCBaseJS).

# Описание
TinyBaseJS это логика, соглашения, и несколько простых функций. Иногда требуется работать с небольшим структурированным объемом данных в браузере (до 1 млн строк в таблице), но хочется иметь связи между объектами для экономии места, траффика и времени.

# Логика
Программист хранит данные в объекте, отвечающем соглашениям. Он может создать экземпляр TinyBaseJS и пользоваться встроенными функциями, но может работать с данными встроенными средствами JS. Но если программист рассчитывает прибегать к TinyBaseJS, хотябы иногда, он соблюдает соглашения.

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

	__relations: {
		"events": {
			"students":	{from: "many",	to: "one",	toTable: "students",	byField: "id"},
			"theme":	{from: "one",	to: "one",	toTable: "trainings",	byField: "id"}
		}
	}
};
```
Пользователь самостоятельно следит за соблюдением уникальности ключей, корректностью связей и т.д. если пользуется средствами JS для изменения БД.
Пользователь самостоятельно осуществляет бэкап данных. TinyBaseJS изменяет и удаляет данные не копируя объект.
