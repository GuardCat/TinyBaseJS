/*jshint camelcase: true, esnext: true, browser: true, browserify: true*/

/**
 * @class
 * @classdesc simple Database operator for existance DB in browser. Data format see in README.MD
 * @param base Object — formatted object with __structure entry.
 */


class TinyDB {
	constructor(base = { __structure: {} }) {
		this.base = base;
		this.__structure = base.__structure;
	}

	getLinkValue (tableName, fieldName, key)  {
		if (key instanceof Array) return key.map( i => this.getLinkValue(tableName, fieldName, i) );
		this.throwIfWrongLink(tableName, fieldName);

		let
			link = this.getStruct(tableName, fieldName),
			searcher = link.to === "many" ? "filter" : "find"
		;

		return this.base[link.toTable][searcher]( i => key === i[link.byField] );
	}

	getStruct(tableName, fieldName) {
		this.throwIfNoField(tableName, fieldName);
		return this.__structure[tableName].find(i => i.name === fieldName);
	}

	/**
	* @desc it replaces links in table to values
	* @param table an Array of Objects in TinyBaseJs format.
	* @param tableName a string, that contains name of the table in the base with the same rules links.
	*/
	mergeLinks(table, tableName) {
		return  table.map(
			row => {
				for (let fieldName in row) {
					if ( !row.hasOwnProperty(fieldName) ) continue;
					this.throwIfNoField(tableName, fieldName);
					if ( this.getStruct(tableName, fieldName).type === "link" ) row[fieldName] = this.getLinkValue(tableName, fieldName, row[fieldName]);
				}
			}
		);
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
		this.throwIfNoLink(tableName, fieldName);
		let link = this.getStruct(tableName, fieldName);
		if( !this.base[link.toTable].some( i => i[fieldName] === key) ) throw new ReferenceError(`Value "${key}" doesn't exist in table linked to field "${fieldName}" in table ${tableName}`);
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