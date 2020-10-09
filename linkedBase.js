/*jshint esversion: 9, esnext: false*/
/*jshint browser: true */

/**
 * @class
 * @classdesc linkedBase помогает хранить данные в 
 * 						массиве, используя взаимосвязанные
 * 						объекты. 
 * @param {Object} base объект в формате linkedBase decompiled data
 */

class linkedBase {
	constructor (base) {
		const inspResult = this._inspection(base);
		if (!inspResult.ok) return inspResult.error;
		this.base = this._compile(base);
	}
	
	_compile (base) {
		return "compiled";
	}
	
	/**
	 * @desc		метод проверяет объект на соответствие
	 * 					формату linkedBase decompiled data.
	 * @returns	{Object} со статусом проверки (ok) и описанием
	 * 					ошибки, если она есть.
	 */
	_inspection (base) {
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
		return result.
	}
}

