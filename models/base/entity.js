let knex = require('../../config/db.js');
let _ = require('lodash');
let Promise = require("bluebird");
let promiseProxy = require("../../lib/promiseProxy");
var whereFilter = require('knex-filter-loopback').whereFilter;

/**
 *
 * @param tableName - name of table the entity belongs to
 * @param primaryKey
 * @param references - follows format
 * @param database - database object
 * @returns {Entity}
 */

 var CreateEntity = function (tableName, references = [], primaryKey = 'id', database = knex) {
    var Entity = function (data) {
        let self = this;
        this.data = data;
        // this.references = new Proxy({}, {
        //     get: async function (target, name) {
        //         let reference = references.find(ref => ref.model.table === name);
        //         try {
        //             if (!reference) {
        //                 
        //                 throw `Reference is not defined on ${Entity.table}.`
        //             }
        //             return await self.getRelated(reference.model)
        //         }catch(e){
        //             console.error("ERRRRROR!!!!", e);
        //         }
        //     }
        //
        // });
    };

    Entity.database = database;
    Entity.table = tableName;
    Entity.primaryKey = primaryKey;
    Entity.references = references;

    Entity.prototype.data = {};

    //introduced to support plugins
    Entity.changeDB = (db) => {
        Entity.database = db;
    };

    Entity.prototype.get = function (name) {
        return this.data[name];
    }

    Entity.prototype.set = function (name, value) {
        this.data[name] = value;
    }

    function getRelated(model, callback) {
        if (Entity.references == null || Entity.references.length == 0) {
            callback([]);
        }
        let self = this;
        let reference = Entity.references.find(rel => rel.model.table == model.table);
        if (!reference) {
            callback([]);
            return;
        }
        let referenceModel = reference.model;
        let referenceField = reference.referenceField;
        if (reference.direction === "from") {
            referenceModel.findOnRelative(referenceField, self.get("id"), function (results) {
                callback(results);
            })
        }
        else if (reference.direction === "to") {
            referenceModel.findOnRelative(referenceModel.primaryKey, self.get(referenceField), function (results) {
                callback(results);
            })
        }

    };

    Entity.prototype.create = function (callback) {
        let self = this;
        Entity.database(Entity.table).columnInfo()
            .then(function (info) {
                return _.pick(self.data, _.keys(info));
            })
            .then(function (data) {
                Entity.database(Entity.table).returning(primaryKey).insert(data)
                    .then(function (result) {
                        self.set(primaryKey, result[0]);
                        callback(null, self);
                    })
                    .catch(function (err) {
                        callback(err);
                    });
            })
    };


    function update(callback) {
        var self = this;
        var id = this.get(primaryKey);
        if (!id) {
            throw "cannot update non existent"
        }
        Entity.database(Entity.table).columnInfo()
            .then(function (info) {
                self.data.updated_at = new Date();
                return _.pick(self.data, _.keys(info));
            })
            .then(function (data) {
                Entity.database(Entity.table).where(primaryKey, id).update(data).returning("*")
                    .then(function (result) {
                        callback(null, new Entity(result[0]));
                    })
                    .catch(function (err) {
                        console.error(err);
                        callback(err.detail);
                    });
            })

    };

    Entity.prototype.delete = function (callback) {
        let id = this.get('id');
        Entity.database(Entity.table).where('id', id).del()
            .then(function (res) {
                callback(null, res);
            })
            .catch(function (err) {
                console.error(err);
                callback(err.detail);
            });
    };

    let attachReferences = function (callback) {
        this.data.references = {};
        let self = this;
        if (references == null || references.length == 0) {
            return callback(self);
        }
        for (let reference of references) {
            let referenceModel = reference.model;
            this.getRelated(referenceModel, function (results) {
                self.data.references[referenceModel.table] = results.map(entity => entity.data);
                if (Object.keys(self.data.references).length == references.length) {
                    callback(self);
                }
            });
        }
    }

    //Also want to think about having generic find method all models would use
    Entity.findAll = function (key = true, value = true, callback) {
        Entity.database(Entity.table).where(key, value)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                let entities = result.map(e => new Entity(e));
                callback(entities);
            })
            .catch(function (err) {
                console.error(err);
            });
    };

    //best one! (todo... clean up ORM cuz it sucks)
    Entity.find = async function (filter = {}, attatchReferences = false) {
        try {
            let result = await Entity.database(Entity.table).where(whereFilter(filter));
            let entities = result ? result.map(e => new Entity(e)) : [];
            if(attatchReferences){
                entities = await Entity.batchAttatchReference(entities);
            }
            return entities;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    //Find on relative function will call the findAll function by default. Allowing overrides at a model layer.
    Entity.findOnRelative = function (key = true, value = true, callback) {
        Entity.findAll(key, value, function (result) {
            callback(result);
        })
    };

    let findOne = function (key, value, callback) {
        Entity.database(Entity.table).where(key, value)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                callback(new Entity(result[0]));
            })
            .catch(function (err) {
                console.error(err);
            });
    };
    //Generic findById function. Finds the record by passing the id.
    Entity.findById = function (id, callback) {
        Entity.database(Entity.table).where('id', id)
            .then(function (result) {
                if (!result) {
                    result = [];
                }
                callback(new Entity(result[0]));
            })
            .catch(function (err) {
                console.error(err);
            });
    };

    async function getReferences(reference, filter={}) {
        let refTable = reference.model.table
        let referenceField = reference.referenceField;
        let join = [refTable];

        if (reference.direction === "from") {
            join.push(`${refTable}.${referenceField}`, `${Entity.table}.${Entity.primaryKey}`)
        }
        else if (reference.direction === "to") {
            join.push(`${refTable}.${reference.model.primaryKey}`, `${Entity.table}.${referenceField}`)
        }

        let results = await Entity.database(Entity.table)
            .select(`${Entity.table}.${Entity.primaryKey} as parent_key`, `${refTable}.*`)
            .leftJoin(...join).where(whereFilter(filter));
        return results.reduce((acc, row) => {
            let parent_key = row.parent_key;
            delete row.parent_key;
            if(row[reference.model.primaryKey]){
                acc[parent_key] = (acc[parent_key] || []).concat(row);
            }
            return acc;
        }, {})
    }

    Entity.batchAttatchReference = async function (entities) {

        if (Entity.references === null || Entity.references.length === 0) {
            return entities;
        }

        let ids = entities.map(entity => entity.data[Entity.primaryKey]);
        let key =`${Entity.table}.${Entity.primaryKey}`
        let filter = {[key] : {"in" : ids}};
        for(let reference of Entity.references){
            let referenceData = await getReferences(reference, filter);
            entities = entities.map(entity => {
                entity.data["references"] = {
                    ...entity.data["references"],
                    [reference.model.table] : referenceData[entity.data[Entity.primaryKey]] || []
                }
                return entity;
            })
        }
        return entities

    };
    Entity.batchDelete = async function (filter) {
        return knex(Entity.table).where(whereFilter(filter)).del().returning("*");
    };
    /**
     *
     * @param dataArray - array of data objects that are going to be inserted
     * @param callback
     */

        //todo: refactor..
    let batchCreate = function (dataArray, callback) {
            Entity.database(Entity.table).columnInfo()
                .then(function (info) {
                    return dataArray.map(function (entity) {
                        return _.pick(entity, _.keys(info));
                    })
                })
                .then(function (data) {
                    Entity.database(Entity.table).insert(data).returning("*")
                        .then(function (result) {
                            callback(result)
                        })
                        .catch(function (err) {
                            console.error(err);
                        })
                })
        };

        Entity.batchUpdate = function (dataArray, callback) {

            knex(Entity.table).columnInfo()
                .then(function (info) {
                    return dataArray.map(function (entity) {
                        return _.pick(entity, _.keys(info));
                    })
                })
                .then(function (data) {
                    knex.transaction(function(trx){
                        return Promise.map(data, function(entityData){
                            if(entityData[Entity.primaryKey]) {
                                return trx.from(Entity.table).where(Entity.primaryKey, entityData[Entity.primaryKey]).update(entityData).returning("*");
                            }else{
                                return trx.from(Entity.table).insert(entityData).returning("*");
                            }
                        });
    
                    }).then(function(result){
                        callback(result);
                    }).catch(function(err){
                        console.log(err);
                    })
                });
        };
    Entity.prototype.update = promiseProxy(update, false);
    Entity.findOne = promiseProxy(findOne);
    Entity.prototype.attachReferences = promiseProxy(attachReferences);
    Entity.prototype.getRelated = promiseProxy(getRelated);
    Entity.batchCreate = promiseProxy(batchCreate);


    return Entity;
}
module.exports = CreateEntity;