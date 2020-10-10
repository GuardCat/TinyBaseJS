/*jshint esversion: 9, esnext: false*/
/*jshint browser: true */

/**
 * @class
 * @classdesc linkedBase помогает хранить данные в 
 * 						массиве, используя взаимосвязанные
 * 						объекты. 
 * @param {Object} base объект в формате linkedBase decompiled data
 */

class LinkedBase {
	constructor (base) {
		const inspected = this._inspect(base);
		if (!inspected.ok) return inspected.error;
		this.base = this._compile(base);
	}
	
	_compile (base) {
		let compiledBase
		return "compiled";
	}
	
	_textToLink(link, value) {
		if (value instanceof Array) return value.map( (val) => this._textToLink(link, val) );
		const 
		  type = link.slice(1,2),
		  table = this[link.slice(2)]
		 ;
		 return table[link];
	}
	/**
	 * @desc		метод проверяет объект на соответствие
	 * 					формату linkedBase decompiled data.
	 * @returns	{Object} со статусом проверки (ok) и описанием
	 * 					ошибки, если она есть.
	 */
	_inspect (base) {
		const knownTypes = ["int", "decimal", "date", "link", "text", "bool"];
		
		let result = {ok: false, error: null};
		if (!base) {
			result.error = new Error("There is nothing.");
		} else if ( !(base instanceof Object) ) {
			result.error = new Error("Given data isn't an object.");
		} else if ( !("_structure" in base) || !(base._structure instanceof Object) ) {
			result.error = new Error("_structure isn't given or has a wrong format.")
		}
		
		if (!!result.error) return result;
		result.ok = true;
		return result;
	}
}

/* test base */
let finBaseDecompiled = {
	_structure: {
		prefixes:			{name: "text"},
		accounts:			{name: "text", cred: "bool", cache: "bool", limit: "decimal", exp: "date"},
		types:				{name: "text", pref: ">>prefs"},
		projects:			{name: "text", pref: ">>prefs"},
		ben:					{name: "text", pref: ">>prefs"},
		currencies:		{name: "text", course: "decimal"},
		transactions: {
			account: ">>accounts",
			desc: "text",
			date: "date", 
			time: "time",
			sum: "decimal",
			type: ">>types",
			proj: ">>projects",
			currency: ">>currencies"
		}
	}
	
};
