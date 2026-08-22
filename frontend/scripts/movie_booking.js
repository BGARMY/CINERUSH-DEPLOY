// Helper to get selected movie from URL
function getSelectedMovie() {
  const params = new URLSearchParams(window.location.search)
  return params.get("movie") || ""
}

// Fetch movie details from backend
async function fetchMovieDetails(movieTitle) {
  try {
    const response = await fetch(`/api/movies/booking/title/${encodeURIComponent(movieTitle)}`)
    if (!response.ok) throw new Error("Movie not found")
    return await response.json()
  } catch (err) {
    return null
  }
}

/**
 * Utility: format a show_date (ISO or compatible) to DOM date key 'DD MMM' (e.g., '02 NOV')
 */
/**
 * Convert a Date (or date-like input) into a DOM key 'DD MMM' (e.g. '02 NOV').
 * Accepts a JS Date, an ISO string, or a timestamp (ms or seconds). If parsing
 * fails, falls back to the original input string.
 */
function formatShowDateToDomKey(input) {
  if (!input) return ""
  let d = null
  if (input instanceof Date) d = input
  else if (typeof input === "number") {
    // treat large numbers as ms, small as seconds
    d = new Date(input > 1e12 ? input : input * 1000)
  } else if (typeof input === "string") {
    // Try to parse YYYY-MM-DDTHH:MM:SS (server may send no timezone)
    // If string looks like an ISO without a timezone, treat it as local by
    // constructing components instead of letting Date assume UTC.
    const isoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input)
    if (isoNoTZ) {
      // split and create local date
      const [datePart, timePart] = input.split("T")
      const [y, m, dd] = datePart.split("-").map((n) => Number.parseInt(n, 10))
      const [hh, min, ss] = timePart.split(":").map((n) => Number.parseInt(n, 10))
      d = new Date(y, m - 1, dd, hh, min, ss, 0)
    } else {
      // fallback to Date parser (handles ISO with timezone and other formats)
      d = new Date(input)
    }
  }

  if (!d || isNaN(d)) return String(input).trim()
  const day = String(d.getDate()).padStart(2, "0")
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase()
  return `${day} ${month}`
}

/**
 * Group showtimes by DOM date key (DD MMM)
 */
function groupShowtimesByDomDate(showtimes) {
  const map = {}
  ;(showtimes || []).forEach((s) => {
    // Prefer server-provided canonical datetime or unix timestamp, fall back to
    // the show_date string. Use parseShowDateTime to get a reliable Date.
    const d = parseShowDateTime(s)
    const key = d ? formatShowDateToDomKey(d) : formatShowDateToDomKey(s.show_date || s.date || s.show_datetime_iso)
    if (!map[key]) map[key] = []
    // dedupe by showtime id
    const id = s.showtime_id || s.id
    if (!map[key].some((x) => (x.showtime_id || x.id) === id)) {
      map[key].push(s)
    }
  })

  // sort each day's showtimes by start time ascending for predictable UI
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => {
      const da = parseShowDateTime(a)
      const db = parseShowDateTime(b)
      if (!da || !db) return 0
      return da.getTime() - db.getTime()
    })
  })

  return map
}

