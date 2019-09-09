/*jshint esversion: 6 */
/*jshint browser: true */

/** 
 * @class
 * @classdesc simple Database operator for existance DB in browser. Data format see in README.MD
 * @param base Object — formatted object. 
 */
	

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
			this.base[tableName][fn]( entry => key(entry) )
		:
			this.base[tableName][fn]( entry => entry[fieldName] === key )
		;
	}
	
	del(tableName, fieldName, key) {
		if (key instanceof Array) return key.map( i => this.del( {tableName: tableName, fieldName: fieldName, key: i} ) );
		
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
	}
	
	
	throwIfWrongRelation(tableName, fieldName) {
		let base = this.base;
		if ( !(base.__relations && base.__relations[tableName] && base.__relations[tableName][fieldName]) ) {
			throw new Error(`There is not relation's description in base.__relations. Table: ${tableName}, field: ${fieldName}`);
		}
	}
	
	throwIfExistsRefsToTable(tableName) {
		let rel = this.base.__relations;
		if ( !(rel) ) return false;
		
		for (let table in rel) {
			if ( !(rel.hasOwnProperty(table)) || table === tableName ) continue;
			
			for (let field in rel[table]) {
				if ( !(rel[table].hasOwnProperty(field) ) ) continue;
				if (rel[table][field].toTable === tableName) throw new Error(`Operation not permitted. There is a relation to ${tableName}, in table ${table}: ${JSON.stringify(rel[table][field])}. Delete relation first and try again.`);
			}
		
		}
		
	}
	
}
