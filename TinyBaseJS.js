/*jshint camelcase: true, esversion: 6, loopfunc: true, browser: true, browserify: true*/


/**
 * @class
 * @classdesc simple Database operator for existance DB in browser. Data format see in README.MD
 * @param {Object} base — formatted object with __structure entry.
 * @version [[Description]] 0.5
 */
class TinyDB {
	constructor(base = { __structure: {} }) {
		this.base = base;
		this.__structure = base.__structure;
		this.__generateLinksMirror( );
	}


	/**
 	* @description getLinkValue method Возвращает значение по полю со ссылкой и его значению
	* @param {string} tableName имя таблицы, для которой будем искать ссылку
	* @param {string} fieldName имя поля в таблице, содержащее ключи для ссылки
	* @param {string/integer | array of strings/integers} Ключ или массив ключей, по которым будут возвращены значения.
	* @param {array | boolean} массив полей, которые возвращаются из целевой таблицы. Если отсутствует, возвращается вся запись.
 	*/
	getLinkValue (tableName, fieldName, key, getFields = false)  {
		if (key instanceof Array) return key.map( key => this.getLinkValue(tableName, fieldName, key, getFields) );
		this.throwIfWrongLink(tableName, fieldName);

		const
			link = this.getStruct(tableName, fieldName),
			finder = link.to === "many" ? "filter" : "find",
			result = this.base[link.toTable][finder](i => key === i[link.byField])
		;

		if (!getFields) return result;
		if ( !(getFields instanceof Array) ) throw new ReferenceError("getLinkValue: the getFields argument must be an array if it is present.");
		if (getFields.length > 1) return getFields.reduce( (a, b) => { a[b] = result[b]; return a; }, { } );

		return result[ getFields[0] ];
	}

	/**
	* @description it replaces links in table to values
	* @param table an Array of Objects in TinyBaseJs format.
	* @param tableName a string, that contains name of the table in the base with needed rules links.
	* @param {object | boolean} объект массивов полей, которые возвращаются из целевой таблицы. Ключи объекта — имя таблицы на которую ссылаемся
	*   содержимое — массив имен полей целевой таблицы к подстановке. Если параметр отсутствует, возвращается вся запись.
	*/
	mergeLinks(table, tableName, getFields = false) {
		return  table.map(
			row => {
				let result = {};
				for (let fieldName in row) {
					if ( !row.hasOwnProperty(fieldName) ) continue;
					this.throwIfNoField(tableName, fieldName);

					result[fieldName] = this.getStruct(tableName, fieldName).type === "link" ? this.getLinkValue(tableName, fieldName, row[fieldName], getFields[fieldName]) : row[fieldName];
				}
				return result;
			}
		);
	}

	addRow(tableName, row) {
		if (row instanceof Array) return row.map( row => this.addRow(tableName, row) );
		const
			fieldNames	= Object.keys(this.__structure[tableName]),
			rowNames	= Object.keys(row),
			result		= { }
		;

		let fieldStruct;

		if ( !fieldNames.every(field => rowNames.some(incomeRow => incomeRow === field)) ) throw new TypeError(`It is needs fields "${JSON.stringify(fieldNames)}" for table "${tableName}", but given fields "${JSON.stringify(rowNames)}"`);

		for (let fieldName in row) {
			if ( !row.hasOwnProperty(fieldName) ) continue;
			if ( !fieldNames.some(i => i === fieldName) ) throw new TypeError(`There is not field "${fieldName}" in the table "${tableName}"`);

			fieldStruct = this.getStruct(tableName, fieldName);

			if (fieldStruct.unique || fieldStruct.type === "key") this.throwIfValueExists(tableName, fieldName, row[fieldName]);
			switch (fieldStruct.type) {
				case "auto":
					if ( !("value" in fieldStruct) ) throw new Error(`value for ID does not exists field "${fieldName}" in the table "${tableName}"`);
					result[fieldName] = fieldStruct.value++;
					break;
				case "key":
					result[fieldName] = row[fieldName];
					break;
				case "date":
					if ( isNaN( Date.parse(row[fieldName]) ) ) throw (`Wrong date format in field ${fieldName}: ${row[fieldName]}`);
					result[fieldName] = row[fieldName];
					break;
				case "integer":
					result[fieldName] = parseInt(row[fieldName]);
					if ( isNaN(result[fieldName]) ) throw (`Wrong integer format in field ${fieldName}: ${row[fieldName]}`);
					break;
				case "float":
					result[fieldName] = parseFloat(row[fieldName]);
					if ( isNaN(result[fieldName]) ) throw (`Wrong float format in field ${fieldName}: ${row[fieldName]}`);
					break;
				case "link":
					this.throwIfWrongLink(tableName, fieldName, row[fieldName]);
					break;
				case "boolean":
					result[fieldName] = !!row[fieldName] ;
					break;
				default:
					result[fieldName] = row[fieldName];
			}

		}
		if (!this.base[tableName]) this.base[tableName] = [ ];
		this.base[tableName].push( result );
		return true;
	}