document.addEventListener("DOMContentLoaded", async () => {
  // Clear previous booking data when starting a new booking
  localStorage.removeItem("currentBooking")
  localStorage.removeItem("showtimeId")
  localStorage.removeItem("selectedShowtime")

  // Fetch and display movie details
  const movieKey = getSelectedMovie()
  const movie = await fetchMovieDetails(movieKey)
  if (!movieKey) {
    alert("Movie not found. Please select a movie from Now Playing.")
    window.location.href = "now_playing.html"
    return
  }
  const titleElem = document.querySelector(".movie-title")
  const runtimeElem = document.querySelector(".movie-runtime")
  if (movie) {
    if (titleElem) titleElem.textContent = movie.title
    if (runtimeElem) runtimeElem.textContent = `Movie runtime: ${movie.runtime}`
    document.title = `${movie.title} - Book Tickets | CINE RUSH`
  } else {
    if (titleElem) titleElem.textContent = "Movie Not Found"
    if (runtimeElem) runtimeElem.textContent = ""
  }

  initializeDateSelector() // wire click handlers early so clicks work immediately

  // Render showtimes dynamically from backend data
  await generateDailyShowtimes()

  // Automatically set today's date (if present) so UI doesn't show duplicates
  setActiveDateToToday()

  initializeShowtimes()
  initializeAnimations()

  // schedule midnight update to switch date automatically
  scheduleMidnightUpdate()

  // Start periodic check to disable started showtimes (every 30s)
  if (window._showtimeStatusTimer) clearInterval(window._showtimeStatusTimer)
  window._showtimeStatusTimer = setInterval(updateShowtimeStatuses, 30 * 1000)
  // run immediately once
  updateShowtimeStatuses()

  // Optional: enable auto-rotation of dates (disabled by default)
  // startAutoRotateDates(7000);
})

/**
 * Generate and render showtimes using backend data.
 * Ensures date items have an active default and showtime grid stores raw data.
 */
