"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicHeader, type PublicLanguage } from "./PublicHeader";
import { PublicQuestionWidget } from "./PublicQuestionWidget";

type CommunityEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "mass" | "cultural" | "service" | "youth" | "learning";
  description: string;
  recurring?: boolean;
};

const categoryColors: Record<CommunityEvent["category"], string> = {
  mass: "#f4c430",
  cultural: "#e8634a",
  service: "#7ec8d9",
  youth: "#1f5747",
  learning: "#0a2540",
};

const categoryLabels: Record<CommunityEvent["category"], string> = {
  mass: "Mass & Prayer",
  cultural: "Cultural",
  service: "Community Service",
  youth: "Youth",
  learning: "Learning",
};

// Seed events shown when database is empty (first run)
const seedEvents: CommunityEvent[] = [
  { id: 1, title: "Burmese Catholic Sunday Mass", date: "2026-08-09", time: "2:30 PM", location: "St Bernadette's Church, Glendalough", category: "mass", description: "Weekly Burmese language Mass followed by community fellowship and refreshments. All Burmese-speaking Catholics in Perth are warmly welcome.", recurring: true },
  { id: 2, title: "BCCWA Monthly Community Meeting", date: "2026-08-16", time: "4:00 PM – 6:00 PM", location: "St Bernadette's Parish Hall, Glendalough", category: "cultural", description: "Monthly gathering for community updates, planning upcoming events, and open discussion.", recurring: true },
  { id: 3, title: "Assumption of Mary — Special Burmese Mass", date: "2026-08-15", time: "6:00 PM", location: "Our Lady of Lourdes, Nollamara", category: "mass", description: "Special feast day Mass celebrating the Assumption of the Blessed Virgin Mary with traditional Burmese hymns." },
  { id: 4, title: "BCCWA Youth Group Gathering", date: "2026-08-22", time: "5:30 PM – 8:00 PM", location: "Holy Rosary Church Hall, Woodlands", category: "youth", description: "Monthly youth meeting featuring faith sharing, games, Burmese cultural activities, and dinner.", recurring: true },
  { id: 5, title: "Burmese Community Rosary Prayer", date: "2026-08-28", time: "7:00 PM", location: "St Bernadette's Church, Glendalough", category: "mass", description: "Community Rosary prayer in Burmese language. A time for quiet reflection and intercession for Myanmar.", recurring: true },
  { id: 6, title: "BCCWA Family Picnic & BBQ", date: "2026-09-07", time: "10:00 AM – 3:00 PM", location: "Whiteman Park, Swan Valley", category: "cultural", description: "Annual family day out with Burmese food, sports, children's games, and fellowship." },
  { id: 7, title: "English Conversation Class", date: "2026-09-10", time: "10:00 AM – 12:00 PM", location: "Mirrabooka Community Centre", category: "learning", description: "Free English practice session for community members. All levels welcome.", recurring: true },
  { id: 8, title: "Fundraising Dinner for Myanmar", date: "2026-09-20", time: "6:00 PM – 9:30 PM", location: "St Bernadette's Parish Hall, Glendalough", category: "service", description: "Community fundraising dinner to support humanitarian aid in Myanmar. Tickets: $25/person." },
  { id: 9, title: "Myanmar Martyrs' Day Remembrance", date: "2026-07-19", time: "3:00 PM", location: "St Bernadette's Church, Glendalough", category: "cultural", description: "Special prayer service and community gathering to remember Myanmar's martyrs." },
  { id: 10, title: "BCCWA Christmas Celebration", date: "2026-12-20", time: "11:00 AM – 5:00 PM", location: "St Bernadette's Parish Hall, Glendalough", category: "cultural", description: "Annual Christmas celebration with Burmese Mass, traditional food, gift exchange, and carol singing." },
];

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDate(dateStr: string) {
  const parts = dateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return {
    day: d.getDate(),
    month: MONTHS_SHORT[d.getMonth()],
    weekday: WEEKDAYS[d.getDay()],
  };
}



