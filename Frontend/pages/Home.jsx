import React from "react";
import {
  CalendarDays,
  Users,
  Bell,
  TrendingUp,
  MapPin,
  Clock,
  Star,
} from "lucide-react";
import img1 from "../src/assets/diverse-college-students-at-campus-event-celebrati.jpg";
import img2 from "../src/assets/college-social-mixer-party.jpg";
import img3 from "../src/assets/students-in-innovation-workshop.jpg";
import img4 from "../src/assets/professional-networking-event-college.jpg";
import { Navigate, NavLink } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 lg:py-20">
        <div className="absolute inset-0 bg-[url('/college-students-at-campus-event.jpg')] bg-cover bg-center opacity-5"></div>
        <div className="relative container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-block text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2 rounded-full">
                  🎉 Join 10,000+ Active Students
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Discover.{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Participate.
                  </span>{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Lead.
                  </span>
                </h1>
                <p className="text-lg text-gray-600">
                  Your campus community awaits! Find events, connect with peers,
                  and make your college experience unforgettable.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <NavLink
                  to="/Events"
                  className="text-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300"
                >
                  Explore Events
                </NavLink>
                <NavLink
                  to="/listEvent"
                  className="text-lg px-6 py-3 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                >
                  Create Event
                </NavLink>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>500+ Events This Month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span>4.9/5 Student Rating</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/2] rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-4">
                <img
                  src={img1}
                  alt="Students at campus event"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Events</h2>
              <p className="text-gray-600">
                Don't miss out on these popular campus happenings
              </p>
            </div>
            <button className="border border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent px-4 py-2 rounded-lg transition-all duration-300">
              View All Events
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Campus Social Mixer",
                description:
                  "Join us for a fun evening of socializing and making new friends on campus.",
                image: img2,
                date: "Tonight",
                time: "7:00 PM",
                location: "Student Center",
                attendees: 127,
                category: "Social",
              },
              {
                title: "Innovation Workshop",
                description:
                  "Unleash your creativity and learn new skills at our hands-on workshop.",
                image: img3,
                date: "Tomorrow",
                time: "2:00 PM",
                location: "Tech Lab",
                attendees: 89,
                category: "Workshop",
              },
              {
                title: "Networking Night",
                description:
                  "Connect with professionals and peers at our annual networking event.",
                image: img4,
                date: "Friday",
                time: "6:00 PM",
                location: "Business Hall",
                attendees: 156,
                category: "Professional",
              },
            ].map((event, index) => (
              <div
                key={index}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 rounded-lg bg-white"
              >
                <div className="relative">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs">
                    {event.category}
                  </span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                    {event.attendees} going
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all duration-300">
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CampusConnect */}
      <section className="py-16 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              Why Choose CampusConnect?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're more than just an events platform - we're your gateway to an
              amazing college experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <CalendarDays className="h-8 w-8" />,
                title: "Discover Events",
                description:
                  "Find all campus events in one place, from social gatherings to academic workshops.",
                color: "blue",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Connect & Network",
                description:
                  "Connect with like-minded students and build lasting friendships through shared interests.",
                color: "purple",
              },
              {
                icon: <Bell className="h-8 w-8" />,
                title: "Stay Updated",
                description:
                  "Never miss an event with personalized reminders and real-time updates.",
                color: "blue",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Track Growth",
                description:
                  "Monitor your involvement and discover new opportunities for leadership and learning.",
                color: "purple",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 hover:shadow-lg transition-shadow border border-blue-100 bg-white rounded-lg"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${
                    feature.color === "blue"
                      ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600"
                      : "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600"
                  } rounded-2xl mb-4 mx-auto`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Campus Experience?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of students who are already discovering,
              participating, and leading through CampusConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="text-lg px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                Get Started Today
              </button>
              <button className="text-lg px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-lg transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-t border-blue-100">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-center md:text-left">
            <div className="lg:col-span-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CampusConnect
                </span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Connecting students through meaningful campus experiences.
                Discover, participate, and lead your way to an unforgettable
                college journey.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <button className="h-10 w-10 p-0 border border-blue-200 hover:bg-blue-50 bg-transparent rounded-lg">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="h-10 w-10 p-0 border border-blue-200 hover:bg-blue-50 bg-transparent rounded-lg">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button className="h-10 w-10 p-0 border border-blue-200 hover:bg-blue-50 bg-transparent rounded-lg">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Browse Events
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Create Event
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    My Events
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Calendar
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Organizations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Safety
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Report Issue
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Event Planning Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Campus Map
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Student Organizations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Academic Calendar
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Campus News
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-100">
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
                <p>&copy; 2024 CampusConnect. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Cookie Policy
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Made with</span>
                <span className="text-red-500">♥</span>
                <span>for students</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