async function generateDailyShowtimes() {
  const showtimeGrid = document.querySelector(".showtime-grid")
  if (!showtimeGrid) return
  showtimeGrid.innerHTML = ""

  const movieKey = getSelectedMovie()
  if (!movieKey) return

  const movie = await fetchMovieDetails(movieKey)
  if (!movie || !movie.showtimes || movie.showtimes.length === 0) {
    showtimeGrid.innerHTML = '<p class="no-showtimes">No showtimes available for this movie.</p>'
    return
  }

  // Store raw showtimes on the DOM for other functions
  showtimeGrid.dataset.showtimes = JSON.stringify(movie.showtimes)

  // Build grouped showtimes by DOM date key
  const grouped = groupShowtimesByDomDate(movie.showtimes)
  // Debug: log grouped keys and counts to help diagnose disabled-date issues
  try {
    console.debug("[movie_booking] grouped showtime keys:", Object.keys(grouped))
    Object.keys(grouped).forEach((k) => console.debug(`[movie_booking] ${k}: ${grouped[k].length} shows`))
  } catch (e) {
    // ignore logging errors in older browsers
  }

  // Option A: Week-of-today starting Sunday (Sunday -> Saturday)
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  function getSundayOf(d) {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const day = copy.getDay() // 0 = Sunday
    copy.setDate(copy.getDate() - day)
    return copy
  }

  const weekStart = getSundayOf(todayStart)
  const displayDates = []
  for (let i = 0; i < 7; i++) {
    displayDates.push(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i))
  }

  // Render date-selector Sunday -> Saturday
  const dateSelector = document.getElementById("dateSelector") || document.querySelector(".date-selector")
  if (dateSelector) {
    dateSelector.innerHTML = ""
    displayDates.forEach((dt) => {
      const domKey = `${String(dt.getDate()).padStart(2, "0")} ${dt.toLocaleString("en-US", { month: "short" }).toUpperCase()}`
      const weekday = dt.toLocaleString("en-US", { weekday: "short" }).toUpperCase().slice(0, 3)
      const dayNum = String(dt.getDate()).padStart(2, "0")
      const monthShort = dt.toLocaleString("en-US", { month: "short" }).toUpperCase()

      const item = document.createElement("div")
      item.className = "date-item"
      item.dataset.dateKey = domKey
      item.dataset.isoDate = dt.toISOString().slice(0, 10)
      // mark past dates (before today) as disabled
      if (dt.getTime() < todayStart.getTime()) item.classList.add("disabled")

      item.innerHTML = `<span class="day">${weekday}</span><span class="date">${dayNum}</span><span class="month">${monthShort}</span>`
      dateSelector.appendChild(item)
    })
  }

  // Ensure date selector click handlers are wired for the newly-created items
  // (initializeDateSelector may have been called earlier before items existed)
  try {
    initializeDateSelector()
  } catch (e) {
    /* ignore */
  }
  // After creating date items, enable/disable them based on whether that date
  // actually has showtimes (and whether those showtimes are all in the past).
  // This prevents dates with parsing issues from being marked as "all started".
  ;(function reconcileDateItemsWithShowtimes() {
    const items = document.querySelectorAll(".date-item")
    items.forEach((item) => {
      const domKey = (
        item.dataset.dateKey ||
        (item.querySelector(".date") && item.querySelector(".month")
          ? item.querySelector(".date").textContent + " " + item.querySelector(".month").textContent
          : item.textContent)
      ).trim()
      const showsForKey = grouped[domKey] || []
      if (!showsForKey || showsForKey.length === 0) {
        // No showtimes for this date in the backend payload — leave as disabled if it's past,
        // otherwise allow user to click but it will simply show "No showtimes".
        // Do not mark as all-started here.
        // If the item was previously marked all-started, remove that flag.
        item.classList.remove("all-started")
        if (!item.classList.contains("disabled")) {
          // keep existing state (past dates are already disabled by earlier logic)
        }
      } else {
        // There are showtimes for this date: check if at least one is in the future.
        const anyFuture = showsForKey.some((s) => {
          const d = parseShowDateTime(s)
          return d && Date.now() < d.getTime()
        })
        if (anyFuture) {
          // enable the date (it's selectable)
          item.classList.remove("disabled", "all-started")
          item.removeAttribute("aria-disabled")
        } else {
          // all shows started — visually disable but keep visible
          item.classList.add("disabled", "all-started")
          item.setAttribute("aria-disabled", "true")
        }
      }
    })
  })()

  const dateItems = document.querySelectorAll(".date-item")

  // If there are date-item DOM nodes, try to set the matching one active for the first available date
  const firstAvailableDateKey = Object.keys(grouped)[0]
  if (dateItems && dateItems.length > 0 && firstAvailableDateKey) {
    // find a date-item that matches the firstAvailableDateKey, otherwise set first date-item active
    let matched = null
    dateItems.forEach((item) => {
      const domKey = (
        item.dataset.dateKey ||
        (item.querySelector(".date") && item.querySelector(".month")
          ? item.querySelector(".date").textContent + " " + item.querySelector(".month").textContent
          : item.textContent)
      ).trim()
      if (domKey === firstAvailableDateKey) matched = item
    })
    // clear existing actives and set matched or first
    dateItems.forEach((i) => i.classList.remove("active"))
    if (matched) matched.classList.add("active")
    else dateItems[0].classList.add("active")
    // render for the active item
    const active = document.querySelector(".date-item.active")
    const activeKey = active
      ? (
          active.dataset.dateKey ||
          (active.querySelector(".date") && active.querySelector(".month")
            ? active.querySelector(".date").textContent + " " + active.querySelector(".month").textContent
            : active.textContent)
        ).trim()
      : firstAvailableDateKey
    renderShowtimesForDate(activeKey)
  } else {
    // No date-item DOM elements: render first available date's showtimes
    renderShowtimesForDate(firstAvailableDateKey || null)
  }
}

// Date selector functionality
function initializeDateSelector() {
  const dateItems = document.querySelectorAll(".date-item")

  dateItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Ignore clicks on disabled dates
      if (this.classList.contains("disabled")) return

      dateItems.forEach((d) => d.classList.remove("active"))
      this.classList.add("active")

      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)

      updateShowtimesForDate()
    })
  })
}

// Update showtimes based on selected date
function updateShowtimesForDate() {
  const activeDate = document.querySelector(".date-item.active")
  const dateEl = activeDate ? activeDate.querySelector(".date") : null
  const monthEl = activeDate ? activeDate.querySelector(".month") : null
  const dateToShow = dateEl && monthEl ? dateEl.textContent.trim() + " " + monthEl.textContent.trim() : null

  const showtimeGrid = document.querySelector(".showtime-grid")
  if (!showtimeGrid) return
  showtimeGrid.style.opacity = "0.5"

  setTimeout(() => {
    renderShowtimesForDate(dateToShow)
    initializeShowtimes()
    showtimeGrid.style.opacity = "1"
  }, 150)
}

