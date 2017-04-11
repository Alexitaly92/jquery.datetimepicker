/*
 * jquery.datetimepicker v1
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Make globaly available as well
        define(['moment', 'jquery'], function (moment, jquery) {
            return (root.datetimepicker = factory(moment, jquery));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node / Browserify
        //isomorphic issue
        var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
        if (!jQuery) {
            jQuery = require('jquery');
            if (!jQuery.fn) jQuery.fn = {};
        }
        module.exports = factory(require('moment'), jQuery);
    } else {
        // Browser globals
        root.datetimepicker = factory(root.moment, root.jQuery);
    }
}
(this, function (moment, $) {
    var DateTimePicker = function (element, options, cb) {

        //Element
        this.element = $(element);

        // Options
        this.parentEl = 'body';
        this.locale = 'en';
        this.Date = moment().clone().startOf('day');
        this.inline = false;
        this.onlyForward = false;
        this.daysOfWeek = [1, 2, 3, 4, 5, 6, 7]
        this.timePicker = true;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.timePickerIgnoreRanges = [];

        //State
        this.calendar = {};
        this.rangesToIgnore = [];
        this.SelectedDateTime = null;

        //Callback
        this.callback = function () { };

        //Check options
        if (typeof options !== 'object' || options === null)
            options = {};

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);

        if (typeof options.locale === 'string')
            this.locale = options.locale;

        moment.locale(this.locale);

        this.Date = moment().clone().startOf('day');

        if (typeof options.Date === 'object')
            this.Date = options.Date.startOf('day').clone();
        
        if (typeof options.inline === 'boolean')
            this.inline = options.inline;

        if (typeof options.onlyForward === 'boolean')
            this.onlyForward = options.onlyForward;

        if (typeof options.daysOfWeek === 'object')
            this.daysOfWeek = options.daysOfWeek;

        if (typeof options.timePicker === 'boolean')
            this.timePicker = options.timePicker;

        if (typeof options.timePickerIncrement === 'number')
            this.timePickerIncrement = options.timePickerIncrement;

        if (typeof options.timePickerSeconds === 'boolean')
            this.timePickerSeconds = options.timePickerSeconds;

        if (typeof options.timePickerIgnoreRanges === 'object')
            this.timePickerIgnoreRanges = options.timePickerIgnoreRanges;

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        this.container = this.generateTemplate();
        this.container.hide();

        if (this.timePicker)
            this.generateRangesToIgnore();
        this.generateCalendar();

        $(this.parentEl).append(this.container);

        this.element.on('click', $.proxy(function (e) { this.showCalendar(); e.stopPropagation(); }, this));
        $(document).on('click', $.proxy(function (e) { this.documentClick(e); }, this));
        this.element.attr("readonly", "readonly");
        this.element.css("cursor", "text");
    }

    DateTimePicker.prototype = {

        constructor: DateTimePicker,

        generateTemplate: function () {
            var cont = $("<div>", {
                class: "datetimepicker dropdown-menu"
            });

            if (this.inline)
                cont.addClass("inline");

            if (this.timePicker)
            {
                var timehead = $("<div>", {
                    class: "datetimepicker-timepickerhead"
                });
                timehead.append($("<i>", {
                    class: "fa fa-clock-o",
                    style: "inline"
                }));
                var seltime = $("<select>", {
                    id: "seltime"
                });
                seltime.on("change", $.proxy(this.timeSelected, this));
                timehead.append(seltime);
                cont.append(timehead);
            }
            var head = $("<div>", {
                class: "datetimepicker-head"
            });

            var leftarrowcont = $("<div>", {
                class: "left-head"
            });
            var leftarrow = $("<i>", {
                class: "fa fa-angle-left"
            });
            leftarrowcont.on('click', $.proxy(this.moveLeft, this));
            leftarrowcont.html(leftarrow);
            head.append(leftarrowcont);

            head.append($("<div>", {
                class: "mid-head"
            }));
            var rightarrowcont = $("<div>", {
                class: "right-head"
            });
            var rightarrow = $("<i>", {
                class: "fa fa-angle-right fa-2"
            });
            rightarrowcont.on('click', $.proxy(this.moveRight, this));
            rightarrowcont.html(rightarrow);
            head.append(rightarrowcont);

            cont.append(head);

            var table = $("<table>", {
                class: "datetable"
            });

            var tablehead = $("<thead>");
            var line = $("<tr>");
            for (var i = 0; i < 7; i++) {
                line.append($("<th>", {
                    class: "daycolumn",
                    id: "week-" + i
                }));
            }
            tablehead.append(line);
            table.append(tablehead);

            var tablebody = $("<tbody>");
            for (var j = 0; j < 6; j++) {
                var line = $("<tr>", {
                    id: "weekdays-" + j
                });
                for (var i = 0; i < 7; i++) {
                    var cell = $("<td>", {
                        class: "daycell",
                        id: "day-" + j + i
                    })
                    cell.on('click', $.proxy(this.cellClicked, this, cell.attr("id")));
                    line.append(cell);
                }
                tablebody.append(line);
            }
            table.append(tablebody);

            cont.append(table);

            return cont;
        },

        setPosition: function () {
            var curelem = this.element;
            while (curelem.parent().children().length == 1) {
                curelem = curelem.parent();
            }
            var pos = curelem.offset();
            var height = curelem.height();
            pos.top += height + 5;
            this.container.css(pos);
        },

        generateCalendar: function () {
            var startmoment = this.Date.clone().startOf('month').startOf('week');
            var endmoment = this.Date.clone().endOf('month').endOf('week').add(1, 'week');
            if (startmoment.isSame(this.Date.clone().startOf('month'))) {
                startmoment.subtract(1, 'week');
                endmoment.subtract(1, 'week');
            }
            var curmoment = startmoment.clone();
            this.calendar.TextMonth = this.Date.format('MMMM YYYY');
            this.calendar.Days = [];
            this.calendar.Times = [];

            while(curmoment.isBefore(endmoment))
            {
                this.calendar.Days.push(curmoment.clone());
                curmoment.add(1, 'day');
            }

            if (this.timePicker) {
                startmoment = this.Date.clone().startOf('day');
                endmoment = this.Date.clone().endOf('day');
                curmoment = startmoment.clone();
                while (curmoment.isBefore(endmoment)) {
                    if (this.checkValidHour(curmoment))
                        this.calendar.Times.push(curmoment.clone());
                    curmoment.add(this.timePickerIncrement, 'minute');
                }
            }
        },

        generateRangesToIgnore: function () {
            this.ignoreRanges = [];
            for(var i=0;i<this.timePickerIgnoreRanges.length;i++)
            {
                var tstart = null;
                var tend = null;
                var format = moment.localeData()._longDateFormat.LT;
                tstart = moment(this.timePickerIgnoreRanges[i].startTime, format);
                tend = moment(this.timePickerIgnoreRanges[i].endTime, format);
                this.ignoreRanges.push({ start: tstart, end: tend });
            }
        },

        checkValidHour: function (m) {
            for(var i=0;i<this.ignoreRanges.length;i++)
            {
                var hour = m.hour();
                var minute = m.minute();
                var ishour = this.ignoreRanges[i].start.hour();
                var isminute = this.ignoreRanges[i].start.minute();
                var iehour = this.ignoreRanges[i].end.hour();
                var ieminute = this.ignoreRanges[i].end.minute();
                if (hour > ishour && hour < iehour)
                    return false;
                if (hour == ishour && minute >= isminute)
                    return false;
                if (hour == iehour && minute < ieminute)
                    return false;
            }
            return true;
        },

        documentClick: function (e) {
            if (this.container && !this.container.is(e.target) && this.container.has(e.target).length == 0) {
                this.container.hide();
            }
        },

        showCalendar: function () {
            this.container.find(".mid-head").html(this.calendar.TextMonth);
            var table = this.container.find(".datetable");
            for (var i = 0; i < 7; i++) {
                table.find('#week-' + i).html(this.calendar.Days[i].format('ddd'));
            }

            var tablebody = $("<tbody>");
            var count = 0;
            for (var j = 0; j < 6; j++) {
                for (var i = 0; i < 7; i++) {
                    table.find('#day-' + j + i).removeClass();
                    table.find('#day-' + j + i).addClass("daycell");
                    if (this.SelectedDateTime && this.SelectedDateTime.clone().startOf('day').isSame(this.calendar.Days[count]))
                        table.find('#day-' + j + i).addClass("selected");
                    table.find('#day-' + j + i).html(this.calendar.Days[count].format('DD'));
                    if (table.find('#day-' + j + i).data('date'))
                        table.find('#day-' + j + i).data("date", null);
                    table.find('#day-' + j + i).data("date", this.calendar.Days[count].clone());
                    if (moment().startOf('day').isSame(this.calendar.Days[count]))
                        table.find('#day-' + j + i).addClass('today');
                    if (this.calendar.Days[count].month() == this.Date.month())
                        table.find('#day-' + j + i).addClass('samemonth');
                    if (this.calendar.Days[count].isBefore(this.Date) && this.calendar.Days[count].month() != this.Date.month())
                        table.find('#day-' + j + i).addClass('monthbefore');
                    if (this.calendar.Days[count].isAfter(this.Date) && this.calendar.Days[count].month() != this.Date.month())
                        table.find('#day-' + j + i).addClass('monthafter');
                    if ($.inArray(this.calendar.Days[count].isoWeekday(), this.daysOfWeek) == -1 || (this.onlyForward && this.calendar.Days[count].isBefore(moment().startOf('day'))))
                        table.find('#day-' + j + i).addClass('invaliddate');
                    count++;
                }
            }
            this.container.find("#seltime").html("");
            for (i = 0; i < this.calendar.Times.length; i++) {
                var timeoption = $("<option>", {
                    text: this.calendar.Times[i].format("LT"),
                    value: this.calendar.Times[i].format("LT")
                });
                if (this.SelectedDateTime && this.calendar.Times[i].format("LT") == this.SelectedDateTime.format("LT")) {
                    timeoption.attr("selected", "selected");
                }
                this.container.find("#seltime").append(timeoption);
            }
            if (this.SelectedDateTime == null)
                this.container.find("#seltime").attr("disabled", "disabled");
            else
                this.container.find("#seltime").removeAttr("disabled");
            this.setPosition();
            this.container.show();
        },

        hideCalendar: function (){
            this.container.hide();
        },

        cellClicked: function (cellid) {
            var date = this.container.find("#" + cellid).data("date").clone();
            if (!this.container.find("#" + cellid).hasClass('invaliddate')) {
                this.daySelected(cellid);
            }
            if (date.isAfter(this.Date) && date.month() != this.Date.month()) {
                this.moveRight();
                return;
            }
            if (date.isBefore(this.Date) && date.month() != this.Date.month()) {
                this.moveLeft();
                return;
            }
        },

        moveLeft: function () {
            this.Date = this.Date.clone().subtract(1, 'month');
            this.generateCalendar();
            this.showCalendar();
        },

        moveRight: function () {
            this.Date = this.Date.clone().add(1, 'month');
            this.generateCalendar();
            this.showCalendar();
        },

        timeSelected: function () {
            var timeformat = moment.localeData()._longDateFormat.LT;
            var time = moment(this.container.find("#seltime").find(":selected").val(), timeformat);
            if (this.SelectedDateTime) {
                this.SelectedDateTime.hour(time.hour()).minute(time.minute());
                this.element.val(this.SelectedDateTime.format("L LT"));
                this.callback(this.SelectedDateTime);
            }
        },

        daySelected: function (cellid) {
            this.container.find(".daycell.selected").removeClass("selected");
            var cell = this.container.find("#" + cellid);
            cell.addClass("selected");
            this.SelectedDateTime = cell.data("date").clone();
            var format = "L";
            if (this.timePicker)
            {
                format += " LT";
                var timeformat = moment.localeData()._longDateFormat.LT;
                if (this.onlyForward)
                {
                    if (this.SelectedDateTime.isSame(moment().startOf('day')))
                    {
                        this.container.find("#seltime").children().each(function (i, e) {
                            var time = moment($(e).val(), timeformat);
                            if(time.isBefore(moment()))
                            {
                                $(e).attr("disabled", "disabled");
                            }
                        });
                        var time = moment(this.container.find("#seltime").find(":selected").val(), timeformat);
                        if(time.isBefore(moment()))
                        {
                            this.container.find("#seltime").children().removeAttr("selected");
                            this.container.find("#seltime").trigger("change");
                        }
                        else
                        {
                            this.SelectedDateTime.hour(time.hour()).minute(time.minute());
                        }
                    }
                    else
                    {
                        this.container.find("#seltime").children().removeAttr("disabled");
                        var time = moment(this.container.find("#seltime").find(":selected").val(), timeformat);
                        this.SelectedDateTime.hour(time.hour()).minute(time.minute());
                    }
                }
            }
            this.container.find("#seltime").removeAttr("disabled");
            this.element.val(this.SelectedDateTime.format(format));
            this.callback(this.SelectedDateTime);
        }
    };

    $.fn.datetimepicker = function (options, callback) {
        this.each(function () {
            var el = $(this);
            if (el.data('datetimepicker'))
                el.data('datetimepicker').remove();
            el.data('datetimepicker', new DateTimePicker(el, options, callback));
        });
        return this;
    };
    return DateTimePicker;
}));