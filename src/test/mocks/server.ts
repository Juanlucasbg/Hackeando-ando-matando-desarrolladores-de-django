import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { mockGoogleMaps } from './googleMaps'

// API base URL
const API_BASE_URL = 'http://localhost:3001/api'

// Mock API handlers
export const handlers = [
  // Geocoding API handler
  rest.get('https://maps.googleapis.com/maps/api/geocode/json', (req, res, ctx) => {
    const address = req.url.searchParams.get('address')

    if (address?.includes('Medellín')) {
      return res(
        ctx.status(200),
        ctx.json({
          status: 'OK',
          results: [
            {
              address_components: [
                { long_name: 'Medellín', short_name: 'Medellín', types: ['locality'] },
                { long_name: 'Antioquia', short_name: 'Antioquia', types: ['administrative_area_level_1'] },
                { long_name: 'Colombia', short_name: 'CO', types: ['country'] }
              ],
              formatted_address: 'Medellín, Antioquia, Colombia',
              geometry: {
                location: { lat: 6.2442, lng: -75.5812 },
                location_type: 'APPROXIMATE',
                viewport: {
                  northeast: { lat: 6.3, lng: -75.5 },
                  southwest: { lat: 6.2, lng: -75.6 }
                }
              },
              place_id: 'ChIJJ4yLJ2BvoI4RqB2V8f1hG0M',
              types: ['locality', 'political']
            }
          ]
        })
      )
    }

    return res(
      ctx.status(404),
      ctx.json({
        status: 'ZERO_RESULTS',
        results: []
      })
    )
  }),

  // Places Autocomplete API handler
  rest.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', (req, res, ctx) => {
    const input = req.url.searchParams.get('input')

    if (input?.includes('Parque')) {
      return res(
        ctx.status(200),
        ctx.json({
          status: 'OK',
          predictions: [
            {
              description: 'Parque Envigado, Envigado, Colombia',
              id: 'test-id-1',
              matched_substrings: [{ offset: 0, length: 6 }],
              place_id: 'ChIJR1J7xZVvoI4R0B2V8f1hG0M',
              reference: 'test-reference-1',
              structured_formatting: {
                main_text: 'Parque Envigado',
                main_text_matched_substrings: [{ offset: 0, length: 6 }],
                secondary_text: 'Envigado, Colombia'
              },
              terms: [
                { offset: 0, value: 'Parque Envigado' },
                { offset: 16, value: 'Envigado' },
                { offset: 26, value: 'Colombia' }
              ],
              types: ['park', 'point_of_interest', 'establishment']
            },
            {
              description: 'Parque Lleras, Medellín, Colombia',
              id: 'test-id-2',
              matched_substrings: [{ offset: 0, length: 6 }],
              place_id: 'ChIJL5yLJ2BvoI4RqB2V8f1hG0M',
              reference: 'test-reference-2',
              structured_formatting: {
                main_text: 'Parque Lleras',
                main_text_matched_substrings: [{ offset: 0, length: 6 }],
                secondary_text: 'Medellín, Colombia'
              },
              terms: [
                { offset: 0, value: 'Parque Lleras' },
                { offset: 14, value: 'Medellín' },
                { offset: 24, value: 'Colombia' }
              ],
              types: ['park', 'point_of_interest', 'establishment']
            }
          ]
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        status: 'ZERO_RESULTS',
        predictions: []
      })
    )
  }),

  // Places Details API handler
  rest.get('https://maps.googleapis.com/maps/api/place/details/json', (req, res, ctx) => {
    const placeId = req.url.searchParams.get('place_id')

    if (placeId === 'ChIJR1J7xZVvoI4R0B2V8f1hG0M') {
      return res(
        ctx.status(200),
        ctx.json({
          status: 'OK',
          result: {
            address_components: [
              { long_name: 'Parque Envigado', short_name: 'Parque Envigado', types: ['point_of_interest'] },
              { long_name: 'Envigado', short_name: 'Envigado', types: ['locality'] },
              { long_name: 'Antioquia', short_name: 'Antioquia', types: ['administrative_area_level_1'] },
              { long_name: 'Colombia', short_name: 'CO', types: ['country'] }
            ],
            formatted_address: 'Parque Envigado, Envigado, Antioquia, Colombia',
            formatted_phone_number: '+57 4 3331234',
            geometry: {
              location: { lat: 6.1700, lng: -75.5850 },
              viewport: {
                northeast: { lat: 6.18, lng: -75.57 },
                southwest: { lat: 6.16, lng: -75.60 }
              }
            },
            icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/park-71.png',
            international_phone_number: '+57 4 3331234',
            name: 'Parque Envigado',
            opening_hours: {
              open_now: true,
              periods: [
                {
                  open: { day: 0, time: '0600' },
                  close: { day: 0, time: '1800' }
                },
                {
                  open: { day: 1, time: '0600' },
                  close: { day: 1, time: '1800' }
                },
                {
                  open: { day: 2, time: '0600' },
                  close: { day: 2, time: '1800' }
                },
                {
                  open: { day: 3, time: '0600' },
                  close: { day: 3, time: '1800' }
                },
                {
                  open: { day: 4, time: '0600' },
                  close: { day: 4, time: '1800' }
                },
                {
                  open: { day: 5, time: '0600' },
                  close: { day: 5, time: '1800' }
                },
                {
                  open: { day: 6, time: '0600' },
                  close: { day: 6, time: '1800' }
                }
              ],
              weekday_text: [
                'Monday: 6:00 AM – 6:00 PM',
                'Tuesday: 6:00 AM – 6:00 PM',
                'Wednesday: 6:00 AM – 6:00 PM',
                'Thursday: 6:00 AM – 6:00 PM',
                'Friday: 6:00 AM – 6:00 PM',
                'Saturday: 6:00 AM – 6:00 PM',
                'Sunday: 6:00 AM – 6:00 PM'
              ]
            },
            photos: [
              {
                height: 4032,
                html_attributions: ['<a href="https://maps.google.com/maps/contrib/123456789">John Doe</a>'],
                photo_reference: 'mock_photo_reference_1',
                width: 3024
              },
              {
                height: 3024,
                html_attributions: ['<a href="https://maps.google.com/maps/contrib/987654321">Jane Smith</a>'],
                photo_reference: 'mock_photo_reference_2',
                width: 4032
              }
            ],
            place_id: 'ChIJR1J7xZVvoI4R0B2V8f1hG0M',
            rating: 4.5,
            reference: 'test-reference-1',
            reviews: [
              {
                author_name: 'John Doe',
                author_url: 'https://www.google.com/maps/contrib/123456789',
                language: 'en',
                profile_photo_url: 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg',
                rating: 5,
                relative_time_description: 'a week ago',
                text: 'Great park! Very clean and well-maintained.',
                time: 1634567890
              }
            ],
            types: ['park', 'point_of_interest', 'establishment'],
            url: 'https://maps.google.com/place/ChIJR1J7xZVvoI4R0B2V8f1hG0M',
            user_ratings_total: 1250,
            utc_offset: -300,
            vicinity: 'Envigado',
            website: 'http://www.parqueenvigado.gov.co'
          }
        })
      )
    }

    return res(
      ctx.status(404),
      ctx.json({
        status: 'NOT_FOUND',
        result: null
      })
    )
  }),

  // Directions API handler
  rest.get('https://maps.googleapis.com/maps/api/directions/json', (req, res, ctx) => {
    const origin = req.url.searchParams.get('origin')
    const destination = req.url.searchParams.get('destination')

    if (origin?.includes('Envigado') && destination?.includes('Plaza Mayor')) {
      return res(
        ctx.status(200),
        ctx.json({
          status: 'OK',
          routes: [
            {
              bounds: {
                northeast: { lat: 6.3, lng: -75.5 },
                southwest: { lat: 6.2, lng: -75.6 }
              },
              copyrights: 'Map data ©2023 Google',
              legs: [
                {
                  distance: { text: '5.2 km', value: 5200 },
                  duration: { text: '15 mins', value: 900 },
                  end_address: 'Plaza Mayor, Medellín, Colombia',
                  end_location: { lat: 6.2094, lng: -75.5671 },
                  start_address: 'Parque Envigado, Envigado, Colombia',
                  start_location: { lat: 6.1700, lng: -75.5850 },
                  steps: [
                    {
                      distance: { text: '1.0 km', value: 1000 },
                      duration: { text: '3 mins', value: 180 },
                      end_location: { lat: 6.1750, lng: -75.5820 },
                      html_instructions: 'Head <b>north</b> on <b>Calle 30</b>',
                      maneuver: { bearing: 0, location: { lat: 6.1700, lng: -75.5850 } },
                      polyline: { points: 'mock_encoded_polyline_1' },
                      start_location: { lat: 6.1700, lng: -75.5850 },
                      travel_mode: 'DRIVING'
                    },
                    {
                      distance: { text: '4.2 km', value: 4200 },
                      duration: { text: '12 mins', value: 720 },
                      end_location: { lat: 6.2094, lng: -75.5671 },
                      html_instructions: 'Continue on <b>Autopista Sur</b>',
                      maneuver: { bearing: 45, location: { lat: 6.1750, lng: -75.5820 } },
                      polyline: { points: 'mock_encoded_polyline_2' },
                      start_location: { lat: 6.1750, lng: -75.5820 },
                      travel_mode: 'DRIVING'
                    }
                  ],
                  traffic_speed_entry: [],
                  via_waypoints: []
                }
              ],
              overview_polyline: {
                points: 'mock_encoded_polyline_full_route'
              },
              summary: 'Calle 30 and Autopista Sur',
              warnings: [],
              waypoint_order: [],
              fare: {
                currency: 'COP',
                value: 8500,
                text: '$8,500'
              }
            },
            {
              bounds: {
                northeast: { lat: 6.32, lng: -75.52 },
                southwest: { lat: 6.18, lng: -75.62 }
              },
              copyrights: 'Map data ©2023 Google',
              legs: [
                {
                  distance: { text: '6.8 km', value: 6800 },
                  duration: { text: '22 mins', value: 1320 },
                  end_address: 'Plaza Mayor, Medellín, Colombia',
                  end_location: { lat: 6.2094, lng: -75.5671 },
                  start_address: 'Parque Envigado, Envigado, Colombia',
                  start_location: { lat: 6.1700, lng: -75.5850 },
                  steps: [
                    {
                      distance: { text: '2.0 km', value: 2000 },
                      duration: { text: '8 mins', value: 480 },
                      end_location: { lat: 6.1800, lng: -75.5750 },
                      html_instructions: 'Walk to <b>Envigado Metro Station</b>',
                      maneuver: { bearing: 90, location: { lat: 6.1700, lng: -75.5850 } },
                      polyline: { points: 'mock_encoded_polyline_walk_1' },
                      start_location: { lat: 6.1700, lng: -75.5850 },
                      travel_mode: 'WALKING'
                    },
                    {
                      distance: { text: '4.8 km', value: 4800 },
                      duration: { text: '14 mins', value: 840 },
                      end_location: { lat: 6.2094, lng: -75.5671 },
                      html_instructions: 'Take <b>Metro Line A</b> towards <b>Niquía</b>',
                      maneuver: { bearing: 45, location: { lat: 6.1800, lng: -75.5750 } },
                      polyline: { points: 'mock_encoded_polyline_metro' },
                      start_location: { lat: 6.1800, lng: -75.5750 },
                      travel_mode: 'TRANSIT',
                      transit_details: {
                        arrival_stop: { location: { lat: 6.2094, lng: -75.5671 }, name: 'Plaza Mayor Station' },
                        arrival_time: { text: '2:30 PM', time_zone: 'America/Bogota', value: 1634567400 },
                        departure_stop: { location: { lat: 6.1800, lng: -75.5750 }, name: 'Envigado Station' },
                        departure_time: { text: '2:16 PM', time_zone: 'America/Bogota', value: 1634566560 },
                        headsign: 'Niquía',
                        line: {
                          agencies: [{ name: 'Metro de Medellín', phone: '+57 4 444 4444', url: 'http://www.metrodemedellin.gov.co' }],
                          color: '#ffffff',
                          name: 'Line A',
                          short_name: 'A',
                          text_color: '#005a9c',
                          url: 'http://www.metrodemedellin.gov.co',
                          vehicle: { icon: '//maps.gstatic.com/mapfiles/transit/iw2/6/subway.png', local_icon: '//maps.gstatic.com/mapfiles/transit/iw2/6/subway.png', name: 'Subway', type: 'SUBWAY' }
                        },
                        num_stops: 4
                      }
                    }
                  ],
                  traffic_speed_entry: [],
                  via_waypoints: []
                }
              ],
              overview_polyline: {
                points: 'mock_encoded_polyline_transit_route'
              },
              summary: 'Walking and Metro',
              warnings: [],
              waypoint_order: [],
              fare: {
                currency: 'COP',
                value: 2800,
                text: '$2,800'
              }
            }
          ]
        })
      )
    }

    return res(
      ctx.status(400),
      ctx.json({
        status: 'INVALID_REQUEST',
        routes: [],
        error_message: 'Invalid request parameters'
      })
    )
  }),

  // Custom backend API handlers
  rest.post(`${API_BASE_URL}/routes/plan`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        routes: [
          {
            id: 'route-1',
            origin: { lat: 6.1700, lng: -75.5850 },
            destination: { lat: 6.2094, lng: -75.5671 },
            duration: 25,
            distance: 5.2,
            modes: ['walking', 'metro'],
            carbonFootprint: 0.8,
            cost: 2800,
            steps: [
              {
                mode: 'walking',
                duration: 8,
                distance: 1.0,
                instructions: 'Walk to Envigado Metro Station'
              },
              {
                mode: 'metro',
                duration: 14,
                distance: 4.2,
                instructions: 'Take Metro Line A to Plaza Mayor'
              },
              {
                mode: 'walking',
                duration: 3,
                distance: 0.5,
                instructions: 'Walk to destination'
              }
            ]
          },
          {
            id: 'route-2',
            origin: { lat: 6.1700, lng: -75.5850 },
            destination: { lat: 6.2094, lng: -75.5671 },
            duration: 15,
            distance: 5.2,
            modes: ['driving'],
            carbonFootprint: 2.5,
            cost: 8500,
            steps: [
              {
                mode: 'driving',
                duration: 15,
                distance: 5.2,
                instructions: 'Drive via Calle 30 and Autopista Sur'
              }
            ]
          }
        ]
      })
    )
  }),

  rest.get(`${API_BASE_URL}/transport/metro/stations`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'envigado',
          name: 'Envigado',
          location: { lat: 6.1800, lng: -75.5750 },
          lines: ['A'],
          accessibility: true,
          facilities: ['elevator', 'escalator', 'parking'],
          status: 'active'
        },
        {
          id: 'plaza-mayor',
          name: 'Plaza Mayor',
          location: { lat: 6.2094, lng: -75.5671 },
          lines: ['A'],
          accessibility: true,
          facilities: ['elevator', 'escalator', 'restrooms'],
          status: 'active'
        }
      ])
    )
  }),

  rest.get(`${API_BASE_URL}/transport/metro/status`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'normal',
        lines: [
          {
            id: 'A',
            name: 'Line A',
            status: 'operational',
            frequency: '5 minutes',
            lastUpdate: new Date().toISOString()
          },
          {
            id: 'B',
            name: 'Line B',
            status: 'operational',
            frequency: '6 minutes',
            lastUpdate: new Date().toISOString()
          }
        ],
        incidents: []
      })
    )
  }),

  rest.get(`${API_BASE_URL}/traffic`, (req, res, ctx) => {
    const lat = req.url.searchParams.get('lat')
    const lng = req.url.searchParams.get('lng')

    return res(
      ctx.status(200),
      ctx.json({
        location: { lat: parseFloat(lat || '6.2442'), lng: parseFloat(lng || '-75.5812') },
        data: [
          {
            id: 'segment-1',
            road: 'Calle 30',
            speed: 25,
            speedLimit: 40,
            congestion: 'moderate',
            delay: 3,
            coordinates: [
              { lat: 6.1700, lng: -75.5850 },
              { lat: 6.1750, lng: -75.5820 }
            ]
          },
          {
            id: 'segment-2',
            road: 'Autopista Sur',
            speed: 35,
            speedLimit: 60,
            congestion: 'light',
            delay: 1,
            coordinates: [
              { lat: 6.1750, lng: -75.5820 },
              { lat: 6.2094, lng: -75.5671 }
            ]
          }
        ],
        lastUpdate: new Date().toISOString()
      })
    )
  }),

  rest.get(`${API_BASE_URL}/analytics/events`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        events: [
          {
            id: 'event-1',
            type: 'route_search',
            timestamp: new Date().toISOString(),
            data: {
              origin: 'Parque Envigado',
              destination: 'Plaza Mayor',
              modes: ['transit']
            }
          }
        ],
        total: 1
      })
    )
  }),

  rest.post(`${API_BASE_URL}/analytics/events`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        id: 'new-event-id'
      })
    )
  }),

  // Error handling handlers
  rest.get(`${API_BASE_URL}/error-test`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal Server Error',
        message: 'Test error for error handling'
      })
    )
  }),

  rest.post(`${API_BASE_URL}/error-test`, (req, res, ctx) => {
    return res.networkError('Network error occurred')
  }),

  // WebSocket mock handler (simulated)
  rest.get('/ws', (req, res, ctx) => {
    return res(
      ctx.status(101),
      ctx.set('Connection', 'Upgrade'),
      ctx.set('Upgrade', 'websocket')
    )
  }),
]

// Create the server
export const server = setupServer(...handlers)