	/**
	 * @description удаляет строки из указанной таблицы, если на них нет ссылок из других записей.
	 * @param {string} tableName 
	 * @param {function} fn функция для удаления. Должна возвращать true для строк, которые нужно удалить.
	 * @returns {number} количество удалённых строк
	 * @throws если нет запрошенной таблицы
	 * @throws если запрошенная таблица пуста
	 * @throws если хотя бы на одну строку к удалению есть ссылка из записи в другой таблице
	 */
	delRow(tableName, fn) {
		this.throwIfNoTable(tableName);
		if (this.base[tableName].length === 0) throw new Error(`Deleting rows from an empty table is impossible. Table "${tableName}" is empty.`);
		
		const
			table = this.base[tableName],
			tableStruct = this.__structure[tableName],
			oldLength = this.base[tableName].length,
			rowsToDelete = tableName in this.linksMirror ? this.base[tableName].filter( (el, num, arr) => !fn(el, num, arr) ) : false 
		;
		
		if (rowsToDelete) { /* Если на таблицу есть ссылки и сформирован пул строк к удалению, проверим нет ли ссылок на кокретные значения */
			if (rowsToDelete.length === 0) return 0; // Nothing to delete
			
			this.linksMirror[tableName].forEach( link => {
				if ( this.checkArraysValues(rowsToDelete, this.base[link.table], link.fieldTo, link.fieldFrom) ) throw new Error(`Can't delete some rows from table "${tableName}" because them needed in some entries in table "${link.table}"`) ;
			});
			
		}

		this.base[tableName] = 	this.base[tableName].filter( (el, num, arr) => !fn(el, num, arr) );
		return oldLength - this.base[tableName].length;
	}

	getStruct(tableName, fieldName) {
		this.throwIfNoField(tableName, fieldName);
		return this.__structure[tableName][fieldName];
	}

	__generateLinksMirror( ) {
		const linksMirror = { };
		let table, field;

		for (let tableName in this.__structure) {
			table = this.__structure[tableName];

			for (let fieldName in table) {
				field = table[fieldName];
				if (field.type !== "link") continue;
				
				if (!linksMirror[field.toTable]) linksMirror[field.toTable] = [ ];
				linksMirror[field.toTable].push({ table: tableName, fieldFrom: fieldName, fieldTo: field.byField });
			}

		}
		this.linksMirror = linksMirror;
	}

	/**
	* @description возвращает true, если во второй переданной таблице есть значение из первой. Ориентируется по переданным именам ключей.
 	*/
	checkArraysValues(arr1, arr2, key1, key2) {	
		return arr1.some( el1 => {
			return arr2.some( el2 => el2[key2] instanceof Array ? el2[key2].some( el3 => el3 === el1[key1] ) : el1[key1] === el2[key2] );
		} );
	}

	/** Генерирует HTML-таблицы на основе массива объектов
 	*	@param {Array} table массив объектов — таблица.
	* 	@param {Object} [settings]  ключи — имена поле, значения — надпись в заголовке
	* 	@returns {Object} HTML таблица
 	*/
	generateSimpleTable(table, settings = { }) {
		const keys = Object.keys(settings).length ? Object.keys(settings) : Object.keys(table[0]);
		let result = `<tr>`, tableElement = document.createElement("table");

		keys.forEach( key => {
			result += `<th>${settings[key] ? settings[key] : key}</th>`;
		} );		
		
		result += `</tr>`;
		
		for (let row in table) {
			result += `<tr>`;
			
			keys.forEach( key => {
				result += `<td>${table[row][key]}</td>`;
			} );
			
			result += `</tr>`;
		}
	
		tableElement.insertAdjacentHTML("afterbegin", result);
		return tableElement;
	}

	
	/* throwIf zone */
	throwIfNoTable(tableName) {
		if ( !this.__structure[tableName] ) throw new ReferenceError(`There is not table "${tableName}" in database.`);
	}

	throwIfNoField(tableName, fieldName) {
		this.throwIfNoTable(tableName);
		if ( !(fieldName in this.__structure[tableName]) ) throw new ReferenceError(`There is not field "${fieldName}" in table "${tableName}".`);
	}
	throwIfNoFieldType(tableName, fieldName) {
		this.throwIfNoField(tableName, fieldName);
		if (!this.__structure[tableName][fieldName].type) throw new Error(`There is not "type" field for field "${fieldName}" in table "${tableName}". It's need to fix it.`);
	}

	throwIfNoLink(tableName, fieldName) {
		this.throwIfNoFieldType(tableName, fieldName);
		if ( this.__structure[tableName][fieldName].type !== "link" ) throw new TypeError(`Field "${fieldName}" in table "${tableName}" is not link.`);
	}

	throwIfWrongLink(tableName, fieldName, key) {
		if (key instanceof Array) key.forEach( key => this.throwIfWrongLink(tableName, fieldName, key) );
		this.throwIfNoLink(tableName, fieldName);
		let link = this.getStruct(tableName, fieldName);
		if( !this.base[link.toTable].some( i => i[fieldName] === key) ) throw new ReferenceError(`Value "${key}" doesn't exist in table linked to field "${fieldName}" in table ${tableName}`);
	}

	throwIfWrongKey(tableName, fieldName, key) {
		this.throwIfWrongLink(tableName, fieldName, key);
		const values = this.getLinkValue(tableName, fieldName, key);
		if ( !values || ((values instanceof Array) && !values.length) ) throw new TypeError(`Given wrong key "${key}" in field "${fieldName}": no needed entries in target table.`);
	}

	throwIfValueExists(tableName, fieldName, value) {
		if ( this.base[tableName].some(entry => entry[fieldName] === value) ) throw new TypeError(`"${fieldName}": "${value}". The key/unique value exists in table "${tableName}".`);
	}

	/* static methods */
		
}

/**
* Методы:
* + del. Чтобы исключить удаление строк и таблиц,
*   ломающее ссылки.
* - change. Чтобы исключить смену значений на
*   некорректные: id больше следующего, несуществующее
*   значение ссылки, утрату значений, на которые ссылаются.
* - renameField
* - add
* + getLinkValue
* + __generateLinksObject
* throwIfWrongBase чтобы проверять корректность входных данных при создании экземпляра базы
**/