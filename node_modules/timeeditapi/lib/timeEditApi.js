'use strict';
const TimeEditCrawler = require('./timeEditCrawler.js');
const dataParser = require('./timeEditDataParser.js');

const TimeEditAPi = class extends TimeEditCrawler {
    constructor(url, types){
        super(url, types);
    }

    _search(html){
        if(dataParser.isValidSearch(html)){
            return dataParser.getSearchData(html);
        }
        throw 'room not valid';
    }

    /**
     * [check if x exsits]
     * @param  {[string / array of strings]} id [text for what you want to search for]
     * @return {[promise]}    [search result]
     */
    search(id){
        return new Promise((resolve, reject) => {
            super.getHtml(super.buildDataURL(id))
                .then((html) => {
                    return this._search(html);
                }).then((searchData) => {
                    resolve(searchData);
                }).catch((er) => {
                    reject(er);
                });
        });
    }

    /**
     * [schedule over multible days]
     * @param  {[string / array of strings]} id     [name of thing]
     * @return {[promise]}        [schedule over multible days]
     */
    getSchedule(id){
        return new Promise((resolve, reject) => {
            this._getSchedule(id)
                .then((jsonString) => {
                    const parsedJson = JSON.parse(jsonString);
                    resolve(dataParser.buildSchedule(parsedJson, id));
                }).catch((er) => {
                    reject(er);
                });
        });
    }

    /**
     * [gets todays schedule for a room]
     * @param  {[string / array of strings]} id     [name of a thing]
     * @return {[promise]}        [todays schedule for a room]
     */
    getTodaysSchedule(id){
        return new Promise((resolve, reject) => {
            this._getSchedule(id)
                .then((jsonString) => {
                    const parsedJson = JSON.parse(jsonString);
                    resolve(dataParser.buildTodaysSchedule(parsedJson, id));
                }).catch((er) => {
                    reject(er);
                });
        });
    }

    _getSchedule(id){
        // super in 'then' promise bugg quick fix
        const buildSchedule = (searchData) => {
            let dataIds = searchData.map(data => data.id);
            return super.getHtml(super.buildScheduleURL(dataIds));
        };

        return new Promise((resolve, reject) => {
            super.getHtml(super.buildDataURL(id))
                .then((html) => {
                    return buildSchedule(this._search(html));
                }).then((jsonString) => {
                    resolve(jsonString);
                }).catch((er) => {
                    reject(er);
                });
        });
    }

};

module.exports = TimeEditAPi;
