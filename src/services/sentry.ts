import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { CaptureConsole } from '@sentry/integrations'

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.REACT_APP_ENV || 'production',
      integrations: [
        new BrowserTracing({
          tracingOrigins: [
            'localhost',
            'https://yourdomain.com',
            'https://staging.yourdomain.com',
            /^\//,
          ],
        }),
        new CaptureConsole({
          levels: ['error'],
        }),
      ],
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      release: `google-maps-clone@${process.env.npm_package_version}`,
      autoSessionTracking: true,
      debug: process.env.REACT_APP_DEBUG === 'true',

      // Performance monitoring
      beforeBreadcrumb: (breadcrumb) => {
        // Filter out sensitive information
        if (breadcrumb.category === 'xhr' && breadcrumb.data?.url) {
          breadcrumb.data.url = breadcrumb.data.url.replace(/api_key=[^&]*/, 'api_key=***')
        }
        return breadcrumb
      },

      // Error filtering
      beforeSend: (event, hint) => {
        // Filter out specific errors
        if (hint.originalException) {
          const error = hint.originalException as Error

          // Filter out Google Maps API errors that are expected
          if (error.message.includes('Google Maps API error')) {
            return null
          }

          // Filter out network errors from offline usage
          if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
            return null
          }
        }

        return event
      },

      // Custom tags
      tags: {
        app: 'google-maps-clone',
        framework: 'react',
        mapsApi: 'google-maps-js-api',
      },

      // Custom context
      initialScope: {
        user: { id: 'anonymous' },
        tags: {
          pageLoad: Date.now().toString(),
          userAgent: navigator.userAgent,
        },
      },
    })
  }
}

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        feature: context?.feature || 'unknown',
        component: context?.component || 'unknown',
      },
    })
  } else {
    console.error('Development Error:', error, context)
  }
}

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level, {
      extra: context,
      tags: {
        feature: context?.feature || 'unknown',
        component: context?.component || 'unknown',
      },
    })
  } else {
    console.log(`Development Log (${level}):`, message, context)
  }
}

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(user)
  }
}

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb(breadcrumb)
  }
}

// Performance monitoring
export const startTransaction = (name: string, op: string = 'navigation') => {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startTransaction({
      name,
      op,
    })
  }
  return null
}

export const setUserFeedback = (email: string, message: string, name?: string) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureUserFeedback({
      email,
      name: name || '',
      comments: message,
    })
  }
}

// Error boundary component
export class SentryErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean; eventId: string | null }
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, eventId: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    this.setState({ eventId })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'production' && this.state.eventId && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Report an issue
                </summary>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    setUserFeedback(
                      formData.get('email') as string,
                      formData.get('message') as string,
                      formData.get('name') as string,
                    )
                    alert('Thank you for your feedback!')
                  }}
                  className="mt-2 space-y-2"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <textarea
                    name="message"
                    placeholder="What were you doing when the error occurred?"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="hidden"
                    name="eventId"
                    value={this.state.eventId}
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Send Report
                  </button>
                </form>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}