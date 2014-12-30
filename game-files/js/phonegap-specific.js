/**
 * All platform specific code will go here so it
 * can easily be changed
 */
var database;

function getHighscore()
{
    highscore = window.localStorage.getItem("highscore");

}
function setHighscore(newscore)
{
    window.localStorage.setItem("highscore",newscore);
}

//function openDB()
//{
//    database = window.openDatabase('alien-massacre','1.0','Database',10000000);
//    database.transaction(initializeDB, initCallback, errorDB);
//}
//
//function initializeDB(tx)
//{
//    tx.executeSql('CREATE TABLE IF NOT EXISTS SCORE (key, value)');
//    tx.executeSql('SELECT * FROM SCORE')
//    
//}
//
//function initCallback(tx, results)
//{
//    if( results.rows.length > 0 )
//        highscore = 
//}
//
//function errorDB(err)
//{
//    console.log('Error from DB ' + err);
//}