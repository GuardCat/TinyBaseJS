/*jshint esversion: 6 */
/*jshint browser: true */

class TinyDB {
	constructor(base) {
	  this.base = base;
	}

	getFromRelation (tableName, fieldName, key)  {
		this.throwIfWrongRelation(tableName, fieldName);
		let rel = this.base.__relations[tableName][fieldName];

		return this.get(rel.toTable, rel.byField, key, rel.to === "many");
	}

	get(tableName, fieldName, key, all = false) {
		if (key instanceof Array) return key.map( i => this.get(tableName, fieldName, i) );
		let fn = all ? "filter" : "find";

		return key instanceof Function ?
			base[tableName][fn]( entry => key(entry) )
		:
			base[tableName][fn]( entry => entry[fieldName] === key )
		;
	}

	throwIfWrongRelation(tableName, fieldName) {
		let base = this.base;
		if ( !(base.__relations && base.__relations[tableName] && base.__relations[tableName][fieldName]) ) {
			throw new Error(`There is not relation's description in base.__relations. Table: ${tableName}, field: ${fieldName}`);
		}
	}
}
