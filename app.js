const EVENTS_KEY = "schoolDashboard.events.v1";
const TIMETABLE_KEY = "schoolDashboard.timetable.v1";
const NOTES_KEY = "schoolDashboard.notes.v1";


const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];


const defaultEvents = [

  {
    id: crypto.randomUUID(),
    title: "Maths Chapter 5 Exercises",
    date: datePlus(0),
    type: "homework",
    priority: "medium",
    time: "",
    details: "Complete exercises from Chapter 5."
  },

  {
    id: crypto.randomUUID(),
    title: "Science Unit Test",
    date: datePlus(2),
    type: "exam",
    priority: "high",
    time: "09:00",
    details: "Revise the current Science unit."
  },

  {
    id: crypto.randomUUID(),
    title: "Football Practice",
    date: datePlus(3),
    type: "activity",
    priority: "low",
    time: "16:00",
    details: "Bring sports shoes and water."
  },

  {
    id: crypto.randomUUID(),
    title: "School Holiday",
    date: datePlus(4),
    type: "notice",
    priority: "low",
    time: "",
    details: "School will remain closed."
  }

];


const defaultTimetable = {

  Monday: [
    "English",
    "Mathematics",
    "EVS",
    "Hindi",
    "Computer"
  ],

  Tuesday: [
    "Mathematics",
    "English",
    "Hindi",
    "EVS",
    "Art"
  ],

  Wednesday: [
    "EVS",
    "Mathematics",
    "English",
    "Computer",
    "Games"
  ],

  Thursday: [
    "Hindi",
    "English",
    "Mathematics",
    "EVS",
    "Library"
  ],

  Friday: [
    "Mathematics",
    "EVS",
    "English",
    "Hindi",
    "Games"
  ]

};


let events = load(
  EVENTS_KEY,
  defaultEvents
);

let timetable = load(
  TIMETABLE_KEY,
  defaultTimetable
);

let notes = load(
  NOTES_KEY,
  []
);


function load(key, fallback) {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(key)
      );

    return value ?? fallback;

  } catch {

    return fallback;

  }

}


function save() {

  localStorage.setItem(
    EVENTS_KEY,
    JSON.stringify(events)
  );

  localStorage.setItem(
    TIMETABLE_KEY,
    JSON.stringify(timetable)
  );

  localStorage.setItem(
    NOTES_KEY,
    JSON.stringify(notes)
  );

}


function datePlus(number) {

  const d = new Date();

  d.setHours(
    12,
    0,
    0,
    0
  );

  d.setDate(
    d.getDate() + number
  );

  return isoDate(d);

}


function isoDate(date) {

  return new Date(
    date.getTime() -
    date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

}


function dateObj(value) {

  return new Date(
    value + "T12:00:00"
  );

}


function formatDate(value) {

  return dateObj(value)
    .toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short"
      }
    );

}


function fullDate(value) {

  return dateObj(value)
    .toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

}


function today() {

  return datePlus(0);

}


function relative(value) {

  const difference =
    Math.round(
      (
        dateObj(value) -
        dateObj(today())
      ) / 86400000
    );


  if (difference === 0) {

    return "Today";

  }


  if (difference === 1) {

    return "Tomorrow";

  }


  if (difference === -1) {

    return "Yesterday";

  }


  if (difference > 1) {

    return `In ${difference}d`;

  }


  return `${Math.abs(difference)}d ago`;

}


function escapeHtml(value = "") {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => {

        return {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        }[character];

      }
    );

}


function icon(type) {

  return {

    homework: "✓",
    exam: "!",
    notice: "i",
    activity: "◆"

  }[type] || "•";

}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    document.getElementById(
      "currentDate"
    ).textContent =
      new Date().toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      );


    setupNavigation();

    setupModals();

    setupForms();

    renderAll();

  }
);


function setupNavigation() {

  document
    .querySelectorAll("[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;


          document
            .querySelectorAll("[data-page]")
            .forEach(item => {

              item.classList.toggle(
                "active",
                item === button
              );

            });


          document
            .querySelectorAll("[data-section]")
            .forEach(section => {

              section.classList.toggle(
                "hidden",
                section.dataset.section !== page
              );

            });


          document.getElementById(
            "pageTitle"
          ).textContent =
            page[0].toUpperCase() +
            page.slice(1);


          document.getElementById(
            "sidebar"
          ).classList.remove("open");


          renderAll();

        }
      );

    });


  document.getElementById(
    "menuBtn"
  ).onclick = () => {

    document.getElementById(
      "sidebar"
    ).classList.toggle("open");

  };


  document.getElementById(
    "typeFilter"
  ).onchange =
    renderUpcoming;


  document.getElementById(
    "priorityFilter"
  ).onchange =
    renderUpcoming;

}


