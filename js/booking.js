// js/booking.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// ------------- CONFIG: replace with your own values -------------
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
// ---------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

(function () {
  // set min date using local timezone (prevents off-by-one)
  function setMinDateLocal() {
    const d = document.getElementById('date')
    if (!d) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    d.min = `${yyyy}-${mm}-${dd}`
  }

  // build hidden time value "hh:mm AM/PM"
  function updateTimeHidden() {
    const h = document.getElementById('timeHour')
    const m = document.getElementById('timeMinute')
    const ap = document.getElementById('timeAmPm')
    const out = document.getElementById('time')
    if (h && m && ap && out && h.value && m.value && ap.value) {
      out.value = `${h.value}:${m.value} ${ap.value}`
    } else if (out) {
      out.value = ''
    }
  }

  function withinKitchenHours(timeStr) {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i)
    if (!match) return false
    const hh = parseInt(match[1], 10)
    const mm = parseInt(match[2], 10)
    const ap = match[3].toUpperCase()
    const mins = (hh % 12) * 60 + mm + (ap === 'PM' ? 12 * 60 : 0)
    const open = 6 * 60            // 06:00
    const close = 14 * 60 + 30     // 14:30
    return mins >= open && mins <= close
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // update hidden time and validate
    updateTimeHidden()
    const time = document.getElementById('time')?.value || ''
    const msg = document.getElementById('formMsg')
    const btn = document.getElementById('submitBtn')

    if (!time) {
      alert('Please select a time (hour, minute and AM/PM).')
      return
    }
    if (!withinKitchenHours(time)) {
      alert('Kitchen hours are 6:00 AM to 2:30 PM. Please pick a time within that range.')
      return
    }

    const fd = new FormData(e.target)
    const booking = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      guests: parseInt(fd.get('guests'), 10),
      date: fd.get('date'),
      time: fd.get('time'),
      notes: fd.get('notes') || null
    }

    // basic front-end guard
    if (!booking.name || !booking.phone || !booking.guests || !booking.date || !booking.time) {
      alert('Please fill all required fields.')
      return
    }

    // UI: disable while saving
    btn.disabled = true
    msg.textContent = 'Submitting…'

    const { error } = await supabase.from('bookings').insert([booking])

    if (error) {
      console.error(error)
      msg.textContent = 'There was an error. Please try again or call us.'
      btn.disabled = false
      return
    }

    // success
    msg.textContent = 'Thanks! We’ll confirm by SMS or email shortly.'
    e.target.reset()
    updateTimeHidden()
    btn.disabled = false
  }

  function attachHandlers() {
    setMinDateLocal()
    ;['timeHour', 'timeMinute', 'timeAmPm'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.addEventListener('change', updateTimeHidden)
    })
    const form = document.getElementById('bookingForm')
    if (form) form.addEventListener('submit', handleSubmit)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers)
  } else {
    attachHandlers()
  }
})()