function renderShowtimesForDate(dateKey) {
  const showtimeGrid = document.querySelector(".showtime-grid")
  if (!showtimeGrid) return
  showtimeGrid.innerHTML = ""

  const showtimesData = showtimeGrid.dataset.showtimes ? JSON.parse(showtimeGrid.dataset.showtimes) : []
  if (!showtimesData || showtimesData.length === 0) {
    showtimeGrid.innerHTML = '<p class="no-showtimes">No showtimes available for this movie.</p>'
    return
  }

  // If dateKey is null/undefined, show first available date's showtimes
  let targetKey = dateKey
  if (!targetKey) {
    const grouped = groupShowtimesByDomDate(showtimesData)
    targetKey = Object.keys(grouped)[0] || null
  }

  // Normalize dateKey
  const normalizedDate = targetKey ? targetKey.replace(/\s+/g, " ").trim() : null

  // Use grouped data (which uses parseShowDateTime) for reliable matching
  const grouped = groupShowtimesByDomDate(showtimesData)
  const filtered = normalizedDate ? grouped[normalizedDate] || [] : grouped[Object.keys(grouped)[0]] || []

  if (filtered.length === 0) {
    showtimeGrid.innerHTML = '<p class="no-showtimes">No showtimes for this date.</p>'
    return
  }

  // Optionally limit to a maximum number of showtimes per day for UI clarity
  const MAX_SHOWS_PER_DAY = 4
  const visible = filtered.slice(0, MAX_SHOWS_PER_DAY)

  visible.forEach((show, index) => {
    const button = document.createElement("button")
    button.className = "showtime-btn"
    const idVal = show.showtime_id || show.id || null
    if (idVal !== null) button.setAttribute("data-id", idVal)

    // compute show start timestamp and mark disabled if already started
    const startDate = parseShowDateTime(show)
    if (startDate) {
      button.dataset.startTimestamp = String(startDate.getTime())
      if (Date.now() >= startDate.getTime()) {
        // already started
        button.classList.add("started")
        button.disabled = true
      }
    }

    // show.show_time might be in 24h (HH:MM:SS) or already formatted; try to format
    let timeText = show.show_time || show.time || ""
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeText)) {
      const [h, m] = timeText.split(":")
      const hour = Number.parseInt(h, 10)
      const ampm = hour >= 12 ? "PM" : "AM"
      const hr12 = ((hour + 11) % 12) + 1
      timeText = `${String(hr12).padStart(2, "0")}:${m} ${ampm}`
    }
    button.setAttribute("data-time", timeText)
    // match existing UI spacing '10 : 30 AM'
    button.textContent = timeText.replace(":", " : ")

    // Animate in
    button.style.opacity = "0"
    button.style.transform = "translateY(10px)"
    setTimeout(() => {
      button.style.transition = "all 0.3s ease"
      button.style.opacity = "1"
      button.style.transform = "translateY(0)"
    }, index * 80)

    showtimeGrid.appendChild(button)
  })

  if (filtered.length > MAX_SHOWS_PER_DAY) {
    const moreCount = filtered.length - MAX_SHOWS_PER_DAY
    const moreEl = document.createElement("div")
    moreEl.className = "showtime-more"
    moreEl.textContent = `+${moreCount} more`
    showtimeGrid.appendChild(moreEl)
  }
}

/**
 * Update all showtime buttons on the page and disable those whose start time passed.
 */