function setupModals() {

  document
    .querySelectorAll("[data-close]")
    .forEach(button => {

      button.onclick = () =>
        closeModal(
          button.dataset.close
        );

    });


  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (event.target === modal) {

            modal.classList.add(
              "hidden"
            );

          }

        }
      );

    });


  document
    .querySelectorAll("[data-add-event]")
    .forEach(button => {

      button.onclick = () =>
        openEvent();

    });


  document
    .querySelectorAll("[data-add-homework]")
    .forEach(button => {

      button.onclick = () =>
        openEvent(
          null,
          "homework"
        );

    });


  document
    .querySelectorAll("[data-add-note]")
    .forEach(button => {

      button.onclick =
        () => openNote();

    });


  document.getElementById(
    "editTimetableBtn"
  ).onclick =
    openTimetable;


  document.getElementById(
    "exportBtn"
  ).onclick =
    exportBackup;


  document.getElementById(
    "importFile"
  ).onchange =
    importBackup;


  document.getElementById(
    "calendarBtn"
  ).onclick =
    downloadCalendar;

}


function setupForms() {

  document.getElementById(
    "eventForm"
  ).onsubmit = event => {

    event.preventDefault();

    saveEvent();

  };


  document.getElementById(
    "noteForm"
  ).onsubmit = event => {

    event.preventDefault();

    saveNote();

  };


  document.getElementById(
    "timetableForm"
  ).onsubmit = event => {

    event.preventDefault();

    saveTimetable();

  };

}


function renderAll() {

  renderUpcoming();

  renderTimetable();

  renderHomework();

  renderNotes();

  renderFeed();

}


function renderWeek() {

  const box =
    document.getElementById(
      "weekStrip"
    );

  box.innerHTML = "";


  const base =
    dateObj(today());


  const monday =
    new Date(base);


  monday.setDate(
    base.getDate() -
    ((base.getDay() + 6) % 7)
  );


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const date =
      new Date(monday);


    date.setDate(
      monday.getDate() + i
    );


    const dateString =
      isoDate(date);


    const count =
      events.filter(
        event =>
          event.date === dateString
      ).length;


    box.insertAdjacentHTML(
      "beforeend",
      `
      <div class="week-day ${
        dateString === today()
          ? "today"
          : ""
      }">

        <span>
          ${date.toLocaleDateString(
            "en-IN",
            { weekday: "short" }
          )}
        </span>

        <strong>
          ${date.getDate()}
        </strong>

        <small>
          ${
            count
              ? count +
                " item" +
                (count > 1 ? "s" : "")
              : ""
          }
        </small>

      </div>
      `
    );

  }

}


function renderUpcoming() {

  renderWeek();


  const typeFilter =
    document.getElementById(
      "typeFilter"
    ).value;


  const priorityFilter =
    document.getElementById(
      "priorityFilter"
    ).value;


  const list =
    events
      .filter(event =>
        event.date >= today() &&
        (
          typeFilter === "all" ||
          event.type === typeFilter
        ) &&
        (
          priorityFilter === "all" ||
          event.priority === priorityFilter
        )
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          ) ||
          (a.time || "").localeCompare(
            b.time || ""
          )
      );


  document.getElementById(
    "upcomingCount"
  ).textContent =
    `${list.length} item${
      list.length === 1
        ? ""
        : "s"
    }`;


  const groups = {};


  list.forEach(event => {

    (
      groups[event.date] ??= []
    ).push(event);

  });


  const timeline =
    document.getElementById(
      "timeline"
    );


  timeline.innerHTML =
    Object.keys(groups)
      .map(date => {

        return `
          <div class="timeline-day">

            <div class="date-col">

              <strong>
                ${relative(date)}
              </strong>

              <span>
                ${formatDate(date)}
              </span>

            </div>

            <div class="day-items">

              ${groups[date]
                .map(eventCard)
                .join("")}

            </div>

          </div>
        `;

      })
      .join("") ||
      emptyState(
        "No upcoming items match these filters."
      );


  bindEventActions();

}


