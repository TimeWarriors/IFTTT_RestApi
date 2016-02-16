'use strict';
const cheerio = require('cheerio');

const TimeEditDataParser = class {
    constructor(){

    }

    getSearchData(html){
        let $ = this._loadHtml(html);
        let dataIds = $('.searchObject').map((i, elem) => {
            return {
                id: $(elem).data('id'),
                name: $(elem).data('name')
            };
        }).get();
        return dataIds.length > 0 ? dataIds : dataIds[0];
    }

    /**
     * [sorts schedule infromation]
     * @param  {[object]} object [cherio html object]
     * @param  {[string]} id     []
     * @return {[object]}        [sorted schedule infromation]
     */
    buildSchedule(object, id){
        if(!object.hasOwnProperty('reservations')){ throw 'invalid search result'; }
        return object.reservations
            .map((reservation) => {
                return {
                    booking: {
                        time:{
                            endDate: reservation.enddate,
                            endTime: reservation.endtime,
                            startDate: reservation.startdate,
                            startTime: reservation.starttime
                        },
                        id,
                        bookingId: reservation.id,
                        columns: reservation.columns
                    }
                };
            });
    }

    /**
     * [todays room schedule information]
     * @param  {[object]} object [cherio html object]
     * @return {[object]}        [only todays room schedule information]
     */
    buildTodaysSchedule(object, id){
        let todaysSchedule = this.buildSchedule(object, id)
            .filter((reservation) => {
                let reservationDate = this.parseDate(reservation.booking.time.startDate);
                let todaysDate = this.getTodaysDate();

                return reservationDate.getFullYear() === todaysDate.getFullYear() &&
                    reservationDate.getMonth() === todaysDate.getMonth() &&
                    reservationDate.getDate() === todaysDate.getDate();
            });
        return todaysSchedule.length > 0 ? todaysSchedule : [{ id }] ;
    }

    isValidSearch(html){
        let $ = this._loadHtml(html);
        return $('.searchObject').hasOwnProperty('0');
    }

    getTodaysDate(){
        return new Date();
    }

    parseDate(dateString){
        return new Date(dateString);
    }

    _loadHtml(html){
        return cheerio.load(html);
    }

};

module.exports = new TimeEditDataParser();