function updateShowtimeStatuses() {
  const now = Date.now()
  const buttons = document.querySelectorAll(".showtime-btn")
  buttons.forEach((btn) => {
    const ts = Number.parseInt(btn.dataset.startTimestamp || "0", 10)
    if (ts && now >= ts) {
      if (!btn.classList.contains("started")) {
        btn.classList.add("started")
        btn.disabled = true
      }
    }
  })
  // If all dates now have no future showtimes, regenerate the list to pull new dates
  // Check the active date: if its showtimes are all started, remove that date and move on
  const showtimeGrid = document.querySelector(".showtime-grid")
  if (!showtimeGrid) return
  const showtimesData = showtimeGrid.dataset.showtimes ? JSON.parse(showtimeGrid.dataset.showtimes) : []
  if (!showtimesData || showtimesData.length === 0) return

  // Remove any date-item whose all showtimes are in the past
  const grouped = groupShowtimesByDomDate(showtimesData)
  Object.keys(grouped).forEach((key) => {
    // Consider a show "started" only if we can parse its datetime and the time has passed.
    // If parsing fails for a show we conservatively treat it as NOT started to avoid
    // incorrectly disabling a whole date due to a parsing edge-case.
    const allStarted = grouped[key].every((s) => {
      const d = parseShowDateTime(s)
      return d ? Date.now() >= d.getTime() : false
    })
    if (allStarted) {
      // Do NOT remove the date item. Mark it disabled so the user still sees
      // that the day existed but all shows are started/past.
      const items = document.querySelectorAll(".date-item")
      items.forEach((item) => {
        const domKey = (
          item.dataset.dateKey ||
          (item.querySelector(".date") && item.querySelector(".month")
            ? item.querySelector(".date").textContent + " " + item.querySelector(".month").textContent
            : item.textContent)
        ).trim()
        if (domKey === key) {
          item.classList.add("disabled", "all-started")
          item.setAttribute("aria-disabled", "true")
          item.dataset.allStarted = "true"
          // Also disable any showtime buttons visually associated (if present)
          const grid = document.querySelector(".showtime-grid")
          if (grid) {
            // If this date is currently active, disable buttons in the grid
            if (item.classList.contains("active")) {
              const buttons = grid.querySelectorAll(".showtime-btn")
              buttons.forEach((b) => {
                b.classList.add("started")
                b.disabled = true
              })
            }
          }
        }
      })
      // don't regenerate or remove DOM nodes here; keep dates visible
    }
  })
}

// Showtime selection functionality
function initializeShowtimes() {
  const showtimeBtns = document.querySelectorAll(".showtime-btn")

  showtimeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const time = this.dataset.time
      const showtimeIdRaw = this.dataset.id
      const showtimeId = showtimeIdRaw ? Number.parseInt(showtimeIdRaw, 10) : Number.NaN // ensure integer

      showtimeBtns.forEach((b) => b.classList.remove("selected"))
      this.classList.add("selected")

      if (time) localStorage.setItem("selectedShowtime", time)

      if (!isNaN(showtimeId)) {
        localStorage.setItem("showtimeId", showtimeId) // store as integer
      } else {
        localStorage.removeItem("showtimeId")
      }

      showBookingConfirmation(time)
    })
  })
}

// Show booking confirmation and proceed
async function showBookingConfirmation(time) {
  const activeDate = document.querySelector(".date-item.active")
  const dateText = activeDate ? activeDate.querySelector(".date").textContent : ""
  const monthText = activeDate ? activeDate.querySelector(".month").textContent : ""
  const dayText = activeDate ? activeDate.querySelector(".day").textContent : ""
  const showtimeId = Number.parseInt(localStorage.getItem("showtimeId"), 10) // ensure integer

  // Fetch movie details again to get the correct movie name
  const movieKey = getSelectedMovie()
  const movie = await fetchMovieDetails(movieKey)

  const bookingDetails = {
    movie: movie ? movie.title : movieKey,
    poster_url: movie ? movie.poster_url : "",
    date: `${dayText}, ${dateText} ${monthText}`,
    time: time,
    cinema: "Sri Padma Veereswara Complex",
    location: "Yanam",
    dateKey: `${dateText}-${monthText}-${time}`,
    showtimeId: showtimeId, // integer or NaN
  }

  localStorage.setItem("currentBooking", JSON.stringify(bookingDetails))
  window.location.href = "seat_selection.html"
}

