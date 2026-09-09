import type { Workshop } from "@/lib/types";

export const workshops: Workshop[] = [
  {
    id: "w-toczenie-paz",
    title: "Toczenie na kole — pierwszy kubek",
    slug: "toczenie-na-kole-pierwszy-kubek",
    description:
      "Trzy godziny przy kole garncarskim. Uczysz się centrowania, otwierania i wyciągania ścianki. Wychodzisz z własnym kubkiem, który wypalimy w pracowni.",
    eventDate: "2026-10-04T11:00:00+02:00",
    durationHours: 3,
    priceInCents: 28000,
    maxAttendees: 6,
    bookedSeats: 4,
    isPublished: true,
    location: "Pracownia Trzy Wiatry, Gdańsk",
    imageUrl: "/brand/photos/mugs-clean.jpg",
  },
  {
    id: "w-herbata",
    title: "Warsztat ceramiczno-herbaciany",
    slug: "warsztat-ceramiczno-herbaciany",
    description:
      "Ceremonie herbaty, gaiwan albo zestaw czarek z niucharem, a na koniec kiping. Prace schną w studio i wypalamy je na biskwit.",
    eventDate: "2026-10-18T17:30:00+02:00",
    durationHours: 3,
    priceInCents: 17900,
    maxAttendees: 6,
    bookedSeats: 6,
    isPublished: true,
    location: "Pracownia Trzy Wiatry, Gdańsk",
    imageUrl: "/brand/photos/mugs-clean.jpg",
  },
  {
    id: "w-szkliwo",
    title: "Szkliwienie i malowanie biskwitu",
    slug: "szkliwienie-i-malowanie",
    description:
      "Drugi ogień. Uczysz się nakładania szkliw Dust, Mist i Sand, testujesz nakładki i zostawiasz prace do wypału szkliwnego.",
    eventDate: "2026-11-08T12:00:00+01:00",
    durationHours: 2.5,
    priceInCents: 22000,
    maxAttendees: 8,
    bookedSeats: 3,
    isPublished: true,
    location: "Pracownia Trzy Wiatry, Gdańsk",
    imageUrl: "/brand/photos/shavings-clean.jpg",
  },
];
