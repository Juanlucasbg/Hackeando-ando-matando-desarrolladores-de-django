import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Google Maps Clone
          </h1>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <button style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          height: '600px',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#f3f4f6',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🗺️
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#374151'
            }}>
              Google Maps Clone
            </h2>
            <p style={{
              fontSize: '16px',
              marginBottom: '24px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              A modern Google Maps clone built with React, TypeScript, and Google Maps API.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                📍 Get Current Location
              </button>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🔍 Search Places
              </button>
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🚗 Plan Route
              </button>
            </div>
            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                🚧 Application Setup Required
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                To enable full functionality:
              </p>
              <ol style={{
                fontSize: '14px',
                color: '#6b7280',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li style={{ marginBottom: '8px' }}>
                  Add your Google Maps API key to <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '3px' }}>REACT_APP_GOOGLE_MAPS_API_KEY</code>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Enable Maps JavaScript API, Places API, and Geocoding API in Google Cloud Console
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Restart the development server
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1f2937'
            }}>
              🗺️ Interactive Maps
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              Explore the world with interactive maps featuring zoom, pan, and multiple map types including satellite, terrain, and street view.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1f2937'
            }}>
              🔍 Smart Search
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              Find places quickly with intelligent autocomplete, search history, and support for addresses, coordinates, and points of interest.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1f2937'
            }}>
              🚗 Route Planning
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              Plan routes with multiple stops, real-time traffic updates, and support for driving, walking, cycling, and public transit.
            </p>
          </div>
        </div>
      </main>

      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '24px',
        marginTop: '48px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            Built with React, TypeScript, and Google Maps API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;