// Back button functionality with exit animation
function goBack() {
  const container = document.querySelector(".container")
  if (container) {
    container.style.transform = "translateX(-100%)"
    container.style.opacity = "0"
    setTimeout(() => {
      window.history.back()
    }, 300)
  } else {
    window.history.back()
  }
}

// Entrance animations
function initializeAnimations() {
  const elements = document.querySelectorAll(".container > *")
  elements.forEach((element, index) => {
    element.style.opacity = "0"
    element.style.transform = "translateY(20px)"
    setTimeout(() => {
      element.style.transition = "all 0.6s ease"
      element.style.opacity = "1"
      element.style.transform = "translateY(0)"
    }, index * 100)
  })
}

// Touch feedback for mobile devices (placeholder)
document.addEventListener("touchstart", () => {}, { passive: true })

// Save selected showtime on page hide
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    const selectedShowtime = document.querySelector(".showtime-btn.selected")
    if (selectedShowtime) {
      localStorage.setItem("selectedShowtime", selectedShowtime.dataset.time)
    }
  }
})

// Debounced refresh helper used by visibility/focus handlers
let _refreshTimer = null
function refreshDataFromServer(immediate = false) {
  // Debounce multiple focus/visibility events
  if (_refreshTimer) clearTimeout(_refreshTimer)
  const delay = immediate ? 100 : 600 // short delay when immediate, small debounce otherwise
  _refreshTimer = setTimeout(async () => {
    try {
      // Re-fetch showtimes and update UI
      await generateDailyShowtimes()
      setActiveDateToToday()
      updateShowtimeStatuses()
    } catch (err) {
      console.error("refreshDataFromServer error", err)
    }
  }, delay)
}

// When the tab becomes visible again, refresh data immediately
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshDataFromServer(true)
  }
})

// When window/tab gains focus (e.g., from other app), refresh as well
window.addEventListener("focus", () => refreshDataFromServer(true))

// When window loses focus cancel any pending refresh to avoid unnecessary work
window.addEventListener("blur", () => {
  if (_refreshTimer) clearTimeout(_refreshTimer)
})

/* --- Automatic date selection & optional rotation --- */

let _midnightTimer = null
let _autoRotateTimer = null

/**
 * Try to set the active .date-item by a DOM date key (e.g. "03 NOV").
 * Returns true if a matching item was activated.
 */
function setActiveDateByDomKey(domKey) {
  if (!domKey) return false
  const dateItems = document.querySelectorAll(".date-item")
  if (!dateItems || dateItems.length === 0) return false

  // Clear any previous active
  dateItems.forEach((d) => d.classList.remove("active"))

  // Try dataset.dateKey first, then composed text (date + month)
  let matched = null
  dateItems.forEach((item) => {
    const dk = (item.dataset.dateKey || "").trim()
    if (dk && dk === domKey) matched = item
    if (!dk && !matched) {
      const dateEl = item.querySelector(".date")
      const monthEl = item.querySelector(".month")
      const composed =
        dateEl && monthEl ? (dateEl.textContent + " " + monthEl.textContent).trim() : item.textContent.trim()
      if (composed === domKey) matched = item
    }
  })

  if (matched) matched.classList.add("active")
  return !!matched
}

/**
 * Set active date to "today" (based on client clock) — uses formatShowDateToDomKey()
 * Falls back to first date-item if today's date isn't present.
 */
function setActiveDateToToday() {
  const todayKey = formatShowDateToDomKey(new Date())
  const set = setActiveDateByDomKey(todayKey)
  if (!set) {
    // fallback: activate first date-item if exists
    const first = document.querySelector(".date-item")
    if (first) {
      document.querySelectorAll(".date-item").forEach((d) => d.classList.remove("active"))
      first.classList.add("active")
    }
  }
  // trigger UI update
  updateShowtimesForDate()
}

/**
 * Schedule update at next midnight to switch the active date automatically.
 */
