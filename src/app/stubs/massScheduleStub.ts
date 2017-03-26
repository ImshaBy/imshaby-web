/**
 * Created by Alena Misan on 11.01.2017.
 */
import {MassSchedule} from '../_models/massSchedule';
import {Mass} from "../_models/mass";

export const SCHEDULE: MassSchedule =
  {
    schedule: [
      {
        date: new Date(),
        massHours: [{
          hour: "10:00",
          data: [
            {
              langCode: "by",
              parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
              duration: 60,
              info: "simple"
            },
            {
              langCode: "by",
              parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
              duration: 60,
              info: "simple"
            },
            {
              langCode: "by",
              parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
              duration: 60,
              info: "simple"
            },
            {
              langCode: "by",
              parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
              duration: 60,
              info: "simple"
            },
          ],
          active: true
        },
          {
            hour: "12:00",
            data: [
              {
                langCode: "by",
                parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
                duration: 60,
                info: "simple"
              },
              {
                langCode: "by",
                parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
                duration: 60,
                info: "simple"
              },
              {
                langCode: "by",
                parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
                duration: 60,
                info: "simple"
              },
            ],
            active: false
          }]
      },
      {
        date: new Date("03/15/2017"),
        massHours: [{
          hour: "16:00",
          data: [
            {
              langCode: "by",
              parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
              duration: 60,
              info: "simple"
            },
            {
              langCode: "by",
              parish: {parishId: "1", address: "Minsk", imgPath: "./images/avatars/img1.png", name: "4k", gps: {langitude: 123, latitude: 231}},
              duration: 60,
              info: "simple"
            },
          ],
          active: false
        }]
      },
    ]
  };
