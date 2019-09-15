/*jshint esversion: 6 */
/*jshint browser: true */

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

	__structure: {
		"events": [
			{name: "id", type: "auto", value: 4},
			{name: "date", type: "date"},
			{name: "theme", type: "link", from: "one",	to: "one",	toTable: "trainings",	byField: "id"},
			{name: "students", type: "link", from: "many", to: "one",	toTable: "students",	byField: "id"}
		],
		
		"students": [
			{name: "id", type: "auto", value: 5},
			{name: "fio", type: "text"},
			{name: "grade", type: "text"}
		],
		
		"trainings": [
			{name: "id", type: "auto", value: 6},
			{name: "name", type: "text"}
		]
	}
};


let db = new TinyDB(base);