function scheduleMidnightUpdate() {
  if (_midnightTimer) clearTimeout(_midnightTimer)
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const msUntilMidnight = tomorrow - now
  _midnightTimer = setTimeout(() => {
    // At midnight: make today active, refresh showtimes (pull new dates) and reschedule
    try {
      setActiveDateToToday()
      // regenerate showtimes to load new date(s)
      generateDailyShowtimes()
      updateShowtimeStatuses()
    } catch (e) {
      console.error("Midnight update failed", e)
    }
    scheduleMidnightUpdate() // reschedule for next day
  }, msUntilMidnight + 1000) // small buffer
}

/**
 * Auto-rotate date selector every intervalMs milliseconds.
 * Call startAutoRotateDates(5000) to rotate every 5s.
 */
function startAutoRotateDates(intervalMs = 5000) {
  stopAutoRotateDates()
  const items = () => Array.from(document.querySelectorAll(".date-item"))
  _autoRotateTimer = setInterval(() => {
    const dateItems = items()
    if (!dateItems || dateItems.length <= 1) return
    const currentIndex = dateItems.findIndex((i) => i.classList.contains("active"))
    const nextIndex = (currentIndex + 1) % dateItems.length
    dateItems.forEach((i) => i.classList.remove("active"))
    dateItems[nextIndex].classList.add("active")
    updateShowtimesForDate()
  }, intervalMs)
}

function stopAutoRotateDates() {
  if (_autoRotateTimer) {
    clearInterval(_autoRotateTimer)
    _autoRotateTimer = null
  }
}

/**
 * Parse a show's date and time into a JS Date object (local timezone).
 * Accepts show.show_date (ISO) and show.show_time (HH:MM[:SS] or formatted).
 */
function parseShowDateTime(show) {
  if (!show) return null
  // Prefer server-provided unix timestamp or ISO datetime when available
  if (show.show_start_unix) {
    const n = Number(show.show_start_unix)
    if (!isNaN(n)) return new Date(n * 1000)
  }
  if (show.show_datetime_iso) {
    const dIso = new Date(show.show_datetime_iso)
    if (!isNaN(dIso)) return dIso
  }

  const datePart = show.show_date || show.date || null
  const timePart = show.show_time || show.time || ""
  if (!datePart) return null

  // Normalize time like '10:30 AM' or '22:15:00' to 'HH:MM:SS' 24h
  let hours = 0,
    minutes = 0,
    seconds = 0
  const tm = String(timePart).trim()
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(tm)) {
    const [h, m, s] = tm.split(":").map((x) => Number.parseInt(x, 10))
    hours = h
    minutes = m
    seconds = s
  } else if (/^\d{1,2}:\d{2}$/.test(tm)) {
    const [h, m] = tm.split(":").map((x) => Number.parseInt(x, 10))
    hours = h
    minutes = m
    seconds = 0
  } else if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(tm)) {
    const m = tm.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (m) {
      let h = Number.parseInt(m[1], 10)
      const mm = Number.parseInt(m[2], 10)
      const ampm = m[3].toUpperCase()
      if (ampm === "PM" && h !== 12) h += 12
      if (ampm === "AM" && h === 12) h = 0
      hours = h
      minutes = mm
      seconds = 0
    }
  }

  const d = new Date(datePart)
  if (isNaN(d)) return null
  d.setHours(hours, minutes, seconds, 0)
  return d
}

/**
 * Remove any `.date-item` elements that don't exist in the provided dateKey set.
 */
function removeDateItemsNotIn(dateKeySet) {
  const items = document.querySelectorAll(".date-item")
  items.forEach((item) => {
    const domKey = (
      item.dataset.dateKey ||
      (item.querySelector(".date") && item.querySelector(".month")
        ? item.querySelector(".date").textContent + " " + item.querySelector(".month").textContent
        : item.textContent)
    ).trim()
    if (!dateKeySet.has(domKey)) {
      item.remove()
    }
  })
}