export function EventsPage() {
  const [language, setLanguage] = useState<PublicLanguage>("en");
  const [filter, setFilter] = useState<string>("all");
  const [showPast, setShowPast] = useState(false);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>(seedEvents);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch events from admin API, fall back to seed data
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.events) && d.events.length > 0) {
          setCommunityEvents(d.events);
        }
      })
      .catch(() => {/* keep seed events */ });
  }, []);

  // Defer date-dependent filtering to client to avoid SSR hydration mismatch
  const upcomingEvents = mounted
    ? communityEvents
      .filter((e) => new Date(e.date + "T23:59:59") >= new Date())
      .sort((a, b) => a.date.localeCompare(b.date))
    : communityEvents.sort((a, b) => a.date.localeCompare(b.date));
  const pastEvents = mounted
    ? communityEvents
      .filter((e) => new Date(e.date + "T23:59:59") < new Date())
      .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const displayEvents = showPast ? pastEvents : upcomingEvents;
  const filteredEvents =
    filter === "all"
      ? displayEvents
      : displayEvents.filter((e) => e.category === filter);

  const allCategories = Object.entries(categoryLabels);

  return (
    <main className="public-site civic-public-site v2-redesign">
      <PublicHeader language={language} onLanguageChange={setLanguage} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="v2-events-hero">
        <div className="v2-events-hero-content">
          <p className="v2-section-eyebrow">Community calendar</p>
          <h1>Upcoming Events</h1>
          <p className="v2-events-subtitle">
            Join us at Mass, cultural celebrations, service missions, and youth
            gatherings across Western Australia.
          </p>
        </div>
      </section>

      {/* ── Toggle + Filters ─────────────────────────────────── */}
      <div className="v2-events-controls">
        <div className="v2-events-toggle">
          <button
            className={!showPast ? "active" : ""}
            onClick={() => setShowPast(false)}
          >
            Upcoming
          </button>
          <button
            className={showPast ? "active" : ""}
            onClick={() => setShowPast(true)}
          >
            Past Events
          </button>
        </div>
        <div className="v2-events-filters">
          <button
            className={`v2-events-filter-btn ${filter === "all" ? "active" : ""
              }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {allCategories.map(([key, label]) => (
            <button
              key={key}
              className={`v2-events-filter-btn ${filter === key ? "active" : ""
                }`}
              onClick={() => setFilter(key)}
              style={
                {
                  "--filter-color":
                    categoryColors[key as CommunityEvent["category"]],
                } as React.CSSProperties
              }
            >
              <span
                className="v2-events-filter-dot"
                style={{
                  background:
                    categoryColors[key as CommunityEvent["category"]],
                }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Events List ──────────────────────────────────────── */}
      <section className="v2-events-list-section">
        {filteredEvents.length === 0 ? (
          <div className="v2-events-empty">
            <p>
              {showPast
                ? "No past events to show."
                : "No upcoming events scheduled. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="v2-events-list">
            {filteredEvents.map((event) => {
              const d = formatDate(event.date);
              return (
                <article key={event.id} className="v2-event-card">
                  <div
                    className="v2-event-date-block"
                    style={{
                      borderColor: categoryColors[event.category],
                    }}
                  >
                    <span className="v2-event-month">{d.month}</span>
                    <span className="v2-event-day">{d.day}</span>
                    <span className="v2-event-weekday">{d.weekday}</span>
                  </div>
                  <div className="v2-event-body">
                    <div className="v2-event-meta">
                      <span
                        className="v2-event-category-badge"
                        style={{
                          background: categoryColors[event.category],
                          color:
                            event.category === "mass" ||
                              event.category === "service"
                              ? "#061b2e"
                              : "white",
                        }}
                      >
                        {categoryLabels[event.category]}
                      </span>
                      {event.recurring && (
                        <span className="v2-event-recurring">↻ Recurring</span>
                      )}
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="v2-event-details">
                      <span className="v2-event-time">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {event.time}
                      </span>
                      <span className="v2-event-location">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {event.location}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="v2-events-cta">
        <div className="v2-events-cta-inner">
          <div>
            <h2>Want to organise an event?</h2>
            <p>
              Community leaders can submit events through the admin panel. Reach
              out to get started.
            </p>
          </div>
          <Link href="/get-involved" className="v2-btn v2-btn-gold">
            Contact Us
          </Link>
        </div>
      </section>

      <PublicQuestionWidget />
    </main>
  );
}
