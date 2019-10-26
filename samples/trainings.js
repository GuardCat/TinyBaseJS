/*jshint camelcase: true, esnext: true, browser: true, browserify: true*/

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
		events: {
			"id":		{type: "auto", value: 4},
			"date":		{type: "date"},
			"students":	{type: "link",	toTable: "students", byField: "id", from: "many", to: "one"},
			"theme":	{type: "link",	toTable: "trainings", byField: "id", from: "one", to: "one"}
		},

		trainings: {
			"id":		{type: "auto", value: 6},
			"name":		{type: "text"}

		},

		students: {
			"id":		{type: "auto", value: 5},
			"fio":		{type: "text"},
			"grade":	{type: "text"}

		}
	}
};


let db = new TinyDB(base);
//console.log( db.getLinkValue("events", "students", 3, ["fio", "grade"]) );
//console.log( db.mergeLinks( db.base.events, "events", {students: ["id", "fio"], theme: ["name"]} ) );
//console.log( db.getLinkValue("events", "students", db.base.events[0].students) );
document.body.appendChild( db.generateSimpleTable(db.base.students, {id: "id", fio: "ФИО", grade: "курс"} ));
