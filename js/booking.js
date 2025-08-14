(function () {
  // min date = today
  var d = document.getElementById('date');
  if (d) {
    var today = new Date(); today.setHours(0,0,0,0);
    d.min = today.toISOString().split('T')[0];
  }

  // build hidden time value "hh:mm AM/PM"
  function updateTimeHidden() {
    var h = document.getElementById('timeHour');
    var m = document.getElementById('timeMinute');
    var ap = document.getElementById('timeAmPm');
    var out = document.getElementById('time');
    if (h && m && ap && out && h.value && m.value && ap.value) {
      out.value = h.value + ':' + m.value + ' ' + (ap.value || 'AM'); // e.g. "10:15 AM"
    }
  }
  ['timeHour','timeMinute','timeAmPm'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', updateTimeHidden);
  });

  // simple open-hours guard (6:00 AM–2:30 PM)
  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', function(e){
      updateTimeHidden();
      var time = document.getElementById('time')?.value || '';
      var match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
      if (match) {
        var hh = parseInt(match[1], 10);
        var mm = parseInt(match[2], 10);
        var ap = match[3].toUpperCase();
        // minutes from midnight
        var mins = (hh % 12) * 60 + mm + (ap === 'PM' ? 12*60 : 0);
        var open = 6*60;       // 06:00
        var close = 14*60 + 30; // 14:30
        if (mins < open || mins > close) {
          e.preventDefault();
          alert('Kitchen hours are 6:00 AM to 2:30 PM. Please pick a time within that range.');
        }
      }
    });
  }
})();