function eventCard(event) {

  return `

    <article
      class="event-card priority-${event.priority}"
    >

      <div class="event-icon">
        ${icon(event.type)}
      </div>


      <div class="event-main">

        <div class="event-top">

          <span class="type-label">
            ${escapeHtml(event.type)}
          </span>

          <span
            class="priority ${event.priority}">
            ${event.priority}
          </span>

        </div>


        <h3>
          ${escapeHtml(event.title)}
        </h3>


        ${
          event.details
            ? `
              <p>
                ${escapeHtml(
                  event.details
                )}
              </p>
            `
            : ""
        }


        ${
          event.time
            ? `
              <span class="meta">
                ◷ ${escapeHtml(
                  event.time
                )}
              </span>
            `
            : ""
        }

      </div>


      <div class="event-actions">

        <button
          data-edit-event="${event.id}">
          Edit
        </button>

        <button
          data-delete-event="${event.id}">
          Delete
        </button>

      </div>

    </article>

  `;

}


function bindEventActions() {

  document
    .querySelectorAll(
      "[data-edit-event]"
    )
    .forEach(button => {

      button.onclick = () =>
        openEvent(
          button.dataset.editEvent
        );

    });


  document
    .querySelectorAll(
      "[data-delete-event]"
    )
    .forEach(button => {

      button.onclick = () => {

        if (
          confirm(
            "Delete this item?"
          )
        ) {

          events =
            events.filter(
              event =>
                event.id !==
                button.dataset.deleteEvent
            );


          save();

          renderAll();

        }

      };

    });

}


function renderTimetable() {

  const day =
    dayNames[
      (new Date().getDay() + 6) % 7
    ];


  document.getElementById(
    "todayLabel"
  ).textContent = day;


  const todayRows =
    timetable[day] || [];


  document.getElementById(
    "todayTimetable"
  ).innerHTML =
    todayRows.length

      ? todayRows
          .map(
            (subject, index) =>
              `
              <div class="class-row">

                <span>
                  ${index + 1}
                </span>

                <strong>
                  ${escapeHtml(
                    subject ||
                    "Free period"
                  )}
                </strong>

              </div>
              `
          )
          .join("")

      : emptyState(
          "No classes scheduled."
        );


  let html = `

    <table>

      <thead>

        <tr>

          <th>Day</th>

          ${[1, 2, 3, 4, 5]
            .map(
              period =>
                `<th>
                  Period ${period}
                </th>`
            )
            .join("")}

        </tr>

      </thead>

      <tbody>
  `;


  dayNames
    .slice(0, 5)
    .forEach(dayName => {

      html += `

        <tr>

          <th>
            ${dayName}
          </th>

          ${[0, 1, 2, 3, 4]
            .map(
              index =>
                `<td>
                  ${escapeHtml(
                    (
                      timetable[
                        dayName
                      ] || []
                    )[index] || "—"
                  )}
                </td>`
            )
            .join("")}

        </tr>
      `;

    });


  html += `
      </tbody>
    </table>
  `;


  document.getElementById(
    "weeklyTimetable"
  ).innerHTML = html;

}


function openTimetable() {

  document.getElementById(
    "timetableEditor"
  ).innerHTML =

    dayNames
      .slice(0, 5)
      .map(day => {

        return `

          <div class="tt-edit-day">

            <strong>
              ${day}
            </strong>

            ${[0, 1, 2, 3, 4]
              .map(
                index =>
                  `
                  <input
                    data-tt-day="${day}"
                    data-tt-i="${index}"
                    value="${escapeHtml(
                      (
                        timetable[
                          day
                        ] || []
                      )[index] || ""
                    )}"
                  >
                  `
              )
              .join("")}

          </div>

        `;

      })
      .join("");


  openModal(
    "timetableModal"
  );

}


function saveTimetable() {

  document
    .querySelectorAll(
      "[data-tt-day]"
    )
    .forEach(input => {

      const day =
        input.dataset.ttDay;


      const index =
        Number(
          input.dataset.ttI
        );


      if (!timetable[day]) {

        timetable[day] = [];

      }


      timetable[day][index] =
        input.value.trim();

    });


  save();

  closeModal(
    "timetableModal"
  );

  renderTimetable();

}


