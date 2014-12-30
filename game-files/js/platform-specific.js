/**
 * All platform specific code will go here so it
 * can easily be changed
 */


function openDB()
{
    database = window.openDatabase('alien-massacre','1.0','Database',10000000);
    database.transaction()
}

function initializeDB(tx)
{
    tx.executeSql('CREATE TABLE IF NOT EXISTS SCORE (key, value)');
    
}