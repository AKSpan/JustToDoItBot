/**
 * Created by Alexey on 18.12.2015.
 */
/*****MONGO FUNCTIONS******/
var DB_NAME = 'list_task';
var utils = require('./app');
var findDocuments = function (db, opts, callback) {
    // Get the documents collection
    var collection = db.collection(DB_NAME);
    // Find some documents
    collection.find(opts).toArray(function (err, docs) {
        console.log('find', docs);
        callback(docs);
    });
};
module.exports.findDocuments = findDocuments;
/**
 * Insert new task.
 * @param db MongoClient connect db
 * @param opts object, containing fields: owner_id, do_date, task_text
 */
var insertDocument = function (db, opts) {
    console.log('insert doc');
    var collection = db.collection(DB_NAME);

    collection.find({owner_id: opts.owner_id}).sort({_id: -1}).limit(1).toArray(function (err, docs) {
        var last_task_number = (docs != null && docs.length > 0 && docs[0].task_number > 0 ) ? docs[0].task_number : 0;
        last_task_number = last_task_number > 0 ? last_task_number : 0;

        var newTask = {
            owner_id: opts.owner_id,
            created_date: utils.getSysdate(),
            do_date: opts.do_date,
            done_date: '',
            is_done: false,
            task_text: opts.task_text,
            task_number: last_task_number + 1
        };
        collection.insertOne(newTask, function (xqr) {
            console.log('answer insert', xqr)
        });

    });
};
module.exports.insertDocument = insertDocument;
var updateDocument = function (db, opts, callback) {
    var collection = db.collection(DB_NAME);
    collection.updateOne(opts, {$set: {is_done: true, done_date: utils.getSysdate()}}, function (err, result) {
        db.close();
        callback(result);
    });
};
module.exports.updateDocument = updateDocument;