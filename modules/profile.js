function getMyProfile(con, email, callback) {
    var user = {user: [], books: [], stats: []};
    // Query 2 - Selection Query
    var query = `
        SELECT langara_id, first_name, last_name, email FROM sys_user
        WHERE langara_id = (SELECT langara_id FROM sys_user WHERE sys_user.email='${email}');
    `;

    con.query(query, function(err, result, fields) {
        user.personal = result[0];
        // SELECT title FROM book;
        // Query 4 - Division Query
        query = `
        SELECT b.title FROM owned_copy oc INNER JOIN book b ON oc.book_id = b.isbn13 WHERE oc.owner_langara_id = (SELECT langara_id FROM sys_user WHERE sys_user.email='${email}') AND b.title NOT IN (SELECT b.title FROM owned_copy oc INNER JOIN book b ON oc.book_id = b.isbn13 WHERE oc.owner_langara_id = (SELECT langara_id FROM sys_user WHERE sys_user.email='${email}') AND
        oc.requested_by_langara_id IS NOT NULL);
        `;
        con.query(query, function(err, result, fields) {
            user.books = result;
            // Query 5 - Aggregation Query (1 and 2)
            query = `
            SELECT COUNT(isbn13) AS allBooks FROM book
            UNION
            SELECT ROUND(AVG(book_price), 2) FROM owned_copy;
            `;
            con.query(query, function(err, result, fields) {
                user.stats = result;
                callback(user);
            });
        });
    });
}

function deleteAccount(con, email, callback) {
    // Query 7 - Delete operation with cascade on delete
    var query = `
    DELETE FROM sys_user WHERE email = '${email}';
    DELETE FROM student WHERE langara_id IN (SELECT langara_id FROM sys_user WHERE email = '${email}');
    DELETE FROM staff WHERE langara_id IN (SELECT langara_id FROM sys_user WHERE email = '${email}');
    `;
    con.query(query, function(err, result, fields) {
        callback(err);
    });
}

module.exports = {
    getMyProfile: getMyProfile,
    deleteAccount: deleteAccount
}