function renderHomework() {

  const list =
    events
      .filter(
        event =>
          event.type === "homework"
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      );


  document.getElementById(
    "homeworkList"
  ).innerHTML =

    list
      .map(
        event =>
          `

          <div class="list-row">

            <div>

              <span class="type-label">
                HOMEWORK
              </span>

              <h3>
                ${escapeHtml(
                  event.title
                )}
              </h3>

              <p>
                ${escapeHtml(
                  event.details || ""
                )}
              </p>

            </div>


            <div class="list-side">

              <strong>
                ${relative(
                  event.date
                )}
              </strong>

              <span>
                ${formatDate(
                  event.date
                )}
              </span>


              <div>

                <button
                  data-edit-event="${event.id}">
                  Edit
                </button>

                <button
                  data-delete-event="${event.id}">
                  Delete
                </button>

              </div>

            </div>

          </div>

          `
      )
      .join("") ||

    emptyState(
      "No homework added yet."
    );


  bindEventActions();

}


function renderNotes() {

  document.getElementById(
    "notesGrid"
  ).innerHTML =

    notes
      .map(
        note =>
          `

          <article class="note-card">

            <h3>
              ${escapeHtml(
                note.title
              )}
            </h3>

            <p>
              ${escapeHtml(
                note.body
              )}
            </p>

            <div>

              <button
                data-edit-note="${note.id}">
                Edit
              </button>

              <button
                data-delete-note="${note.id}">
                Delete
              </button>

            </div>

          </article>

          `
      )
      .join("") ||

    emptyState(
      "No notes yet. Add your first note."
    );


  document
    .querySelectorAll(
      "[data-edit-note]"
    )
    .forEach(button => {

      button.onclick = () =>
        openNote(
          button.dataset.editNote
        );

    });


  document
    .querySelectorAll(
      "[data-delete-note]"
    )
    .forEach(button => {

      button.onclick = () => {

        if (
          confirm(
            "Delete this note?"
          )
        ) {

          notes =
            notes.filter(
              note =>
                note.id !==
                button.dataset.deleteNote
            );


          save();

          renderNotes();

        }

      };

    });

}


function renderFeed() {

  const list =
    [...events]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      )
      .slice(0, 20);


  document.getElementById(
    "feedList"
  ).innerHTML =

    list
      .map(
        event =>
          `

          <div class="feed-row">

            <div class="feed-icon">
              ${icon(event.type)}
            </div>

            <div>

              <span class="type-label">

                ${escapeHtml(
                  event.type
                )}

                •

                ${formatDate(
                  event.date
                )}

              </span>

              <h3>
                ${escapeHtml(
                  event.title
                )}
              </h3>

              <p>
                ${escapeHtml(
                  event.details || ""
                )}
              </p>

            </div>

          </div>

          `
      )
      .join("") ||

    emptyState(
      "No feed items yet."
    );

}


function openEvent(
  id = null,
  forcedType = null
) {

  const event =
    id
      ? events.find(
          item =>
            item.id === id
        )
      : null;


  document.getElementById(
    "eventModalTitle"
  ).textContent =
    event
      ? "Edit item"
      : "Add item";


  document.getElementById(
    "eventId"
  ).value =
    event?.id || "";


  document.getElementById(
    "eventTitle"
  ).value =
    event?.title || "";


  document.getElementById(
    "eventDate"
  ).value =
    event?.date || today();


  document.getElementById(
    "eventType"
  ).value =
    event?.type ||
    forcedType ||
    "homework";


  document.getElementById(
    "eventPriority"
  ).value =
    event?.priority ||
    "medium";


  document.getElementById(
    "eventTime"
  ).value =
    event?.time || "";


  document.getElementById(
    "eventDetails"
  ).value =
    event?.details || "";


  openModal(
    "eventModal"
  );

}


