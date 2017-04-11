# jquery.datetimepicker
A simple DateTimePicker plugin for jquery

# Description
This is a simple DateTimePicker plugin that uses jquery and moment.js to let the user select a date and time.
It uses the moment.js locale format but it may be customizable in the next versions.

# Usage
Reference jquery, moment.js, bootstrap and  font-awesome
```html
  <script src="bootstrap.min.js"></script>
  <script src="jQuery-2.1.4.min.js"></script>
  <script src="moment.js"></script>
  <script src="bootstrap.min.js"></script>
  <link href="bootstrap.min.css" rel="stylesheet"/>
  <link href="font-awesome.min.css" rel="stylesheet"/>
```

Referenze jquery.datetimepicker.js and datetimepicker.css
```html
  <script src="jquery.datetimepicker.min.js"></script>
  <link href="datetimepicker.css" rel="stylesheet"/>
```

Initialize datetimepicker
```html
<input type="text" name="" id="calendartest" />
<script>
$(document).ready(function () {
          $("#calendartest").datetimepicker({
              locale: "it",
              daysOfWeek: [1, 2, 3, 4, 5],
              timePicker: true,
              onlyForward: true,
              timePickerIncrement: 20,
              timePickerIgnoreRanges: [
                  { startTime: "0:00:00", endTime: "8:00:00" },
                  { startTime: "13:00:00", endTime: "14:00:00" },
                  { startTime: "19:00:00", endTime: "23:59:59" }
              ]
          });
      });
</script>
```

# known Issues:
* the inline option is not yet implemented