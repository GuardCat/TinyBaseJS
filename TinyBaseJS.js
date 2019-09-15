/*jshint camelcase: true, esnext: true, browser: true, browserify: true*/

/**
 * @class
 * @classdesc simple Database operator for existance DB in browser. Data format see in README.MD
 * @param {Object} base — formatted object with __structure entry.
 */


class TinyDB {
	constructor(base = { __structure: {} }) {
		this.base = base;
		this.__structure = base.__structure;
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
		return result[getFields];
	}

	getStruct(tableName, fieldName) {
		this.throwIfNoField(tableName, fieldName);
		return this.__structure[tableName].find(i => i.name === fieldName);
	}

	/**
	* @description it replaces links in table to values
	* @param table an Array of Objects in TinyBaseJs format.
	* @param tableName a string, that contains name of the table in the base with the same rules links.
	* @param {object | boolean} объект массивов полей, которые возвращаются из целевой таблицы. Ключи объекта — названия полей исходной таблицы
	*   содержимое — массив имен полей целевой таблицы к передаче. Если параметр отсутствует, возвращается вся запись.
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
		if (row instanceof Array) return row.map( row => this.add(tableName, row) );
		const
			struct = this.__structure[tableName],
			fieldNames = struct.map(field => field.name),
			rowNames = Object.keys(row)
		;
		if ( !fieldNames.every(field => rowNames.some(incomeRow => incomeRow === field)) ) throw new TypeError(`It is needs fields "${fieldNames}" for table "${tableName}", but given fields "${rowNames}"`);
		
		let fieldStruct, result = { };
		
		for (let fieldName in row) {
			if ( !row.hasOwnProperty(fieldName) ) continue;
			if ( !fieldNames.some(i => i === fieldName) ) throw new TypeError(`There is not field "${fieldName}" in the table "${tableName}"`);
			
			fieldStruct = struct.find(i => i.name === fieldName);
			switch (fieldStruct.type) {
				case "auto":
					if (!fieldStruct.value) throw new Error(`value for ID does not exists field "${fieldName}" in the table "${tableName}"`);
					result[fieldName] = fieldStruct.value++;
					break;
				case "key":
					result[fieldName] = row[fieldName];
					if ( this.base[tableName].some(entry => entry[fieldName] === row[fieldName]) ) throw new TypeError(`"${fieldName}": "${row[fieldName]}". The key value already exists`);
					break;
				case "date":
					result[fieldName] = Date.parse(row[fieldName]);
					if ( isNaN(result[fieldName]) ) throw (`Wrong date format in field ${fieldName}: ${row[fieldName]}`);
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
				default:
					result[fieldName] = row[fieldName];
			} 
		}
		this.base[tableName].push( result );
		return true;
	}
	
	
	/* throwIf zone */
	throwIfNoTable(tableName) {
		if ( !this.__structure[tableName] ) throw new ReferenceError(`There is not table "${tableName}" here.`);
	}

	throwIfNoField(tableName, fieldName) {
		this.throwIfNoTable(tableName);
		if ( !this.__structure[tableName].find(i => i.name === fieldName) ) throw new ReferenceError(`There is not field "${fieldName}" in table "${tableName}".`);
	}
	throwIfNoFieldType(tableName, fieldName) {
		this.throwIfNoField(tableName, fieldName);
		if ( !this.__structure[tableName].find(i => i.name === fieldName).type ) throw new Error(`There is not "type" field for field "${fieldName}" in table "${tableName}". It's need to fix it.`);
	}

	throwIfNoLink(tableName, fieldName) {
		this.throwIfNoFieldType(tableName, fieldName);
		if ( this.__structure[tableName].find(i => i.name === fieldName).type !== "link" ) throw new TypeError(`Field "${fieldName}" in table "${tableName}" is not link.`);
	}

	throwIfWrongLink(tableName, fieldName, key) {
		if (key instanceof Array) key.forEach( key => this.throwIfWrongLink(tableName, fieldName, key) );
		this.throwIfNoLink(tableName, fieldName);
		let link = this.getStruct(tableName, fieldName);
		if( !this.base[link.toTable].some( i => i[fieldName] === key) ) throw new ReferenceError(`Value "${key}" doesn't exist in table linked to field "${fieldName}" in table ${tableName}`);
	}

	/**
 	* @param {string} tableName name of table-recipient 
 	*/
	throwIfWrongKey(tableName, fieldName, key) {
		this.throwIfWrongLink(tableName, fieldName, key);
		const values = this.getLinkValue(tableName, fieldName, key);
		if ( !values || ((values instanceof Array) && !values.length) ) throw new TypeError(`Given wrong key "${key}" in field "${fieldName}": no needed entries in target table.`); 
	}
}

/**
* Методы, которые реально нужны:
* - del. Чтобы исключить удаление строк и таблиц,
*   ломающее ссылки.
* - change. Чтобы исключить смену значений на
*   некорректные: id больше следующего, несуществующее
*   значение ссылки, утрату значений, на которые ссылаются.
* - renameField
* - add
* + getLinkValue
* - __generateLinksObject
**/