/*jshint esversion: 6 */
/*jshint browser: true */

/**
 * @class
 * @classdesc simple Database operator for existance DB in browser. Data format see in README.MD
 * @param base Object — formatted object with __structure entry.
 */


class TinyDB {
	constructor(base) {
		this.base = base;
		this.__structure = base.__structure;
	}

	getLink (tableName, fieldName, key)  {
		if (key instanceof Array) return key.map( i => this.getLink(tableName, fieldName, i) );

		this.throwIfWrongLink(tableName, fieldName);

		let
			link = this.__structure[tableName].find( i => i.name === fieldName ),
			searcher = link.to === "many" ? "filter" : "find"
		;

		return this.base[link.toTable][searcher]( i => key === i[link.byField] );
	}

/*	delRel(tableName, fieldName) {
		let rel = this.base.__relations[tableName];
		if ( !rel || !rel[fieldName] ) return false;
		return delete rel[fieldName];
	}


	del(tableName, fieldName, key) {
		if (key instanceof Array) return key.map( i => this.del(tableName, fieldName, i) );

		if (!fieldName) {
			this.throwIfExistsRefsToTable(tableName);
			return delete this.base[tableName];
		}

		this.base = key instanceof Function ?
			this.base[tableName].filter( entry => key(entry) )
		:
			this.base[tableName].filter( entry => entry[fieldName] === key )
		;

		return this;
	}*/


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
		if( !this.getLink(tableName, fieldName, key) )  throw new ReferenceError(`Value "${key}" doesn't exist in table linked to field "${fieldName}" in table ${tableName}`);
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
* - getLink
* - __generateLinksObject
**/