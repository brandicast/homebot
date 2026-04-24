'use strict';

const config = require('./config.js');
const log4js  = require('log4js');
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

const path = require('path');
const Database = require('better-sqlite3');

let db;

exports.init = function () {
    const dbPath = path.join(__dirname, config.eng.resource_folder, 'vocabulary.db');
    logger.info('Connecting to vocabulary database at: ' + dbPath);
    try {
        db = new Database(dbPath, { readonly: true });
        logger.info('Database connected successfully.');
        
        // 驗證並記錄詞彙數量
        const stmt = db.prepare('SELECT category, COUNT(*) as count FROM vocabulary GROUP BY category');
        const rows = stmt.all();
        const basicCount = rows.find(r => r.category === '101')?.count || 0;
        const advanceCount = rows.find(r => r.category === '110')?.count || 0;
        
        logger.info(`Vocabulary loaded from SQLite — basic: ${basicCount}, advance: ${advanceCount}`);
    } catch (err) {
        logger.error('Failed to connect to database: ' + err.message);
    }
};

function getRandomWordByCategory(categoryPattern) {
    if (!db) {
        logger.error('Database not initialized');
        return ['error', { chi: '資料庫未連接', link: 'None' }];
    }
    
    try {
        // SQLite 查詢：從特定 category 中隨機取得一筆
        const stmt = db.prepare('SELECT word, translation as chi, link, category FROM vocabulary WHERE category = ? ORDER BY RANDOM() LIMIT 1');
        const row = stmt.get(categoryPattern);
        
        if (!row) {
            return ['error', { chi: '找不到單字', link: 'None', category: '000' }];
        }
        
        // 確保 link 的格式與之前 JSON 的行為一致 (如果是 null 就轉成 'None')
        const link = (row.link === null || row.link === '') ? 'None' : row.link;
        
        return [row.word, { chi: row.chi, link: link, category: row.category }];
    } catch (err) {
        logger.error('Error fetching word: ' + err.message);
        return ['error', { chi: '取得單字發生錯誤', link: 'None', category: '000' }];
    }
}

exports.randomBasicWord = function () {
    return getRandomWordByCategory('101');
};

exports.randomAdvanceWord = function () {
    return getRandomWordByCategory('110');
};