function saveEvent() {

  const id =
    document.getElementById(
      "eventId"
    ).value;


  const item = {

    id:
      id ||
      crypto.randomUUID(),

    title:
      document.getElementById(
        "eventTitle"
      ).value.trim(),

    date:
      document.getElementById(
        "eventDate"
      ).value,

    type:
      document.getElementById(
        "eventType"
      ).value,

    priority:
      document.getElementById(
        "eventPriority"
      ).value,

    time:
      document.getElementById(
        "eventTime"
      ).value,

    details:
      document.getElementById(
        "eventDetails"
      ).value.trim()

  };


  if (id) {

    events =
      events.map(
        event =>
          event.id === id
            ? item
            : event
      );

  } else {

    events.push(item);

  }


  save();

  closeModal(
    "eventModal"
  );

  renderAll();

}


function openNote(id = null) {

  const note =
    id
      ? notes.find(
          item =>
            item.id === id
        )
      : null;


  document.getElementById(
    "noteModalTitle"
  ).textContent =
    note
      ? "Edit note"
      : "Add note";


  document.getElementById(
    "noteId"
  ).value =
    note?.id || "";


  document.getElementById(
    "noteTitle"
  ).value =
    note?.title || "";


  document.getElementById(
    "noteBody"
  ).value =
    note?.body || "";


  openModal(
    "noteModal"
  );

}


function saveNote() {

  const id =
    document.getElementById(
      "noteId"
    ).value;


  const item = {

    id:
      id ||
      crypto.randomUUID(),

    title:
      document.getElementById(
        "noteTitle"
      ).value.trim(),

    body:
      document.getElementById(
        "noteBody"
      ).value.trim()

  };


  if (id) {

    notes =
      notes.map(
        note =>
          note.id === id
            ? item
            : note
      );

  } else {

    notes.unshift(item);

  }


  save();

  closeModal(
    "noteModal"
  );

  renderNotes();

}


function openModal(id) {

  document
    .getElementById(id)
    .classList.remove(
      "hidden"
    );

}


function closeModal(id) {

  document
    .getElementById(id)
    .classList.add(
      "hidden"
    );

}


function emptyState(text) {

  return `
    <div class="empty">
      ${escapeHtml(text)}
    </div>
  `;

}


function exportBackup() {

  const backup = {

    version: 2,

    events,

    timetable,

    notes

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    URL.createObjectURL(
      blob
    );


  link.download =
    "snbp-class3-backup.json";


  link.click();


  URL.revokeObjectURL(
    link.href
  );

}


function importBackup(event) {

  const file =
    event.target.files[0];


  if (!file) {

    return;

  }


  const reader =
    new FileReader();


  reader.onload = () => {

    try {

      const data =
        JSON.parse(
          reader.result
        );


      if (
        Array.isArray(
          data.events
        )
      ) {

        events =
          data.events;

      }


      if (
        data.timetable
      ) {

        timetable =
          data.timetable;

      }


      if (
        Array.isArray(
          data.notes
        )
      ) {

        notes =
          data.notes;

      }


      save();

      renderAll();


      alert(
        "Backup imported successfully."
      );


    } catch {

      alert(
        "Invalid backup file."
      );

    }

  };


  reader.readAsText(
    file
  );


  event.target.value = "";

}


function downloadCalendar() {

  const upcoming =
    events
      .filter(
        event =>
          event.date >= today()
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      )
      .slice(0, 50);


  const lines = [

    "BEGIN:VCALENDAR",

    "VERSION:2.0",

    "PRODID:-//SNBP Class III//EN"

  ];


  upcoming.forEach(event => {

    const start =
      event.date.replaceAll(
        "-",
        ""
      ) +
      "T" +
      (
        event.time
          ? event.time.replace(
              ":",
              ""
            ) + "00"
          : "090000"
      );


    lines.push(

      "BEGIN:VEVENT",

      `UID:${event.id}@snbp-class3-dashboard`,

      `DTSTART:${start}`,

      `SUMMARY:${event.title.replace(
        /[,;\\]/g,
        " "
      )}`,

      `DESCRIPTION:${(
        event.details || ""
      ).replace(
        /[,;\\]/g,
        " "
      )}`,

      "END:VEVENT"

    );

  });


  lines.push(
    "END:VCALENDAR"
  );


  const blob =
    new Blob(
      [
        lines.join(
          "\r\n"
        )
      ],
      {
        type:
          "text/calendar"
      }
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    URL.createObjectURL(
      blob
    );


  link.download =
    "snbp-class3-calendar.ics";


  link.click();


  URL.revokeObjectURL(
    link.href
  );

}
