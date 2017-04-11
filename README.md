# jquery.datetimepicker
A simple DateTimePicker plugin for jquery

# Description
This is a simple DateTimePicker plugin that uses jquery and moment.js to let the user select a date and time.
It uses the moment.js locale format but it may be customizable in the next versions.

# Usage
Reference jquery and moment.js
```html
  <script src="jQuery-2.1.4.min.js"></script>
  <script src="moment.js"></script>
```

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